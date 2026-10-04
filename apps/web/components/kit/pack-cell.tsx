import { ProBadge } from './badge'
import { Pencil } from './icons'
import { ring } from './greyed'

/* Editor Sidebar Kit.dc.html:204 — the pack cell: a glyph in the pack's OWN heading font,
   its palette as dots, a pencil to edit, and a coral ring when active. The palette values
   belong to the Style Pack (E6, Story 6.1) and arrive as colour strings — the site's
   system, never the app's. Story 6.2: the glyph's face is the pool's (`lib/style-pack.ts`'s
   `packFacesCss`). STORY 6.3: the cell SWITCHES — and it stays the picture, never the control:
   the editor's list wraps it in an option button and the New project window in a native radio's
   label, so it is a `<span>` (phrasing content inside either) and takes the caller's classes for
   the ring a `:checked` radio draws. It imports nothing of the pool: its colours and face arrive
   as data, handed down from the server (DW-323). */

export function PackCell({
  name,
  glyphFamily,
  palette,
  active = false,
  editable = false,
  className = '',
}: {
  name: string
  glyphFamily: string
  palette: readonly string[]
  active?: boolean
  /**
   * The pencil, and only where something opens. The Style Pack EDITOR is Epic 6's, so the
   * New project sheet renders this cell without one — a dead "Edit Paper" button would be a
   * lie about what the product can do today (UX-DR3: a control that could never act here is
   * absent). `/kit` passes it, because the gallery's whole job is to draw the Kit's frame.
   *
   * ponytail: a flag rather than the `onEdit` handler Story 1.5's Code Map named — `/kit` is a
   * Server Component, and a function prop on a host element cannot cross the flight boundary
   * (it is the "Event handlers cannot be passed to Client Component props" error), so an
   * `onEdit` the gallery could pass does not exist. E6 turns this into the handler when there
   * is an editor to open, and this cell's caller becomes a client component with it.
   */
  editable?: boolean
  /** Story 6.3 — the caller's ring rules: D4a's `:checked` radio rings its cell from CSS, never from a prop */
  className?: string
}) {
  return (
    <span
      className={`relative flex flex-col gap-[3px] rounded-sm border border-line bg-surface p-[6px] ${active ? 'shadow-[0_0_0_2px_var(--color-coral)]' : ''} ${className}`}
    >
      {editable ? (
        <button
          type="button"
          aria-label={`Edit ${name}`}
          className={`absolute top-1 right-1 inline-flex size-[15px] items-center justify-center rounded-full border border-line-strong bg-surface text-ink-soft ${ring}`}
        >
          <Pencil size={8} />
        </button>
      ) : null}
      {/* Story 6.2: the glyph is the pack's own face as the pool ships it — a weight it lacks is never synthesised */}
      <span aria-hidden style={{ fontFamily: glyphFamily, fontSynthesis: 'none' }} className="text-[15px] font-semibold">
        Ag
      </span>
      <span className="text-[10.5px] font-semibold text-ink">
        {name}
        {/* the coral ring's meaning, said: the ring alone carries it to the eye and to nothing else (Story 6.2) */}
        {active ? <span className="sr-only">, Current</span> : null}
      </span>
      <span aria-hidden className="flex gap-[3px]">
        {palette.map((c, i) => (
          <span key={i} style={{ background: c }} className="size-[9px] rounded-full shadow-hairline-inset" />
        ))}
      </span>
    </span>
  )
}

/** The dashed cell that makes a new pack. */
export const NewPackCell = () => (
  <button
    type="button"
    className={`flex flex-col items-center justify-center gap-[3px] rounded-sm border-[1.5px] border-dashed border-line-strong text-ink-soft transition-colors hover:border-coral ${ring}`}
  >
    <span aria-hidden className="text-body leading-none">
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
      className={`flex items-center gap-2 rounded-sm border border-line bg-surface p-2 text-left transition-shadow hover:shadow-md ${ring}`}
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
        <span className="ml-auto shrink-0">
          <ProBadge small />
        </span>
      ) : null}
    </button>
  )
}
