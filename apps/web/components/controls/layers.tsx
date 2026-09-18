'use client'

import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react'
import { Button } from '@/components/kit/button'
import { closeOnBackdrop, openOnCancel, sheet, title } from '@/components/kit/dialog'
import { ring, slimScrollbar } from '@/components/kit/greyed'
import { Copy, Pencil } from '@/components/kit/icons'
import { TextInput } from '@/components/kit/input'
import { LayersRow, SiteWideGroup } from '@/components/kit/layers-row'
import { Menu } from '@/components/kit/select'
import { arrowKeys, openMenu } from '@/lib/menu'
import { captureLayout, landingAt, shift, slotTop, type Layout } from '@/lib/reorder'

/* B7 · LAYERS WITH SITE-WIDE PINNED (`B Missing Surfaces.dc.html`:1538-1580) — the panel body, and Story 5.4's whole
   Layers surface. The `<aside>`, its title and its fold stay in `editor.tsx`; everything below them is here, so that
   file keeps the shape Story 5.1 gave it.

   TWO GROUPS, AND THE BOUNDARY IS THE RULE. A pinned white card — the Kit's `SiteWideGroup`: a globe, `SITE-WIDE` and
   a mono template count — holds the site-wide sections, and the page's own rows follow under `THIS PAGE · {LABEL}`
   with its own count. B7 draws no line between them because it does not need one: a section is never reordered from
   one group into the other (FR-D5's shared instance), and a drag that leaves its own group lands back where it began.
   The mono "This page · Home" line that sat under the panel's title until Story 5.3 lives HERE now, in the group
   header B7 prints it in; the two headings are drawn with the Kit card's own classes, so they read as one pair.

   NEITHER COUNT IS WRITTEN DOWN (standing rule 4): the card's is how many canvases `lib/editor.ts` opens, which grows
   on its own as Story 5.5 opens more, and the page group's is its own rows.

   NOTHING REORDERS UNTIL THE DROP (EXPERIENCE.md :308, the owner's finding 9 of 2026-09-13). A dashed slot the
   dragged row's height shows where it lands and the rows between are TRANSLATED — nothing moves in the DOM, so the
   grip keeps its pointer capture — and one `moveSection` runs on release. The arithmetic is `lib/reorder.ts`, the
   same numbers P0-3's item list drags by. The drag STATE lives in `editor.tsx`, because the canvas pill's grip drives
   the same reorder from the other side of the frame: whichever grip is held, this panel draws the slot.

   EVERY DRAG HAS A KEYBOARD PATH (UX-DR10). The ROW is the one tab stop per section — roving tabindex, D8e's ring on
   the row — and carries the keys: `↑ ↓` move focus (through both groups, in the order B7 draws them), `⌥↑`/`⌥↓` move
   the section inside its own group with the move announced politely in `moveSection`'s words (UX-DR12), `Enter`
   selects, `Space` toggles visibility. The grip is `aria-hidden` and pointer-only; the `⋯` keeps its own tab stop,
   because its Rename, Duplicate and Delete have no key of their own.

   R-123's THIRD GROUND is the empty space BELOW THE ROWS, and its geometry is read from the last ROW — not from the
   list's last element child, which is B7's footed note. A group heading, the note and the card's own padding are not
   ground: a miss there while reaching for a row would cost the selection.

   THE SITE-WIDE ROW'S TWO REFUSALS. Duplicate is ABSENT from its menu (UX-DR3) — a header is one shared instance, not
   a copy per page. Delete and Hide ask first, in a confirm that lives in `editor.tsx` rather than here, because the
   canvas pill's Delete must open the SAME one.

   ALWAYS DRAWN, NOT "THE FIRST TIME, THEN STOP" (DW-184): B7's footed note has nowhere to remember a first time
   before Story 5.8's storage, and a session-only memory would make the note flicker between reloads.

   NOT BUILT, DELIBERATELY: hovering a row does NOT outline its section on the canvas (DW-188). Story 5.2's mirroring
   runs one way — the canvas's hover into this panel's wash — and nothing asks for the other. */

/** One row, as the editor hands it over. */
export type LayerRow = {
  /** the `project_templates` key — `site` for a shared instance, the canvas key for a page section */
  doc: string
  instanceId: string
  layerName: string
  hidden: boolean
  /** this row's position in its OWN doc's instances — what `moveSection` is given */
  at: number
}

