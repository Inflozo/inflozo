import { greyedProps, labelTone, marked, reason, ring, type Greyed } from './greyed'

/* THE KIT'S DRAWING, AND NOT THE EDITOR'S CONTROL. `/kit` draws this; the real Design block is
   `components/editor/design-picker.tsx` (Story 5.11, B1a), whose tiles are live `SectionPreview`
   renders rather than the wireframes below — the export's mini-diagrams were stress-fill fiction for
   eighteen designs nobody had authored, and a 64×44 render of the design itself is what the frame's
   own note asks for.

   Editor Sidebar Kit.dc.html:71 — design picker. 64×44 wireframe mini-diagrams, ink lines
   with a coral highlight on surface, active takes a coral ring. Above it the counter —
   "7 of 18", mono, under a label reading Design, NEVER "Layout". The Kit draws six tiles;
   the full picker's +N tile (B1a) is the Design accordion's and is not drawn here. */

/** The six wireframes the Kit draws, each a arrangement of ink rules and a coral block. */
const wireframes = [
  <>
    <div className="flex flex-[1.2] flex-col gap-[3px]">
      <div className="h-1 rounded-[1px] bg-ink" />
      <div className="h-[3px] w-[70%] rounded-[1px] bg-line-strong" />
    </div>
    <div className="h-full flex-1 rounded-[3px] bg-coral-tint-strong" />
  </>,
  <>
    <div className="h-full flex-1 rounded-[3px] bg-coral-tint-strong" />
    <div className="flex flex-[1.2] flex-col gap-[3px]">
      <div className="h-1 rounded-[1px] bg-ink" />
      <div className="h-[3px] w-[70%] rounded-[1px] bg-line-strong" />
    </div>
  </>,
  <div className="flex flex-1 flex-col items-center justify-center gap-[3px]">
    <div className="h-1 w-[70%] rounded-[1px] bg-ink" />
    <div className="h-[3px] w-[45%] rounded-[1px] bg-line-strong" />
    <div className="h-2 w-[80%] rounded-[2px] bg-coral-tint-strong" />
  </div>,
  <div className="flex h-full flex-1 items-center justify-center rounded-[3px] bg-coral-tint-strong">
    <div className="h-1 w-[60%] rounded-[1px] bg-ink" />
  </div>,
  <div className="flex flex-1 flex-col justify-center gap-[3px]">
    <div className="h-2 rounded-[2px] bg-coral-tint-strong" />
    <div className="h-1 w-[70%] rounded-[1px] bg-ink" />
  </div>,
  <div className="flex flex-1 flex-col justify-center gap-[3px]">
    <div className="h-1 w-[85%] rounded-[1px] bg-ink" />
    <div className="h-[3px] w-[55%] rounded-[1px] bg-line-strong" />
  </div>,
]

export function DesignPicker({
  id,
  active = 0,
  count,
  total,
  greyed,
}: {
  id: string
  active?: number
  count: number
  total: number
  greyed?: Greyed
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-[5px]">
        <span id={`${id}-label`} className={`text-control-label font-medium ${labelTone(greyed)}`}>
          Design
        </span>
        <span className="font-mono text-helper-caption text-ink-soft">
          {count} of {total}
        </span>
      </div>
      <div
        id={id}
        role="radiogroup"
        aria-labelledby={`${id}-label`}
        className={`flex flex-wrap gap-2 ${ring}`}
        {...greyedProps(id, greyed)}
      >
        {wireframes.map((art, i) => {
          const on = i === marked(active, greyed)
          return (
          <button
            key={i}
            type="button"
            role="radio"
            aria-checked={on}
            aria-label={`Design ${i + 1}`}
            tabIndex={greyed ? -1 : 0}
            className={`flex h-11 w-16 items-center gap-1 rounded-[6px] border border-line bg-surface p-[6px] ${ring} ${on ? 'shadow-[0_0_0_2px_var(--color-coral)]' : ''}`}
          >
            {art}
          </button>
          )
        })}
      </div>
      {reason(id, greyed)}
    </div>
  )
}
