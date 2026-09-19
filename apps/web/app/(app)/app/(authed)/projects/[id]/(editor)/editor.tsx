'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useLayoutEffect, useRef, useState, type HTMLAttributes } from 'react'
import { createPortal } from 'react-dom'
import type { IconLookup, SectionRegistryEntry } from '@inflozo/library'
import {
  clearDarkOverrides, darkOverridesInForce, duplicateSection, getPath, isDesigned, moveSection, removeSection,
  renameSection, serializeMarks, setContent, setHidden, setMemberVisibility, stampControls, storedFor,
} from '@inflozo/section-runtime'
import type { ControlState, DocInstance, MemberState, Mode, ProjectDoc, PropValue, RuntimeElement } from '@inflozo/section-runtime'
import { loadIcons } from '@/components/controls/icon-picker'
import { Layers, type LayerRow, type SectionDrag } from '@/components/controls/layers'
import { DeviceSwitch, ViewportChip } from '@/components/editor/device-switch'
import { ModeToggle, modeShown } from '@/components/editor/mode-toggle'
import { TemplateSwitcher } from '@/components/editor/template-switcher'
import { CanvasNote, InlineTools, type InlineToolsHandle, type ScreenSelection } from '@/components/controls/mark-toolbar'
import { SectionPill, type PillBox } from '@/components/controls/section-pill'
import { Sidebar, type Edit } from '@/components/controls/sidebar'
import { ProBadge } from '@/components/kit/badge'
import { Button, IconButton } from '@/components/kit/button'
import { closeOnBackdrop, openOnCancel, sheet, title } from '@/components/kit/dialog'
import { EmptyPanel } from '@/components/kit/empty-panel'
import { ring, slimScrollbar } from '@/components/kit/greyed'
import { ChevronLeft, Panel } from '@/components/kit/icons'
import { PanelLabel } from '@/components/kit/labels'
import { canvasAssets, canvasSrc, mountSections, renderSection, shownRows } from '@/lib/canvas'
import { chromeLayers, dropChromeLayers, pinned, place, type ChromeLayers } from '@/lib/canvas-layer'
import { DESKTOP, deviceShown, fitFor, type Device } from '@/lib/device'
import { CANVASES, canvasOfPath, canvasStack, settingsPath, SITE, templateKeyOf, type CanvasKey } from '@/lib/editor'
import { committed, EMPTY_DOC, templatesOpen } from '@/lib/round-trip'
import { startInline, type Inline, type InlineSelection } from '@/lib/inline'
import { captureLayout, landingAt, type Layout } from '@/lib/reorder'
import { escDeselects, hold, HOLD_IDLE, HOLD_MS, rootFrom, samePropElsewhere, sectionRoots, takeStamps, withState, type HoldEvent, type Stamp } from '@/lib/selection'
import { isApp, stripApp } from '@/routing'
import type { EditorData } from './read'

