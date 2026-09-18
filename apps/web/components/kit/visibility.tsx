import { Eye, EyeOff } from './icons'
import { ring } from './greyed'

/* Editor Sidebar Kit.dc.html:99 — the visibility eye, shown and hidden. The shape never
   carries the signal alone: the button is labelled either way — and the label says what the
   press DOES, so it carries no `aria-pressed` (a changing label plus pressed reads as
   "Hide Hero, pressed").

   Story 5.4: it presses. Inside a Layers row it is taken out of the tab order (`tabIndex={-1}`), because the row is
   the one tab stop and `Space` on the focused row is this button's keyboard path (UX-DR10). */

export function Visibility({
  shown,
  name,
  onToggle,
  tabIndex,
}: {
  shown: boolean
  name: string
  onToggle?: () => void
  tabIndex?: number
}) {
  return (
    <button
      type="button"
      tabIndex={tabIndex}
      aria-label={shown ? `Hide ${name}` : `Show ${name}`}
      onClick={onToggle}
      className={`inline-flex size-7 items-center justify-center rounded-sm ${ring} ${shown ? 'text-ink' : 'text-line-strong'}`}
    >
      {shown ? <Eye size={15} /> : <EyeOff size={15} />}
    </button>
  )
}
