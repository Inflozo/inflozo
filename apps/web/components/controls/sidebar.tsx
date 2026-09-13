'use client'

import { useId, useState, type ReactNode } from 'react'
import {
  editText, resetControl, resetSection, setContent, setControl, setData, sidebar,
} from '@inflozo/section-runtime'
import type { ControlEntry, ControlRow, ControlState, DataRow, PropRow, PropValue } from '@inflozo/section-runtime'
import { Accordion } from '@/components/kit/accordion'
import { ring, type Greyed } from '@/components/kit/greyed'
import { Image, InfoCircle } from '@/components/kit/icons'
import { Multiline, TextInput } from '@/components/kit/input'
import { HelperCaption } from '@/components/kit/labels'
import { MoonBadge } from '@/components/kit/moon-badge'
import { QuickControlsCard } from '@/components/kit/quick-controls-card'
import { Segmented } from '@/components/kit/segmented'
import { Select } from '@/components/kit/select'
import { Stepper } from '@/components/kit/stepper'
import { SwatchRow } from '@/components/kit/swatch-row'
import { Toggle } from '@/components/kit/toggle'
import { IconPicker } from './icon-picker'
import { ImagePicker, type Asset } from './image-picker'
import { GhostList, ItemList } from './item-list'
import { LinkPicker, type LinkResources } from './link-picker'

/* THE CONTROLS PANEL — what Epic 5 mounts beside its canvas (Story 4.5).

   It draws `sidebar()`'s model and nothing else: every row, value, grey, moon and "changed" flag is the
   engine's, from the one declaration both emitters read (FR-F7), so the panel cannot offer what a render
   would not stamp. Every edit goes through the engine too, and the NEXT STATE is handed up with its kind:
   `control` changes only the section root's attributes, `content` needs a re-render. A refused edit
   comes back as the engine's sentence and changes nothing.

   Built from the Kit (R-74), in the frames' order: the Quick Controls card (`Editor Sidebar Kit.dc.html:195`,
   S4c), then Content, Arrangement, Style and Data as accordions (`:44`). WHERE A RULING OVERRIDES A FRAME
   (the spec's Design Notes): S4c's second accordion is "Design" and FR-F3 names it Arrangement; the
   universal trio is never a Quick Control and sits as one block at the foot of Style, after that group's
   absent note (P0-0: the note sits where the control would have been); a changed control carries a
   "Reset" in the style of D5's "Reset this design" (12 px, ink-soft), and "Reset this design" sits at the
   panel foot with no confirm — D5 draws none. The moon badge carries its words, "Dark override" (UX-DR8). */

export type Edit = 'control' | 'content'

export type SidebarProps = {
  entry: ControlEntry
  state: ControlState
  onChange: (next: ControlState, kind: Edit) => void
  /** Background role's colours, by role — the site's own (the review hands it the reference tokens) */
  swatches: Readonly<Record<string, string>>
  /** the site's time zone name, printed under a date (the value itself is never converted) */
  timezone: string
  links: LinkResources
  assets: readonly Asset[]
  /** each Ghost-sourced query's rows as the canvas shows them, for the read-only preview */
  sourceRows: Readonly<Record<string, readonly unknown[]>>
}

const slug = (s: string) => s.replace(/[^a-zA-Z0-9]+/g, '-')

const textOf = (v: unknown) =>
  typeof v === 'string' ? v : typeof v === 'object' && v !== null && typeof (v as { text?: unknown }).text === 'string' ? (v as { text: string }).text : ''

