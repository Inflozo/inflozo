import type { ReactNode } from 'react'

/* Editor Sidebar Kit.dc.html:195 — the quick-controls card: three to five most-used
   controls on a surface card. The card is the container; what goes in it is the caller's.
   R-113: the controls panel pins nothing above its groups, so no product surface uses this card —
   /kit keeps it only because the Kit draws it. */

export const QuickControlsCard = ({ children }: { children: ReactNode }) => (
  <div className="flex flex-col gap-3 rounded border border-line bg-surface p-3">
    {children}
  </div>
)
