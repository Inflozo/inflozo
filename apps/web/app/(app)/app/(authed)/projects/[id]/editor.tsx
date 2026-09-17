'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { IconLookup, SectionRegistryEntry } from '@inflozo/library'
import { stampControls } from '@inflozo/section-runtime'
import type { ControlState, DocInstance, ProjectDoc, RuntimeElement } from '@inflozo/section-runtime'
import { loadIcons } from '@/components/controls/icon-picker'
import { Sidebar, type Edit } from '@/components/controls/sidebar'
import { ProBadge } from '@/components/kit/badge'
import { IconButton } from '@/components/kit/button'
import { EmptyPanel } from '@/components/kit/empty-panel'
import { ring, slimScrollbar } from '@/components/kit/greyed'
import { ChevronLeft, Panel } from '@/components/kit/icons'
import { PanelLabel } from '@/components/kit/labels'
import { LayersRow } from '@/components/kit/layers-row'
import { canvasAssets, canvasSrc, mountSections, renderSection, shownRows } from '@/lib/canvas'
import { chromeLayers, dropChromeLayers, pinned, place, type ChromeLayers } from '@/lib/canvas-layer'
import { CANVASES, canvasOfPath, canvasStack, SITE, type CanvasKey } from '@/lib/editor'
import { escDeselects, hold, HOLD_IDLE, HOLD_MS, rootFrom, sectionRoots, withState, type HoldEvent } from '@/lib/selection'
import { isApp, stripApp } from '@/routing'
import type { EditorData } from './read'

/* ─────────────────────────────────────────── S4 Editor.dc.html — S4a, the editor at rest, 1440 (Story 5.1).

   FR-D1's four regions, read off the frame: the 48px bar and its rule (:28), Layers at 240 with a right rule (:54),
   the canvas ground with the page card 24px from the top and 28px from each side, flush with the bottom, a 6px top
   radius and the page shadow (:62-63), and Controls at 280 with a left rule and 16px padding (:118). The window never
   scrolls: the canvas document scrolls inside its frame and each panel on its own.

   THE CANVAS is the one canvas document `/canvas` serves (no script; the pilots review frames the same one), every
   section drawn through `lib/canvas.ts` — the render `/pilots` uses — at Desktop 1440, scaled to fit the card's
   width and filling its height: the fit, not a cap (S4a's 864 is 1440 − 240 − 280 − 56). Nothing on it is chrome at
   rest: the chrome stylesheet inside is keyed on `data-inflozo-*`, and a root carries one only while hovered or
   selected.

   HOVER AND SELECTION (Story 5.2 — S4b and S4c). The editor listens on the canvas document from this one, and marks
   the section root under the pointer `data-inflozo-hover` and the chosen one `data-inflozo-selected` — state marks, which
   nothing inside the frame paints today. A press inside the canvas selects and does nothing else: `click`, `submit`,
   `dragstart`, `mousedown` and `auxclick` have their defaults prevented. Everything drawn for them — the two outline
   boxes (R-120: an inset box-shadow line, because a border or an outline is floored to whole pixels), the name tag and
   R-119's Pro badge — is this component's own elements PORTALLED into a chrome layer on the canvas document's `<body>`,
   beside the site's sections and never in them (`lib/canvas-layer.ts`), so the compositor scrolls them with their
   section in the same frame: drawn from this document they trailed it by a frame, the owner's finding. Touch has no hover: a 500 ms hold shows it and
   a tap selects (`lib/selection.ts`). Selecting mounts Story 4.5's `Sidebar` over an in-memory copy of the docs, fed
   what `/pilots` feeds it: a control change stamps the live root, anything else repaints — and after every paint and
   every stamp the attributes are re-applied, because `stampControls` strips every root `data-*` it does not own. Esc
   deselects unless a field, a picker or the reset dialog owns it; a change of canvas deselects too.

   EXTRAPOLATED, NOT DRAWN AT 1440 (R-74): the Layers header is D8e's (`D8 Editor Below 1440.dc.html:372-373`) with
   the mono line under the title rather than beside it, because "THIS PAGE · AUTHOR ARCHIVE" does not fit beside it
   in 240; both folds are D8's "Show layers" rail (:193-194), the Controls one mirrored, as `/controls` does (DW-114).
   Tap-and-hold and Esc deselecting are drawn nowhere either, and the panel at rest is PAGE over the Kit's empty state.

   ABSENT, NOT GREYED (UX-DR3), each until its story: "Saved", saving and Undo/Redo (5.8 — until then an edit lives for
   the session and a reload starts from the stored docs), the Template pill (5.5), View as (5.14), the sun (5.6), the
   device switch (5.7), Ship it (7.18), the name's rename underline (no story yet), Layers' grip, eye, thumbnails and a
   pressable row (5.4), "+ Add section" and the hairline "+" between sections (5.10), the hover pill's Duplicate, Delete
   and drag handle (5.4), the design arrows and S4c's "4 / 18" chip (5.11), typing on the canvas (5.3), the Style Pack
   card (6.3) and Dark mode (5.6) (R-118). S4a's posts-per-page note and S4c's pinned Quick Controls card are never
   built (FR-Q1, R-113). */

