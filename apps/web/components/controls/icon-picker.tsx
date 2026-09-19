'use client'

import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode, type RefObject } from 'react'
import { iconSvg } from '@inflozo/section-runtime'
import { ring, slimScrollbar } from '@/components/kit/greyed'
import { ChevronDown } from '@/components/kit/icons'
import { SearchInput } from '@/components/kit/input'
import { Segmented } from '@/components/kit/segmented'
import { Select, openPopover } from '@/components/kit/select'

/* The Icon Picker (FR-F1), as `P0-2 Icon Slot and Picker.dc.html:56-173` draws it and R-104 reshapes it:
   every Tabler icon, outline and filled, under Tabler's own categories. The drawn picker's parts stay —
   the header, the search, the recent row with its empty sentence, the grid of 38 px cells under caps
   labels, the no-match sentence, "Tabler Icons · MIT" and Remove icon from a filled slot. What R-104
   changes: the header says "Every Tabler icon, in outline and filled." (:271 said "curated"), a segmented
   Outline · Filled · Both decides which styles show (opening at Outline, the style P0-2 draws), and a
   select of "All categories" and each of Tabler's categories stands where the six chips stood, because
   chips cannot hold them.

   The set is megabytes of drawing data, so it is loaded when the picker (or the canvas) first needs it —
   `loadIcons` — and a category's cells are drawn only as it scrolls near, so thousands of icons stay
   responsive. Every cell's drawing comes through the runtime's `iconSvg`, which rebuilds each path from
   validated attributes (AD-36): nothing the data holds reaches the DOM as markup unchecked. */

type IconsModule = typeof import('@inflozo/library/icons')

let loaded: IconsModule | null = null
let loading: Promise<IconsModule> | null = null
/** The icon set, loaded once for the page — the picker and the canvas share it. */
export function loadIcons(): Promise<IconsModule> {
  // review: a rejected import is not cached, so reopening the picker retries the download
  loading ??= import('@inflozo/library/icons').then(
    (m) => (loaded = m),
    (e: unknown) => {
      loading = null
      throw e
    },
  )
  return loading
}

// ponytail: the last eight picked in THIS page session. P0-2 says "in this project"; saving arrives with
// the editor (5.8), and the list moves into the project doc then.
const recent: string[] = []
const RECENT = 8
const COLUMNS = 8
/** ponytail: a result this small is drawn at once rather than as it scrolls near — a measured guess, not a limit */
const EAGER = 400

type Style = 'outline' | 'filled' | 'both'

const words = (key: string) => (key.endsWith('-filled') ? `${key.slice(0, -'-filled'.length)}, filled` : key)

function Drawing({ name, mod }: { name: string; mod: IconsModule }) {
  const svg = iconSvg(name, mod.iconDrawing)
  return svg === null ? null : <span aria-hidden className="flex [&_svg]:size-5" dangerouslySetInnerHTML={{ __html: svg }} />
}

/** One category's cells, drawn when its box first scrolls near. Until then it holds its height. */
function LazyGroup({
  category,
  keys,
  root,
  cell,
  first,
  eager,
}: {
  category: string
  keys: string[]
  root: RefObject<HTMLDivElement | null>
  cell: (key: string, stop: boolean) => ReactNode
  first: boolean
  eager: boolean
}) {
  const box = useRef<HTMLDivElement>(null)
  const [near, setNear] = useState(first || eager)
  useEffect(() => {
    if (near || box.current === null) return
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setNear(true)
          io.disconnect()
        }
      },
      { root: root.current, rootMargin: '400px 0px' },
    )
    io.observe(box.current)
    return () => io.disconnect()
  }, [near, root])
  const rows = Math.ceil(keys.length / COLUMNS)
  return (
    <section aria-label={category} className="flex flex-col gap-[5px]">
      <h3 className="text-[10.5px] font-semibold uppercase tracking-[0.05em] text-ink-soft">{category}</h3>
      <div
        ref={box}
        style={near ? undefined : { height: `${rows * 40}px` }}
        className="grid grid-cols-[repeat(8,38px)] gap-[2px]"
      >
        {near ? keys.map((key, i) => cell(key, first && i === 0)) : null}
      </div>
    </section>
  )
}

/** P0-2: THE ARROW GRID — a roving move over `[data-cell]` in the pressed container, by DOM order.
 *
 *  ONE IMPLEMENTATION, TWO GRIDS (Story 5.10). The icon picker lays its cells out in ROWS of eight, so "down" is
 *  eight cells on; the Section Picker's grid is CSS multi-column, so its cells run DOWN each column and "down" is
 *  one cell on while "right" is a whole column. The caller says which, because only the caller knows its layout —
 *  the walk itself is the same and is never written twice. */
