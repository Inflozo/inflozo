'use client'

import { useRef, useState } from 'react'
import { BAR_POPOVER, BarMenuCard, BarMenuRow, TRIGGER_LABEL, TRIGGER_VALUE, triggerClass } from '@/components/editor/bar-menu'
import { ChevronDown, ChevronUp, Crown, Eye, Person } from '@/components/kit/icons'
import { arrowKeys, openMenu } from '@/lib/menu'
import { HEADING, LABEL, NOT_VIEWED, ROWS, VISITORS, unviewed, type Visitor } from '@/lib/view-as'

/* S4a's VIEW AS TRIGGER AND S4d's MENU (Story 5.14, FR-D16), as the owner amended them on the deployed build
 * (2026-09-21): R-169 took S4d's "2 not viewed" marker out of the bar and put a coral dot on each unviewed row of the
 * menu instead; R-170 gave each visitor ONE name — S4d's row title — wherever View as names it; and R-171 made this
 * control and the Template switcher beside it one look (`bar-menu.tsx`), taking the eye off this trigger: "Remove eye
 * icon from the View As dropdown. Just keep the icons in the dropdown items".
 *
 * THE TRIGGER sits in S4a's centred group immediately right of Template, where every drawn top bar puts it, in
 * Template's own shape: "View as" in the label type and the visitor at 12.5/600, then the 12px chevron. Its value is
 * the menu row's own title (R-170), so the button and the list can never name the visitor two ways. ITS VALUE SLOT IS
 * AS WIDE AS THE WIDEST OF THE THREE NAMES — all three sit in one grid cell and the two not showing are `invisible` —
 * because the group is absolutely centred: a trigger that grew with its word would move Template every time the
 * visitor changed. `visibility: hidden` also keeps those two out of the accessible name, so the button is named by its
 * own visible words and carries NO `aria-label` (WCAG 2.5.3, Story 5.13's lesson).
 *
 * THE MENU IS S4d's (`:399-404`): 260 wide, headed "Preview as", then three rows — each a 15px glyph, a 13/500 title and
 * an 11px caption — and exactly three (B9: "only"): `comped` and Ghost 6's `gift` preview as Paid, so no tier row and
 * no comped row exist to draw. The current row is HIGHLIGHTED with the coral tint and carries no tick (R-172, which
 * replaced S4d's check-and-no-tint on the owner's word). A plain labelled
 * list on `openMenu`'s `popover="auto"`, as every menu in the app is: the platform gives light dismiss, Escape and the
 * return of focus to this trigger, `arrowKeys` the movement, `aria-current` the row in force. Centred under the trigger
 * as S4d draws it (`openMenu`'s `align: 'center'`), and it opens on the checked row, as the Template list does.
 *
 * THE REMINDER IS A CORAL DOT, AND ONLY IN THE MENU (R-169). Each visitor this page has not been looked at as carries
 * one 8px dot in the row's trailing slot. The current row is always viewed, so it never carries one. Nothing sits
 * beside the trigger. The dot's word, "Not viewed", is in the row for screen readers
 * only: the owner wants no printed word, and a sighted reader's signal is the dot's PRESENCE, a shape, so colour never
 * carries it alone. 8px is D5b's row mark (the Template list's `size-2`), and `coral-deep` is the coral that S4d drew
 * the check in, before R-172 took the check away. The reminder never blocks.
 *
 * NO KEY BINDS IT (FR-D11: set-and-forget context), and no colour literal lives here (`tokens.test.ts`): every value
 * above is a token.
 */

/** S4d's three glyphs, each the export's own drawing (`kit/icons.tsx`, R-92). */
const GLYPH: Readonly<Record<Visitor, typeof Eye>> = { anonymous: Eye, free: Person, paid: Crown }

export function ViewAs({
  visitor,
  viewed,
  onChoose,
}: {
  /** the visitor the canvas is previewing — session state, never stored (`EXPERIENCE.md:230`) */
  visitor: Visitor
  /** this canvas's "looked at" record, the visitor on screen already counted in it */
  viewed: readonly Visitor[]
  onChoose: (next: Visitor) => void
}) {
  const [open, setOpen] = useState(false)
  const menu = useRef<HTMLDivElement>(null)
  const missing = unviewed(viewed)

  return (
    <>
      <button
        type="button"
        id="editor-view-as"
        aria-expanded={open}
        popoverTarget="editor-view-as-menu"
        onClick={(event) => {
          if (menu.current) openMenu(menu.current, event.currentTarget, { side: 'down', align: 'center' })
        }}
        className={triggerClass(open)}
      >
        <span className={TRIGGER_LABEL}>{LABEL}</span>
        {/* `text-left`: a button centres its text, which would put the slot's spare width on BOTH sides of a short name
            and open the gap after "View as" past the trigger's own — the spare width belongs before the chevron */}
        <span className={`grid text-left ${TRIGGER_VALUE}`}>
          {VISITORS.map((v) => (
            <span key={v} data-current={v === visitor || undefined} className={`col-start-1 row-start-1 whitespace-nowrap ${v === visitor ? '' : 'invisible'}`}>
              {ROWS[v].title}
            </span>
          ))}
        </span>
        {open ? <ChevronUp size={12} className="shrink-0 text-ink-soft" /> : <ChevronDown size={12} className="shrink-0 text-ink-soft" />}
      </button>
      <div
        ref={menu}
        id="editor-view-as-menu"
        popover="auto"
        onToggle={(event) => setOpen((event as unknown as ToggleEvent).newState === 'open')}
        onKeyDown={arrowKeys}
        className={BAR_POPOVER}
      >
        <BarMenuCard width="w-[min(260px,calc(100vw-16px))]" headingId="editor-view-as-heading" heading={HEADING}>
          {VISITORS.map((v) => {
            const Glyph = GLYPH[v]
            const on = v === visitor
            return (
              <li key={v} className="flex flex-col">
                <BarMenuRow
                  data-visitor={v}
                  current={on}
                  onClick={() => {
                    // the platform returns focus to the trigger as the menu hides, and the canvas repaints behind it
                    menu.current?.hidePopover()
                    if (!on) onChoose(v)
                  }}
                  glyph={<Glyph size={15} className="shrink-0 text-ink-soft" />}
                  name={ROWS[v].title}
                  caption={ROWS[v].caption}
                  trailing={
                    // the row in force is highlighted (R-172), and it is always viewed, so it carries nothing here
                    !on && missing.includes(v) ? (
                      <>
                        {/* its word is the dot's hover title as well as the row's `sr-only` text (DESIGN.md's carve-out) */}
                        <span aria-hidden data-not-viewed title={NOT_VIEWED} className="size-2 shrink-0 rounded-full bg-coral-deep" />
                        <span className="sr-only">{NOT_VIEWED}</span>
                      </>
                    ) : null
                  }
                />
              </li>
            )
          })}
        </BarMenuCard>
      </div>
    </>
  )
}
