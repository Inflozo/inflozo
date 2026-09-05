import { Moon } from './icons'

/* Editor Sidebar Kit.dc.html:177 — moon badge, 12px, marks any control carrying a
   dark-mode override. A shape never carries a signal on its own, so it carries its
   label (DESIGN.md Don'ts; EXPERIENCE.md § Accessibility Floor). */

export const MoonBadge = ({ label = 'Dark override' }: { label?: string }) => (
  <span className="inline-flex size-3 shrink-0 items-center justify-center rounded-full bg-ink text-paper">
    <Moon label={label} />
  </span>
)
