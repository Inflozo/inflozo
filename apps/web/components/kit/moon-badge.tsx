import { Moon } from './icons'

/* Editor Sidebar Kit.dc.html:177 — moon badge, 12px, marks any control carrying a
   dark-mode override. A shape never carries a signal on its own, so it carries its
   label (DESIGN.md Don'ts; EXPERIENCE.md § Accessibility Floor) — as the accessible
   name a screen reader reads AND the `title` a pointer hovers, which is R-136's shape:
   the owner took the printed words off the sidebar's rows (2026-09-19) and they live
   here instead. `label=""` is a badge whose row already says the words beside it. */

export const MoonBadge = ({ label = 'Dark override' }: { label?: string }) => (
  <span title={label || undefined} className="inline-flex size-3 shrink-0 items-center justify-center rounded-full bg-ink text-paper">
    <Moon label={label} />
  </span>
)
