import { Eye, EyeOff } from './icons'
import { ring } from './greyed'

/* Editor Sidebar Kit.dc.html:99 — the visibility eye, shown and hidden. The shape never
   carries the signal alone: the button is labelled either way — and the label says what the
   press DOES, so it carries no `aria-pressed` (a changing label plus pressed reads as
   "Hide Hero, pressed"). */

export function Visibility({ shown, name }: { shown: boolean; name: string }) {
  return (
    <button
      type="button"
      aria-label={shown ? `Hide ${name}` : `Show ${name}`}
      className={`inline-flex size-7 items-center justify-center rounded-sm ${ring} ${shown ? 'text-ink' : 'text-line-strong'}`}
    >
      {shown ? <Eye size={15} /> : <EyeOff size={15} />}
    </button>
  )
}
