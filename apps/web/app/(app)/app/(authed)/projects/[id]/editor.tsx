'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { IconLookup, SectionRegistryEntry } from '@inflozo/library'
import { getPath, serializeMarks, setContent, stampControls } from '@inflozo/section-runtime'
import type { ControlState, DocInstance, ProjectDoc, PropValue, RuntimeElement } from '@inflozo/section-runtime'
import { loadIcons } from '@/components/controls/icon-picker'
import { CanvasNote, InlineTools, type InlineToolsHandle, type ScreenSelection } from '@/components/controls/mark-toolbar'
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
import { startInline, type Inline, type InlineSelection } from '@/lib/inline'
import { escDeselects, hold, HOLD_IDLE, HOLD_MS, rootFrom, samePropElsewhere, sectionRoots, takeStamps, withState, type HoldEvent, type Stamp } from '@/lib/selection'
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
   `dragstart`, `mousedown`, `auxclick`, `dragover` and `drop` have their defaults prevented. Everything drawn for them — the two outline
   boxes (R-120: an inset box-shadow line, because a border or an outline is floored to whole pixels), the name tag and
   R-119's Pro badge — is this component's own elements PORTALLED into a chrome layer on the canvas document's `<body>`,
   beside the site's sections and never in them (`lib/canvas-layer.ts`), so the compositor scrolls them with their
   section in the same frame: drawn from this document they trailed it by a frame, the owner's finding. Touch has no hover: a 500 ms hold shows it and
   a tap selects (`lib/selection.ts`). Selecting mounts Story 4.5's `Sidebar` over an in-memory copy of the docs, fed
   what `/pilots` feeds it: a control change stamps the live root, anything else repaints — and after every paint and
   every stamp the attributes are re-applied, because `stampControls` strips every root `data-*` it does not own. Esc
   deselects unless a field, a picker or the reset dialog owns it; a change of canvas deselects too.

   TYPING ON THE CANVAS (Story 5.3 — P0-1, B4b). Every paint asks the canvas emitter for its editing stamps and lifts them
   into memory in the same task (`takeStamps`), so nothing is left on the page. A press on a stamped text prop inside the
   selected section is not prevented: the element becomes `contenteditable` inside the handler and the browser puts the
   caret under the pointer. A `<button>`'s label cannot take a caret that way (executed), so its press is prevented and the
   label goes into a temporary editable span, focused with the caret at its end, that ending editing unwraps. Every other
   press is prevented, so a first click still only selects, and moves focus to the canvas document so Esc reaches it.
   `lib/inline.ts` runs the field: each input stores the value through `setContent` without repainting, writes the new
   markup into any other element stamped with the same prop, and a refused character shows the limit's pill. A press into
   a second field starts it before the first one's focusout arrives, so the first ends in place and nothing repaints; when
   editing ends with no field being edited, the canvas repaints, after the press that ended it, so it is again exactly the
   render of the stored docs. P0-1's toolbar sits outside the frame, placed from the selection's rect through the frame's
   rect and the fit, hidden from the first canvas scroll and placed again 150ms after the last; its link panel is Story
   4.5's, and a press on the canvas closes it committing nothing. A click on Ghost's own words in the selected section
   shows P0-1's lock pill naming them (R-122), in the chrome layer beside them; the next click, Esc or a change of
   selection takes it away.

   EXTRAPOLATED, NOT DRAWN AT 1440 (R-74): the Layers header is D8e's (`D8 Editor Below 1440.dc.html:372-373`) with
   the mono line under the title rather than beside it, because "THIS PAGE · AUTHOR ARCHIVE" does not fit beside it
   in 240; both folds are D8's "Show layers" rail (:193-194), the Controls one mirrored, as `/controls` does (DW-114).
   Tap-and-hold and Esc deselecting are drawn nowhere either, and the panel at rest is PAGE over the Kit's empty state.

   ABSENT, NOT GREYED (UX-DR3), each until its story: "Saved", saving and Undo/Redo (5.8 — until then an edit lives for
   the session and a reload starts from the stored docs), the Template pill (5.5), View as (5.14), the sun (5.6), the
   device switch (5.7), Ship it (7.18), the name's rename underline (no story yet), Layers' grip, eye, thumbnails and a
   pressable row (5.4), "+ Add section" and the hairline "+" between sections (5.10), the hover pill's Duplicate, Delete
   and drag handle (5.4), the design arrows and S4c's "4 / 18" chip (5.11), the Style Pack card (6.3) and Dark mode (5.6)
   (R-118); clicking an icon on the canvas, its empty slot and a button's icon (9.1, R-121), P0-1's docked bar at 390
   (R-87), the lock pill on a text prop promoted to Ghost Admin (7.10), live link search over a linked site (5.18) and
   P0-2's filled-slot popover. S4a's posts-per-page note and S4c's pinned Quick Controls card are never
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
  // Story 5.3 — each paint's editing stamps, the field being edited, its toolbar, and the pill
  const stamps = useRef(new Map<HTMLElement, Stamp>())
  type Editing = { inline: Inline; target: HTMLElement; path: string; item?: number; n: number }
  const editing = useRef<Editing | null>(null)
  const [session, setSession] = useState<Inline | null>(null)
  const [inlineAt, setInlineAt] = useState<ScreenSelection | null>(null)
  const [scrolling, setScrolling] = useState(false)
  const [note, setNote] = useState<{ el: HTMLElement; kind: 'lock' | 'limit'; words: string } | null>(null)
  const noteBox = useRef<HTMLDivElement>(null)
  const tools = useRef<InlineToolsHandle>(null)
  /** a press on the canvas is under way: a repaint it causes waits for its click, which must still find its target */
  const press = useRef({ on: false, repaint: false })
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
    setNote(null)
    // a change of selection ends editing
    editing.current?.inline.end()
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
    // a field being edited is ended in place before its element is replaced, and asks for no second paint
    const was = editing.current
    editing.current = null
    was?.inline.end()
    setNote(null)
    try {
      const assets = canvasAssets(pool)
      const parts = now.stack.map((i) => {
        const entry: SectionRegistryEntry | undefined = entries[i.designId]
        if (!entry) throw new Error(`${i.designId} was not read for this project`)
        return renderSection(doc, entry, i, { target: i.target, rows: rows[i.designId], feed: 'first', member: 'anonymous', visibility: 'everyone', assets, icons: lookup, editing: true })
      })
      mountSections(mount, parts.join(''))
      // Story 5.3: the stamps lifted into memory in the same task, so none is ever painted or observable
      stamps.current = takeStamps(mount.querySelectorAll<HTMLElement>('[data-inflozo-prop], [data-inflozo-ghost]'))
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

  // ─── Story 5.3 — typing on the canvas ───

  /** The nearest stamped element a target sits in, inside the section that was selected when the press began. */
  const stampAt = (target: EventTarget | null, pick: Pick | null) => {
    const n = pick ? latest.current.stack.findIndex((i) => same(i, pick)) : -1
    const root = roots.current[n]
    if (!root) return null
    for (let x = target as HTMLElement | null; x; x = x.parentElement) {
      const stamp = stamps.current.get(x)
      if (stamp) return { el: x, stamp, n }
      if (x === root) break
    }
    return null
  }
  /** paints now, or after the press that asked for it has had its click */
  const repaintAfterPress = () => {
    if (press.current.on) press.current.repaint = true
    else paint()
  }
  /** The selection's rect on screen: through the frame's own rect and the fit. */
  const onScreen = (s: InlineSelection | null): ScreenSelection | null => {
    const f = frame.current
    if (!s || !f) return null
    const fr = f.getBoundingClientRect()
    const k = fr.width / f.offsetWidth
    return { ...s, rect: { left: fr.left + s.rect.left * k, top: fr.top + s.rect.top * k, width: s.rect.width * k, height: s.rect.height * k }, edge: fr.top }
  }

  const startEditing = (target: HTMLElement, stamp: { path: string; item?: number }, n: number, caret: 'pointer' | 'end') => {
    const placed = latest.current.stack[n]
    const def = placed ? entries[placed.designId]?.contentSchema[stamp.path] : undefined
    if (!placed || !def) return false
    // moving between fields: the first ends in place, and its end asks for no paint because it is no longer current
    const was = editing.current
    editing.current = null
    was?.inline.end()
    setNote(null)
    const doc = target.ownerDocument
    let el = target
    let unwrap = () => {}
    if (target.tagName === 'BUTTON') {
      const span = doc.createElement('span')
      span.append(...target.childNodes)
      target.append(span)
      el = span
      unwrap = () => {
        if (span.parentNode === target) span.replaceWith(...span.childNodes)
      }
    }
    const cut = stamp.path.indexOf('[].')
    const value = (cut === -1
      ? getPath(placed.content, stamp.path)
      : getPath((getPath(placed.content, stamp.path.slice(0, cut)) as unknown[] | undefined)?.[stamp.item ?? -1], stamp.path.slice(cut + 3))) as PropValue
    const me: Editing = { inline: null as unknown as Inline, target, path: stamp.path, item: stamp.item, n }
    me.inline = startInline(el, {
      def,
      label: def.label,
      value,
      onValue: (next) => {
        const now = latest.current
        const at = now.stack[me.n]
        const entry = at ? entries[at.designId] : undefined
        if (!at || !entry) return
        const state = setContent(entry, at, me.path, next, me.item)
        if (typeof state === 'string') return
        const docs = withState(now.docs, at.doc, at.instanceId, state)
        latest.current = { ...now, docs, stack: stackOf(docs, now.key) }
        setDocs(docs)
        // the limit's pill stays until the next edit
        setNote((shown) => (shown?.kind === 'limit' ? null : shown))
        // the same prop drawn twice follows as it is typed
        for (const other of samePropElsewhere<HTMLElement>(stamps.current, target, me.path, me.item, roots.current[me.n])) other.innerHTML = serializeMarks(next, def)
      },
      onRefused: (words) => setNote({ el: target, kind: 'limit', words }),
      onSelection: (s) => setInlineAt(onScreen(s)),
      onLinkKey: () => tools.current?.openLink(),
      onToolbarKey: () => tools.current?.focusBar(),
      onEnd: () => {
        unwrap()
        setInlineAt(null)
        setSession((shown) => (shown === me.inline ? null : shown))
        if (editing.current !== me) return
        editing.current = null
        setSession(null)
        repaintAfterPress()
      },
    })
    editing.current = me
    setSession(me.inline)
    if (caret === 'end') {
      el.focus({ preventScroll: true })
      const sel = doc.getSelection()
      sel?.selectAllChildren(el)
      sel?.collapseToEnd()
    }
    return true
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
    // `auxclick` too: a middle click on a link would open it in a new tab. `drop` (and `dragover`, which a drop needs):
    // a file dropped on the canvas would navigate its document to the file — AD-21's dropped-files trap (review, 2026-09-17)
    for (const type of ['submit', 'dragstart', 'auxclick', 'dragover', 'drop']) doc.addEventListener(type, (e) => e.preventDefault())
    // Story 5.3: which section was selected when the press began — a touch's tap selects on its lift, before the mouse
    // events it fires, and a first tap must still only select
    let pressedIn: Pick | null = null
    doc.addEventListener('pointerdown', () => {
      pressedIn = latest.current.selected
      // the link panel's light dismiss never sees a press inside the frame: it closes here, committing nothing
      tools.current?.closeLink()
    }, true)
    doc.addEventListener('mousedown', (e) => {
      press.current.on = true
      const hit = stampAt(e.target, pressedIn)
      if (hit && 'path' in hit.stamp && hit.el.tagName !== 'BUTTON') {
        // not prevented: contenteditable is on before the default action, so the caret lands under the pointer
        if (editing.current?.target === hit.el || startEditing(hit.el, hit.stamp, hit.n, 'pointer')) return
      }
      e.preventDefault()
      if (hit && 'path' in hit.stamp) {
        if (editing.current?.target !== hit.el) startEditing(hit.el, hit.stamp, hit.n, 'end')
        return
      }
      // a press the canvas prevents moves focus to the canvas document, so Esc reaches the canvas (and a field being
      // edited loses it, which ends editing)
      const active = doc.activeElement as HTMLElement | null
      if (active && active !== doc.body) active.blur()
      doc.defaultView?.focus()
    })
    doc.addEventListener('mouseup', () => {
      // after the click this press fires, which runs in the same task
      setTimeout(() => {
        press.current.on = false
        if (press.current.repaint) {
          press.current.repaint = false
          paint()
        }
      }, 0)
    })
    let settle: ReturnType<typeof setTimeout> | undefined
    doc.addEventListener('scroll', () => {
      if (!editing.current) return
      setScrolling(true)
      clearTimeout(settle)
      // ponytail: a timer, not `scrollend`; switch when every engine the editor supports fires it
      settle = setTimeout(() => {
        setScrolling(false)
        editing.current?.inline.report()
      }, 150)
    }, { passive: true })
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
      // a second finger is not a press: the first one's hold or tap is off, and neither lift is a tap (review, 2026-09-17)
      if (state.at) {
        clearTimeout(timer)
        step({ type: 'cancel' })
        return
      }
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
      // R-122: Ghost's own words in the selected section name themselves; the next click takes the pill away
      const ghost = stampAt(e.target, latest.current.selected)
      setNote(ghost && 'ghost' in ghost.stamp ? { el: ghost.el, kind: 'lock', words: `${ghost.stamp.ghost} — set in Ghost` } : null)
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
    const all: [HTMLElement | null, HTMLElement | null, 'fill' | 'top-left' | 'top-right' | 'above'][] = [
      [hoverBox.current, hoveredRoot, 'fill'],
      [selectedBox.current, selectedRoot, 'fill'],
      [tag.current, hoveredRoot, 'top-left'],
      [badge.current, selectedRoot, 'top-right'],
      [noteBox.current, note?.el ?? null, 'above'],
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
            {/* P0-1's pill (R-122, and the limit's sentence): chrome in the canvas's own layer, so it scrolls with its words */}
            {note && chosen && layerFor(selectedRoot) ? createPortal(<CanvasNote ref={noteBox} kind={note.kind} words={note.words} />, layerFor(selectedRoot) as ShadowRoot) : null}
          </div>
          {/* P0-1's toolbar and its link panel: pressed, so outside the frame (AD-21) */}
          <InlineTools id="canvas-inline" session={session} selection={inlineAt} hidden={scrolling} resources={links} handle={tools} />
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
