'use client'

import { useRef, useState } from 'react'
import { Check, ChevronDown, ChevronUp, Crown, Eye, Person } from '@/components/kit/icons'
import { ring } from '@/components/kit/greyed'
import { arrowKeys, openMenu } from '@/lib/menu'
import { HEADING, LABEL, NOT_VIEWED, ROWS, VALUE, VISITORS, markerWords, unviewed, type Visitor } from '@/lib/view-as'

/* S4a's VIEW AS TRIGGER, S4d's MENU AND S4d's MARKER (Story 5.14, FR-D16).
 *
 * THE TRIGGER IS S4a's (`S4 Editor.dc.html:33`), in the centred group immediately right of Template, where every drawn
 * top bar puts it: 32px, `0 11px`, a 7px gap, white on a 1px `line` border at radius 8 hovering to `line-strong`, the
 * 13px eye, "View as" in the switcher's own label type and the visitor at 12.5/600, then the 12px chevron. ITS VALUE
 * SLOT IS AS WIDE AS THE WIDEST OF THE THREE WORDS — all three sit in one grid cell and the two not showing are
 * `invisible` — because the group is absolutely centred: a trigger that grew with its word would move Template every
 * time the visitor changed. `visibility: hidden` also keeps those two out of the accessible name, so the button is
 * named by its own visible words and carries NO `aria-label` (WCAG 2.5.3, Story 5.13's lesson).
 *
 * THE MENU IS S4d's (`:399-404`): 260 wide, radius 12, 6px padding and the frame's own `shadow-lg`, headed "Preview
 * as" at 11/600 uppercase, then three rows — each a 15px glyph, a 13/500 title and an 11px caption — and exactly three
 * (B9: "only"): `comped` and Ghost 6's `gift` preview as Paid, so no tier row and no comped row exist to draw. The
 * current row carries S4d's 13px coral check and NO tint, as drawn. A plain labelled list on `openMenu`'s
 * `popover="auto"`, as every menu in the app is: the platform gives light dismiss, Escape and the return of focus to
 * this trigger, `arrowKeys` the movement, `aria-current` the row in force. Centred under the trigger as S4d draws it
 * (`openMenu`'s `align: 'center'`).
 *
 * THE MARKER IS S4d's (`:405`), and it only REMINDS: "2 not viewed", 20px, `0 8px`, the pill radius, coral text on
 * the coral tint at 10.5/600 with a 5px dot — `StatusChip tone='recommended'`'s palette. It hangs ABSOLUTELY 2px off
 * the trigger's right edge, measured on the frame, so the centred group never moves as it comes and goes, and it is
 * ABSENT at zero (UX-DR3), never a "0". S4d draws a count and FR-D16 asks for names, so each unviewed row of the menu
 * carries the same chip with its word — S4d's own component, no second vocabulary. The row in force is always viewed,
 * so the check and the chip never meet. Every dot travels with its word: colour never carries the signal alone.
 *
 * NO KEY BINDS IT (FR-D11: set-and-forget context), and no colour literal lives here (`tokens.test.ts`): every value
 * above is a token.
 */

/** S4d's three glyphs, each the export's own drawing (`kit/icons.tsx`, R-92). */
const GLYPH: Readonly<Record<Visitor, typeof Eye>> = { anonymous: Eye, free: Person, paid: Crown }

/** S4d's marker chip, and the same chip on an unviewed row of the menu. */
const CHIP =
  'inline-flex h-5 items-center gap-[5px] whitespace-nowrap rounded-pill bg-coral-tint px-2 text-[10.5px] font-semibold text-coral-text'
const Dot = () => <span aria-hidden className="size-[5px] shrink-0 rounded-full bg-coral-text" />

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
  const marker = markerWords(missing.length)

  return (
    // the positioning context for the marker, and nothing else: the marker and the popover are both out of flow, so
    // this box is exactly the trigger's and the centred group measures the trigger alone
    <div className="relative flex">
      <button
        type="button"
        id="editor-view-as"
        aria-expanded={open}
        aria-describedby={marker === null ? undefined : 'editor-view-as-marker'}
        popoverTarget="editor-view-as-menu"
        onClick={(event) => {
          if (menu.current) openMenu(menu.current, event.currentTarget, { side: 'down', align: 'center' })
        }}
        className={`flex h-8 items-center gap-[7px] rounded-sm border bg-surface px-[11px] transition-colors hover:border-line-strong ${open ? 'border-line-strong' : 'border-line'} ${ring}`}
      >
        <Eye size={13} className="shrink-0 text-ink-soft" />
        <span className="text-control-label font-medium text-ink-soft">{LABEL}</span>
        {/* `text-left`: a button centres its text, which would put the slot's spare width on BOTH sides of a short word
            and open the gap after "View as" past S4a's 7px — the spare width belongs before the chevron */}
        <span className="grid text-left text-[12.5px] font-semibold">
          {VISITORS.map((v) => (
            <span key={v} data-current={v === visitor || undefined} className={`col-start-1 row-start-1 whitespace-nowrap ${v === visitor ? '' : 'invisible'}`}>
              {VALUE[v]}
            </span>
          ))}
        </span>
        {open ? <ChevronUp size={12} className="shrink-0 text-ink-soft" /> : <ChevronDown size={12} className="shrink-0 text-ink-soft" />}
      </button>
      {marker === null ? null : (
        <span id="editor-view-as-marker" data-view-as-marker className={`${CHIP} absolute left-[calc(100%+2px)] top-1/2 -translate-y-1/2`}>
          <Dot />
          {marker}
        </span>
      )}
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
                      <span data-not-viewed className={`${CHIP} shrink-0`}>
                        <Dot />
                        {NOT_VIEWED}
                      </span>
                    ) : null}
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </div>
  )
}
