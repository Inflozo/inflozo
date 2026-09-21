'use client'

import { useRef, useState } from 'react'
import { Check, ChevronDown, ChevronUp, Crown, Eye, Person } from '@/components/kit/icons'
import { ring } from '@/components/kit/greyed'
import { arrowKeys, openMenu } from '@/lib/menu'
import { HEADING, LABEL, NOT_VIEWED, ROWS, VISITORS, unviewed, type Visitor } from '@/lib/view-as'

/* S4a's VIEW AS TRIGGER AND S4d's MENU (Story 5.14, FR-D16), as the owner amended them on the deployed build
 * (2026-09-21): R-169 took S4d's "2 not viewed" marker out of the bar and put a coral dot on each unviewed row of the
 * menu instead, and R-170 gave each visitor ONE name — S4d's row title — wherever View as names it.
 *
 * THE TRIGGER IS S4a's (`S4 Editor.dc.html:33`), in the centred group immediately right of Template, where every drawn
 * top bar puts it: 32px, `0 11px`, a 7px gap, white on a 1px `line` border at radius 8 hovering to `line-strong`, the
 * 13px eye, "View as" in the switcher's own label type and the visitor at 12.5/600, then the 12px chevron. Its value
 * is the menu row's own title (R-170), so the button and the list can never name the visitor two ways. ITS VALUE SLOT
 * IS AS WIDE AS THE WIDEST OF THE THREE NAMES — all three sit in one grid cell and the two not showing are `invisible`
 * — because the group is absolutely centred: a trigger that grew with its word would move Template every time the
 * visitor changed. `visibility: hidden` also keeps those two out of the accessible name, so the button is named by its
 * own visible words and carries NO `aria-label` (WCAG 2.5.3, Story 5.13's lesson).
 *
 * THE MENU IS S4d's (`:399-404`): 260 wide, radius 12, 6px padding and the frame's own `shadow-lg`, headed "Preview
 * as" at 11/600 uppercase, then three rows — each a 15px glyph, a 13/500 title and an 11px caption — and exactly three
 * (B9: "only"): `comped` and Ghost 6's `gift` preview as Paid, so no tier row and no comped row exist to draw. The
 * current row carries S4d's 13px coral check and NO tint, as drawn. A plain labelled list on `openMenu`'s
 * `popover="auto"`, as every menu in the app is: the platform gives light dismiss, Escape and the return of focus to
 * this trigger, `arrowKeys` the movement, `aria-current` the row in force. Centred under the trigger as S4d draws it
 * (`openMenu`'s `align: 'center'`).
 *
 * THE REMINDER IS A CORAL DOT, AND ONLY IN THE MENU (R-169). Each visitor this page has not been looked at as carries
 * one 8px dot in the row's trailing slot — the slot the check takes on the current row, which is always viewed, so
 * the two never meet. Nothing sits beside the trigger. The dot's word, "Not viewed", is in the row for screen readers
 * only: the owner wants no printed word, and a sighted reader's signal is the dot's PRESENCE, a shape, so colour never
 * carries it alone. 8px is D5b's row mark (`template-switcher.tsx`'s `size-2`), the app's one dot in a menu row, and
 * `coral-deep` is the check's own ink in the same slot. The reminder never blocks.
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
        className={`flex h-8 items-center gap-[7px] rounded-sm border bg-surface px-[11px] transition-colors hover:border-line-strong ${open ? 'border-line-strong' : 'border-line'} ${ring}`}
      >
        <Eye size={13} className="shrink-0 text-ink-soft" />
        <span className="text-control-label font-medium text-ink-soft">{LABEL}</span>
        {/* `text-left`: a button centres its text, which would put the slot's spare width on BOTH sides of a short name
            and open the gap after "View as" past S4a's 7px — the spare width belongs before the chevron */}
        <span className="grid text-left text-[12.5px] font-semibold">
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
        className="border-0 bg-transparent p-0"
      >
        <div className="flex w-[260px] flex-col gap-px rounded border border-line bg-surface p-[6px] shadow-lg">
          <p id="editor-view-as-heading" className="px-[10px] pb-1 pt-2 text-helper-caption font-semibold uppercase tracking-[0.04em] text-ink-soft">
            {HEADING}
          </p>
          <ul aria-labelledby="editor-view-as-heading" className="flex list-none flex-col gap-px">
            {VISITORS.map((v) => {
              const Glyph = GLYPH[v]
              const on = v === visitor
              return (
                <li key={v} className="flex flex-col">
                  <button
                    type="button"
                    data-visitor={v}
                    aria-current={on ? 'true' : undefined}
                    onClick={() => {
                      // the platform returns focus to the trigger as the menu hides, and the canvas repaints behind it
                      menu.current?.hidePopover()
                      if (!on) onChoose(v)
                    }}
                    className={`flex w-full items-center gap-[10px] rounded-sm px-[10px] py-[9px] text-left transition-colors hover:bg-paper ${ring}`}
                  >
                    <Glyph size={15} className="shrink-0 text-ink-soft" />
                    <span className="flex min-w-0 flex-1 flex-col gap-px">
                      <span data-name className="text-ui-dense font-medium">{ROWS[v].title}</span>
                      <span className="text-helper-caption text-ink-soft">{ROWS[v].caption}</span>
                    </span>
                    {on ? (
                      <Check size={13} strokeWidth={2} className="shrink-0 text-coral-deep" />
                    ) : missing.includes(v) ? (
                      <>
                        <span aria-hidden data-not-viewed className="size-2 shrink-0 rounded-full bg-coral-deep" />
                        <span className="sr-only">{NOT_VIEWED}</span>
                      </>
                    ) : null}
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </>
  )
}
