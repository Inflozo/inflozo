import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { ring, slimScrollbar } from '@/components/kit/greyed'

/* THE TOP BAR'S TWO MENUS SHARE ONE ANATOMY (R-171, the owner, 2026-09-21: "Both Template and View as dropdown to look
 * similar"). S4d drew View as's; the Template switcher, which D5b drew as a plain list of dots and words, now takes the
 * same parts, so the two can never drift apart again:
 *
 *   - THE TRIGGER: a 32px pill, `0 12px`, an 8px gap, white on a 1px `line` border at radius 8, hovering and opening to
 *     `line-strong` — the label at 12/500 muted, the value at 12.5/600, a 12px chevron. D5b's own measure; View as's
 *     S4a trigger was 11/7 only to make room for the eye the owner took off it.
 *   - THE CARD: radius 12, 6px padding, `shadow-lg`, headed at 11/600 uppercase — S4d's "Preview as".
 *   - THE LIST scrolls INSIDE the card under its heading when it outgrows it, on the Kit's one slim scrollbar (the
 *     owner: "add scrollbar and ensure the dropdown looks good with scrollbar … Do not increase the height of dropdown
 *     much"): the card stops at 420px, or 70% of a short window, and never runs past the viewport. `overscroll-contain`
 *     keeps a wheel at the list's end from scrolling the editor behind it, and `openMenu` already ignores a scroll that
 *     happens inside its menu (Story 5.13's finding).
 *   - A ROW: a 15px glyph, the name at 13/500 over ONE line at 11px muted, and a trailing slot — S4d's row. The row in
 *     force is HIGHLIGHTED, never ticked (R-172).
 *
 * Widths stay each frame's (284 and 260) and shrink to the window on a narrow one; `openMenu` clamps the rest. */

export const triggerClass = (open: boolean) =>
  `flex h-8 items-center gap-2 rounded-sm border bg-surface px-3 transition-colors hover:border-line-strong ${open ? 'border-line-strong' : 'border-line'} ${ring}`
export const TRIGGER_LABEL = 'text-control-label font-medium text-ink-soft'
export const TRIGGER_VALUE = 'text-[12.5px] font-semibold'

/** The popover that holds a card: the platform's own `[popover]` box with its border, padding and ground taken away,
 *  and its UA `overflow: auto` too — the card scrolls its own list, so the popover never scrolls (the owner's "two
 *  scrollbars"), and with overflow visible the card's `shadow-lg` is drawn as S4d and D5b draw it rather than clipped
 *  to the popover's edge. */
export const BAR_POPOVER = 'overflow-visible border-0 bg-transparent p-0'

/** The card and its heading, with the scrolling list as its child. `width` is a whole Tailwind class, never built. */
export function BarMenuCard({ width, headingId, heading, children }: { width: string; headingId: string; heading: string; children: ReactNode }) {
  return (
    <div className={`flex max-h-[min(420px,70vh)] ${width} flex-col rounded border border-line bg-surface p-[6px] shadow-lg`}>
      <p id={headingId} className="shrink-0 px-[10px] pb-1 pt-2 text-helper-caption font-semibold uppercase tracking-[0.04em] text-ink-soft">
        {heading}
      </p>
      <ul aria-labelledby={headingId} className={`flex min-h-0 list-none flex-col gap-px overflow-y-auto overscroll-contain ${slimScrollbar}`}>
        {children}
      </ul>
    </div>
  )
}

/** One row: glyph, name over its one line, and whatever the menu puts in the trailing slot. `indent` is D5b's
 *  Membership group, whose rows sit 31px in under their heading.
 *
 *  THE ROW IN FORCE IS HIGHLIGHTED, NOT TICKED (R-172, the owner, 2026-09-21: "For active template or view as —
 *  instead of showing a tick mark, show that list item as highlighted"): D5b's own current-row treatment, the coral
 *  tint and the name at 600, now for both menus, and `aria-current` says it to a screen reader. It keeps its tint under
 *  the pointer rather than flickering to the hover ground.
 *
 *  `relative`, BECAUSE A ROW CARRIES `sr-only` WORDS (R-169's "Not viewed", R-171's "Auto-generated" / "Empty"). An
 *  `sr-only` span is absolutely positioned, and without a positioned row its containing block was the popover itself —
 *  so the words of rows scrolled out of the list still stood at their unscrolled places and gave the POPOVER a
 *  scrollbar of its own beside the list's (the owner's finding, 2026-09-21: "there are two scrollbars"). */