const DESKTOP = 1440

/** A panel's fold: focus moves to the toggle that replaced the pressed one. Layout-held, so a soft navigation between
 *  canvases keeps it; a typed address is a document load and starts unfolded. */
function useFold() {
  const [folded, setFolded] = useState(false)
  const toggled = useRef(false)
  const hide = useRef<HTMLButtonElement>(null)
  const show = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    if (toggled.current) (folded ? show : hide).current?.focus()
  }, [folded])
  const toggle = (next: boolean) => {
    toggled.current = true
    setFolded(next)
  }
  return { folded, hide, show, toggle }
}

/** D8's 44px rail with its one Show button. */
function Rail({ fold, label, controls, side }: { fold: ReturnType<typeof useFold>; label: string; controls: string; side: 'left' | 'right' }) {
  return (
    <div className={`flex w-11 shrink-0 flex-col items-center bg-paper py-[6px] ${side === 'left' ? 'border-r' : 'border-l'} border-line`}>
      <button
        ref={fold.show}
        type="button"
        aria-label={label}
        title={label}
        aria-expanded={false}
        aria-controls={controls}
        onClick={() => fold.toggle(false)}
        className={`inline-flex size-8 items-center justify-center rounded-sm text-ink-soft transition-colors hover:bg-paper-sunk ${ring}`}
      >
        <Panel size={15} className={side === 'right' ? '-scale-x-100' : undefined} />
      </button>
    </div>
  )
}

type Placed = DocInstance & { target: string; doc: string }
/** A section on this canvas, by the doc that stores it — a site-wide section lives in `site` */
type Pick = { doc: string; instanceId: string }

const same = (a: Pick | null | undefined, b: Pick | null | undefined) => !!a && !!b && a.doc === b.doc && a.instanceId === b.instanceId

const stackOf = (docs: Readonly<Record<string, ProjectDoc>>, key: CanvasKey): Placed[] =>
  canvasStack(
    (docs[SITE.key]?.instances ?? []).map((i) => ({ ...i, target: SITE.file as string, doc: SITE.key as string })),
    (docs[key]?.instances ?? []).map((i) => ({ ...i, target: CANVASES[key].file as string, doc: key as string })),
  )

