'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { addItem, duplicateItem, getPath, moveItem, removeItem, setContent } from '@inflozo/section-runtime'
import type { ControlEntry, ControlState, DataRow, PropRow } from '@inflozo/section-runtime'
import { AddButton } from '@/components/kit/button'
import { ring } from '@/components/kit/greyed'
import { DragGrip } from '@/components/kit/grip'
import { AlertCircle, Copy, FromGhost, InfoCircle } from '@/components/kit/icons'
import { Segmented } from '@/components/kit/segmented'
import { Menu } from '@/components/kit/select'
import { Stepper } from '@/components/kit/stepper'
import { arrowKeys, openMenu } from '@/lib/menu'
import { shownInThisDesign } from '@/lib/ring'
import { captureLayout, landingAt, shift, slotTop, type Drag, type Layout } from '@/lib/reorder'

/* The two list grammars of `P0-3 Item List Controls.dc.html`, which must never blur.

   THE AUTHORED LIST (:32-52): a range line in mono ("2–6 · 3 used"), a row per item — a Move handle, the
   item's first text field as its name, and an overflow holding Duplicate and Remove and nothing else —
   and "+ Add {item}" at the foot. A new item lands last with the placeholder content its props declare.
   At the ceiling Add greys with its sentence (:113-114). REMOVE NEVER GREYS (R-12, :142-176): at the floor
   it still presses, and the floor sentence appears under the list and clears on the next edit. Reorder is
   a drag on the handle (a 2° tilt while it moves, none under reduced motion) or ⌥↑/⌥↓ on the focused
   handle, announced politely in the engine's words. WHILE A ROW IS DRAGGED, A DASHED EMPTY SLOT THE ROW'S
   SIZE SHOWS WHERE IT WILL LAND and the rows between slide aside to make room (the owner's finding 9,
   2026-09-13, for every editable list — EXPERIENCE.md § the reorderable list). P0-3 draws no drop state, so
   the slot is the Kit's own dashed border, the "+ Add" button's. Nothing moves in the DOM until the drop:
   the other rows are TRANSLATED, so the dragged handle keeps its pointer capture and its focus. Pressing a row's name opens that item's fields
   beneath the list — P0-3 selects the item on canvas; with no canvas selection yet (Epic 5), the fields
   open here.

   THE GHOST-SOURCED CARD (:54-97): a live Show count and Order over read-only rows, and Add, the handles
   and the overflow greyed with the owner's sentence (3 September 2026) — you choose how many and in what
   order, never which. FR-F1: a Ghost-bound repeat is never an item list. */

type Commit = (next: ControlState | string) => string | null

