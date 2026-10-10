import { ChevronDown, X } from './icons'
import { fieldTone, greyedProps, reason, ring, valueTone, type Greyed } from './greyed'
import { Menu, openPopover } from './select'

/* Editor Sidebar Kit.dc.html:228 — condition row: field · operator · value, with chips for
   lists and an × that removes the whole row.

   Story 7.9 — LIVE, as D6a's "Only show when" (`D6 Theme Settings Completed.dc.html:211-219`): with `onField` the field
   opens a menu of `fields`, with `onValue` the value box a menu of `options`, and the × calls `onRemove` — the Select's
   own popover and Menu, so nothing is drawn twice. A live row has one operator, so it is the frame's box without a menu
   (a control that could never open is absent, UX-DR3), and its value is the one chosen, drawn as the frame's chip. Greyed
   (P0-0), every part takes the grey and the reason sits under the row. Without handlers it is `/kit`'s static drawing. */

type Option = { value: string; label: string }

export function ConditionRow({
  id,
  field,
  operator,
  values,
  fields,
  options,
  onField,
  onValue,
  onRemove,
  greyed,
}: {
  id: string
  field: string
  operator: string
  values: string[]
  /** Story 7.9 — what the field's menu offers, and the field in force */
  fields?: (Option & { active?: boolean })[]
  /** Story 7.9 — what the value's menu offers */
  options?: (Option & { active?: boolean })[]
  onField?: (value: string) => void
  onValue?: (value: string) => void
  /** Story 7.9 — the ×; absent, the row draws none */
  onRemove?: () => void
  greyed?: Greyed
}) {
  const live = onField !== undefined
  const box = `flex h-9 shrink-0 items-center gap-[6px] rounded-sm border px-[10px] ${fieldTone(greyed)} ${ring}`
  const word = `flex-1 truncate text-left text-[12.5px] font-medium ${valueTone(greyed)}`
  // greyed, the ROW is the one Tab stop that says why (P0-0); its parts leave the order
  const skip = greyed ? { tabIndex: -1 } : {}
  const chevron = <ChevronDown size={11} className={greyed ? 'text-line-strong' : 'text-ink-soft'} />
  const menu = (which: 'field' | 'value', items: (Option & { active?: boolean })[] | undefined, pick: ((v: string) => void) | undefined) =>
    live && !greyed && items !== undefined && pick !== undefined ? (
      <div id={`${id}-${which}-menu`} popover="auto" className="border-0 bg-transparent p-0">
        <Menu label={which === 'field' ? 'Settings' : 'Values'} items={items.map((o) => ({ label: o.label, active: o.active, onSelect: () => pick(o.value) }))} />
      </div>
    ) : null
  const opener = (which: 'field' | 'value', can: boolean) =>
    can && !greyed
      ? {
          popoverTarget: `${id}-${which}-menu`,
          onClick: (event: { currentTarget: HTMLElement }) => {
            const pop = document.getElementById(`${id}-${which}-menu`)
            if (pop) openPopover(pop, event.currentTarget, { side: 'down', align: 'left' }, pop.querySelector<HTMLElement>('[aria-current="true"]'))
          },
        }
      : {}
  return (
    <div className="flex flex-col gap-[5px]">
      <div id={id} role="group" aria-label="Condition" className="flex items-center gap-2" {...greyedProps(id, greyed)}>
        <button type="button" aria-label={`Field: ${field}`} className={`${box} w-[84px]`} {...skip} {...opener('field', live)}>
          <span className={word}>{field}</span>
          {chevron}
        </button>
        {menu('field', fields, onField)}
        {live ? (
          <span className={`${box} w-[76px]`}>
            <span className={word}>{operator}</span>
          </span>
        ) : (
          <button type="button" aria-label={`Operator: ${operator}`} className={`${box} w-[88px]`}>
            <span className="flex-1 text-left text-[12.5px] font-medium text-ink">{operator}</span>
            <ChevronDown size={11} className="text-ink-soft" />
          </button>
        )}
        {live ? (
          <button
            type="button"
            aria-label={`Value: ${values.join(', ') || 'none'}`}
            // with no field chosen yet there is nothing to pick: said, not a silent stop (Story 7.9's Review)
            aria-disabled={greyed || (onValue !== undefined && (options?.length ?? 0) > 0) ? undefined : true}
            className={`flex min-h-9 min-w-0 flex-1 items-center gap-[5px] rounded-sm border px-2 py-[3px] ${fieldTone(greyed)} ${ring}`}
            {...skip}
            {...opener('value', onValue !== undefined && (options?.length ?? 0) > 0)}
          >
            {values.map((value) => (
              <span key={value} className="inline-flex items-center rounded-pill border border-line bg-paper px-2 py-[2px] text-[11.5px] font-medium text-ink">
                {value}
              </span>
            ))}
          </button>
        ) : (
          <div className="flex min-h-9 flex-1 flex-wrap items-center gap-[5px] rounded-sm border border-line bg-surface px-2 py-[3px]">
            {values.map((value, i) => (
              <span
                key={`${i}-${value}`}
                className="inline-flex items-center gap-[5px] rounded-pill border border-line bg-paper px-2 py-[2px] text-[11.5px] font-medium text-ink"
              >
                {value}
                <button type="button" aria-label={`Remove ${value}`} className={`text-ink-soft ${ring}`}>
                  <X size={9} />
                </button>
              </span>
            ))}
          </div>
        )}
        {menu('value', options, onValue)}
        {live && onRemove === undefined ? null : (
          <button type="button" aria-label={`Remove the ${field} condition`} onClick={greyed ? undefined : onRemove} className={`shrink-0 text-ink-soft ${ring}`} {...skip}>
            <X />
          </button>
        )}
      </div>
      {reason(id, greyed)}
    </div>
  )
}
