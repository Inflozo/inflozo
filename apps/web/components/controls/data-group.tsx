'use client'

import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { movedTo } from '@inflozo/section-runtime'
import type { DataControl, DataRow, PickedPost } from '@inflozo/section-runtime'
import { DragGrip } from '@/components/kit/grip'
import { fieldTone, greyedProps, reason, ring, slimScrollbar, valueTone, type Greyed } from '@/components/kit/greyed'
import { AlertCircle, AlertTriangle, Check, ChevronDown, Search, TagGlyph, X } from '@/components/kit/icons'
import { SearchInput } from '@/components/kit/input'
import { Segmented } from '@/components/kit/segmented'
import { openPopover, Select } from '@/components/kit/select'
import { Stepper } from '@/components/kit/stepper'
import {
  HOLDS, initialOf, NO_MATCHES, NO_PICKS, NOT_IN_SOURCE, optionsOf, PAST_SLOW, PAST_SLOW_BOLD, PICK_ADDED, PICK_LACKING,
  PICK_REMOVED, PICKED, postsCount, SEARCH_POSTS, searchPosts, slow, type Held, type Option,
} from '@/lib/data-group'
import { captureLayout, landingAt, shift, slotTop, type Drag, type Layout } from '@/lib/reorder'

/* P0·5 · "POPULATE FROM…" — THE DATA GROUP'S BODY (Story 5.19, `P0-5 Populate From Panel.dc.html`, P0 spec :458-500),
   drawn once for every posts query a section asks: a design's declared one (Latest Post's included, where R-108 leaves
   Source alone) and a secondary feed's own. It replaced P0·3's Ghost-sourced card (`GhostList`), whose "Show" and Order
   it keeps as Count and Order.

   THE ROWS ARE THE ENGINE'S (`sidebar()`'s Data rows): Source (Latest · Featured · By tag · By author · Hand-picked); the
   tag or writer select, or the picked list, for the Source in force; Count; Order. Count and Order grey at Hand-picked
   with P0·5's two sentences, the Count showing the number of picks and the Order marking no value (R-69); the main
   feed's Count greys at the page size in force with D5c's sentence. Every value is a local edit through the engine's
   `setData` (Story 5.8 syncs it), so nothing here starts work a screen waits on (R-98), and a refusal is the engine's
   sentence, shown at its row.

   WHAT IS EXTRAPOLATED (R-74): the tag and writer selects are P0·5's closed select over a search field — the Link
   Picker's and D5e's grammar, "Tag/author selects live-search past ten entries with the Link Picker's field grammar" —
   and the picked list is P0·3's list (handle, name, a trailing control) with P0·5's ×, its dashed landing slot and its
   `⌥↑`/`⌥↓` moves (`lib/reorder.ts`, `movedTo`). The warning box is `item-list.tsx`'s floor box, the app's one warning
   shape. The words are `lib/data-group.ts`'s and the engine's, one list (R-170). */

type Row = Readonly<Record<string, unknown>>

/** What the pickers search: the SOURCE IN FORCE's own rows — the connected site's lists in hand, or the sample's — and
 *  whose content a note names. A value belongs to the source it was chosen from (5.18's rule for subjects). */
export type DataLists = {
  held: Held; tags: readonly Row[]; authors: readonly Row[]; posts: readonly Row[]
  /** D5e's capped line for the post search, or null when the list is whole */
  capped: string | null
  /** the same for the tag and writer selects (review, 2026-09-25): a site past the read's limit offers its fullest */
  listCapped: Readonly<Record<'tag' | 'author', string | null>>
}

type Change = readonly [DataControl, unknown]

const str = (v: unknown): string => (typeof v === 'string' ? v : '')

