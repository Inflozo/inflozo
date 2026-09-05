import { Grip as GripDots } from './icons'

/* Editor Sidebar Kit.dc.html:99 — the drag grip, six dots. Decorative inside a row that
   already names itself; give it a label where it is the whole control. */

export const DragGrip = ({ label }: { label?: string }) => (
  <GripDots label={label} className="shrink-0 text-line-strong" />
)