/* ─────────────────────────────────────────── S4 Editor.dc.html — S4a, the editor at rest, 1440 (Story 5.1).

   FR-D1's four regions, read off the frame: the 48px bar and its rule (:28), Layers at 240 with a right rule (:54),
   the canvas ground with the page card 28px from each side (and, since R-137/R-138, centred between 32px of top and bottom padding) and the page shadow (:62-63), and
   Controls at 280 with a left rule and 16px padding (:118). The window never scrolls: the canvas document scrolls
   inside its frame and each panel on its own.

   THE CANVAS is the one canvas document `/canvas` serves (no script; the pilots review frames the same one), every
   section drawn through `lib/canvas.ts` — the render `/pilots` uses. Since Story 5.7 it is a DEVICE VIEWPORT in both
   axes (`lib/device.ts`, R-137): the iframe's CSS pixel size is the device's own, so a media query fires at that width
   and `vh` resolves honestly, and the only scale on it is a `transform` fitted to BOTH axes and capped at 1. The card
   takes the device's size rather than the room available and is centred in the ground — S4a`:63`'s `height:100%`, its
   top-only radius and its 864 ceiling are what R-137 replaced, and its ground, ink, shadow and 6px radius are what it
   kept. Nothing on it is chrome at rest: the chrome stylesheet inside is keyed on `data-inflozo-*`, and a root carries
   one only while hovered or selected.

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
   deselects unless a field, a picker or the reset dialog owns it; a change of canvas deselects too, and so does a press on
   NOTHING, which ends any editing in the same press: the canvas ground below the last section, the editor's own ground
   around the page card, and the empty space below the Layers rows (R-123 and its amendment, the owner's rulings of
   2026-09-18, reversing Story 5.2's "the selection stays"). The top bar is deliberately not one of them.

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

   LAYERS, THE PILL, AND THE TWO KINDS OF SINGLETON (Story 5.4 — B7, D8e, S4b). The Layers panel's body is
   `controls/layers.tsx`: B7's two groups as R-126 amends them — Site-wide over the page's own rows, one shape, a
   hairline between — each row pressable, draggable by its grip, carrying a `…` (Hide/Show · Rename · Duplicate ·
   Delete) as its only control and answering `↑ ↓ / ⌥↑ ⌥↓ / Enter / Space` on the row itself. Every operation goes through `doc-edit.ts` — ONE place decides what a move, a copy, a removal, a
   rename, a hide and an audience mean, so 5.8's journal and Epic 7's compiler read the rules rather than re-derive
   them — and each writes this session's `docs` and repaints. A HIDDEN instance stays in the doc and renders `''`, so
   `sectionRoots` gives it a null root exactly as a gated section does; R-124's Member visibility is an instance field
   handed to the render door as `RenderInput.visibility`, which Story 4.10 already honours on both emitters, and the
   panel draws it at the head of Section Settings (never in Layers). A SITE-WIDE section is one shared instance: its
   Duplicate is absent, and Delete or Hide asks first in the app's one dialog vocabulary, naming every template.
   S4b's QUICK-ACTION PILL (`controls/section-pill.tsx`) carries Duplicate, Delete and the drag grip and nothing else
   (R-118). It is OUTSIDE the frame because it is pressed — and because a React portal into the canvas document gets
   no React events at all — so it is placed from the hovered section's rect through the frame's rect and the fit, on
   its own frame loop, hides from the first canvas `scroll` and is placed again 150 ms after the last, exactly as
   P0-1's toolbar does. R-125 keeps it a gap to the LEFT of R-119's Pro tag, which does not move. The pointer crossing
   from the iframe onto it reaches the canvas document as a `pointerout` with a null `relatedTarget`, which would
   clear the very hover it is anchored to: guarded by GEOMETRY, because the two documents' events have no guaranteed
   order. A repaint still clears the hover — the pointer has not said where it is since — so the pill returns on the
   next move. Either grip drives the SAME reorder, and the dashed landing slot is drawn in Layers whichever one is
   held; the geometry is `lib/reorder.ts`, the one implementation P0-3's item list also drags by.

   EXTRAPOLATED, NOT DRAWN AT 1440 (R-74): the Layers header is D8e's (`D8 Editor Below 1440.dc.html:372-373`) with
   its "THIS PAGE · HOME" line moved out of the title row — it does not fit beside it in 240, and since Story 5.4 it
   is B7's own group header, where B7 prints it; both folds are D8's "Show layers" rail (:193-194), the Controls one
   mirrored, as `/controls` does (DW-114).
   Tap-and-hold and Esc deselecting are drawn nowhere either, and the panel at rest is PAGE over the Kit's empty state.

   THE SWITCHER AND THE MARKER (Story 5.5 — D5b, D5a). The top bar's centred group is `components/editor/`: D5b's
   switcher, alone since R-130 took D5a's chip out of the bar (the marker's one place is the Layers panel). The switcher is the editor's FIRST SOFT
   NAVIGATION: `router.push` inside a transition, the `[id]` layout keeping this component mounted, and the `[key]`
   effect below clearing the selection as the new canvas paints (DW-176's close). SYNTHESIS IS SERVER TRUTH: `read.ts`
   hands over the Synthesis Default stack of every untouched synthesizable canvas as an ordinary doc, plus the set of
   keys it built, so nothing here decides what an untouched canvas looks like. `commit()` is AD-22's round trip, in
   one place: the first edit to a canvas makes it the user's, and taking its last section off gives it back to the
   default stack, marker and all — while merely HIDING them all does not (FR-D5).

   LIGHT AND DARK (Story 5.6 — S4a's sun, R-132, R-133, D6a). THE PREVIEW IS ONE ATTRIBUTE AND A RE-STAMP, NEVER A
   REPAINT: the canvas document's `<html>` carries `data-mode`, which `tokens.ts` reserved for exactly this
   (`:165-172` — no fourth mode signal exists), the token block does the colouring, and a flip re-stamps each root
   through `storedFor(design, instance, mode)` and re-applies `mark()`. So a caret, a text selection, the scroll
   position and the selection all survive a flip; `paint()` writes the attribute too, so a repaint from any other
   cause keeps the mode. `resolveControls` and `stampControls` are unchanged and no mode reaches the theme emitter
   (AD-30, `agreement.test.ts`). A MODE-SCOPED control's change in dark lands in `darkOverrides` and the light page
   keeps what it had — decided in the engine, keyed on each control's own `darkOverride` DECLARATION and never on the
   name `bg`. The sun is ABSENT, not disabled, on a Light-only project (`dark_enabled`, server truth from `read.ts`),
   and every stored override survives that untouched (AD-17). R-133's per-section clear has TWO entry points — the
   Controls panel's foot and the Layers `⋯` — and ONE confirm, below, beside Delete's and Hide's and for the same
   reason. The project's own two rows live on R-131's Theme settings screen, reached from the bar.

   DEVICE PREVIEW (Story 5.7 — S4a's track, B11's chip, R-137). THE DEVICE IS A STYLE CHANGE, NEVER A REPAINT — even
   weaker than 5.6's flip, which at least re-stamps: nothing in the canvas DOM is touched at all, so every section root
   is the same node and the selection, the stamps, the inline caret and the canvas scroll all survive it. The device is
   session state like the mode, and resets to Desktop on reload. The `ResizeObserver` watches the stage `<section>` and
   not the card, because the card is now the ANSWER (the device's size, fitted) and the stage is the question (the room
   available). NO ZOOM CONTROL and no per-breakpoint editing (UX-DR17, UX-DR20, FR-D8): the fit is derived and only
   reported. `1` `2` `3` are Story 5.9's whole keyboard map, and D8b's collapse into `⋯` below 1440 is Story 5.22's.

   ABSENT, NOT GREYED (UX-DR3), each until its story: "Saved", saving and Undo/Redo (5.8 — until then an edit lives for
   the session and a reload starts from the stored docs), View as (5.14),
   Ship it (7.18), the name's rename underline (no story yet),
   "+ Add section" and the hairline "+" between sections (5.10),
   the design arrows and S4c's "4 / 18" chip (5.11) and the Style Pack card (6.3)
   (R-118); S4's own "Dark mode / Readers get a moon toggle" sidebar row, which is the VISITOR's `mode-toggle` and a
   different setting (`EXPERIENCE.md:652`) whose refusal has nothing to read before Epic 7 (R-118 a third time); clicking an icon on the canvas, its empty slot and a button's icon (9.1, R-121), P0-1's docked bar at 390
   (R-87), the lock pill on a text prop promoted to Ghost Admin (7.10), live link search over a linked site (5.18) and
   P0-2's filled-slot popover. S4a's posts-per-page note and S4c's pinned Quick Controls card are never
   built (FR-Q1, R-113). */

/** The visitor the canvas previews until Story 5.14's View as: Story 4.10's own default, named here because R-124's
 *  Member visibility control says which visitor it is when a section is gated away. */
const PREVIEWS: Exclude<MemberState, 'everyone'> = 'anonymous'

// `EMPTY_DOC`, the template count and AD-22's round trip are `lib/round-trip.ts`'s, where `node --test` reaches them.

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

/** Story 5.5: a canvas's own doc is keyed by its `template_key`, which stopped being its URL segment when the
 *  membership canvases arrived (`custom-signup` → `custom:custom-signup.hbs`). `Pick.doc` is the STORED key
 *  throughout, so every operation below addresses the row it will one day save. */
const stackOf = (docs: Readonly<Record<string, ProjectDoc>>, key: CanvasKey): Placed[] =>
  canvasStack(
    (docs[SITE.key]?.instances ?? []).map((i) => ({ ...i, target: SITE.file as string, doc: SITE.key as string })),
    (docs[templateKeyOf(key)]?.instances ?? []).map((i) => ({ ...i, target: CANVASES[key].file as string, doc: templateKeyOf(key) })),
  )

