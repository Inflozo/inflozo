import type { ReactNode } from 'react'

/* Editor Sidebar Kit.dc.html:195 — the quick-controls card: three to five most-used
   controls on a surface card. The card is the container; what goes in it is the caller's. */

export const QuickControlsCard = ({ children }: { children: ReactNode }) => (
  <div className="flex flex-col gap-3 rounded-[12px] border border-line bg-surface p-3">
    {children}
  </div>
)
