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