export function ItemList({
  id,
  row,
  entry,
  state,
  commit,
  floor,
  onFloor,
  field,
}: {
  id: string
  row: PropRow
  entry: ControlEntry
  state: ControlState
  /** hands an edit to the panel; a sentence comes back when the engine refused it */
  commit: Commit
  /** the floor sentence to show under this list, until the next edit */
  floor: string | null
  onFloor: (sentence: string) => void
  /** draws one item prop's editor — the panel's own field, so an item edits the way a section does */
  field: (prop: PropRow, value: unknown, onValue: (value: unknown) => void, id: string) => ReactNode
}) {
  const list = row.list
  const items = Array.isArray(row.value) ? (row.value as unknown[]) : []
  const [open, setOpen] = useState<number | null>(null)
  const [said, setSaid] = useState('')
  const [drag, setDrag] = useState<Drag | null>(null)
  // every row's top and height as the drag began, relative to the list — the slot is read against these,
  // never against rows that are already sliding, which would chase itself. Story 5.4 lifted the arithmetic
  // into `lib/reorder.ts`, unchanged, so Layers drags by the same numbers (standing rule 3).
  const layout = useRef<Layout>({ tops: [], heights: [], gap: 0 })
  const [focusAt, setFocusAt] = useState<number | null>(null)
  const start = useRef(0)
  const rows = useRef<HTMLUListElement>(null)

  useEffect(() => {
    if (focusAt === null) return
    rows.current?.querySelector<HTMLElement>(`[data-handle="${focusAt}"]`)?.focus()
    setFocusAt(null)
  }, [focusAt])

  if (list === undefined) return null
  const noun = list.item
  const cut = row.path.length + 3 // `features[].` → the item's own key
  const title = list.props.find((p) => p.type === 'text')
  const nameOf = (i: number) => {
    const v = title ? getPath(items[i], title.path.slice(cut)) : undefined
    const text = typeof v === 'string' ? v : typeof v === 'object' && v !== null && typeof (v as { text?: unknown }).text === 'string' ? (v as { text: string }).text : ''
    return text.trim() === '' ? `${noun} ${i + 1}` : text
  }

  const move = (from: number, to: number) => {
    const moved = moveItem(entry, state, row.path, from, to)
    if (typeof moved === 'string') return
    setSaid(moved.announce)
    if (open === from) setOpen(to)
    commit(moved.state)
  }

  /* STORY 5.11 — FR-D13's sentence, IN PLACE OF P0-3's range line and only where the two numbers differ: a design
     renders only as many items as its structure fits (`data-items-limit`), and "8 items shuffled into a 3-card
     layout shows 3 … the sidebar shows the count". The items past the cap are not gone — they are waiting for a
     design that fits them — so this says what is drawn, never what is stored. `shown` is the ENGINE's own number
     (`PropRow.list`), so the panel and both emitters cannot disagree about it. */
  const range = list.shown < list.count
    ? shownInThisDesign(list.count, list.shown)
    : list.min !== undefined && list.max !== undefined ? `${list.min}–${list.max} · ${list.count} used` : `${list.count} used`

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span id={`${id}-label`} className="text-control-label font-medium text-ink-soft">
          {row.label}
        </span>
        <span className="font-mono text-[10px] text-ink-soft">{range}</span>
      </div>

      <ul ref={rows} aria-labelledby={`${id}-label`} className="relative flex list-none flex-col gap-[3px]">
        {drag !== null ? (
          <li
            aria-hidden
            data-drop-slot
            style={{ top: slotTop(drag, layout.current), height: layout.current.heights[drag.from] ?? 0 }}
            className="pointer-events-none absolute inset-x-0 rounded-sm border border-dashed border-line-strong bg-paper-sunk"
          />
        ) : null}
        {items.map((_, i) => {
          const name = nameOf(i)
          const lifted = drag?.from === i
          const menu = `${id}-menu-${i}`
          return (
            <li
              key={i}
              data-row={i}
              style={lifted ? { translate: `0 ${drag.dy}px` } : drag !== null ? { translate: `0 ${shift(drag, i, layout.current)}px` } : undefined}
              className={`relative flex items-center gap-2 rounded-sm border bg-surface p-2 ${
                open === i ? 'border-coral shadow-[0_0_0_2px_var(--color-coral-wash)]' : 'border-line'
              } ${lifted ? 'z-10 shadow-lg motion-safe:rotate-2' : drag !== null ? 'motion-safe:transition-[translate] motion-safe:duration-150' : ''}`}
            >
              <button
                type="button"
                data-handle={i}
                aria-label={`Move: ${name}`}
                aria-describedby={`${id}-how`}
                onKeyDown={(event) => {
                  if (!event.altKey || (event.key !== 'ArrowUp' && event.key !== 'ArrowDown')) return
                  event.preventDefault()
                  const to = i + (event.key === 'ArrowUp' ? -1 : 1)
                  if (to < 0 || to >= items.length) return
                  move(i, to)
                  setFocusAt(to)
                }}
                onPointerDown={(event) => {
                  if (event.button !== 0 || drag !== null) return // a second pointer never takes over a live drag
                  event.currentTarget.setPointerCapture(event.pointerId)
                  start.current = event.clientY
                  layout.current = captureLayout([...(rows.current?.querySelectorAll<HTMLElement>('[data-row]') ?? [])])
                  setDrag({ from: i, to: i, dy: 0 })
                }}
                onPointerMove={(event) => {
                  if (drag === null || drag.from !== i) return
                  // the slot is how many OTHER rows the dragged row's middle has passed the middle of, as they
                  // stood when the drag began (`lib/reorder.ts`)
                  setDrag({ from: i, to: landingAt(layout.current, i, event.clientY, start.current), dy: event.clientY - start.current })
                }}
                onPointerUp={() => {
                  if (drag === null) return
                  const { from, to } = drag
                  setDrag(null)
                  if (to !== from) move(from, to)
                }}
                onPointerCancel={() => setDrag(null)}
                className={`flex h-[22px] w-4 shrink-0 cursor-grab touch-none items-center justify-center rounded-[4px] ${ring}`}
              >
                <DragGrip />
              </button>
              <button
                type="button"
                aria-expanded={open === i}
                aria-controls={`${id}-item`}
                onClick={() => setOpen(open === i ? null : i)}
                className={`min-w-0 flex-1 truncate rounded-[4px] text-left text-[12.5px] font-medium text-ink ${ring}`}
              >
                {name}
              </button>
              <button
                type="button"
                aria-label={`More for ${name}`}
                popoverTarget={menu}
                onClick={(event) => {
                  const el = document.getElementById(menu)
                  if (el) openMenu(el, event.currentTarget, { side: 'down', align: 'right' })
                }}
                className={`inline-flex size-[22px] shrink-0 items-center justify-center rounded-[6px] text-[12px] font-bold tracking-[1px] text-ink-soft hover:bg-paper hover:text-ink ${ring}`}
              >
                …
              </button>
              <div id={menu} popover="auto" onKeyDown={arrowKeys} className="border-0 bg-transparent p-0">
                <Menu
                  label={name}
                  items={[
                    {
                      label: 'Duplicate',
                      icon: <Copy size={13} />,
                      onSelect: () => {
                        // review: at the ceiling the engine refuses Duplicate with the same sentence as Add — say it
                        const refused = commit(duplicateItem(entry, state, row.path, i))
                        if (refused !== null) onFloor(refused)
                      },
                    },
                    {
                      label: 'Remove',
                      danger: true,
                      onSelect: () => {
                        const refused = commit(removeItem(entry, state, row.path, i))
                        if (refused !== null) onFloor(refused)
                        else if (open !== null) setOpen(open === i ? null : open > i ? open - 1 : open)
                      },
                    },
                  ]}
                />
              </div>
            </li>
          )
        })}
      </ul>
      <p id={`${id}-how`} className="sr-only">
        Press Option or Alt with the up or down arrow to move this {noun}.
      </p>
      <p aria-live="polite" className="sr-only">
        {said}
      </p>

      <div role="status">
        {floor !== null ? (
          <p className="mt-[2px] flex items-start gap-2 rounded-sm bg-coral-tint p-[9px_10px] text-[11.5px] leading-[1.5] text-ink">
            <AlertCircle size={13} className="mt-px shrink-0 text-coral-text" />
            {floor}
          </p>
        ) : null}
      </div>

      <div className="mt-[2px]">
        <AddButton
          id={`${id}-add`}
          greyed={list.atMax !== undefined ? { reason: list.atMax } : undefined}
          onClick={() => {
            const next = addItem(entry, state, row.path)
            if (commit(next) === null) setOpen(null)
          }}
        >
          + Add {noun}
        </AddButton>
      </div>

      {open !== null && open < items.length ? (
        <div
          id={`${id}-item`}
          role="group"
          aria-label={nameOf(open)}
          className="mt-1 flex flex-col gap-3 rounded-sm border border-line bg-surface p-[10px]"
        >
          {list.props.map((prop) =>
            field(
              prop,
              getPath(items[open], prop.path.slice(cut)),
              (value) => commit(setContent(entry, state, prop.path, value, open)),
              `${id}-${open}-${prop.path.replace(/[^a-zA-Z0-9]+/g, '-')}`,
            ),
          )}
        </div>
      ) : null}
    </div>
  )
}