/** The drag in flight, over one doc's own rows. Held by `editor.tsx`, because the canvas pill starts one too —
 *  `via` says which grip, because only a row's own drag lifts the row: a pill drag moves the section on the CANVAS,
 *  and this panel shows only where it will land. */
export type SectionDrag = { doc: string; from: number; to: number; dy: number; via: 'layers' | 'pill' }

export type LayersProps = {
  /** the site doc's instances in doc order — the pinned card's rows */
  site: readonly LayerRow[]
  /** this canvas's own instances in doc order */
  page: readonly LayerRow[]
  /** the canvas's D5b label, for `THIS PAGE · {LABEL}` */
  label: string
  /** the site doc's key, so a row knows which group it is in */
  siteKey: string
  /** how many canvases the editor opens — derived by the caller, never written down */
  templates: number
  /** `{doc}:{instanceId}` — a composite, because `instanceId` is unique per doc and not across them */
  selectedKey: string | null
  hoveredKey: string | null
  drag: SectionDrag | null
  onDrag: (next: SectionDrag | null) => void
  /** the press that selects; a press on a ROW never deselects (R-123) */
  onSelect: (row: LayerRow) => void
  /** R-123's third ground: the empty space below the rows */
  onGround: () => void
  onToggleHidden: (row: LayerRow) => void
  /** the refusal sentence, or null when the rename landed */
  onRename: (row: LayerRow, name: string) => string | null
  onDuplicate: (row: LayerRow) => void
  onRemove: (row: LayerRow) => void
  /** the drop, or an `⌥`-arrow: `to` is the position in that row's own doc. Answers the words to announce. */
  onMove: (row: LayerRow, to: number) => string | null
}

/** A row's identity across both groups: `instanceId` is unique inside a doc, not between two. */
const keyOf = (row: LayerRow) => `${row.doc}:${row.instanceId}`

const NAME_FIELD = 'layers-rename-name'

const HEADING = 'text-helper-caption font-semibold tracking-[0.04em] text-ink-soft uppercase'
const COUNT = 'font-mono text-helper-caption text-ink-soft'