function ControlField({
  id,
  row,
  swatches,
  onValue,
  onReset,
}: {
  id: string
  row: ControlRow
  swatches: Readonly<Record<string, string>>
  onValue: (value: string) => void
  onReset: () => void
}) {
  const greyed: Greyed | undefined = row.greyed === undefined ? undefined : row.value === null ? { reason: row.greyed, value: null } : { reason: row.greyed }
  const words = (v: string | null) => row.options.find((o) => o.value === v)?.label ?? ''
  const aside = (
    <>
      {row.moon ? (
        <>
          <MoonBadge label="" />
          <span className="font-normal text-ink-soft">Dark override</span>
        </>
      ) : null}
      {row.changed ? (
        <button type="button" aria-label={`Reset ${row.label}`} onClick={onReset} className={`text-[12px] font-normal text-ink-soft hover:text-ink ${ring}`}>
          Reset
        </button>
      ) : null}
    </>
  )
  switch (row.type) {
    case 'stepper': {
      const at = row.options.findIndex((o) => o.value === row.value)
      const first = row.options[0]?.value
      const last = row.options[row.options.length - 1]?.value
      return (
        <Stepper
          id={id}
          label={row.label}
          value={row.value ?? ''}
          greyed={greyed}
          min={Number(first)}
          max={Number(last)}
          aside={aside}
          onStep={(step) => {
            const to = row.options[at + step]
            if (to) onValue(to.value)
          }}
        />
      )
    }
    case 'toggle':
      return <Toggle id={id} label={row.label} checked={row.value === 'on'} greyed={greyed} aside={aside} onToggle={(on) => onValue(on ? 'on' : 'off')} />
    case 'named-select':
      return (
        <Select
          id={id}
          label={row.label}
          value={words(row.value)}
          greyed={greyed}
          aside={aside}
          options={row.options.map((o) => ({ value: o.value, label: o.label, active: o.value === row.value }))}
          onSelect={onValue}
        />
      )
    case 'swatch-row':
      return (
        <SwatchRow
          id={id}
          label={row.label}
          active={row.value}
          greyed={greyed}
          aside={aside}
          onChange={onValue}
          swatches={row.options.map((o) => {
            const color = swatches[o.value]
            // a role with no colour of its own — Image — is drawn with the Kit's image glyph
            return { role: o.value, label: o.label, ...(color === undefined ? { glyph: <Image size={13} /> } : { color }), ...(o.greyed === undefined ? {} : { greyed: o.greyed }) }
          })}
        />
      )
    default:
      return <Segmented id={id} label={row.label} options={row.options} active={row.value} greyed={greyed} aside={aside} onChange={onValue} />
  }
}

/** P0-0's never-offered note: no row, one sentence where the control would have been. */
const Absent = ({ note }: { note: string }) => (
  <div className="flex items-start gap-2 rounded-sm bg-paper-sunk p-[9px_10px]">
    <InfoCircle size={13} className="mt-px shrink-0 text-ink-soft" />
    <span className="text-[11.5px] leading-[1.5] text-ink-soft">{note}</span>
  </div>
)