/** "These come from Ghost…" — the owner's sentence, ruled 3 September 2026 (`P0-3 Item List Controls.dc.html:94`). */
const FROM_GHOST = 'These come from Ghost, so there is nothing to add here.'

export function GhostList({
  id,
  source,
  rows,
  titles,
  onData,
}: {
  id: string
  /** the query's source — `posts` */
  source: string
  /** the query's Count and Order rows, from `sidebar()` */
  rows: readonly DataRow[]
  /** the rows the canvas shows, in its order, read-only here */
  titles: readonly string[]
  onData: (control: 'count' | 'order', value: number | string) => void
}) {
  const count = rows.find((r) => r.control === 'count')
  const order = rows.find((r) => r.control === 'order')
  const noun = source.endsWith('s') ? source.slice(0, -1) : source
  const heading = `${source.charAt(0).toUpperCase()}${source.slice(1)}`
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span id={`${id}-label`} className="text-control-label font-medium text-ink-soft">
          {heading}
        </span>
        <span className="inline-flex items-center gap-[5px] font-mono text-[10px] text-ink-soft">
          <FromGhost size={11} />
          From Ghost
        </span>
      </div>
      <div className="flex flex-col gap-[10px] rounded-sm border border-line bg-surface p-[10px]">
        {count ? (
          <Stepper
            id={`${id}-count`}
            label={count.label}
            value={count.value}
            min={count.min}
            max={count.max}
            onStep={(step) => onData('count', Number(count.value) + step)}
          />
        ) : null}
        {order ? (
          <Segmented
            id={`${id}-order`}
            label={order.label}
            options={order.options ?? []}
            active={order.value}
            onChange={(value) => onData('order', value)}
          />
        ) : null}
      </div>
      <ul aria-label={`${heading} from Ghost, in the order shown`} className="flex list-none flex-col gap-[3px] pt-[6px]">
        {titles.map((t, i) => (
          <li
            key={`${i}-${t}`}
            className="flex cursor-not-allowed items-center gap-2 rounded-sm border border-grey-border bg-grey-field p-[7px_8px]"
          >
            <span aria-hidden className="flex w-4 shrink-0 justify-center opacity-60">
              <DragGrip />
            </span>
            <span className="min-w-0 flex-1 truncate text-control-label text-ink-soft">{t}</span>
            <span aria-hidden className="inline-flex size-[22px] shrink-0 items-center justify-center text-[12px] font-bold tracking-[1px] text-line-strong">
              …
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-1">
        <AddButton id={`${id}-add`} greyed={{ reason: FROM_GHOST }}>
          + Add {noun}
        </AddButton>
      </div>
      {source === 'posts' ? (
        <div className="mt-2 flex items-start gap-2 rounded-sm bg-paper-sunk p-[9px_10px]">
          <InfoCircle size={13} className="mt-px shrink-0 text-ink-soft" />
          <span className="text-[11.5px] leading-[1.5] text-ink-soft">
            These are your published posts. Add and remove them in Ghost — this design chooses how many to show, and in what order.
          </span>
        </div>
      ) : null}
    </div>
  )
}