export function Layers({
  site,
  page,
  label,
  siteKey,
  templates,
  selectedKey,
  hoveredKey,
  drag,
  onDrag,
  onSelect,
  onGround,
  onToggleHidden,
  onRename,
  onDuplicate,
  onRemove,
  onMove,
}: LayersProps) {
  const all = [...site, ...page]
  const panel = useRef<HTMLDivElement>(null)
  const siteList = useRef<HTMLDivElement>(null)
  const pageList = useRef<HTMLDivElement>(null)
  /** the rows of the dragged group as they stood when the press landed — captured for a pill-started drag too */
  const layout = useRef<Layout>({ tops: [], heights: [], gap: 0 })
  const startY = useRef(0)
  /** roving tabindex: the row the panel offers Tab, by instanceId — the first row until one is stepped onto */
  const [current, setCurrent] = useState<string | null>(null)
  /** the row to put focus back on after a render that reordered the rows, so a move follows its section */
  const [focusOn, setFocusOn] = useState<string | null>(null)
  const [renaming, setRenaming] = useState<LayerRow | null>(null)
  const [nameError, setNameError] = useState<string | null>(null)
  const rename = useRef<HTMLDialogElement>(null)

  const tabAt = current !== null && all.some((r) => keyOf(r) === current) ? current : (all[0] ? keyOf(all[0]) : null)
  const rowEl = (key: string) => panel.current?.querySelector<HTMLElement>(`[data-layer-row="${CSS.escape(key)}"]`)

  useEffect(() => {
    if (focusOn === null) return
    rowEl(focusOn)?.focus()
    setFocusOn(null)
    // `rowEl` reads a ref; the row to focus is the whole dependency
  }, [focusOn])

  // the layout is read ONCE per drag, from whichever group started it: a slot measured against rows that are already
  // sliding would chase itself, and a drag started by the canvas pill has no layout of its own to hand over
  const dragDoc = drag?.doc ?? null
  useLayoutEffect(() => {
    if (dragDoc === null) return
    const list = dragDoc === siteKey ? siteList.current : pageList.current
    layout.current = captureLayout([...(list?.querySelectorAll<HTMLElement>('[data-layer-row]') ?? [])])
    // `drag.to` changes on every pointer move and must not re-measure
  }, [dragDoc, siteKey])

  /** Rename's one action, reached by Save and by Enter in the field. The field is the DOM's, read by its own id. */
  const save = () => {
    if (!renaming) return
    const refused = onRename(renaming, (document.getElementById(NAME_FIELD) as HTMLInputElement | null)?.value ?? '')
    if (refused !== null) {
      setNameError(refused)
      return
    }
    rename.current?.close()
  }

  const move = (row: LayerRow, to: number) => {
    // the announce is the editor's to read out, so the pill's drop announces through the same live region
    if (onMove(row, to) === null) return
    setCurrent(keyOf(row))
    setFocusOn(keyOf(row))
  }

  const onRowKey = (row: LayerRow, event: KeyboardEvent<HTMLDivElement>) => {
    // a key pressed in the ⋯, its menu or the eye belongs to that control, not to the row
    if (event.target !== event.currentTarget) return
    const own = row.doc === siteKey ? site : page
    if (event.altKey && (event.key === 'ArrowUp' || event.key === 'ArrowDown')) {
      event.preventDefault()
      const to = row.at + (event.key === 'ArrowUp' ? -1 : 1)
      if (to < 0 || to >= own.length) return // at either end the key does nothing
      move(row, to)
    } else if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      const to = all[all.findIndex((r) => keyOf(r) === keyOf(row)) + (event.key === 'ArrowUp' ? -1 : 1)]
      if (!to) return
      event.preventDefault()
      setCurrent(keyOf(to))
      setFocusOn(keyOf(to))
    } else if (event.key === 'Enter') {
      event.preventDefault()
      onSelect(row)
    } else if (event.key === ' ') {
      event.preventDefault()
      onToggleHidden(row)
    }
  }

  /* Called as plain functions and never mounted as `<Row/>`: a component declared inside a render is a NEW type on
     every render, which would unmount each row — and a remounted grip loses the pointer capture the drag holds. */
  const drawRow = (row: LayerRow) => {
    const menu = `layers-menu-${row.instanceId}`
    const lifted = drag?.doc === row.doc && drag.from === row.at && drag.via === 'layers'
    const sliding = drag?.doc === row.doc
    return (
      <LayersRow
        key={keyOf(row)}
        name={row.layerName}
        shown={!row.hidden}
        selected={selectedKey === keyOf(row)}
        hovered={hoveredKey === keyOf(row)}
        data-layer-row={keyOf(row)}
        tabIndex={tabAt === keyOf(row) ? 0 : -1}
        aria-describedby="layers-how"
        onKeyDown={(event) => onRowKey(row, event)}
        onSelect={() => onSelect(row)}
        onToggleShown={() => onToggleHidden(row)}
        style={lifted ? { translate: `0 ${drag.dy}px` } : sliding ? { translate: `0 ${shift(drag, row.at, layout.current)}px` } : undefined}
        className={`relative ${lifted ? 'z-10 shadow-lg motion-safe:rotate-2' : sliding ? 'motion-safe:transition-[translate] motion-safe:duration-150' : ''}`}
        gripProps={{
          onPointerDown: (event) => {
            if (event.button !== 0 || drag !== null) return // a second pointer never takes over a live drag
            event.currentTarget.setPointerCapture(event.pointerId)
            startY.current = event.clientY
            onDrag({ doc: row.doc, from: row.at, to: row.at, dy: 0, via: 'layers' })
          },
          onPointerMove: (event) => {
            if (drag?.doc !== row.doc || drag.from !== row.at) return
            onDrag({ doc: row.doc, from: row.at, to: landingAt(layout.current, row.at, event.clientY, startY.current), dy: event.clientY - startY.current, via: 'layers' })
          },
          onPointerUp: () => {
            if (drag?.doc !== row.doc || drag.from !== row.at) return
            const { from, to } = drag
            onDrag(null)
            if (to !== from) move(row, to)
          },
          onPointerCancel: () => onDrag(null),
        }}
        overflow={
          <>
            <button
              type="button"
              aria-label={`More for ${row.layerName}`}
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
                label={row.layerName}
                items={[
                  {
                    label: 'Rename',
                    icon: <Pencil size={13} />,
                    onSelect: () => {
                      setNameError(null)
                      setRenaming(row)
                      // the dialog's field is rendered on the next frame, and it opens on Cancel
                      requestAnimationFrame(() => openOnCancel(rename.current))
                    },
                  },
                  // FR-D5: a site-wide section is ONE shared instance, so there is nothing to copy — absent, not
                  // greyed and not a refusal (UX-DR3)
                  ...(row.doc === siteKey ? [] : [{ label: 'Duplicate', icon: <Copy size={13} />, onSelect: () => onDuplicate(row) }]),
                  { label: 'Delete', danger: true, onSelect: () => onRemove(row) },
                ]}
              />
            </div>
          </>
        }
      />
    )
  }

  const drawGroup = (rows: readonly LayerRow[], which: 'site' | 'page') => (
    // `relative`: the dashed slot is positioned against this group's own rows
    <div ref={which === 'site' ? siteList : pageList} className="relative flex flex-col gap-[2px]">
      {drag !== null && (drag.doc === siteKey) === (which === 'site') ? (
        <div
          aria-hidden
          data-drop-slot
          style={{ top: slotTop(drag, layout.current), height: layout.current.heights[drag.from] ?? 0 }}
          className="pointer-events-none absolute inset-x-0 rounded-sm border border-dashed border-line-strong bg-paper-sunk"
        />
      ) : null}
      {rows.map(drawRow)}
    </div>
  )

  return (
    <div
      ref={panel}
      // R-123 as amended: the empty space BELOW THE ROWS is a ground, as it is in Figma and Sketch. A row is not, and
      // neither is a group heading, the card's padding, the footed note or the gap between two rows — a miss there
      // while reaching for a row would cost the selection (review, 2026-09-18). The geometry is the last ROW's, never
      // this container's last element child, which is the note.
      onPointerDown={(event) => {
        if (event.button !== 0 || event.target !== event.currentTarget) return
        const rows = event.currentTarget.querySelectorAll<HTMLElement>('[data-layer-row]')
        const last = rows[rows.length - 1]?.getBoundingClientRect().bottom ?? -Infinity
        if (event.clientY >= last) onGround()
      }}
      className={`flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-2 py-[10px] ${slimScrollbar}`}
    >
      <SiteWideGroup pages={templates}>{drawGroup(site, 'site')}</SiteWideGroup>

      <div className="flex flex-col gap-[2px]">
        <div className="flex items-center gap-[6px] px-[5px] pb-[5px]">
          <span className={`flex-1 ${HEADING}`}>This page · {label}</span>
          <span className={COUNT}>{page.length}</span>
        </div>
        {drawGroup(page, 'page')}
      </div>

      <p id="layers-how" className="sr-only">
        Press Enter to select this section, Space to hide or show it, and Option or Alt with the up or down arrow to
        move it.
      </p>
      {/* B7's footed note, above a hairline. `mt-auto` keeps it at the foot of a short list. Marked, because the
          panel's LAST element child is the rename dialog and not this — anything reading "the foot of the list"
          off `lastElementChild` would read the dialog instead. */}
      <div data-layers-note className="mt-auto border-t border-line pt-[10px]">
        <span className="text-helper-caption leading-[1.5] text-ink-soft">
          Editing a site-wide section changes it on all {templates} templates.
        </span>
      </div>

      {/* Rename — S12c's shape, the same one `project-menu.tsx` uses for a project. NO SUBMIT CONTROL, and that is
          deliberate: `renameSection` is synchronous and local, so there is nothing happening in the background for a
          busy label to say (`busy.test.ts`'s rule, the owner's finding 1 of Story 3.4). The `<form>` stays, because
          a form with a single field and no submit button still submits on Enter — the platform's implicit
          submission — which is how the key reaches Save. */}
      <dialog
        ref={rename}
        onClick={closeOnBackdrop}
        aria-labelledby="layers-rename-title"
        onClose={() => setNameError(null)}
        className={`${sheet} gap-[18px]`}
      >
        <h2 id="layers-rename-title" className={title}>
          Rename section
        </h2>
        <form
          onSubmit={(event) => {
            event.preventDefault()
            save()
          }}
          className="flex flex-col gap-[18px]"
        >
          {/* keyed on the row: the field is the DOM's, and a second Rename must open on that row's own name */}
          <TextInput
            key={renaming?.instanceId}
            id={NAME_FIELD}
            name="layerName"
            label="Name"
            defaultValue={renaming?.layerName ?? ''}
            error={nameError}
          />
          <div className="flex justify-end gap-[10px]">
            <Button type="button" variant="secondary" size={36} data-cancel onClick={() => rename.current?.close()}>
              Cancel
            </Button>
            <Button type="button" variant="primary" size={36} onClick={save}>
              Save
            </Button>
          </div>
        </form>
      </dialog>
    </div>
  )
}