export function Sidebar({ entry, state, onChange, swatches, timezone, links, assets, sourceRows }: SidebarProps) {
  const base = useId()
  const [open, setOpen] = useState<Readonly<Record<string, boolean>>>({})
  const [floor, setFloor] = useState<{ path: string; sentence: string } | null>(null)
  const model = sidebar(entry, state)

  /** Every edit ends here: a refusal is the engine's sentence and changes nothing; anything else is the
   *  next state, and it clears the floor sentence (P0-3: "it clears on the next edit"). */
  const commit = (next: ControlState | string, kind: Edit): string | null => {
    if (typeof next === 'string') return next
    setFloor(null)
    onChange(next, kind)
    return null
  }

  const control = (row: ControlRow) => (
    <ControlField
      key={row.name}
      id={`${base}-${row.name}`}
      row={row}
      swatches={swatches}
      onValue={(value) => commit(setControl(entry, state, row.name, value), 'control')}
      onReset={() => commit(resetControl(entry, state, row.name), 'control')}
    />
  )

  /** One content editor, by the prop's type. Items reuse it, so an item edits the way the section does. */
  const field = (prop: PropRow, value: unknown, onValue: (value: unknown) => void, id: string): ReactNode => {
    switch (prop.type) {
      case 'richtext':
        return <Multiline key={id} id={id} label={prop.label} value={textOf(value)} onChange={(e) => onValue(editText(value as PropValue, e.target.value))} />
      case 'date':
        return (
          <div key={id} className="flex flex-col gap-[5px]">
            <TextInput id={id} label={prop.label} type="date" value={typeof value === 'string' ? value : ''} onChange={(e) => onValue(e.target.value)} />
            <HelperCaption>Site time zone: {timezone}</HelperCaption>
          </div>
        )
      case 'image':
        return <ImagePicker key={id} id={id} label={prop.label} value={value} assets={assets} onChange={onValue} />
      case 'url':
        return <LinkPicker key={id} id={id} label={prop.label} value={value} resources={links} onChange={onValue} />
      case 'icon':
        return <IconPicker key={id} id={id} label={prop.label} value={value} onChange={onValue} />
      default:
        return <TextInput key={id} id={id} label={prop.label} value={textOf(value)} onChange={(e) => onValue(editText(value as PropValue, e.target.value))} />
    }
  }

  const content = (row: PropRow) => {
    const id = `${base}-${slug(row.path)}`
    if (row.list !== undefined) {
      return (
        <ItemList
          key={row.path}
          id={id}
          row={row}
          entry={entry}
          state={state}
          commit={(next) => commit(next, 'content')}
          floor={floor?.path === row.path ? floor.sentence : null}
          onFloor={(sentence) => setFloor({ path: row.path, sentence })}
          field={field}
        />
      )
    }
    return field(row, row.value, (value) => commit(setContent(entry, state, row.path, value), 'content'), id)
  }

  const data = (rows: readonly DataRow[]) => {
    const keys = [...new Set(rows.map((r) => r.key))]
    return keys.map((key) => {
      const own = rows.filter((r) => r.key === key)
      const titles = (sourceRows[key] ?? []).map((r) => String((r as { title?: unknown }).title ?? ''))
      return (
        <GhostList
          key={key}
          id={`${base}-data-${slug(key)}`}
          source={own[0]?.source ?? key}
          rows={own}
          titles={titles}
          onData={(which, value) => commit(setData(entry, state, key, which, value), 'content')}
        />
      )
    })
  }

  return (
    <div className="flex flex-col gap-3">
      {model.quick.length > 0 ? <QuickControlsCard>{model.quick.map(control)}</QuickControlsCard> : null}

      <div className="flex flex-col">
        {model.groups.map((group) => {
          const rows = group.rows
          const body =
            group.id === 'content' ? (
              <>
                {rows.map((r) => (r.kind === 'prop' ? content(r) : null))}
                {group.absent.map((note) => <Absent key={note} note={note} />)}
              </>
            ) : group.id === 'data' ? (
              <>
                {data(rows.filter((r): r is DataRow => r.kind === 'data'))}
                {group.absent.map((note) => <Absent key={note} note={note} />)}
              </>
            ) : (
              <>
                {rows.map((r) => (r.kind === 'control' && !r.universal ? control(r) : null))}
                {group.absent.map((note) => <Absent key={note} note={note} />)}
                {rows.map((r) => (r.kind === 'control' && r.universal ? control(r) : null))}
              </>
            )
          return (
            <Accordion
              key={group.id}
              id={`${base}-group-${group.id}`}
              title={group.label}
              open={open[group.id] === true}
              onToggle={() => setOpen({ ...open, [group.id]: open[group.id] !== true })}
            >
              <div className="flex flex-col gap-3 pb-3 pt-1">{body}</div>
            </Accordion>
          )
        })}
      </div>

      <div className="flex items-center gap-2 border-t border-line pt-3">
        <button
          type="button"
          onClick={() => commit(resetSection(entry, state), 'content')}
          className={`text-[12px] text-ink-soft hover:text-ink ${ring}`}
        >
          Reset this design
        </button>
      </div>
    </div>
  )
}
