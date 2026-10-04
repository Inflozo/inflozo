import type { ComponentProps, CSSProperties, ReactNode, Ref } from 'react'
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
   as data, handed down from the server (DW-323).

   STORY 6.4 — THE PENCIL IS ITS OWN BUTTON (`PackPencil`), because the editor's cells are OPTIONS of a
   listbox and an option may hold nothing interactive (axe's `nested-interactive`): the editor lays
   each pencil over its cell from outside the listbox, exactly where S7a draws it, and `/kit` still
   draws it inside (`editable`). A pack the project made is S7a's "Maya's Warm" cell (`custom`):
   "Ag" at 14, and its name over a dashed underline with the 11px pencil after it — drawn here
   for the option's own name, and laid over by the editor's name button, which is what you press. */

export function PackCell({
  name,
  glyphFamily,
  palette,
  active = false,
  editable = false,
  custom = false,
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
  /** Story 6.4 — a pack the project made: S7a's dashed name. Its name and pencil are the editor's button, laid over this
   *  line (`CustomName`), so here the line keeps its place and its words for a screen reader, drawn by the button */
  custom?: boolean
}) {
  return (
    <span
      className={`relative flex flex-col gap-[3px] rounded-sm border border-line bg-surface p-[6px] ${active ? 'shadow-[0_0_0_2px_var(--color-coral)]' : ''} ${className}`}
    >
      {editable ? <PackPencil label={`Edit ${name}`} className="absolute top-1 right-1" /> : null}
      {/* Story 6.2: the glyph is the pack's own face as the pool ships it — a weight it lacks is never synthesised */}
      <span aria-hidden style={{ fontFamily: glyphFamily, fontSynthesis: 'none' }} className={`${custom ? 'text-[14px]' : 'text-[15px]'} font-semibold`}>
        Ag
      </span>
      {custom ? (
        // the name's words are the option's, so a screen reader hears the cell whole; the button over it draws them
        <CustomName name={name} className="text-transparent [&_*]:border-transparent [&_svg]:invisible">
          {active ? <span className="sr-only">, Current</span> : null}
        </CustomName>
      ) : (
        <span className="text-[10.5px] font-semibold text-ink">
          {name}
          {/* the coral ring's meaning, said: the ring alone carries it to the eye and to nothing else (Story 6.2) */}
          {active ? <span className="sr-only">, Current</span> : null}
        </span>
      )}
      <span aria-hidden className="flex gap-[3px]">
        {palette.map((c, i) => (
          <span key={i} style={{ background: c }} className="size-[9px] rounded-full shadow-hairline-inset" />
        ))}
      </span>
    </span>
  )
}

/** S7a's corner pencil (`S7 Style Packs.dc.html` S7a, `title="Edit pack"`): a 15px circle, 1px line-strong, surface,
 *  holding the frame's 8px pencil at stroke 2 in ink-soft — `box-content`, as the frame draws it (17 across, measured).
 *  Story 6.4 — its own button, so the editor can lay it over a cell from outside the listbox; the caller places it.
 *  The circle is the button's DRAWING, not its box: on a touch screen the editor's 44px rule (D8a, `globals.css`) grows
 *  the target, the circle stays S7a's at its centre, and the editor centres the target on the circle's drawn place
 *  (executed at 834 × 1112 with touch: as the button's own border it was a 46px circle over the pack's name). */
export function PackPencil({ label, className = '', ...rest }: ComponentProps<'button'> & { label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      className={`inline-flex items-center justify-center rounded-full disabled:cursor-not-allowed disabled:opacity-35 ${ring} ${className}`}
      {...rest}
    >
      <span className="box-content inline-flex size-[15px] items-center justify-center rounded-full border border-line-strong bg-surface text-ink-soft">
        <Pencil size={8} strokeWidth={2} />
      </span>
    </button>
  )
}

/** S7a's custom pack name (`"Maya's Warm"`): 10.5/600 over a 1px dashed line-strong underline, a text cursor (it renames),
 *  and the frame's 11px pencil at stroke 1.5, 4px after it. One line: a name longer than its cell ends in an ellipsis, so
 *  a forty-character name never makes its row taller (the app's panel is 280 wide, S7a's 320). */
export function CustomName({ name, className = '', children }: { name: string; className?: string; children?: ReactNode }) {
  return (
    <span className={`flex min-w-0 items-center gap-1 ${className}`}>
      <span className="min-w-0 cursor-text truncate border-b border-dashed border-line-strong text-[10.5px] font-semibold">{name}</span>
      <Pencil size={11} className="shrink-0 text-ink-soft" />
      {children}
    </span>
  )
}

/** The dashed cell that makes a new pack — S7a's: on hover a coral border and coral-deep words. Story 6.4: it acts, and
 *  the editor places it in its grid (`style`). */
export function NewPackCell({
  id,
  ref,
  label = 'New pack',
  style,
  onClick,
}: {
  id?: string
  ref?: Ref<HTMLButtonElement>
  label?: string
  style?: CSSProperties
  onClick?: () => void
} = {}) {
  return (
    <button
      ref={ref}
      id={id}
      type="button"
      onClick={onClick}
      style={style}
      className={`flex flex-col items-center justify-center gap-[3px] rounded-sm border-[1.5px] border-dashed border-line-strong text-ink-soft transition-colors hover:border-coral hover:text-coral-deep disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-line-strong disabled:hover:text-ink-soft ${ring}`}
    >
      <span aria-hidden className="text-body leading-none">
        +
      </span>
      <span className="text-[10px] font-semibold">{label}</span>
    </button>
  )
}

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