export function gridKeys(event: KeyboardEvent<HTMLElement>, steps: { right: number; down: number }) {
  const step = ({ ArrowRight: steps.right, ArrowLeft: -steps.right, ArrowDown: steps.down, ArrowUp: -steps.down } as Record<string, number>)[event.key]
  if (step === undefined) return
  const cells = [...event.currentTarget.querySelectorAll<HTMLElement>('[data-cell]')]
  const at = cells.indexOf(document.activeElement as HTMLElement)
  if (at < 0) return
  event.preventDefault()
  cells[Math.max(0, Math.min(cells.length - 1, at + step))]?.focus()
}

export function IconPicker({
  id,
  label,
  value,
  onChange,
}: {
  id: string
  label: string
  value: unknown
  /** the icon's key — `heart`, or `heart-filled` for Tabler's filled drawing — or `null` for Remove icon */
  onChange: (name: string | null) => void
}) {
  const [picked, setMod] = useState<IconsModule | null>(loaded)
  // the set may have arrived for the canvas since this mounted; it is one module either way
  const mod = picked ?? loaded
  const [query, setQuery] = useState('')
  const [style, setStyle] = useState<Style>('outline')
  const [category, setCategory] = useState('')
  const scroller = useRef<HTMLDivElement>(null)
  const name = typeof value === 'string' && value !== '' ? value : null
  const pop = `${id}-icons`

  const q = query.trim().toLowerCase()
  const groups = useMemo(() => {
    if (mod === null) return []
    const by = new Map<string, string[]>()
    for (const icon of mod.ICONS) {
      if (category !== '' && icon.category !== category) continue
      // Tabler's tags are sometimes numbers in its own data; a tag is matched as its words
      if (q !== '' && !icon.name.includes(q) && !icon.tags.some((t) => String(t).toLowerCase().includes(q))) continue
      const filled = mod.filledKey(icon.name)
      const keys = style === 'outline' ? [icon.name] : !icon.filled ? (style === 'both' ? [icon.name] : []) : style === 'filled' ? [filled] : [icon.name, filled]
      if (keys.length === 0) continue
      const list = by.get(icon.category) ?? []
      list.push(...keys)
      by.set(icon.category, list)
    }
    return mod.ICON_CATEGORIES.filter((c) => by.has(c)).map((c) => ({ category: c, keys: by.get(c) ?? [] }))
  }, [mod, q, category, style])

  const total = groups.reduce((n, g) => n + g.keys.length, 0)

  // a new search, style or category starts at the top of its own results
  useEffect(() => {
    scroller.current?.scrollTo({ top: 0 })
  }, [q, style, category])

  const close = () => document.getElementById(pop)?.hidePopover()
  const pick = (key: string) => {
    const at = recent.indexOf(key)
    if (at >= 0) recent.splice(at, 1)
    recent.unshift(key)
    recent.length = Math.min(recent.length, RECENT)
    close()
    onChange(key)
  }

  const cell = (key: string, stop: boolean) =>
    mod === null ? null : (
      <button
        key={key}
        type="button"
        data-cell=""
        tabIndex={stop ? 0 : -1}
        title={key}
        aria-label={words(key)}
        aria-pressed={key === name}
        onClick={() => pick(key)}
        className={`flex size-[38px] items-center justify-center rounded-sm text-ink ${ring} ${key === name ? 'bg-coral-tint shadow-[0_0_0_2px_var(--color-coral)]' : 'hover:bg-paper'}`}
      >
        <Drawing name={key} mod={mod} />
      </button>
    )

  const categoryOptions = [{ value: '', label: 'All categories' }, ...(mod?.ICON_CATEGORIES ?? []).map((c) => ({ value: c, label: c }))]

  return (
    <div className="flex flex-col gap-[5px]">
      <span id={`${id}-label`} className="text-control-label font-medium text-ink-soft">
        {label}
      </span>
      <button
        type="button"
        id={id}
        aria-labelledby={`${id}-label ${id}`}
        popoverTarget={pop}
        onClick={(event) => {
          const trigger = event.currentTarget
          const el = document.getElementById(pop)
          if (el) openPopover(el, trigger, { side: 'down', align: 'left' }, document.getElementById(`${id}-q`))
          if (mod === null) void loadIcons().then(setMod)
        }}
        className={`flex h-[38px] items-center gap-[9px] rounded-sm border border-line bg-surface px-[11px] hover:border-line-strong ${ring}`}
      >
        <span className="flex size-5 items-center justify-center text-ink">{name !== null && mod !== null ? <Drawing name={name} mod={mod} /> : null}</span>
        <span className={`text-[12.5px] font-medium ${name === null ? 'text-ink-soft' : 'text-ink'}`}>{name === null ? 'No icon' : words(name)}</span>
        <ChevronDown size={12} className="ml-auto text-ink-soft" />
      </button>

      <div
        id={pop}
        popover="auto"
        role="dialog"
        aria-labelledby={`${id}-title`}
        className="w-[380px] max-w-[calc(100vw-16px)] flex-col gap-[10px] rounded border border-line bg-surface p-3 shadow-lg open:flex"
      >
        <div className="flex flex-col gap-[2px]">
          <span id={`${id}-title`} className="text-ui-dense font-semibold text-ink">
            Icons
          </span>
          <span className="text-[11.5px] leading-[1.5] text-ink-soft">Every Tabler icon, in outline and filled.</span>
        </div>
        <SearchInput id={`${id}-q`} label="Search icons" labelHidden placeholder="Search icons" value={query} onChange={(event) => setQuery(event.target.value)} />
        <div className="grid grid-cols-2 items-start gap-[10px]">
          <Segmented
            id={`${id}-style`}
            label="Style"
            options={[
              { value: 'outline', label: 'Outline' },
              { value: 'filled', label: 'Filled' },
              { value: 'both', label: 'Both' },
            ]}
            active={style}
            onChange={(v) => setStyle(v as Style)}
          />
          <Select
            id={`${id}-category`}
            label="Category"
            value={categoryOptions.find((o) => o.value === category)?.label ?? 'All categories'}
            options={categoryOptions.map((o) => ({ ...o, active: o.value === category }))}
            onSelect={setCategory}
          />
        </div>

        <div className="flex flex-col gap-[5px]">
          <span className="text-[10.5px] font-semibold uppercase tracking-[0.05em] text-ink-soft">Recent</span>
          {recent.length === 0 || mod === null ? (
            <span className="text-[11.5px] leading-[1.5] text-ink-soft">Nothing picked in this project yet. The icons you choose collect here.</span>
          ) : (
            <div className="flex flex-wrap gap-1">
              {recent.map((key) => (
                <button
                  key={key}
                  type="button"
                  title={key}
                  aria-label={words(key)}
                  aria-pressed={key === name}
                  onClick={() => pick(key)}
                  className={`flex size-[38px] items-center justify-center rounded-sm text-ink ${ring} ${key === name ? 'bg-coral-tint' : 'hover:bg-paper'}`}
                >
                  <Drawing name={key} mod={mod} />
                </button>
              ))}
            </div>
          )}
        </div>
        <div aria-hidden className="h-px bg-line" />

        <div ref={scroller} onKeyDown={(event) => gridKeys(event, { right: 1, down: COLUMNS })} className={`flex max-h-[300px] flex-col gap-3 overflow-y-auto pr-1 ${slimScrollbar}`}>
          {mod === null ? (
            <span className="text-[11.5px] text-ink-soft">Loading the icons…</span>
          ) : groups.length === 0 && query.trim() === '' ? (
            <p className="text-[11.5px] leading-[1.5] text-ink-soft">No {style === 'filled' ? 'filled' : 'outline'} icons in this category.</p>
          ) : groups.length === 0 ? (
            <p className="text-[11.5px] leading-[1.5] text-ink-soft">
              Nothing for '{query.trim()}'{' '}
              <button type="button" onClick={() => setQuery('')} className={`font-medium text-coral-text underline ${ring}`}>
                Clear search
              </button>
            </p>
          ) : (
            groups.map((g, i) => (
              <LazyGroup
                key={`${style}-${category}-${q}-${g.category}`}
                category={g.category}
                keys={g.keys}
                root={scroller}
                cell={cell}
                first={i === 0}
                // a narrow result is drawn whole, so a search's matches are all there to scroll through
                eager={total <= EAGER}
              />
            ))
          )}
        </div>

        <div className="flex items-center justify-between border-t border-line px-[2px] pt-2">
          <span className="text-[11.5px] text-ink-soft">Tabler Icons · MIT</span>
          {name !== null ? (
            <button
              type="button"
              onClick={() => {
                close()
                onChange(null)
              }}
              className={`text-[12px] font-medium text-coral-text ${ring}`}
            >
              Remove icon
            </button>
          ) : null}
        </div>
      </div>
    </div>
  )
}