export function Editor({
  project,
  docs: stored,
  entries,
  rows,
  pool,
  swatches,
  links,
  timezone,
  plan,
}: EditorData & { project: { id: string; name: string } }) {
  const pathname = usePathname()
  // the layout 404s every segment that is not a canvas, so a null here is never drawn
  const key = canvasOfPath(stripApp(pathname)) ?? 'home'
  const canvas = CANVASES[key]
  // Edits live here for the session: nothing writes `project_templates` before Story 5.8, so a reload starts again
  const [docs, setDocs] = useState(stored)
  const stack = stackOf(docs, key)
  const [selected, setSelected] = useState<Pick | null>(null)
  const [hovered, setHovered] = useState<Pick | null>(null)
  const [paints, setPaints] = useState(0)

  const layers = useFold()
  const controls = useFold()
  const frame = useRef<HTMLIFrameElement>(null)
  const card = useRef<HTMLDivElement>(null)
  const tag = useRef<HTMLDivElement>(null)
  const hoverBox = useRef<HTMLDivElement>(null)
  const selectedBox = useRef<HTMLDivElement>(null)
  const badge = useRef<HTMLDivElement>(null)
  const icons = useRef<IconLookup | null>(null)
  /** index-aligned with the stack last painted; null where a section rendered nothing */
  const roots = useRef<(HTMLElement | null)[]>([])
  const [size, setSize] = useState({ width: DESKTOP, height: 0 })
  // A section that will not draw is a broken doc or design, not a canvas to show around it: thrown in render, so the
  // app's error boundary shows it (the spec's "never a partly drawn canvas").
  const [failure, setFailure] = useState<Error | null>(null)
  // a card measured at 0 (folded away, not yet laid out) would put Infinity in the iframe's height
  const scale = size.width > 0 ? Math.min(1, size.width / DESKTOP) : 1
  // the canvas document's handlers and paint read the latest values through here
  const latest = useRef({ key, docs, stack, selected, hovered })
  latest.current = { key, docs, stack, selected, hovered }

  /** Each root's two attributes, from the latest selection and hover — after every paint, stamp and change of either. */
  const mark = () => {
    const now = latest.current
    roots.current.forEach((root, n) => {
      const placed = now.stack[n]
      if (!root || !placed) return
      root.toggleAttribute('data-inflozo-selected', same(placed, now.selected))
      root.toggleAttribute('data-inflozo-hover', same(placed, now.hovered))
    })
  }
  const choose = (pick: Pick | null) => {
    if (same(pick, latest.current.selected) || (!pick && !latest.current.selected)) return
    latest.current.selected = pick
    setSelected(pick)
    mark()
  }
  const point = (pick: Pick | null) => {
    if (same(pick, latest.current.hovered) || (!pick && !latest.current.hovered)) return
    latest.current.hovered = pick
    setHovered(pick)
    mark()
  }

  const paint = () => {
    const doc = frame.current?.contentDocument
    const mount = doc?.getElementById('canvas')
    const lookup = icons.current
    // before the icons resolve or the frame loads this returns early ON PURPOSE: the icons callback and the frame's
    // `load` listener each paint `latest` when they land, so a key change dropped here is painted then
    if (!doc || !mount || !lookup || !frame.current) return
    const now = latest.current
    try {
      const assets = canvasAssets(pool)
      const parts = now.stack.map((i) => {
        const entry: SectionRegistryEntry | undefined = entries[i.designId]
        if (!entry) throw new Error(`${i.designId} was not read for this project`)
        return renderSection(doc, entry, i, { target: i.target, rows: rows[i.designId], feed: 'first', member: 'anonymous', visibility: 'everyone', assets, icons: lookup })
      })
      mountSections(mount, parts.join(''))
      roots.current = sectionRoots(parts, mount) as (HTMLElement | null)[]
      wire(doc)
      // the hovered root was replaced, and the pointer has not said where it is since
      latest.current.hovered = null
      setHovered(null)
      mark()
      setPaints((n) => n + 1)
      frame.current.dataset.painted = now.key
    } catch (error) {
      setFailure(error instanceof Error ? error : new Error(String(error)))
    }
  }

  /** The section a target in the canvas document sits in. */
  const pickAt = (target: EventTarget | null): Pick | null => {
    const root = rootFrom(target as HTMLElement | null, roots.current)
    const placed = root ? latest.current.stack[roots.current.indexOf(root)] : undefined
    return placed ? { doc: placed.doc, instanceId: placed.instanceId } : null
  }

  const onEscape = (e: KeyboardEvent) => {
    if (e.key !== 'Escape' || e.defaultPrevented) return
    const target = e.target as HTMLElement | null
    // an open popover or dialog anywhere in that document owns the key, whichever element holds focus
    if (target?.ownerDocument?.querySelector(':popover-open, dialog[open]') || !escDeselects(target)) return
    choose(null)
  }

  /** The canvas document's listeners, once per document — a reloaded frame is a new one. */
  const wired = useRef(new WeakSet<Document>())
  const wire = (doc: Document) => {
    if (wired.current.has(doc)) return
    wired.current.add(doc)
    // `auxclick` too: a middle click on a link would open it in a new tab
    for (const type of ['submit', 'dragstart', 'mousedown', 'auxclick']) doc.addEventListener(type, (e) => e.preventDefault())
    // hover is the mouse's and the pen's: touch has the hold, so a tap never flashes an outline before it selects
    doc.addEventListener('pointerover', (e) => {
      if (e.pointerType !== 'touch') point(pickAt(e.target))
    })
    doc.addEventListener('pointerout', (e) => {
      if (e.pointerType !== 'touch' && e.relatedTarget === null) point(null)
    })
    let pressed: EventTarget | null = null
    let state = HOLD_IDLE
    let timer: ReturnType<typeof setTimeout> | undefined
    const step = (event: HoldEvent) => {
      const [next, outcome] = hold(state, event)
      state = next
      if (outcome === 'hover') point(pickAt(pressed))
      if (outcome === 'tap') {
        const pick = pickAt(pressed)
        if (pick) choose(pick)
      }
      return outcome
    }
    doc.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'touch') return
      pressed = e.target
      point(null)
      clearTimeout(timer)
      step({ type: 'down', x: e.clientX, y: e.clientY, t: performance.now() })
      timer = setTimeout(() => step({ type: 'timer', t: performance.now() }), HOLD_MS)
    })
    doc.addEventListener('pointermove', (e) => {
      if (e.pointerType === 'touch') step({ type: 'move', x: e.clientX, y: e.clientY, t: performance.now() })
    })
    doc.addEventListener('pointerup', (e) => {
      if (e.pointerType !== 'touch') return
      clearTimeout(timer)
      step({ type: 'up', t: performance.now() })
    })
    doc.addEventListener('pointercancel', (e) => {
      if (e.pointerType !== 'touch') return
      clearTimeout(timer)
      step({ type: 'cancel' })
    })
    doc.addEventListener('click', (e) => {
      e.preventDefault()
      if (step({ type: 'click' }) === 'swallow') return
      // a click on nothing — the ground below the last section — keeps the selection
      const pick = pickAt(e.target)
      if (pick) choose(pick)
    })
    doc.addEventListener('keydown', onEscape)
  }

  // a change of canvas is a soft navigation: the iframe keeps its document and is repainted, and nothing stays chosen
  useEffect(() => {
    latest.current.selected = null
    setSelected(null)
    paint()
    // paint reads the latest values through `latest`
  }, [key])

  useEffect(() => {
    let alive = true
    const el = frame.current
    const ready = () => paint()
    void loadIcons().then(
      (m) => {
        if (!alive) return
        icons.current = m.iconDrawing
        paint()
      },
      () => alive && setFailure(new Error('The icons could not be loaded, so the canvas cannot be drawn. Reload the page to try again.')),
    )
    if (el?.contentDocument?.readyState === 'complete') ready()
    el?.addEventListener('load', ready)
    window.addEventListener('keydown', onEscape)
    return () => {
      alive = false
      el?.removeEventListener('load', ready)
      window.removeEventListener('keydown', onEscape)
    }
    // mount only
  }, [])

  // the fit: re-measured whenever a fold or the window changes the card
  useLayoutEffect(() => {
    if (!card.current) return
    const watch = new ResizeObserver(([row]) => row && setSize({ width: row.contentRect.width, height: row.contentRect.height }))
    watch.observe(card.current)
    return () => watch.disconnect()
  }, [])
  useLayoutEffect(mark, [selected, hovered])

  const rootOf = (pick: Pick | null) => {
    const n = pick ? stack.findIndex((i) => same(i, pick)) : -1
    return n === -1 ? null : (roots.current[n] ?? null)
  }
  const chosen = selected ? stack.find((i) => same(i, selected)) : undefined
  const pointed = hovered ? stack.find((i) => same(i, hovered)) : undefined
  const entry = chosen ? entries[chosen.designId] : undefined
  const pro = plan === 'free' && entry?.tier === 'pro'
  // on a hovered selection the selected box's 1.5px is the only outline (S4c)
  const hoverOutline = pointed && !same(hovered, selected)
  const hoveredRoot = pointed ? rootOf(hovered) : null
  const selectedRoot = chosen ? rootOf(selected) : null

  // THE CHROME LAYER (the owner's finding, 2026-09-17): the boxes, the tag and the badge are portalled into the canvas
  // document, so the compositor scrolls them with their section in the same frame (`lib/canvas-layer.ts`)
  const [chrome, setChrome] = useState<ChromeLayers | null>(null)
  const showing = !!(hoveredRoot || selectedRoot)
  useLayoutEffect(() => {
    const doc = frame.current?.contentDocument
    if (!showing || !doc) {
      if (chrome) {
        dropChromeLayers(chrome.doc)
        setChrome(null)
      }
      return
    }
    // a reloaded frame is a new document: its chrome are made again
    if (chrome?.doc !== doc) setChrome(chromeLayers(doc))
    // `chrome` is read, not a dependency: it is what this effect sets
  }, [showing, paints])
  const layerFor = (root: HTMLElement | null) => (!root || !chrome ? null : pinned(root) ? chrome.view : chrome.page)

  // positions follow layout, not scroll: a section that grows, a header that shrinks, a fold that re-fits the canvas
  useLayoutEffect(() => {
    if (!chrome) return
    const all: [HTMLElement | null, HTMLElement | null, 'fill' | 'top-left' | 'top-right'][] = [
      [hoverBox.current, hoveredRoot, 'fill'],
      [selectedBox.current, selectedRoot, 'fill'],
      [tag.current, hoveredRoot, 'top-left'],
      [badge.current, selectedRoot, 'top-right'],
    ]
    const tick = () => {
      for (const [el, root, how] of all) if (el && root) place(el, root, scale, how)
    }
    tick()
    let id = requestAnimationFrame(function loop() {
      tick()
      id = requestAnimationFrame(loop)
    })
    return () => cancelAnimationFrame(id)
  })

  if (failure) throw failure

  const src = canvasSrc(isApp(pathname))

  const onChange = (next: ControlState, kind: Edit) => {
    const now = latest.current
    const pick = now.selected
    if (!pick) return
    const docs = withState(now.docs, pick.doc, pick.instanceId, next)
    latest.current = { ...now, docs, stack: stackOf(docs, now.key) }
    setDocs(docs)
    const n = now.stack.findIndex((i) => same(i, pick))
    const root = roots.current[n]
    const design = entries[now.stack[n]?.designId ?? '']
    // a control changes only the root's attributes, so it is stamped in place (`/pilots`' fast path); no root means
    // the section is gated away, and anything else needs a render
    if (kind === 'control' && root && design) {
      stampControls(root as unknown as RuntimeElement, { controlSchema: design.controlSchema, universals: design.universals, controls: next.controls })
      mark()
    } else paint()
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-paper text-ink">
      <header className="flex h-12 shrink-0 items-center gap-[10px] border-b border-line bg-paper px-3">
        <Link
          href="/"
          aria-label="Back to dashboard"
          title="Back to dashboard"
          className={`inline-flex size-7 items-center justify-center rounded-sm text-ink-soft transition-colors hover:bg-paper-sunk ${ring}`}
        >
          <ChevronLeft size={15} />
        </Link>
        <span className="text-ui-dense font-semibold">{project.name}</span>
      </header>

      <div className="flex min-h-0 flex-1">
        <aside id="editor-layers" aria-label="Layers" hidden={layers.folded} className="flex w-[240px] shrink-0 flex-col border-r border-line bg-paper">
          <div className="flex flex-col gap-[2px] px-4 pt-[10px]">
            <div className="flex items-center gap-2">
              <span className="flex-1 text-[12.5px] font-semibold">Layers</span>
              <IconButton ref={layers.hide} label="Collapse layers" title="Collapse layers" aria-expanded aria-controls="editor-layers" onClick={() => layers.toggle(true)}>
                <Panel size={15} />
              </IconButton>
            </div>
            <span className="font-mono text-[10px] uppercase text-ink-soft-aa [font-variant-ligatures:none]">
              This page · {canvas.label}
            </span>
          </div>
          <div className={`flex min-h-0 flex-1 flex-col gap-[2px] overflow-y-auto px-2 py-[10px] ${slimScrollbar}`}>
            {stack.map((i) => (
              // the canvas's state mirrored; pressing a row is Story 5.4's
              <LayersRow key={`${i.target}:${i.instanceId}`} name={i.layerName} interactive={false} selected={same(i, selected)} hovered={same(i, hovered)} />
            ))}
          </div>
        </aside>
        {layers.folded ? <Rail fold={layers} label="Show layers" controls="editor-layers" side="left" /> : null}

        <section aria-label="Canvas" className="flex min-w-0 flex-1 flex-col bg-canvas-ground px-7 pt-6">
          <div ref={card} className="relative mx-auto min-h-0 w-full max-w-[1440px] flex-1 overflow-hidden rounded-t-[6px] bg-paper-raised shadow-canvas-page">
            <iframe
              ref={frame}
              src={src}
              title={`${canvas.label} canvas`}
              data-width={DESKTOP}
              className="block origin-top-left border-0"
              style={{ width: DESKTOP, height: size.height / scale, transform: `scale(${scale})` }}
            />
            {/* The outlines (R-120): boxes over the root, whose line is an inset box-shadow spread, which paints its exact
                width where a border or an outline is floored to whole pixels: S4b's 1px (:181) and S4c's 1.5px (:293),
                `globals.css`. Inside the canvas document since the owner's finding, so they scroll with their section. */}
            {hoverOutline && layerFor(hoveredRoot)
              ? createPortal(<div ref={hoverBox} aria-hidden data-chrome="hover" className="pointer-events-none absolute canvas-outline-hover" style={{ visibility: 'hidden' }} />, layerFor(hoveredRoot) as ShadowRoot)
              : null}
            {chosen && layerFor(selectedRoot)
              ? createPortal(<div ref={selectedBox} aria-hidden data-chrome="selected" className="pointer-events-none absolute canvas-outline-selected" style={{ visibility: 'hidden' }} />, layerFor(selectedRoot) as ShadowRoot)
              : null}
            {/* S4b's name tag (S4 Editor.dc.html:181), drawn at its own 11px in the app's Inter. Never pressed: the pointer
                passes through to the section. */}
            {pointed && layerFor(hoveredRoot)
              ? createPortal(
                  <div
                    ref={tag}
                    aria-hidden
                    data-chrome="tag"
                    className="pointer-events-none absolute whitespace-nowrap rounded-[0_0_6px_0] bg-coral-text px-[9px] py-[3px] text-helper-caption font-semibold text-surface"
                    style={{ visibility: 'hidden' }}
                  >
                    {pointed.layerName}
                  </div>,
                  layerFor(hoveredRoot) as ShadowRoot,
                )
              : null}
            {/* R-119, B10 (B Missing Surfaces.dc.html:1424-1451): a price tag, not a lock — the Kit's span, never a button */}
            {pro && layerFor(selectedRoot)
              ? createPortal(
                  <div ref={badge} data-chrome="pro" className="pointer-events-none absolute flex w-max" style={{ visibility: 'hidden' }}>
                    <ProBadge />
                  </div>,
                  layerFor(selectedRoot) as ShadowRoot,
                )
              : null}
          </div>
        </section>

        {controls.folded ? <Rail fold={controls} label="Show controls" controls="editor-controls" side="right" /> : null}
        <aside
          id="editor-controls"
          aria-label={chosen ? 'Section settings' : 'Page settings'}
          hidden={controls.folded}
          className={`flex w-[280px] shrink-0 flex-col gap-4 overflow-y-auto border-l border-line bg-paper p-4 ${slimScrollbar}`}
        >
          {/* -6px each way: the 28px toggle leaves the label where S4a draws it, 16px from the top */}
          <div className="-my-[6px] flex items-center justify-between gap-2">
            {/* the instance's layer name, as Layers prints it: S4c's category word and "4 / 18" are the design picker's (5.11) */}
            <PanelLabel>{chosen ? chosen.layerName : 'Page'}</PanelLabel>
            <IconButton ref={controls.hide} label="Collapse controls" title="Collapse controls" aria-expanded aria-controls="editor-controls" onClick={() => controls.toggle(true)}>
              <Panel size={15} className="-scale-x-100" />
            </IconButton>
          </div>
          {chosen && entry ? (
            // R-113's panel, mounted and not redrawn, fed what `/pilots` feeds it
            <Sidebar
              key={`${chosen.doc}:${chosen.instanceId}`}
              entry={entry}
              state={chosen}
              onChange={onChange}
              swatches={swatches}
              timezone={timezone}
              links={links}
              assets={pool.map((a) => ({ id: a.id, src: `${src}?image=${a.id}`, meta: `${Math.max(1, Math.round(a.bytes / 1024))} KB · SVG` }))}
              sourceRows={shownRows(entry, chosen, rows[entry.id])}
            />
          ) : (
            <EmptyPanel title="Nothing selected" instruction="Click any section on the canvas — its controls appear here." />
          )}
        </aside>
      </div>
    </div>
  )
}
