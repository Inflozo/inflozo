import { Pencil } from './icons'
import { ring } from './greyed'

/* Editor Sidebar Kit.dc.html:204 — the pack cell: a glyph in the pack's OWN heading font,
   its palette as dots, a pencil to edit, and a coral ring when active. The palette values
   belong to the Style Pack (E6, Story 6.1) and arrive as colour strings — the site's
   system, never the app's. */

export function PackCell({
  name,
  glyphFamily,
  palette,
  active = false,
}: {
  name: string
  glyphFamily: string
  palette: string[]
  active?: boolean
}) {
  return (
    <div
      className={`relative flex flex-col gap-[3px] rounded-sm border border-line bg-surface p-[6px] ${active ? 'shadow-[0_0_0_2px_var(--color-coral)]' : ''}`}
    >
      <button
        type="button"
        aria-label={`Edit ${name}`}
        className={`absolute top-1 right-1 inline-flex size-[15px] items-center justify-center rounded-full border border-line-strong bg-surface text-ink-soft ${ring}`}
      >
        <Pencil size={8} />
      </button>
      <span aria-hidden style={{ fontFamily: glyphFamily }} className="text-[15px] font-semibold">
        Ag
      </span>
      <span className="text-[10.5px] font-semibold text-ink">{name}</span>
      <span aria-hidden className="flex gap-[3px]">
        {palette.map((c) => (
          <span key={c} style={{ background: c }} className="size-[9px] rounded-full shadow-hairline-inset" />
        ))}
      </span>
    </div>
  )
}

/** The dashed cell that makes a new pack. */
export const NewPackCell = () => (
  <button
    type="button"
    className={`flex flex-col items-center justify-center gap-[3px] rounded-sm border-[1.5px] border-dashed border-line-strong text-ink-soft transition-colors duration-fast ease-out hover:border-coral ${ring}`}
  >
    <span aria-hidden className="text-base leading-none">
      +
    </span>
    <span className="text-[10px] font-semibold">New pack</span>
  </button>
)

/** The variant thumb: a name paired with one line, and its Pro mark when it carries one. */
export function VariantThumb({
  name,
  line,
  pro = false,
}: {
  name: string
  line: string
  pro?: boolean
}) {
  return (
    <button
      type="button"
      className={`flex items-center gap-2 rounded-sm border border-line bg-surface p-2 text-left transition-shadow duration-fast ease-out hover:shadow-md ${ring}`}
    >
      <span aria-hidden className="flex h-[34px] w-12 shrink-0 items-center rounded-[6px] border border-line bg-surface p-[5px]">
        <span className="flex flex-1 flex-col items-center justify-center gap-[2px]">
          <span className="h-[3px] w-[70%] rounded-[1px] bg-ink" />
          <span className="h-[6px] w-[80%] rounded-[2px] bg-coral-tint-strong" />
        </span>
      </span>
      <span className="flex flex-col gap-px">
        <span className="text-control-label font-medium text-ink">{name}</span>
        <span className="text-[10px] text-ink-soft">{line}</span>
      </span>
      {pro ? (
        <span className="ml-auto shrink-0 rounded-pill bg-marigold-tint px-[7px] py-px text-[10px] font-semibold text-marigold-text">
          ✦ Pro
        </span>
      ) : null}
    </button>
  )
}