export function BarMenuRow({
  glyph,
  name,
  caption,
  trailing,
  current = false,
  indent = false,
  ...button
}: ButtonHTMLAttributes<HTMLButtonElement> & { glyph: ReactNode; name: string; caption: string; trailing?: ReactNode; current?: boolean; indent?: boolean }) {
  return (
    <button
      type="button"
      {...button}
      aria-current={current ? 'true' : undefined}
      className={`relative flex w-full items-center gap-[10px] rounded-sm py-[9px] pr-[10px] text-left transition-colors ${current ? 'bg-coral-tint' : 'hover:bg-paper'} ${indent ? 'pl-[31px]' : 'pl-[10px]'} ${ring}`}
    >
      {glyph}
      <span className="flex min-w-0 flex-1 flex-col gap-px">
        <span data-name className={`truncate text-ui-dense ${current ? 'font-semibold' : 'font-medium'}`}>{name}</span>
        <span data-caption className="truncate text-helper-caption text-ink-soft">{caption}</span>
      </span>
      {trailing}
    </button>
  )
}

/** R-185's ROW (the owner, 2026-09-23) — the placeholder menu's, and a SIBLING of `BarMenuRow` rather than a
 *  second look: the same 10px gutters, the same name-over-one-muted-line, the same trailing slot. ONE
 *  adaptation, and it is why this is its own component: `BarMenuRow` IS a `<button>`, and R-185 puts two
 *  buttons on the right ("On right side we will have option to copy that code and insert that code"), so this
 *  is an `<li>` carrying two buttons instead of a button carrying buttons. The name is the placeholder's CODE,
 *  so it is drawn in the mono face — a `{}` code is read character by character, not as a word.
 *
 *  `relative` for `BarMenuRow`'s own reason: an `sr-only` word inside an unpositioned row escapes the list and
 *  gives the popover a second scrollbar (R-172). There is no glyph and no `aria-current`: every row is offered,
 *  none is "in force", and a leading glyph would repeat what the code already says.
 *
 *  The card holds these rows and nothing else — no footer and no explanatory sentence (R-185 as amended the
 *  same day, and the braces sentence is withdrawn from the product entirely). */
export function PlaceholderRow({ code, description, actions }: { code: string; description: string; actions: ReactNode }) {
  return (
    // R-188 (the owner's test, 2026-09-23), findings 4 and 5: the description is NOT cropped — it wraps to as many
    // lines as it needs, because half a sentence explains nothing and these lines are the whole reason the menu
    // exists — and the row answers the pointer the way every other menu row does. `items-start` rather than
    // `items-center` so the two buttons stay level with the code once the description runs to a second line.
    <li className="group/row relative flex items-start gap-[10px] rounded-sm py-[9px] pl-[10px] pr-[10px] text-left transition-colors hover:bg-paper">
      <span className="flex min-w-0 flex-1 flex-col gap-px">
        <span data-code className="truncate font-mono text-ui-dense font-medium">{code}</span>
        <span data-caption className="text-helper-caption text-ink-soft">{description}</span>
      </span>
      <span className="flex shrink-0 items-center gap-1">{actions}</span>
    </li>
  )
}

/** One of R-185's two trailing buttons. Small, quiet and the same size as its pair, so neither reads as the
 *  primary of the row — pressing either is a choice, not a commitment. R-188 (the owner's test, 2026-09-23)
 *  made it a GLYPH with no words: square, so the pair is a matched pair, and its name arrives on hover and
 *  through `aria-label` rather than in the row, which is what kept the description from having to be cropped. */
export const PLACEHOLDER_ACTION =
  `inline-flex size-6 shrink-0 items-center justify-center rounded-[6px] border border-line text-ink-soft transition-colors hover:border-line-strong hover:bg-paper-sunk hover:text-ink ${ring}`