export function Editor({
  project,
  docs: stored,
  entries,
  rows,
  pool,
  swatches,
  links,
  memberVisibility,
  timezone,
  plan,
  canvases,
  synthesized,
  defaults: stacks,
  darkEnabled,
}: EditorData & { project: { id: string; name: string } }) {
  const pathname = usePathname()
  // the layout 404s every segment that is not a canvas, so a null here is never drawn
  const key = canvasOfPath(stripApp(pathname)) ?? 'home'
  const canvas = CANVASES[key]
  // Edits live here for the session: nothing writes `project_templates` before Story 5.8, so a reload starts again
  const [docs, setDocs] = useState(stored)
  /** Story 5.5 — the canvases that are UNTOUCHED right now: D5a's Layers marker and D5b's hollow dot read this one set.
   *  It starts as the server's `synthesized` and `commit()` is the only thing that changes it. */
  const [auto, setAuto] = useState<ReadonlySet<CanvasKey>>(() => new Set(synthesized))
  const stack = stackOf(docs, key)
  /** How many templates a site-wide section really reaches — the Site-wide heading's number and the confirm's. */
  const templates = templatesOpen(canvases, docs, auto)
  /** D5b's third dot state: a canvas with no default stack — R-129's three and Private — that nothing has designed
   *  yet. Derived from `defaults`, which holds exactly the synthesizable canvases, so it needs no second list. */
  const empty = new Set(canvases.filter((k) => stacks[templateKeyOf(k)] === undefined && !isDesigned(docs[templateKeyOf(k)] ?? EMPTY_DOC)))
  const [selected, setSelected] = useState<Pick | null>(null)
  const [hovered, setHovered] = useState<Pick | null>(null)
  const [paints, setPaints] = useState(0)
  /** Story 5.6 — the mode the canvas is SHOWING. Session state, like `pilots/review.tsx`'s: it is never in the URL
   *  (`lib/editor.ts`) and never a stored per-canvas preference. A Light-only project has no way to leave 'light'. */
  const [mode, setMode] = useState<Mode>('light')
  /** Story 5.7 — the device the canvas IS. Session state like the mode, for the same reason: it is a property of the
   *  person looking and not of the canvas, so it survives a canvas switch (this component stays mounted), resets to
   *  Desktop on reload, and no column stores it. R-137 makes Desktop a viewport too, so there is no state in which the
   *  card fills the room available. */
  const [device, setDevice] = useState<Device>(DESKTOP)

  const layers = useFold()
  const controls = useFold()
  const frame = useRef<HTMLIFrameElement>(null)
  /** the canvas ground: its CONTENT BOX is the room the card is fitted into — the card itself is the answer, so
   *  measuring it would measure the fit rather than the space (Story 5.7; it was the card until R-137) */
  const stage = useRef<HTMLElement>(null)
  const tag = useRef<HTMLDivElement>(null)
  const hoverBox = useRef<HTMLDivElement>(null)
  const selectedBox = useRef<HTMLDivElement>(null)
  const badge = useRef<HTMLDivElement>(null)
  const icons = useRef<IconLookup | null>(null)
  /** index-aligned with the stack last painted; null where a section rendered nothing */
  const roots = useRef<(HTMLElement | null)[]>([])
  const [size, setSize] = useState({ width: 0, height: 0 })
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
  // Story 5.4 — the one reorder, held here because EITHER grip starts it: a Layers row's or the canvas pill's
  const [drag, setDrag] = useState<SectionDrag | null>(null)
  /** the pill drag's own start: the pointer's Y and the dragged doc's sections as they sat ON SCREEN */
  const pillDrag = useRef<{ y: number; layout: Layout }>({ y: 0, layout: { tops: [], heights: [], gap: 0 } })
  const pill = useRef<HTMLDivElement | null>(null)
  /** what a completed move says, politely — `moveSection`'s own words, announced from here so both grips announce */
  const [said, setSaid] = useState('')
  type Note = { el: HTMLElement; kind: 'lock' | 'limit'; words: string }
  const [note, setNote] = useState<Note | null>(null)
  // the pill as the canvas document's handlers see it, in the same task it was set — paint reads it before React has
  // rendered the state
  const noteRef = useRef<Note | null>(null)
  const showNote = (next: Note | null) => {
    noteRef.current = next
    setNote(next)
  }
  /** the elements a paint stamped with this lock's name, in document order — the same order on every paint of the same docs */
  const sameLock = (words: string) => [...stamps.current].filter(([, s]) => 'ghost' in s && `${s.ghost} — set in Ghost` === words).map(([el]) => el)
  const noteBox = useRef<HTMLDivElement>(null)
  const tools = useRef<InlineToolsHandle>(null)
  /** a press on the canvas is under way: a repaint it causes waits for its click, which must still find its target */
  const press = useRef({ on: false, repaint: false })
  /** THE ONE SCALE (Story 5.7): `min(1, stageW/deviceW, stageH/deviceH)`, derived and never set. Everything downstream
   *  already takes the fit as a derived quantity — `place()` is handed it, `onScreen` and `fitOf` recompute it from the
   *  DOM — so this line is the whole of the change. */
  const scale = fitFor(size, device)
  // the canvas document's handlers and paint read the latest values through here
  const latest = useRef({ key, docs, stack, selected, hovered, auto, mode })
  latest.current = { key, docs, stack, selected, hovered, auto, mode }

  /** EVERY WRITE TO THE SESSION'S DOCS GOES THROUGH HERE, so AD-22's round trip is decided ONCE rather than at each of
   *  the three places that edit a doc. Two rules, and they are the whole of FR-D6's "untouched is a real state":
   *
   *  THE FIRST EDIT MATERIALISES. The canvas that was written to stops being auto-generated — its marker goes and
   *  its switcher dot fills. Nothing is persisted: Story 5.8 saves, so a reload starts over.
   *
   *  THE LAST SECTION OFF GIVES IT BACK. A synthesizable canvas whose doc now holds no instances is untouched again,
   *  so its Synthesis Default stack re-renders and the marker returns. HIDING every section does NOT do this
   *  (FR-D5): a hidden instance is retained, so `isDesigned` is still true. */
  const commit = (written: Readonly<Record<string, ProjectDoc>>, touched: string) => {
    const now = latest.current
    const next = committed(written, touched, stacks, now.auto)
    if (next.auto !== now.auto) setAuto(next.auto)
    latest.current = { ...now, docs: next.docs, auto: next.auto, stack: stackOf(next.docs, now.key) }
    setDocs(next.docs)
    return next.back
  }

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
  /** The stored slice each root's attributes come from, in the mode being shown — `stampControls`' single door,
   *  handed a different slice. This is the whole of the dark render (AD-30). */
  const slice = (placed: Placed, state: ControlState = placed) => {
    const design = entries[placed.designId]
    return design === undefined
      ? undefined
      : { controlSchema: design.controlSchema, universals: design.universals, controls: storedFor(design, state, latest.current.mode) }
  }

  /** Every root re-stamped for the mode now showing. NEVER A REPAINT: nothing in the DOM is replaced, so the caret,
   *  the text selection, the scroll position and the selection all survive the flip (the story's whole point). */
  const restampAll = () => {
    const now = latest.current
    roots.current.forEach((root, n) => {
      const placed = now.stack[n]
      const input = placed ? slice(placed) : undefined
      if (root && input) stampControls(root as unknown as RuntimeElement, input)
    })
    // `stampControls` strips every root `data-*` it does not own, `data-inflozo-*` included
    mark()
  }

  /** R-132's press: the attribute, a re-stamp, and the mode now showing announced politely through the editor's one
   *  live region. The top bar never deselects (R-123), so nothing is chosen or unchosen here. */
  const flip = (next: Mode) => {
    if (next === latest.current.mode) return
    latest.current = { ...latest.current, mode: next }
    setMode(next)
    const doc = frame.current?.contentDocument
    if (doc) doc.documentElement.setAttribute('data-mode', next)
    restampAll()
    setSaid(modeShown(next))
  }

  /** Story 5.7's press, and it is deliberately smaller than `flip`'s: A DEVICE CHANGE IS A STYLE CHANGE AND NOTHING
   *  ELSE. Nothing is reloaded, `paint()` is not called and nothing re-stamps — the card and the iframe simply take
   *  new numbers — so every section root is the same node object and the selection, the outlines, the stamps, the
   *  inline caret and the canvas scroll all survive it. The top bar never deselects (R-123). */
  const pickDevice = (next: Device) => {
    if (next.name === device.name) return
    setDevice(next)
    setSaid(deviceShown(next))
  }

  const choose = (pick: Pick | null) => {
    if (same(pick, latest.current.selected) || (!pick && !latest.current.selected)) return
    latest.current.selected = pick
    setSelected(pick)
    showNote(null)
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
    // Story 5.6: the mode is ONE attribute on the canvas root, and every paint re-asserts it — the token block
    // (`tokens.ts`'s `:root[data-mode="dark"]`) does all the colouring from there (AD-30)
    doc.documentElement.setAttribute('data-mode', now.mode)
    // a field being edited is ended in place before its element is replaced, and asks for no second paint
    const was = editing.current
    editing.current = null
    was?.inline.end()
    // review (2026-09-18): a click on a Ghost word while another field is being edited ends that field, whose repaint
    // waits for this click and then arrived AFTER the pill was set, taking it away; a lock pill survives the paint on the
    // element in the same place of the new render
    const lock = noteRef.current?.kind === 'lock' ? { words: noteRef.current.words, at: sameLock(noteRef.current.words).indexOf(noteRef.current.el) } : null
    showNote(null)
    try {
      const assets = canvasAssets(pool)
      const parts = now.stack.map((i) => {
        const entry: SectionRegistryEntry | undefined = entries[i.designId]
        if (!entry) throw new Error(`${i.designId} was not read for this project`)
        // Story 5.4: HIDDEN IS RETAINED, NEVER REMOVED — the instance stays in the doc and renders nothing, so
        // `sectionRoots` gives it a null root exactly as a member-gated section does, and Epic 7 leaves it out of the
        // compile. R-124's audience reaches the render door as `visibility`, which gates the root on both emitters.
        if (i.hidden) return ''
        // Story 5.6: a repaint in dark must draw the DARK render — the mode picks the stored slice handed to the one
        // door, here as it does in `restampAll` and `onChange`, so no repaint ever silently returns to light
        return renderSection(doc, entry, { ...i, controls: storedFor(entry, i, now.mode) }, { target: i.target, rows: rows[i.designId], feed: 'first', member: PREVIEWS, visibility: i.memberVisibility, assets, icons: lookup, editing: true })
      })
      mountSections(mount, parts.join(''))
      // Story 5.3: the stamps lifted into memory in the same task, so none is ever painted or observable
      stamps.current = takeStamps(mount.querySelectorAll<HTMLElement>('[data-inflozo-prop], [data-inflozo-ghost]'))
      const back = lock && lock.at >= 0 ? sameLock(lock.words)[lock.at] : undefined
      if (back && lock) showNote({ el: back, kind: 'lock', words: lock.words })
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
    // review (2026-09-18): a press in ANOTHER section walks up to <html> without meeting this root, and the pilots share
    // prop names (`sub`, `eyebrow`, `note`), so its stamp would start editing that element against this section's value
    // (`instanceof Node` would be the editor window's Node, and the target lives in the canvas document's realm)
    if (!root || !target || !root.contains(target as Node)) return null
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
  /** the press is over: after the click it fires, which runs in the same task */
  const release = () => {
    setTimeout(() => {
      press.current.on = false
      if (press.current.repaint) {
        press.current.repaint = false
        paint()
      }
    }, 0)
  }
  /** The selection's rect on screen: through the frame's own rect and the fit. */
  const onScreen = (s: InlineSelection | null): ScreenSelection | null => {
    const f = frame.current
    if (!s || !f || f.offsetWidth === 0) return null
    const fr = f.getBoundingClientRect()
    const k = fr.width / f.offsetWidth
    return { ...s, rect: { left: fr.left + s.rect.left * k, top: fr.top + s.rect.top * k, width: s.rect.width * k, height: s.rect.height * k }, edge: fr.top }
  }

  // ─── Story 5.4 — the canvas's geometry, read from outside the frame ───

  /** The fit, as the frame draws it: one canvas pixel is `k` screen pixels. */
  const fitOf = (f: HTMLIFrameElement, fr: DOMRect) => (f.offsetWidth > 0 ? fr.width / f.offsetWidth : 1)

  /** Is a point in the CANVAS document's coordinates inside S4b's pill, which lives outside the frame? */
  const overPill = (cx: number, cy: number) => {
    const [f, el] = [frame.current, pill.current]
    if (!f || !el || el.style.visibility === 'hidden') return false
    const fr = f.getBoundingClientRect()
    const k = fitOf(f, fr)
    const p = el.getBoundingClientRect()
    const [x, y] = [fr.left + cx * k, fr.top + cy * k]
    return x >= p.left && x <= p.right && y >= p.top && y <= p.bottom
  }

  /** One doc's own sections as they sit ON SCREEN, in `captureLayout`'s two offsets — what the pill's grip drags
   *  against, because the pointer is over the canvas rather than over the Layers list. A hidden or gated section has
   *  no root and contributes a zero-height row at the last one's edge, so a drag still passes it. */
  const screenRows = (docKey: string) => {
    const f = frame.current
    const fr = f?.getBoundingClientRect()
    const k = f && fr ? fitOf(f, fr) : 1
    let last = 0
    return (latest.current.docs[docKey]?.instances ?? []).map((inst) => {
      const n = latest.current.stack.findIndex((placed) => placed.doc === docKey && placed.instanceId === inst.instanceId)
      const r = (n === -1 ? null : roots.current[n])?.getBoundingClientRect()
      if (!r) return { offsetTop: last, offsetHeight: 0 }
      last = r.bottom * k
      return { offsetTop: r.top * k, offsetHeight: r.height * k }
    })
  }

  const startEditing = (target: HTMLElement, stamp: { path: string; item?: number }, n: number, caret: 'pointer' | 'end') => {
    const placed = latest.current.stack[n]
    const def = placed ? entries[placed.designId]?.contentSchema[stamp.path] : undefined
    if (!placed || !def) return false
    // moving between fields: the first ends in place, and its end asks for no paint because it is no longer current
    const was = editing.current
    editing.current = null
    was?.inline.end()
    showNote(null)
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
        commit(withState(now.docs, at.doc, at.instanceId, state), at.doc)
        // the limit's pill stays until the next edit
        if (noteRef.current?.kind === 'limit') showNote(null)
        // the same prop drawn twice follows as it is typed
        for (const other of samePropElsewhere<HTMLElement>(stamps.current, target, me.path, me.item, roots.current[me.n])) other.innerHTML = serializeMarks(next, def)
      },
      onRefused: (words) => showNote({ el: target, kind: 'limit', words }),
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
      // the primary button alone starts editing: a right press would put the caret in and open the browser's editing
      // menu over it, and a middle press on Linux pastes the primary selection (review, 2026-09-18)
      const hit = e.button === 0 ? stampAt(e.target, pressedIn) : null
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
    doc.addEventListener('mouseup', release)
    let settle: ReturnType<typeof setTimeout> | undefined
    doc.addEventListener('scroll', () => {
      // Story 5.4: the pill is anchored from THIS document too, so it hides and re-places on the same timer as P0-1's
      // toolbar. Nothing hovered and nothing being edited means nothing outside the frame to hide (review, 5.2).
      if (!editing.current && !latest.current.hovered) return
      setScrolling(true)
      clearTimeout(settle)
      // ponytail: a timer, not `scrollend`; switch when every engine the editor supports fires it
      settle = setTimeout(() => {
        setScrolling(false)
        editing.current?.inline.report()
      }, 150)
      // capture: a section's own scrolling box (a carousel, an overflow row) moves the words under the toolbar too
    }, { passive: true, capture: true })
    // hover is the mouse's and the pen's: touch has the hold, so a tap never flashes an outline before it selects
    doc.addEventListener('pointerover', (e) => {
      if (e.pointerType !== 'touch') point(pickAt(e.target))
    })
    doc.addEventListener('pointerout', (e) => {
      if (e.pointerType === 'touch' || e.relatedTarget !== null) return
      // Story 5.4: the pointer crossing from the iframe onto S4b's pill arrives HERE, as a `pointerout` with a null
      // relatedTarget — the pill is outside the frame (AD-21) — so clearing the hover would take the pill away from
      // under the pointer that is inside it. Tested by GEOMETRY and not by the pill's own `pointerenter`, because two
      // documents' pointer events have no guaranteed order.
      if (overPill(e.clientX, e.clientY)) return
      point(null)
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
      showNote(ghost && 'ghost' in ghost.stamp ? { el: ghost.el, kind: 'lock', words: `${ghost.stamp.ghost} — set in Ghost` } : null)
      // R-123 (owner, 2026-09-18): a click on NOTHING — the ground below the last section — deselects, as Esc does.
      // It used to keep the selection (Story 5.2's matrix); one press now ends any editing and lets the section go.
      choose(pickAt(e.target))
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
    // a press that starts on the canvas and lifts over the panel releases in the editor document, not the canvas's —
    // added once here, not once per canvas document wired (review, 2026-09-18)
    // ponytail: a lift outside the browser window reaches neither; the next press releases it
    window.addEventListener('mouseup', release)
    return () => {
      alive = false
      el?.removeEventListener('load', ready)
      window.removeEventListener('keydown', onEscape)
      window.removeEventListener('mouseup', release)
    }
    // mount only
  }, [])

  // the fit: re-measured whenever a fold or the window changes THE ROOM AVAILABLE. The stage's content box, never the
  // card's — since R-137 the card is the device's size fitted, so measuring it would measure this effect's own answer
  useLayoutEffect(() => {
    if (!stage.current) return
    const watch = new ResizeObserver(([row]) => row && setSize({ width: row.contentRect.width, height: row.contentRect.height }))
    watch.observe(stage.current)
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

  // ─── Story 5.4 — every section operation, through `doc-edit.ts`, and the two surfaces that ask for one ───

  /** A row's identity across both Layers groups: an `instanceId` is unique inside a doc, not between two. */
  const keyOf = (p: Pick) => `${p.doc}:${p.instanceId}`

  /** One doc's own instances as Layers rows, in DOC order — the card's are `site`'s, the page group's are this
   *  canvas's. Doc order, not `canvasStack`'s: the row's `at` is the position `moveSection` is given, and B7 draws
   *  the card's rows as the site doc stores them (DW-187: the `a3/` footers compile last whatever that order). */
  const rowsOf = (docKey: string): LayerRow[] =>
    (docs[docKey]?.instances ?? []).map((i, at) => ({
      doc: docKey, instanceId: i.instanceId, layerName: i.layerName, hidden: i.hidden, at,
      // R-133: the `⋯` item is ABSENT where nothing could be cleared, and the engine's own definition decides.
      // R-135 (owner, 2026-09-19): and absent on a LIGHT-ONLY project, where Theme settings greys the same act with
      // its reason — the editor shows nothing about dark there, exactly as the sun is gone rather than disabled.
      darkOverride: darkEnabled && darkOverridesInForce(entries[i.designId] ?? { controlSchema: [] }, i).length > 0,
    }))

  /** One operation over one template's doc: the session's next `docs`, painted once. Answers the refusal, or null. */
  const apply = (pick: Pick, op: (doc: ProjectDoc) => ProjectDoc | string): string | null => {
    const now = latest.current
    const doc = now.docs[pick.doc]
    if (!doc) return `there is no ${pick.doc} template to edit`
    const next = op(doc)
    if (typeof next === 'string') return next
    const back = commit({ ...now.docs, [pick.doc]: next }, pick.doc)
    // a selection cannot outlive the section it was on — and neither can it (or a hover) outlive a canvas returning to
    // untouched. `back` is asked, not the ids: synthesis DERIVES them (`auto-tag-1`), so the default stack that returns
    // can repeat the id of the very section just removed, and a test by id would keep the panel open on a new instance
    // (review, 2026-09-18).
    const gone = !latest.current.docs[pick.doc]?.instances.some((i) => i.instanceId === pick.instanceId)
    if (back && now.hovered?.doc === pick.doc) point(null)
    if (now.selected?.doc === pick.doc && (back || (same(now.selected, pick) && gone))) choose(null)
    paint()
    return null
  }

  /** A refusal is shown WHERE THE ACTION WAS PRESSED: P0-1's pill over the section itself, the shape the character
   *  limit already uses. Only R-37's second Post Content can reach it, and `packages/library/designs/` holds no A25
   *  design — so this path is proved by `doc-edit.test.ts` and not on the deployed editor. */
  const refuse = (pick: Pick, words: string) => {
    choose(pick)
    const root = rootOf(pick)
    if (root) showNote({ el: root, kind: 'limit', words })
  }
  const edit = (pick: Pick, op: (doc: ProjectDoc) => ProjectDoc | string) => {
    const refused = apply(pick, op)
    if (refused !== null) refuse(pick, refused)
  }

  const onDuplicate = (pick: Pick) => edit(pick, (doc) => duplicateSection(doc, pick.instanceId, crypto.randomUUID()))
  const onRename = (pick: Pick, name: string) => apply(pick, (doc) => renameSection(doc, pick.instanceId, name))

  /** FR-D5: a site-wide section is ONE shared instance, so removing or hiding it changes every template — the app's
   *  one dialog vocabulary asks first, opening on Cancel (EXPERIENCE § destructive confirms). SHOWING one again asks
   *  nothing: it is the restoring half. The dialog lives here and not in Layers, because the canvas pill's Delete
   *  must open the same one. */
  const [ask, setAsk] = useState<{ kind: 'hide' | 'remove'; pick: Pick; name: string } | null>(null)
  const confirm = useRef<HTMLDialogElement>(null)
  const askFirst = (kind: 'hide' | 'remove', row: Pick & { layerName: string }) => {
    setAsk({ kind, pick: { doc: row.doc, instanceId: row.instanceId }, name: row.layerName })
    // opened on the frame after the one that filled its words in
    requestAnimationFrame(() => openOnCancel(confirm.current))
  }
  /** R-133's ONE confirm, for BOTH entry points — the Controls panel's foot and the Layers `⋯` — beside Delete's and
   *  Hide's and for the same reason (`layers.tsx`'s header): two entry points, one act, one dialog. It asks first,
   *  names the count, and opens on Cancel (R-115, UX-DR14). Neither entry point ever reaches it with nothing to
   *  clear: the panel row says so itself and the menu item is absent. */
  const [askDark, setAskDark] = useState<{ pick: Pick; name: string; count: number } | null>(null)
  const clearDark = useRef<HTMLDialogElement>(null)
  const askClearDark = (row: Pick & { layerName: string }) => {
    const placed = latest.current.stack.find((i) => same(i, row))
    const entry_ = placed ? entries[placed.designId] : undefined
    const count = placed && entry_ ? darkOverridesInForce(entry_, placed).length : 0
    if (count === 0) return
    setAskDark({ pick: { doc: row.doc, instanceId: row.instanceId }, name: row.layerName, count })
    requestAnimationFrame(() => openOnCancel(clearDark.current))
  }

  const onRemove = (row: Pick & { layerName: string }) =>
    row.doc === SITE.key ? askFirst('remove', row) : edit(row, (doc) => removeSection(doc, row.instanceId))
  const onToggleHidden = (row: LayerRow) =>
    row.doc === SITE.key && !row.hidden ? askFirst('hide', row) : edit(row, (doc) => setHidden(doc, row.instanceId, !row.hidden))

  /** The drop, and `⌥↑`/`⌥↓`: one `moveSection`, announced politely in its own words (UX-DR12). */
  const moveTo = (pick: Pick, to: number): string | null => {
    const doc = latest.current.docs[pick.doc]
    const moved = doc ? moveSection(doc, pick.instanceId, to) : 'there is no template to edit'
    if (typeof moved === 'string') return null
    apply(pick, () => moved.doc)
    setSaid(moved.announce)
    return moved.announce
  }

  /** S4b's pill, read from outside the frame every frame: the hovered section's rect on screen, the card's own box to
   *  stay inside, and — R-125 — R-119's Pro tag's left edge while the tag is drawn on THIS section. */
  const pillBox = (): PillBox | null => {
    const f = frame.current
    if (!f || !hoveredRoot) return null
    const fr = f.getBoundingClientRect()
    const k = fitOf(f, fr)
    const r = hoveredRoot.getBoundingClientRect()
    // the badge is placed on the SELECTED root: only a hovered selection puts the two in the same corner
    const b = pro && same(hovered, selected) ? badge.current?.getBoundingClientRect() : undefined
    return {
      rect: { left: fr.left + r.left * k, top: fr.top + r.top * k, right: fr.left + r.right * k, bottom: fr.top + r.bottom * k },
      bounds: { left: fr.left, top: fr.top, right: fr.right, bottom: fr.bottom },
      badgeLeft: b && b.width > 0 ? fr.left + b.left * k : null,
    }
  }

  /** The pill's grip: the SAME reorder as a Layers row's, read against the sections as they sit on the canvas,
   *  because that is where the pointer is. Layers draws the dashed slot either way. */
  const pillGrip: HTMLAttributes<HTMLSpanElement> = {
    onPointerDown: (event) => {
      const pick = latest.current.hovered
      if (event.button !== 0 || drag !== null || !pick) return
      const from = (latest.current.docs[pick.doc]?.instances ?? []).findIndex((i) => i.instanceId === pick.instanceId)
      if (from === -1) return
      event.currentTarget.setPointerCapture(event.pointerId)
      pillDrag.current = { y: event.clientY, layout: captureLayout(screenRows(pick.doc)) }
      setDrag({ doc: pick.doc, from, to: from, dy: 0, via: 'pill' })
    },
    onPointerMove: (event) => {
      if (!drag) return
      // dy stays 0: the row in Layers is not the thing being dragged, so only the slot follows the pointer
      setDrag({ ...drag, to: landingAt(pillDrag.current.layout, drag.from, event.clientY, pillDrag.current.y) })
    },
    onPointerUp: () => {
      if (!drag) return
      const { doc, from, to } = drag
      setDrag(null)
      const moved = latest.current.docs[doc]?.instances[from]
      if (to !== from && moved) moveTo({ doc, instanceId: moved.instanceId }, to)
    },
    onPointerCancel: () => setDrag(null),
  }

  if (failure) throw failure

  const src = canvasSrc(isApp(pathname))

  const onChange = (next: ControlState, kind: Edit) => {
    const now = latest.current
    const pick = now.selected
    if (!pick) return
    commit(withState(now.docs, pick.doc, pick.instanceId, next), pick.doc)
    const n = now.stack.findIndex((i) => same(i, pick))
    const root = roots.current[n]
    const design = entries[now.stack[n]?.designId ?? '']
    // a control changes only the root's attributes, so it is stamped in place (`/pilots`' fast path); no root means
    // the section is gated away, and anything else needs a render
    const placed = now.stack[n]
    const input = kind === 'control' && placed ? slice(placed, next) : undefined
    if (input && root && design) {
      stampControls(root as unknown as RuntimeElement, input)
      mark()
    } else paint()
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-paper text-ink">
      <header className="relative flex h-12 shrink-0 items-center gap-[10px] border-b border-line bg-paper px-3">
        <Link
          href="/"
          aria-label="Back to dashboard"
          title="Back to dashboard"
          className={`inline-flex size-7 items-center justify-center rounded-sm text-ink-soft transition-colors hover:bg-paper-sunk ${ring}`}
        >
          <ChevronLeft size={15} />
        </Link>
        <span className="max-w-[calc(50%-200px)] truncate text-ui-dense font-semibold">{project.name}</span>
        {/* D5a's centred group (:37), now the switcher ALONE: the owner removed the marker chip that stood beside it
            at his test of Story 5.5 (R-130) — the switcher's own row already carries the hollow dot and the word, and
            the Layers row still carries the sentence. ABSOLUTELY centred, as the frame draws it, so it does not move
            as the project's name grows. */}
        <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center">
          <TemplateSwitcher projectId={project.id} current={key} canvases={canvases} auto={auto} empty={empty} />
        </div>
        {/* S4a's RIGHT-HAND CLUSTER (:35-40). R-132's one button leads it and S4a's device track sits IMMEDIATELY
            RIGHT OF IT, as the frame draws them; View as (5.14), undo/redo (5.8) and Ship it (7.18) land beside them
            later (R-118).
            The sun is ABSENT, NOT DISABLED, on a Light-only project (UX-DR3, R-118, R-128, and AD-17's own Rule in so
            many words): there is no toggle rather than a theme that declares less. The device track is NOT scoped by
            dark — R-135 scopes the mode and nothing else — so it is drawn on every project. */}
        <div className="ml-auto flex items-center gap-[10px]">
          {darkEnabled ? <ModeToggle mode={mode} onMode={flip} /> : null}
          <DeviceSwitch device={device} onDevice={pickDevice} />
          {/* R-131's screen, reached from the editor and from nowhere else — it is the project's, not the account's,
              so it is never a shell-nav destination (`EXPERIENCE.md:172`). Words, not a glyph: the export draws no
              icon for it, and R-92 forbids inventing one here. */}
          <Link
            href={settingsPath(project.id)}
            id="editor-theme-settings"
            className={`rounded-sm px-[6px] py-1 text-ui-dense text-ink-soft transition-colors hover:bg-paper-sunk hover:text-ink ${ring}`}
          >
            Theme settings
          </Link>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <aside id="editor-layers" aria-label="Layers" hidden={layers.folded} className="flex w-[240px] shrink-0 flex-col border-r border-line bg-paper">
          <div className="flex items-center gap-2 px-4 pt-[10px]">
            <span className="flex-1 text-[12.5px] font-semibold">Layers</span>
            <IconButton ref={layers.hide} label="Collapse layers" title="Collapse layers" aria-expanded aria-controls="editor-layers" onClick={() => layers.toggle(true)}>
              <Panel size={15} />
            </IconButton>
          </div>
          {/* B7's two groups, every row pressable — and R-123's third ground inside it (`controls/layers.tsx`) */}
          <Layers
            site={rowsOf(SITE.key)}
            page={rowsOf(templateKeyOf(key))}
            label={canvas.label}
            siteKey={SITE.key}
            // derived, never written down (standing rule 4): the templates this project's site-wide sections reach
            templates={templates}
            autoGenerated={auto.has(key)}
            selectedKey={selected ? keyOf(selected) : null}
            hoveredKey={hovered ? keyOf(hovered) : null}
            drag={drag}
            onDrag={setDrag}
            onSelect={choose}
            onGround={() => choose(null)}
            onToggleHidden={onToggleHidden}
            onRename={onRename}
            onDuplicate={onDuplicate}
            onRemove={onRemove}
            onClearDark={askClearDark}
            onMove={moveTo}
          />
        </aside>
        {layers.folded ? <Rail fold={layers} label="Show layers" controls="editor-layers" side="left" /> : null}

        <section
          ref={stage}
          aria-label="Canvas"
          // R-123: the ground around the page card is nothing too — a press on it ends editing and deselects, exactly as
          // Esc does. `currentTarget` alone: a press on the page card keeps the selection, as the Controls panel, the top
          // bar, the Layers header and a Layers row do (EXPERIENCE § the focus model (2)); the toolbar and its link panel
          // are portalled to the body, so their presses never reach this handler at all. The space below the Layers rows
          // is the third ground, on its own list container.
          // STORY 5.7: the centring is on THIS ELEMENT and not on a wrapper around the card. A wrapper would become a
          // fourth ground that `e.target === e.currentTarget` does not cover, and a press in the letterbox beside a
          // phone-shaped card would silently stop deselecting. The chip is absolutely positioned and pointer-transparent,
          // so it is out of the centring and out of this test.
          onPointerDown={(e) => {
            if (e.button === 0 && e.target === e.currentTarget) choose(null)
          }}
          // R-138 (owner, 2026-09-19): `pt-8`, not S4a`:62`'s 24px. THE CHIP IS PINNED TO THIS CORNER AND THE CARD
          // MOVES, so a height-bound card rose to meet it — measured on the deployed editor at 1440 × 900: Tablet put
          // the card 5px UNDER the chip and Desktop with both panels folded left 4px the card's shadow bled across.
          // The chip tucks to 4px/4px and ends at 24px; 32px of top padding is what keeps the card clear of it on
          // EVERY device, at a cost of 8px of fitted height.
          // R-139 (owner, 2026-09-19, the Review's Q3): THE BOTTOM GETS THE SAME 32px — `py-8`. R-137 said the card "no
          // longer stands on the bottom of the window", and a height-bound card (Tablet, Mobile, a folded or short-window
          // Desktop) still did, with its shadow cut off. Tablet 74% → 71%, Mobile 97% → 93% on the 1440 × 900 stage. The
          // two sides are S4a's.
          className="relative flex min-w-0 flex-1 flex-col items-center justify-center bg-canvas-ground px-7 py-8"
        >
          {/* R-137: the card is the DEVICE's size, fitted — centred in the ground, rounded on all four corners, with
              ground below it. `shrink-0` because the fit already guarantees it is never larger than the stage.
              HIDDEN UNTIL THE STAGE IS MEASURED (review, 2026-09-19): before the first `ResizeObserver` callback the
              fit is 1, and the server's HTML would otherwise paint a full 1440 × 900 card across both panels — the
              old card was `w-full overflow-hidden` and clipped the same state, this one is `shrink-0`. */}
          <div
            style={{ width: device.width * scale, height: device.height * scale, visibility: size.width > 0 && size.height > 0 ? undefined : 'hidden' }}
            className="relative shrink-0 overflow-hidden rounded-[6px] bg-paper-raised shadow-canvas-page"
          >
            <iframe
              ref={frame}
              src={src}
              title={`${canvas.label} canvas`}
              // the CSS PIXEL SIZE IS THE DEVICE'S, always — so a media query inside the canvas fires at that width and
              // `100vh` resolves to that height; the fit is a transform over it and never touches the CSS viewport
              // (`prd.md:569`). Never scale by changing this width.
              data-width={device.width}
              className="block origin-top-left border-0"
              style={{ width: device.width, height: device.height, transform: `scale(${scale})` }}
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
          {/* B11's chip: the true size first, the fit second, and nothing sets it (UX-DR17, UX-DR20). LAST, not first:
              the page card must stay this ground's `firstElementChild`, which is how the harness and step 27's gutter
              find it — and out of flow it paints over the ground either way. */}
          <ViewportChip device={device} fit={scale} />
          {/* P0-1's toolbar and its link panel, and S4b's quick-action pill: all pressed, so all outside the frame
              (AD-21) — and all hidden from the first canvas scroll, placed again 150ms after the last */}
          <InlineTools id="canvas-inline" session={session} selection={inlineAt} hidden={scrolling} resources={links} handle={tools} />
          <SectionPill
            shown={!!pointed}
            hidden={scrolling}
            boxOf={pillBox}
            // FR-D5: a site-wide section is one shared instance, so its Duplicate is absent here as it is in Layers
            canDuplicate={pointed?.doc !== SITE.key}
            name={pointed?.layerName ?? ''}
            pillRef={pill}
            onDuplicate={() => pointed && onDuplicate(pointed)}
            onDelete={() => pointed && onRemove(pointed)}
            gripProps={pillGrip}
            onPointerLeave={(e) => {
              // leaving the pill for the canvas is the canvas document's own `pointerover`; leaving it for a panel or
              // the bar reaches neither document, so the hover is let go here. Never mid-drag, which holds the pointer.
              const f = frame.current?.getBoundingClientRect()
              if (drag || !f) return
              if (e.clientX < f.left || e.clientX > f.right || e.clientY < f.top || e.clientY > f.bottom) point(null)
            }}
          />
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
              // Story 5.6 — the mode's own swatch values, so the Background-role dots are the colours the canvas
              // is actually painting; the mode itself scopes every resolution, write and reset in the panel
              swatches={swatches[mode]}
              mode={mode}
              // R-135: absent on a Light-only project — `sidebar.tsx` draws no row at all without this
              onClearDark={darkEnabled ? () => askClearDark(chosen) : undefined}
              timezone={timezone}
              links={links}
              assets={pool.map((a) => ({ id: a.id, src: `${src}?image=${a.id}`, meta: `${Math.max(1, Math.round(a.bytes / 1024))} KB · SVG` }))}
              sourceRows={shownRows(entry, chosen, rows[entry.id])}
              // R-124: the FIRST ROW of Section Settings, for a section whose category carries it — never in Layers.
              // The value is the instance's own and reaches both emitters as `RenderInput.visibility`, so there is no
              // design control to declare (DW-186); `carriesMemberVisibility` reads R-113's register (DW-185).
              visibility={
                memberVisibility[chosen.designId] === true
                  ? {
                      value: chosen.memberVisibility,
                      previews: PREVIEWS,
                      onChange: (value) => edit(chosen, (doc) => setMemberVisibility(doc, chosen.instanceId, value)),
                    }
                  : undefined
              }
            />
          ) : (
            <EmptyPanel title="Nothing selected" instruction="Click any section on the canvas — its controls appear here." />
          )}
        </aside>
      </div>

      {/* A completed move, announced politely in `moveSection`'s own words — from here, so a drop on either grip
          (a Layers row's or the canvas pill's) reads out through one live region (UX-DR12) */}
      <p id="editor-said" aria-live="polite" className="sr-only">
        {said}
      </p>

      {/* FR-D5's site-wide confirm, for both entry points: a Layers row's menu (Hide or Delete), and the canvas pill's bin */}
      <dialog
        ref={confirm}
        onClick={closeOnBackdrop}
        aria-labelledby="editor-sitewide-title"
        aria-describedby="editor-sitewide-body"
        className={`${sheet} gap-[18px]`}
      >
        <div className="flex flex-col gap-[6px]">
          <h2 id="editor-sitewide-title" className={title}>
            {ask?.kind === 'remove' ? 'Delete' : 'Hide'} {ask?.name ?? 'this section'}?
          </h2>
          <p id="editor-sitewide-body" className="text-ui-dense leading-[1.55] text-ink-soft">
            This section is site-wide: it is one shared thing that appears on every template of your site, so{' '}
            {ask?.kind === 'remove' ? 'deleting' : 'hiding'} it here changes all {templates}{' '}
            templates.
          </p>
        </div>
        <div className="flex justify-end gap-[10px]">
          <Button type="button" variant="secondary" size={36} data-cancel onClick={() => confirm.current?.close()}>
            Cancel
          </Button>
          <Button
            type="button"
            variant={ask?.kind === 'remove' ? 'danger' : 'coral'}
            size={36}
            onClick={() => {
              confirm.current?.close()
              if (!ask) return
              edit(ask.pick, (doc) => (ask.kind === 'remove' ? removeSection(doc, ask.pick.instanceId) : setHidden(doc, ask.pick.instanceId, true)))
            }}
          >
            {ask?.kind === 'remove' ? 'Delete section' : 'Hide section'}
          </Button>
        </div>
      </dialog>

      {/* R-133's ONE confirm, opened by the Controls panel's row AND the Layers `⋯` — R-115's shape, on Cancel */}
      <dialog
        ref={clearDark}
        onClick={closeOnBackdrop}
        aria-labelledby="editor-cleardark-title"
        aria-describedby="editor-cleardark-body"
        className={`${sheet} gap-[18px]`}
      >
        <div className="flex flex-col gap-[6px]">
          <h2 id="editor-cleardark-title" className={title}>
            Clear dark overrides on {askDark?.name ?? 'this section'}?
          </h2>
          <p id="editor-cleardark-body" className="text-ui-dense leading-[1.55] text-ink-soft">
            This section&apos;s dark version will follow its light one again, {askDark?.count ?? 0}{' '}
            {askDark?.count === 1 ? 'setting' : 'settings'} in all. Your light page, your words and your pictures are
            not touched.
          </p>
        </div>
        <div className="flex justify-end gap-[10px]">
          <Button type="button" variant="secondary" size={36} data-cancel onClick={() => clearDark.current?.close()}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="coral"
            size={36}
            onClick={() => {
              clearDark.current?.close()
              if (askDark) edit(askDark.pick, (doc) => clearDarkOverrides(doc, askDark.pick.instanceId))
            }}
          >
            Clear dark overrides
          </Button>
        </div>
      </dialog>
    </div>
  )
}
