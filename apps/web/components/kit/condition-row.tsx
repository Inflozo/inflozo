import { ChevronDown, X } from './icons'
import { ring } from './greyed'

/* Editor Sidebar Kit.dc.html:228 — condition row: field · operator · value, with chips for
   lists and an × that removes the whole row. */

export function ConditionRow({
  id,
  field,
  operator,
  values,
}: {
  id: string
  field: string
  operator: string
  values: string[]
}) {
  const box = `flex h-9 shrink-0 items-center gap-[6px] rounded-sm border border-line bg-surface px-[10px] ${ring}`
  return (
    <div className="flex items-center gap-2">
      <button type="button" aria-label="Field" className={`${box} w-[84px]`}>
        <span className="flex-1 text-left text-[12.5px] font-medium text-ink">{field}</span>
        <ChevronDown size={11} className="text-ink-soft" />
      </button>
      <button type="button" aria-label="Operator" className={`${box} w-[88px]`}>
        <span className="flex-1 text-left text-[12.5px] font-medium text-ink">{operator}</span>
        <ChevronDown size={11} className="text-ink-soft" />
      </button>
      <div className="flex min-h-9 flex-1 flex-wrap items-center gap-[5px] rounded-sm border border-line bg-surface px-2 py-[3px]">
        {values.map((value) => (
          <span
            key={value}
            className="inline-flex items-center gap-[5px] rounded-pill border border-line bg-paper px-2 py-[2px] text-[11.5px] font-medium text-ink"
          >
            {value}
            <button
              type="button"
              aria-label={`Remove ${value}`}
              className={`text-ink-soft ${ring}`}
            >
              <X size={9} />
            </button>
          </span>
        ))}
      </div>
      <button type="button" aria-label={`Remove the ${field} condition`} className={`shrink-0 text-ink-soft ${ring}`} id={id}>
        <X />
      </button>
    </div>
  )
}