export function DataGroup({
  id,
  rows,
  stored,
  lists,
  shown,
  design,
  onData,
}: {
  id: string
  /** ONE query's Data rows, in the engine's order */
  rows: readonly DataRow[]
  /** the query's stored record — so a Source switch brings back the tag, writer or picks chosen before */
  stored: Readonly<Record<string, unknown>>
  lists: DataLists
  /** the rows the canvas shows for this query — a pick not among them is one the source in force does not hold;
   *  undefined while the site's rows are still being read, when nothing is known and nothing is marked lacking */
  shown: readonly unknown[] | undefined
  /** the design's name, for a fixed query's cap sentence */
  design: string
  /** one gesture's values, applied in order and committed once; answers the engine's refusal, or null */
  onData: (changes: readonly Change[]) => string | null
}) {
  const [refused, setRefused] = useState<{ control: DataControl; sentence: string } | null>(null)
  const set = (control: DataControl, changes: readonly Change[]) => {
    const no = onData(changes)
    setRefused(no === null ? null : { control, sentence: no })
  }
  const refusal = (control: DataControl): ReactNode =>
    refused?.control === control ? (
      <p role="status" className="flex items-start gap-2 rounded-sm bg-coral-tint p-[9px_10px] text-[11.5px] leading-[1.5] text-ink">
        <AlertCircle size={13} className="mt-px shrink-0 text-coral-text" />
        {refused.sentence}
      </p>
    ) : null

  return (
    <div data-data-group className="flex flex-col gap-3">
      {rows.map((row) => {
        const rowId = `${id}-${row.control}`
        switch (row.control) {
          case 'source':
            return (
              <div key={row.control} className="flex flex-col gap-[5px]">
                <Select
                  id={rowId}
                  label={row.label}
                  value={row.options?.find((o) => o.value === row.value)?.label ?? ''}
                  options={(row.options ?? []).map((o) => ({ value: o.value, label: o.label, active: o.value === row.value }))}
                  onSelect={(value) => {
                    // P0·5 draws the tag or writer select WITH a value: choosing By tag or By author with none chosen
                    // before starts on the fullest one (R-193's order) — a value chosen before comes back as it was
                    if ((value === 'tag' || value === 'author') && str(stored[value]) === '') {
                      const first = optionsOf(value === 'tag' ? lists.tags : lists.authors)[0]
                      return set('source', first === undefined ? [['source', value]] : [['source', value], [value, first.slug]])
                    }
                    set('source', [['source', value]])
                  }}
                />
                {refusal('source')}
              </div>
            )
          case 'tag':
          case 'author':
            return (
              <div key={row.control} className="flex flex-col gap-[5px]">
                <Taxonomy id={rowId} row={row} which={row.control} lists={lists} onChoose={(slug) => set(row.control, [[row.control, slug]])} />
                {refusal(row.control)}
              </div>
            )
          case 'picks':
            return (
              <div key={row.control} className="flex flex-col gap-[5px]">
                <Picks id={rowId} row={row} lists={lists} shown={shown} design={design} onPicks={(picks) => set('picks', [['picks', picks]])} />
                {refusal('picks')}
              </div>
            )
          case 'count':
            return (
              <div key={row.control} className="flex flex-col gap-[5px]">
                <Stepper
                  id={rowId}
                  label={row.label}
                  value={row.value}
                  min={row.min}
                  max={row.max}
                  greyed={row.greyed === undefined ? undefined : { reason: row.greyed }}
                  onStep={(step) => set('count', [['count', Number(row.value) + step]])}
                />
                {refusal('count')}
              </div>
            )
          case 'order':
            return (
              <div key={row.control} className="flex flex-col gap-[5px]">
                <Segmented
                  id={rowId}
                  label={row.label}
                  options={row.options ?? []}
                  active={row.value === '' ? null : row.value}
                  // R-69: at Hand-picked the order in force is the dragged one, which is neither value — none is marked
                  greyed={row.greyed === undefined ? undefined : { reason: row.greyed, value: null }}
                  onChange={(value) => set('order', [['order', value]])}
                />
                {refusal('order')}
              </div>
            )
        }
      })}
    </div>
  )
}

/** A writer's picture, or the ONE letter of the name Ghost supplied (P0·5, P0·8 rule 4) — never a silhouette. */
function Avatar({ option }: { option: Option }) {
  return option.image !== null ? (
    <img src={option.image} alt="" className="size-5 shrink-0 rounded-full object-cover" />
  ) : (
    <span aria-hidden className="inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-ink text-[9px] font-semibold text-surface">
      {initialOf(option.name)}
    </span>
  )
}

/** P0·5's tag or writer select: the chosen one's name and post count (a writer's with the picture or the initial), over
 *  a live search of the source in force's rows. A stored value the source does not hold keeps its slug and says so. */
