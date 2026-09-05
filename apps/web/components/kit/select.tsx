import type { ReactNode } from 'react'
import { Check, ChevronDown, ChevronRight, Trash } from './icons'
import { fieldTone, greyedProps, labelTone, reason, ring, valueTone, type Greyed } from './greyed'

/* Editor Sidebar Kit.dc.html:109 — select rows and menus. A closed select may carry a mini
   thumbnail; a font row renders a live "Aa" in the face itself; a dropdown marks the active
   row with a check. This is the shape P0-0 greys in its own pair frame. */

export function Select({
  id,
  label,
  value,
  thumb,
  greyed,
}: {
  id: string
  label: string
  value: string
  thumb?: ReactNode
  greyed?: Greyed
}) {
  return (
    <div className="flex flex-col gap-[5px]">
      <span id={`${id}-label`} className={`text-control-label font-medium ${labelTone(greyed)}`}>
        {label}
      </span>
      <button
        type="button"
        aria-labelledby={`${id}-label`}
        className={`flex h-[38px] items-center gap-[9px] rounded-sm border px-[11px] ${fieldTone(greyed)} ${ring} ${greyed ? '' : 'hover:border-line-strong'}`}
        {...greyedProps(id, greyed)}
      >
        {thumb}
        <span className={`text-[12.5px] font-medium ${valueTone(greyed)}`}>{value}</span>
        <ChevronDown size={12} className={`ml-auto ${greyed ? 'text-line-strong' : 'text-ink-soft'}`} />
      </button>
      {reason(id, greyed)}
    </div>
  )
}

/** The two-rule mini page thumbnail a closed select carries. */
export const SelectThumb = () => (
  <span aria-hidden className="flex h-[18px] w-[26px] gap-[1.5px] rounded-[3px] border border-line p-[2px]">
    <span className="flex-1 rounded-[1px] bg-line" />
    <span className="flex-1 rounded-[1px] bg-coral-tint-strong" />
  </span>
)

/** A font row renders "Aa" in the face it is offering. */
export function FontRow({ id, label, family }: { id: string; label: string; family: string }) {
  return (
    <button
      type="button"
      id={id}
      className={`flex h-10 items-center gap-[9px] rounded-sm border border-line bg-surface px-[10px] hover:border-line-strong ${ring}`}
    >
      <span aria-hidden style={{ fontFamily: family }} className="w-5 text-ui">
        Aa
      </span>
      <span className="flex flex-1 flex-col text-left">
        <span className="text-[10px] text-ink-soft">{label}</span>
        <span className="text-control-label font-semibold text-ink">{family}</span>
      </span>
      <ChevronRight size={12} className="text-ink-soft" />
    </button>
  )
}

export type MenuItem = { label: string; active?: boolean; danger?: boolean }

/** The dropdown itself: the active row is coral-tint with a check, danger sits last. */
export function Menu({ label, items }: { label: string; items: MenuItem[] }) {
  return (
    <ul
      aria-label={label}
      className="flex w-[210px] list-none flex-col gap-px rounded-[12px] border border-line bg-surface p-[6px] shadow-lg"
    >
      {items.map((item, i) => (
        <li key={item.label} className="contents">
          {item.danger && i > 0 ? <hr className="mx-2 my-1 h-px border-0 bg-line" /> : null}
          <button
            type="button"
            aria-current={item.active ? 'true' : undefined}
            className={`flex items-center gap-2 rounded-sm px-[10px] py-[7px] text-left text-ui-dense ${ring} ${
              item.active
                ? 'bg-coral-tint font-semibold text-ink'
                : item.danger
                  ? 'font-medium text-danger-text hover:bg-danger-tint'
                  : 'font-medium text-ink hover:bg-paper'
            }`}
          >
            {item.danger ? <Trash size={13} /> : null}
            <span className="flex-1">{item.label}</span>
            {item.active ? <Check size={13} className="text-coral-deep" /> : null}
          </button>
        </li>
      ))}
    </ul>
  )
}