function Taxonomy({ id, row, which, lists, onChoose }: { id: string; row: DataRow; which: 'tag' | 'author'; lists: DataLists; onChoose: (slug: string) => void }) {
  const [query, setQuery] = useState('')
  const options = optionsOf(which === 'tag' ? lists.tags : lists.authors)
  const current = options.find((o) => o.slug === row.value)
  const q = query.trim().toLowerCase()
  const found = q === '' ? options : options.filter((o) => o.name.toLowerCase().includes(q))
  const menu = `${id}-menu`
  const search = `${id}-q`
  // a value past a capped list is not KNOWN to be missing — only a whole list can say so
  const lacking = row.value !== '' && current === undefined && lists.listCapped[which] === null
  return (
    <div className="flex flex-col gap-[5px]">
      <span id={`${id}-label`} className="text-control-label font-medium text-ink-soft">{row.label}</span>
      <button
        type="button"
        id={id}
        aria-labelledby={`${id}-label ${id}`}
        aria-describedby={lacking ? `${id}-note` : undefined}
        popoverTarget={menu}
        onClick={(event) => {
          const pop = document.getElementById(menu)
          setQuery('')
          if (pop) openPopover(pop, event.currentTarget, { side: 'down', align: 'left' }, document.getElementById(search))
        }}
        className={`flex h-[38px] items-center gap-2 rounded-sm border border-line bg-surface px-[10px] hover:border-line-strong ${ring}`}
      >
        {which === 'tag' ? <TagGlyph size={13} className="shrink-0 text-ink-soft" /> : current !== undefined ? <Avatar option={current} /> : null}
        <span className="min-w-0 flex-1 truncate text-left text-[12.5px] font-medium text-ink">{current?.name ?? row.value}</span>
        {current !== undefined ? <span className="shrink-0 font-mono text-[10px] text-ink-soft">{postsCount(current.count)}</span> : null}
        <ChevronDown size={12} className="shrink-0 text-ink-soft" />
      </button>
      {lacking ? <p id={`${id}-note`} className="text-[11.5px] leading-[1.5] text-ink-soft">{NOT_IN_SOURCE(which, lists.held)}</p> : null}
      <div
        id={menu}
        popover="auto"
        role="dialog"
        aria-label={`Choose a ${which === 'tag' ? 'tag' : 'writer'}`}
        className="w-[248px] flex-col gap-2 overflow-hidden rounded border border-line bg-surface p-[8px] shadow-lg open:flex"
      >
        <SearchInput id={search} label={`Search ${which === 'tag' ? 'tags' : 'writers'}`} labelHidden placeholder={`Search ${which === 'tag' ? 'tags' : 'writers'}`} value={query} onChange={(e) => setQuery(e.target.value)} />
        {lists.listCapped[which] === null ? null : <p data-list-capped className="px-[2px] text-[11.5px] leading-[1.5] text-ink-soft">{lists.listCapped[which]}</p>}
        {found.length === 0 ? <p className="px-[2px] text-[11.5px] leading-[1.5] text-ink-soft">{NO_MATCHES}</p> : null}
        <ul className={`flex max-h-[min(300px,55vh)] list-none flex-col gap-px overflow-y-auto ${slimScrollbar}`}>
          {found.map((o) => (
            <li key={o.slug} className="relative flex">
              <button
                type="button"
                aria-current={o.slug === row.value ? 'true' : undefined}
                onClick={(event) => {
                  event.currentTarget.closest<HTMLElement>('[popover]')?.hidePopover()
                  if (o.slug !== row.value) onChoose(o.slug)
                }}
                className={`flex min-w-0 flex-1 items-center gap-2 rounded-sm px-2 py-[7px] text-left ${ring} ${o.slug === row.value ? 'bg-coral-tint' : 'hover:bg-paper'}`}
              >
                {which === 'author' ? <Avatar option={o} /> : null}
                <span className={`min-w-0 flex-1 truncate text-ui-dense ${o.slug === row.value ? 'font-semibold' : 'font-medium'} text-ink`}>{o.name}</span>
                <span className="shrink-0 font-mono text-[10px] text-ink-soft">{postsCount(o.count)}</span>
                {o.slug === row.value ? <Check size={13} className="shrink-0 text-coral-deep" /> : null}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

/** P0·5's hand-picked list: the picks in their dragged order — a handle that drags and takes `⌥↑`/`⌥↓`, the title, a
 *  note where the source in force does not hold it, and × — then "Search posts to add". No maximum: past 25 the count
 *  turns warning-toned and the cost is named; a FIXED query holds at most its own limit, and at it the search greys. */
function Picks({ id, row, lists, shown, design, onPicks }: {
  id: string
  row: DataRow
  lists: DataLists
  shown: readonly unknown[] | undefined
  design: string
  onPicks: (picks: readonly PickedPost[]) => void
}) {
  const picks = row.picks ?? []
  const found = shown === undefined ? null : new Set(shown.map((r) => str((r as Row)['id'])))
  const [said, setSaid] = useState('')
  const [query, setQuery] = useState('')
  const [drag, setDrag] = useState<Drag | null>(null)
  const layout = useRef<Layout>({ tops: [], heights: [], gap: 0 })
  const start = useRef(0)
  const list = useRef<HTMLUListElement>(null)
  const [focusAt, setFocusAt] = useState<number | null>(null)
  useEffect(() => {
    if (focusAt === null) return
    // a removed row's neighbour, else (the list emptied) the search that adds one — focus never drops to the body
    const handle = list.current?.querySelector<HTMLElement>(`[data-pick-handle="${focusAt}"]`)
    ;(handle ?? document.getElementById(`${id}-search`))?.focus()
    setFocusAt(null)
  }, [focusAt, id])

  const move = (from: number, to: number) => {
    const next = picks.filter((_, i) => i !== from)
    next.splice(to, 0, picks[from] as PickedPost)
    setSaid(movedTo(to, picks.length))
    onPicks(next)
  }
  const posts = lists.posts.map((p) => ({ id: str(p['id']), title: str(p['title']) })).filter((p) => p.id !== '')
  const results = searchPosts(posts, query, picks)
  const full = row.cap !== undefined && picks.length >= row.cap
  const greyed: Greyed | undefined = full ? { reason: HOLDS(design, row.cap as number) } : undefined
  const menu = `${id}-menu`
  const search = `${id}-q`
  const warn = slow(picks.length)

  const onHandleKey = (i: number) => (event: KeyboardEvent<HTMLButtonElement>) => {
    if (!event.altKey || (event.key !== 'ArrowUp' && event.key !== 'ArrowDown')) return
    event.preventDefault()
    const to = i + (event.key === 'ArrowUp' ? -1 : 1)
    if (to < 0 || to >= picks.length) return
    move(i, to)
    setFocusAt(to)
  }

  return (
    <div data-picked-list className="flex flex-col gap-[5px]">
      <span className="flex items-center justify-between">
        <span id={`${id}-label`} className="text-control-label font-medium text-ink-soft">{row.label}</span>
        <span data-picked-count data-warn={warn ? '' : undefined} className={`font-mono text-[10px] ${warn ? 'text-coral-text' : 'text-ink-soft'}`}>{PICKED(picks.length)}</span>
      </span>
      {picks.length === 0 ? <p className="text-[11.5px] leading-[1.5] text-ink-soft">{NO_PICKS}</p> : null}
      <ul ref={list} aria-labelledby={`${id}-label`} className="relative flex list-none flex-col gap-[3px]">
        {drag !== null ? (
          <li aria-hidden data-drop-slot style={{ top: slotTop(drag, layout.current), height: layout.current.heights[drag.from] ?? 0 }} className="pointer-events-none absolute inset-x-0 rounded-sm border border-dashed border-line-strong bg-paper-sunk" />
        ) : null}
        {picks.map((pick, i) => {
          const lifted = drag?.from === i
          const lacking = found !== null && !found.has(pick.id)
          return (
            <li
              key={pick.id}
              data-pick={i}
              style={lifted ? { translate: `0 ${drag.dy}px` } : drag !== null ? { translate: `0 ${shift(drag, i, layout.current)}px` } : undefined}
              className={`relative flex items-start gap-2 rounded-sm border border-line bg-surface p-[7px_8px] ${lifted ? 'z-10 shadow-lg motion-safe:rotate-2' : drag !== null ? 'motion-safe:transition-[translate] motion-safe:duration-150' : ''}`}
            >
              <button
                type="button"
                data-pick-handle={i}
                aria-label={`Move: ${pick.title}`}
                aria-describedby={`${id}-how`}
                onKeyDown={onHandleKey(i)}
                onPointerDown={(event) => {
                  if (event.button !== 0 || drag !== null) return
                  event.currentTarget.setPointerCapture(event.pointerId)
                  start.current = event.clientY
                  layout.current = captureLayout([...(list.current?.querySelectorAll<HTMLElement>('[data-pick]') ?? [])])
                  setDrag({ from: i, to: i, dy: 0 })
                }}
                onPointerMove={(event) => {
                  if (drag === null || drag.from !== i) return
                  setDrag({ from: i, to: landingAt(layout.current, i, event.clientY, start.current), dy: event.clientY - start.current })
                }}
                onPointerUp={() => {
                  if (drag === null) return
                  const { from, to } = drag
                  setDrag(null)
                  if (to !== from) move(from, to)
                }}
                onPointerCancel={() => setDrag(null)}
                className={`mt-px flex h-[18px] w-4 shrink-0 cursor-grab touch-none items-center justify-center rounded-[4px] ${ring}`}
              >
                <DragGrip />
              </button>
              <span className="flex min-w-0 flex-1 flex-col gap-px">
                <span className="truncate text-[12px] font-medium text-ink">{pick.title}</span>
                {lacking ? <span data-pick-note className="text-[11px] leading-[1.4] text-ink-soft">{PICK_LACKING(lists.held)}</span> : null}
              </span>
              {/* × unpicks and never greys (UX-DR4) */}
              <button
                type="button"
                aria-label={`Remove ${pick.title}`}
                title={`Remove ${pick.title}`}
                onClick={() => {
                  setSaid(PICK_REMOVED(pick.title))
                  setFocusAt(i < picks.length - 1 ? i : i - 1)
                  onPicks(picks.filter((_, x) => x !== i))
                }}
                className={`inline-flex size-[18px] shrink-0 items-center justify-center rounded-[4px] text-ink-soft hover:bg-paper hover:text-ink ${ring}`}
              >
                <X size={12} />
              </button>
            </li>
          )
        })}
      </ul>
      <p id={`${id}-how`} className="sr-only">Press Option or Alt with the up or down arrow to move this post.</p>
      <p aria-live="polite" className="sr-only">{said}</p>
      {warn ? (
        // P0·5 (:193-195): the frame's rust tint and hairline, drawn in the calibrated coral pair, and its two phrases bold
        <p data-picked-slow className="flex items-start gap-2 rounded-sm border border-coral-tint-strong bg-coral-tint p-[9px_10px] text-[11.5px] leading-[1.55] text-ink">
          <AlertTriangle size={13} className="mt-px shrink-0 text-coral-text" />
          <span>{PAST_SLOW.split(PAST_SLOW_BOLD).map((part, i) => (i % 2 === 1 ? <strong key={i} className="font-semibold">{part}</strong> : part))}</span>
        </p>
      ) : null}
      <div className="flex flex-col gap-[5px]">
        <button
          type="button"
          id={`${id}-search`}
          popoverTarget={full ? undefined : menu}
          onClick={
            full
              ? undefined
              : (event) => {
                  const pop = document.getElementById(menu)
                  setQuery('')
                  if (pop) openPopover(pop, event.currentTarget, { side: 'down', align: 'left' }, document.getElementById(search))
                }
          }
          className={`flex h-[34px] items-center gap-2 rounded-sm border px-[10px] text-left ${fieldTone(greyed)} ${ring}`}
          {...greyedProps(`${id}-search`, greyed)}
        >
          <Search size={13} className={`shrink-0 ${greyed ? 'text-line-strong' : 'text-ink-soft'}`} />
          <span className={`text-[12px] ${greyed ? valueTone(greyed) : 'text-ink-soft-aa'}`}>{SEARCH_POSTS}</span>
        </button>
        {reason(`${id}-search`, greyed)}
      </div>
      {full ? null : (
        <div
          id={menu}
          popover="auto"
          role="dialog"
          aria-label={SEARCH_POSTS}
          className="max-h-[min(420px,70vh)] w-[280px] flex-col gap-2 overflow-hidden rounded border border-line bg-surface p-[8px] shadow-lg open:flex"
        >
          <SearchInput id={search} label={SEARCH_POSTS} labelHidden placeholder={SEARCH_POSTS} value={query} onChange={(e) => setQuery(e.target.value)} />
          {lists.capped === null ? null : <p data-picks-capped className="px-[2px] text-[11.5px] leading-[1.5] text-ink-soft">{lists.capped}</p>}
          {results.length === 0 ? <p className="px-[2px] text-[11.5px] leading-[1.5] text-ink-soft">{NO_MATCHES}</p> : null}
          <ul className={`flex min-h-0 flex-1 list-none flex-col gap-px overflow-y-auto ${slimScrollbar}`}>
            {results.map((p) => (
              <li key={p.id} className="relative flex">
                <button
                  type="button"
                  onClick={(event) => {
                    // a fixed query's last free place closes the search, whose trigger then greys with its reason
                    if (row.cap !== undefined && picks.length + 1 >= row.cap) event.currentTarget.closest<HTMLElement>('[popover]')?.hidePopover()
                    setSaid(PICK_ADDED(p.title))
                    onPicks([...picks, { id: p.id, title: p.title }])
                  }}
                  className={`flex min-w-0 flex-1 items-center rounded-sm px-2 py-[7px] text-left hover:bg-paper ${ring}`}
                >
                  <span className="min-w-0 flex-1 truncate text-ui-dense font-medium text-ink">{p.title}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
