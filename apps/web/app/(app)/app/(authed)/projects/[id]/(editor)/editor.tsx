'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useLayoutEffect, useMemo, useRef, useState, useTransition, type HTMLAttributes } from 'react'
import { createPortal } from 'react-dom'
import { categoryOf, orbitWeekly, ringFor, type IconLookup, type SectionRegistryEntry } from '@inflozo/library'
import {
  clearDarkOverrides, darkOverridesInForce, defaultContent, duplicateSection, getPath, insertSection, isDesigned,
  moveSection, removeSection, renameSection, serializeMarks, setContent, setHidden, setMemberVisibility,
  stampControls, storedFor, switchDesign,
} from '@inflozo/section-runtime'
import type { ControlState, Mode, ProjectDoc, PropValue, RuntimeElement, SynthesisLibrary } from '@inflozo/section-runtime'
import { loadIcons } from '@/components/controls/icon-picker'
import { Layers, type LayerRow, type SectionDrag } from '@/components/controls/layers'
import { DesignPicker } from '@/components/editor/design-picker'
import { DeviceSwitch, ViewportChip } from '@/components/editor/device-switch'
import { ModeToggle, modeShown } from '@/components/editor/mode-toggle'
import { PageTwoPill } from '@/components/editor/page-two-pill'
import { LockBar } from '@/components/editor/lock-bar'
import { LockRequest } from '@/components/editor/lock-request'
import { LockTakeover } from '@/components/editor/lock-takeover'
import { PreviewBar, PreviewButton } from '@/components/editor/preview-toggle'
import { RemixDice, type RemixHandle } from '@/components/editor/remix-dice'
import { SectionPicker, type Placement } from '@/components/editor/section-picker'
import { SourcePill } from '@/components/editor/source-pill'
import { SaveState } from '@/components/editor/save-state'
import { openShortcuts, ShortcutsSheet } from '@/components/editor/shortcuts-sheet'
import { TemplateSwitcher } from '@/components/editor/template-switcher'
import { ViewAs } from '@/components/editor/view-as'
import { CanvasNote, InlineTools, type InlineToolsHandle, type ScreenSelection } from '@/components/controls/mark-toolbar'
import { SectionPill, type PillBox } from '@/components/controls/section-pill'
import { Sidebar, type Edit } from '@/components/controls/sidebar'
import { ProBadge } from '@/components/kit/badge'
import { AddButton, Button, IconButton } from '@/components/kit/button'
import { closeOnBackdrop, openOnCancel, sheet, title } from '@/components/kit/dialog'
import { EmptyPanel } from '@/components/kit/empty-panel'
import { ring, slimScrollbar } from '@/components/kit/greyed'
import { ChevronLeft, Panel, Pause, Redo as RedoIcon, Undo as UndoIcon } from '@/components/kit/icons'
import { PanelLabel } from '@/components/kit/labels'
import { movesByItself, startBehaviours } from '@/lib/behaviours'
import { canvasAssets, canvasSrc, renderSection, shownRows, wheelToFrame } from '@/lib/canvas'
import { chromeLayers, dropChromeLayers, pinned, place, type ChromeLayers } from '@/lib/canvas-layer'
import { DESKTOP, DEVICES, deviceShown, fitFor, type Device } from '@/lib/device'
import { CANVASES, canvasOfPageTwoKey, canvasOfPath, settingsPath, SITE, syncPath, templateKeyOf, type CanvasKey } from '@/lib/editor'
import {
  append, autoFrom, backoffSeconds, canRedo, canUndo, EMPTY_JOURNAL, flushed, flushPayload, FLUSH_MS,
  flushDecision, hydrationFor, journalCleared, maxSeq, ownFlushLanded, redo as redoIn, restingState, undo as undoIn,
  unsynced, unsyncedEdits, vanishedDesign, type FlushCall, type Journal, type Restore, type SyncState,
} from '@/lib/journal'
import {
  displacedBy, HEARTBEAT_MS, isStale, LOCK_COPY, NUDGE_MS, stillAsking, type LockRow,
} from '@/lib/lock'
import { askLock, lockSignals, lockUrl, tabSession, type LockAnswer, type LockSignal } from '@/lib/lock-client'
import { holdsCaret, IN_PREVIEW, shortcutFor, SINGLE_KEY, type Gesture } from '@/lib/keymap'
import { BACK_SAID, PAUSED, PREVIEW_SAID } from '@/lib/preview'
import { remixFold, remixPicks, remixSaid, remixable } from '@/lib/remix'
import { announce, pillPosition, shuffleTo, step } from '@/lib/ring'
import { invokedAt, isSiteWide, offeredHere } from '@/lib/picker'
import { askToPersist, openLocal, type LocalStore } from '@/lib/local-store'
import { closeMenus } from '@/lib/menu'
import { committed, EMPTY_DOC, templatesOpen } from '@/lib/round-trip'
import {
  carry, COPY_MARKER, editedDoc, ENTERED_SAID, follows, followersOf, leftBecause, LEFT_SAID, mainFeedOn, offersPageTwo,
  ownKeyOf, PAGE_TWO_WORDS, pageFileOf, pageInForce, SITE_WIDE_ASK, stackOf, type Page, type Placed,
} from '@/lib/page-two'
import { startInline, type Inline, type InlineSelection } from '@/lib/inline'
import { captureLayout, landingAt, type Layout } from '@/lib/reorder'
import { escDeselects, hold, HOLD_IDLE, HOLD_MS, rootFrom, samePropElsewhere, sectionRoots, takeStamps, withState, type HoldEvent, type Stamp } from '@/lib/selection'
import { GONE, SAVE_REFUSED, SUBJECT_SAID, bundledSource, subjectOptions } from '@/lib/preview-subject'
import { VIEW_AS_SAID, afterChange, seen, type Viewed, type Visitor } from '@/lib/view-as'
import { isApp, stripApp } from '@/routing'
import { setPreviewSubject, setViewedStates } from './actions'
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

   THE DESIGN RING (Story 5.11 — B1a, S4b + S6, FR-D19, R-158, R-159). A placed section is no longer stuck with the
   look it arrived in: `]` and `[`, the ◀ ▶ on the section's own quick-action pill, a thumbnail in the panel's
   Design block and the pill's Shuffle — its ONE seat since the owner's test of 2026-09-20 amended R-159 — all reach ONE handler here, which calls ONE doc
   operation (`switchDesign`) through `apply` → `commit` — so a swap is one edit, one journal entry and one `⌘Z`
   (AD-15, AD-16) and the position is announced politely from the one place all four doors pass. WHICH designs are
   reachable is the library's `ringFor`, beside `offeredOn`, so the partition rule and the placement rule cannot
   drift; WHAT a swap does to the stored values is the runtime's `switchControls` (carry / park / default), and
   content, items and `data` are untouched by construction because a ring never leaves its category. THE LIBRARY
   HOLDS ONE DESIGN PER CATEGORY TODAY, so every ring here has length 1 and every one of those controls is ABSENT
   (UX-DR3) with the block reading "1 of 1" beside its `Design` label and one sentence saying why — the day Epic 9 fills a category
   they appear on their own, because every count is derived (R-158; the rule itself is exercised on the deployed
   `/controls` review page and on the keyboard harness, both over the three-design fixture ring).

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

   VIEW AS (Story 5.14 — S4a's eye, S4d's menu, B9, FR-D16, R-167 to R-170). A MODE LIKE THE DEVICE: session state,
   back to the logged out user on reload, never in the URL (`EXPERIENCE.md:230`), and it sits in S4a's CENTRED GROUP
   beside Template, where every drawn bar puts it. A CHOICE IS A REPAINT, never a re-stamp: Story 4.10's `gateMembers`
   REMOVES an element gated to another visitor, so the visitor reaches `renderSection`'s one `member` option and the
   render decides the rest — the canvas, R-124's caption, the picker's cards and the ring's tiles all through that one
   door. A section whose Member visibility excludes the visitor is LEFT OUT of the page, exactly as that visitor sees it
   (R-168), with its Layers row kept and the panel naming who is being previewed. The per-canvas "looked at" record is
   `project_template_prefs.member_states_viewed`, and R-167's rule for when it runs out is `lib/view-as.ts`'s
   `afterChange`, run by `commit()` and `restore()` alone. The reminder is a coral dot on each unviewed row of View as's
   own menu and nothing in the bar (R-169); it only reminds, and never blocks.

   BEHAVIOURS HOLD STILL WHILE DESIGNING, AND PREVIEW RUNS THEM (Story 5.15 — B3a, B3b, FR-D20, R-174, R-175). THIS
   COMPONENT RUNS `core` ITSELF, against the canvas window, on every paint (`lib/behaviours.ts`, DW-136): the canvas
   document carries no script and no nonce and the policy refuses `eval`, so nothing can run inside it, and `core`
   reaches every platform object through the `win` it is handed. While designing it holds still every module that is
   not edit-safe — `header-scroll`, `reveal`, `tabs` and `accordion` included (R-174) — and each such mount stays AT
   REST, its no-JavaScript state (FR-G7(4)): so at 390 Rail lists its links and shows no menu button. The markup is
   written plain and never through `mountSections`' blanket `js-enabled`. `core` hands back the mounts it held still,
   and B3a's PAUSED chip marks one only while its section is hovered or selected and only if the part MOVES BY ITSELF
   (R-175, the registry's `movesByItself`) — chrome in the canvas layer, 8px inside the mount's bottom-left corner, so
   the page at rest is still the site and no `data-inflozo-*` marks the mount. On today's library no chip is drawn: the
   pilots' `nav-drawer` and `member-form` both wait for a press. PREVIEW is B3a's pill or `P`, and B3b's bar, `Esc` or
   `P` come back: a MODE like the device (`EXPERIENCE.md:230`) — session state, never in the URL, never an edit — that
   HIDES every piece of editing chrome, never unmounting it, so every panel and the selection come back as they were;
   one repaint runs every module the build carries (a registry module no file implements yet runs as a no-op, so its
   mount draws its JavaScript branch as `/pilots` does). A link still never navigates the canvas and a form never
   submits (AD-21's traps); every other press reaches the page, and only `P`, `Esc`, `1` `2` `3` and `⌘S` act.

   ABSENT, NOT GREYED (UX-DR3), each until its story: Ship it (7.18), the name's rename underline (no story yet) and
   the Style Pack card (6.3) (R-118); S4's own "Dark mode / Readers get a moon toggle" sidebar row, which is the
   VISITOR's `mode-toggle` and a different setting (`EXPERIENCE.md:652`) whose refusal has nothing to read before
   Epic 7 (R-118 a third time); clicking an icon on the canvas, its empty slot and a button's icon (9.1, R-121), P0-1's
   docked bar at 390 (R-87), the lock pill on a text prop promoted to Ghost Admin (7.10), live link search over a
   linked site (5.18) and P0-2's filled-slot popover. S4a's posts-per-page note, S4c's pinned Quick Controls card
   (FR-Q1, R-113) and a "preview in a new tab" (B3's notes: the deploy preview URL's job) are never built. */

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
  /* AN UPDATER, NOT A VALUE (Story 5.9): `L` is bound on the window ONCE, at mount, so a handler that read
     `folded` from that render's closure would fold the panel and never unfold it. `setFolded` is asked instead. */
  const toggle = (next: boolean | ((was: boolean) => boolean)) => {
    toggled.current = true
    setFolded(next)
  }
  return { folded, hide, show, toggle }
}

/** D8's 44px rail with its one Show button. `hidden` in Preview (Story 5.15), never unmounted. */
function Rail({ fold, label, controls, side, hidden }: { fold: ReturnType<typeof useFold>; label: string; controls: string; side: 'left' | 'right'; hidden: boolean }) {
  return (
    <div hidden={hidden} className={`flex w-11 shrink-0 flex-col items-center bg-paper py-[6px] ${side === 'left' ? 'border-r' : 'border-l'} border-line`}>
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

/** Story 5.15 — where a behaviour's error goes: LOGGED, NEVER SAID, and its section stays at rest. `lib/behaviours.ts`
 *  names the module in the error, because `core` hands on whatever the module threw. */
const reportBehaviour = (error: unknown) => console.error('A behaviour on the canvas failed, and its section stays at rest.', error)

/** A section on this canvas, by the doc that stores it — a site-wide section lives in `site`. Story 5.5: a canvas's
 *  own doc is keyed by its `template_key`, which stopped being its URL segment when the membership canvases arrived
 *  (`custom-signup` → `custom:custom-signup.hbs`), and since Story 5.16 a section of PAGE 2 lives under page 2's own
 *  key (`index`, `tag-paged`, `author-paged`). `Pick.doc` is the STORED key throughout, so every operation below
 *  addresses the row it will one day save; the stack itself is `lib/page-two.ts`'s `stackOf`, page-aware. */
type Pick = { doc: string; instanceId: string }

const same = (a: Pick | null | undefined, b: Pick | null | undefined) => !!a && !!b && a.doc === b.doc && a.instanceId === b.instanceId

/** Story 5.16 — what `apply` answers when R-180 HELD the change for its ask: neither landed nor refused, so the caller
 *  announces nothing and shows no refusal. The confirm lands it and repaints. */
const HELD: unique symbol = Symbol('held')

/** What a change is ABOUT, for R-180's ask on page 2: the site-wide section it changes, by id and name. `also` is a
 *  second id the confirm marks as asked — a placement's NEW header, asked about under the one it replaces — and `said`
 *  is what `#editor-said` says once the held change lands (a move's own sentence), since the caller could not. */
type About = { instanceId: string; name: string; also?: string; said?: string }

/** STORY 5.17 — the edit lock as this component holds it. The four PARTIES are derived, never stored twice:
 *  `holder` is the only one the editor gates on, and `lib/lock.ts`'s `partyOf` is the rule the tests assert. */
type LockUi = {
  /** this session holds the lock and may edit. `commit()`'s one early return reads it. */
  holder: boolean
  /** the row as last heard, or null when nobody holds it */
  row: LockRow | null
  /** this session's Request editing is in flight or waiting (R-98's swapped label reads it) */
  asking: boolean
  /** when the request landed — the requester's own ~30 s runs from here, and B5c prints the duration */
  askedAt: number | null
  /** ~30 s passed with no answer: the bar offers the take-over */
  unanswered: boolean
  /** Hand over is in flight: the flush goes out BEFORE the release */
  handingOver: boolean
  /** the flush refused, so the lock was NOT released — unsynced work never crosses a lock boundary (AD-15) */
  handOverFailed: boolean
  /** the take-over's confirm is in flight */
  taking: boolean
}

/** A section's identity ACROSS THE PAGE SWITCH: page 2's copy of a section is the same section (R-179), so the panel
 *  stays mounted over the switch and focus stays on D5d's row when the row was pressed. */
const acrossPages = (p: Pick) => {
  const paged = canvasOfPageTwoKey(p.doc)
  return `${paged === null ? p.doc : templateKeyOf(paged)}:${p.instanceId}`
}

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
  subjects: storedSubjects,
  viewed: storedViewed,
  darkEnabled,
  revision,
  userId,
  autosave,
  lock: heldOnServer,
  canvasSrc: canvasPath,
}: EditorData & {
  project: { id: string; name: string }
  /** Story 5.9 — the canvas document's address, defaulting to the app's own `/canvas`. The keyboard harness serves
   *  the SAME `pilotsCanvasDocument()` bytes from a path of its own and names it here, so the real route keeps its
   *  session guard rather than having it bypassed for a test. */
  canvasSrc?: string
}) {
  const pathname = usePathname()
  // the layout 404s every segment that is not a canvas, so a null here is never drawn
  const key = canvasOfPath(stripApp(pathname)) ?? 'home'
  const canvas = CANVASES[key]
  // STORY 5.8 — EDITS NO LONGER LIVE FOR THE SESSION. They are still held here, and they are also written to this
  // browser's IndexedDB on every `commit()` and sent to the server on the timer, at tab close and on ⌘S. The server's
  // docs are the OPENING value only: the hydrate below replaces them with the local ones when the revisions agree.
  const [docs, setDocs] = useState(stored)
  /** Story 5.5 — the canvases that are UNTOUCHED right now: D5a's Layers marker and D5b's hollow dot read this one set.
   *  It starts as the server's `synthesized` and `commit()` is the only thing that changes it. */
  const [auto, setAuto] = useState<ReadonlySet<CanvasKey>>(() => new Set(synthesized))
  /** Story 5.16 — the library as page 2 asks it: R-127's fallback in `pageTwoStack` synthesizes, and that reads the
   *  designs this editor holds. `entries` never changes in a session, so every render's copy reads the same map. */
  const library: SynthesisLibrary = (designId) => entries[designId]
  /* ─── Story 5.16 — PAGE 2 (FR-D21, D5d, R-176 to R-180) ────────────────────────────────────────────────────────
   *
   * A CANVAS STATE beside the mode, the device, View as and Preview: session state, never in the URL, never stored,
   * never an edit. It is KEYED TO THE CANVAS it was chosen on, so the render that shows another canvas already shows
   * its page 1, and the `[key]` effect below puts it back to page 1 for good — the way back included. Which pages
   * exist, what page 2 is and which stack it paints are `lib/page-two.ts`'s; the stack KNOWS THE PAGE, so the roots,
   * the picks, the marks, the restamps, the panel's fast path and every edit agree with what is painted. */
  const [shownPage, setShownPage] = useState<{ key: CanvasKey; page: Page }>({ key, page: 1 })
  const page: Page = shownPage.key === key ? shownPage.page : 1
  /** the doc this canvas EDITS on the page in force — page 2's own key on page 2; the preview SUBJECT stays the canvas's */
  const own = ownKeyOf(key, page)
  const stack = stackOf(docs, key, page, library)
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
  /** Story 5.14 — the visitor the canvas PREVIEWS (FR-D16). Session state like the mode and the device, and for the
   *  same reason: it is a property of the person looking and not of the canvas, so it survives a canvas switch (this
   *  component stays mounted), goes back to the logged out user on reload, and is never in the URL or a column —
   *  `EXPERIENCE.md:230` makes View as a mode. It reaches every surface through `renderSection`'s one `member` option:
   *  the canvas, R-124's caption, the Section Picker's cards and the Design ring's tiles. */
  const [viewAs, setViewAs] = useState<Visitor>('anonymous')
  /** Story 5.15 — PREVIEW (FR-D20, B3a · B3b). Session state like the mode, the device and the visitor, and for the
   *  same reason: `EXPERIENCE.md:230` makes it a mode. It is never in the URL, never stored and never an edit — nothing
   *  reaches `commit()`, the journal or `⌘Z` — and a reload is back to editing. View as, the mode, the device and the
   *  preview subject all carry into it, because `paint()` reads them all through `latest`. */
  const [preview, setPreview] = useState(false)
  /* ─── Story 5.13 — FR-D22's PREVIEW SUBJECT, and the pill that names it ──────────────────────────────────────
   *
   * PER CANVAS (and per user only while a project has one owner: the table's key is `(project_id, template_key)`,
   * review 2026-09-21), stored in `project_template_prefs.preview_subject` — a column that has been in the
   * schema since day one with no reader anywhere, so this story is its first of both and adds no migration (R-99).
   * It is NOT part of the doc: it never enters 5.8's journal, `⌘Z` does not touch it and it never materialises an
   * untouched canvas (FR-D11 calls it "set-and-forget context, not a per-edit action").
   *
   * THE RESOLUTION IS THE LIBRARY'S and it is pure: `resolveSubject` answers which subject this canvas is actually
   * rendering and whether the stored one survived, so the pill has one honest answer to print and the fallback is a
   * unit test rather than a browser observation. A canvas with no singular resource resolves to null, and the pill
   * then states the source and offers nothing to open.
   */
  const [subjects, setSubjects] = useState(storedSubjects)
  /** the last save's refusal, carried in the menu: the choice stands for the session and will not survive a reload */
  const [subjectRefusal, setSubjectRefusal] = useState<string | null>(null)
  const [, startSubject] = useTransition()
  const subjectTurn = useRef(0)
  /** the bundled publication, the source until Story 5.18 reads the connected site (R-165) */
  const source = useMemo(bundledSource, [])
  const previewing = orbitWeekly.resolveSubject(canvas.file, subjects[templateKeyOf(key)])
  /** Story 5.16 — does this canvas have a page 2 at all (R-176): a main feed on page 1 whose list runs past one page */
  const offered = offersPageTwo(key, docs, previewing.subject)
  /** …and the section whose panel carries D5d's row: page 1's main feed, or on page 2 its copy */
  const feedHere = offered ? mainFeedOn(docs, key, page, library) : null
  const subjectRows = useMemo(
    () => (previewing.subject === null ? [] : subjectOptions(source, previewing.subject.kind)),
    [source, previewing.subject?.kind],
  )
  /* ─── Story 5.14 — FR-D16's "LOOKED AT" RECORD, and the nudge that names what I have not looked at ──────────────
   *
   * PER CANVAS, keyed by `template_key` as `subjects` is, and stored in `project_template_prefs.member_states_viewed` —
   * the column AD-22 names for "FR-D16's viewed member states", in the schema since day one with no reader and no
   * writer until now, so there is no migration (R-99). LOOKING IS NEVER AN EDIT: nothing here reaches `commit()`, the
   * journal or `⌘Z`, and an untouched canvas stays untouched.
   *
   * A visitor counts as viewed THE MOMENT THE CANVAS IS SHOWN IN THAT STATE (the effect below). R-167 (owner,
   * 2026-09-21) says when that runs out — at ANY change to the page — and `afterChange` decides it, called from
   * `commit()` and `restore()` and nowhere else, so undo and redo are changes and the hydrate is not.
   *
   * EVERY WRITE GOES DOWN ONE PROMISE CHAIN, so the answers land in the order the records were made and an early
   * answer arriving late can never stand over a later record. A refusal is LOGGED AND NEVER SAID: the record is
   * bookkeeping, and losing it costs one reminder after a reload, where announcing it would interrupt someone who
   * changed nothing (Story 5.13 said its refusal because a subject is an explicit choice; this is not one). */
  const [viewed, setViewed] = useState<Viewed>(storedViewed)
  const viewedWrites = useRef<Promise<void>>(Promise.resolve())
  const unsavedViewed = useRef<Record<string, readonly Visitor[]>>({})

  /** the section a swap has just landed on, for `canvas-chrome.css`'s 180ms settle — cleared when it is over */
  const swapped = useRef<Pick | null>(null)
  /** `markSwapped`'s one pending timer, cleared on unmount so a swap 180ms before leaving never marks a torn-down
   *  canvas (review, 2026-09-20) */
  const settle = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  /* ─── Story 5.8 — the journal, the indicator and the flush ───────────────────────────────────────────────────────
   *
   * THE JOURNAL IS THE UNDO STACK (AD-15), which is why undo surviving a reload costs nothing extra: the same records
   * that say what to send are the records that say what to put back. Its rules are `lib/journal.ts`'s, where
   * `node --test` reaches them; this component holds the state and the effects.
   *
   * THE FIRST PAINT IS GATED ON THE LOCAL READ. A reload must never flash the cloud document over the local one, so
   * `paint()` returns early until `hydrated` and the skeleton stays up for the one IndexedDB round trip.
   */
  const [journal, setJournal] = useState<Journal>(EMPTY_JOURNAL)
  const [sync, setSync] = useState<SyncState>({ kind: 'rest', owed: false })
  const [hydrated, setHydrated] = useState(false)
  // `paint()` is called from the canvas document's own handlers, which never re-close over a new render's state
  const hydratedRef = useRef(false)
  /** B6's "Retry now" is in flight — R-98's swapped label and its two aria attributes */
  const [pressingRetry, setPressingRetry] = useState(false)
  const [conflicted, setConflicted] = useState(false)
  const conflict = useRef<HTMLDialogElement>(null)
  /** R-147's card, opened by `?` here and by the account menu's row everywhere else — one component, one door */
  const shortcuts = useRef<HTMLDialogElement>(null)
  /* ─── Story 5.10 — the Section Picker (FR-D12, S5a) ───────────────────────────────────────────────────────────
   * A native modal `<dialog>`, so `Esc`, the focus trap and the return of focus to the invoking control are the
   * platform's (`EXPERIENCE.md:502`). `invoked` is the STACK INDEX the "+" was pressed under, or null for `⌘K`
   * with nothing selected; `lib/picker.ts`'s `invokedAt` turns it into one position in the canvas's own doc. */
  const picker = useRef<HTMLDialogElement>(null)
  const [picking, setPicking] = useState(false)
  const [invoked, setInvoked] = useState<number | null>(null)
  /** has the picker been opened in this session? Once it has, it stays mounted (R-155's pair, the owner's ruling of
   *  2026-09-20): `picking` still says whether it is SHOWN, and a closed dialog draws nothing. */
  const [opened, setOpened] = useState(false)
  /** DW-190's home: R-37's refusal, shown in the picker where the press was */
  const [pickerRefusal, setPickerRefusal] = useState<string | null>(null)
  /** null means FALLBACK MODE: IndexedDB refused, or a write failed, and every change goes straight to the cloud */
  const local = useRef<LocalStore | null>(null)
  /** AD-15's `base_revision`: the `projects.revision` this session's document descends from */
  const base = useRef(revision)
  const attempt = useRef(0)
  const inFlight = useRef(false)
  // Story 5.8's review: a flush asked for while one is in flight is OWED, never dropped; fallback is a fact about the
  // device and outlives every indicator state; and nothing is scheduled by a component that has gone
  const again = useRef(false)
  const fellBack = useRef(false)
  const gone = useRef(false)
  const clocks = useRef<{ retry?: ReturnType<typeof setInterval> }>({})

  /* ─── Story 5.17 — FR-D18's EDIT LOCK: one editing context per project, across tabs, browsers and devices ──────
   *
   * THE STATE IS THIS COMPONENT'S OWN, exactly as `autosave` and `revision` are — there is no context, no provider
   * and no store in this editor, and this story adds none. `lib/lock.ts` holds every rule `node --test` can reach,
   * `lib/lock-client.ts` holds the I/O, and `projects/[id]/lock/route.ts` is the one door every `edit_locks` write
   * passes. What lives here is the state, the timers and the four gestures.
   *
   * THE WHOLE PROTOCOL IS AN OPTIMISTIC COMPARE-AND-SWAP ON `lock_generation` (AD-15), executed against the real
   * Supabase before any of this was written (`MEASUREMENTS.md` §50). NOTHING ABOUT THE TRANSPORT IS EVER SHOWN: two
   * tabs of one browser hear each other instantly through `BroadcastChannel`, everything else waits for the ~15 s
   * heartbeat, and Realtime is not used in v1 (R-191, owner, 2026-09-24).
   */
  const [lock, setLock] = useState<LockUi>(() => ({
    // A READER MUST NOT FLASH AN EDITABLE SHELL, so the first paint is decided by the row `read.ts` read above the
    // boundary: a live lock held by somebody else is read-only from the very first frame, and the `acquire` below
    // only confirms it.
    holder: isStale(heldOnServer),
    row: heldOnServer,
    asking: false,
    askedAt: null,
    unanswered: false,
    handingOver: false,
    handOverFailed: false,
    taking: false,
  }))
  /** the generation this session ACQUIRED at, or null when it has never held the lock — or gave it away, which is
   *  not being displaced. AD-15's take-over test compares the row's generation against this and nothing else. */
  const heldGeneration = useRef<number | null>(null)
  /** the REQUEST this holder has already ANSWERED or let expire — `LockRow.request`, its session AND its moment,
   *  never the session alone, or the same tab asking again would be swallowed for good. Without it B5b would come
   *  straight back on the next beat: Keep editing clears the columns, but the expiry deliberately does not — the
   *  requester's own timer owns that half. */
  const [dismissed, setDismissed] = useState<string | null>(null)
  /** UX-DR12's SECOND live region, and it is ASSERTIVE. `#editor-said` is the editor's polite one and stays polite:
   *  widening it would make every design-ring announcement shout. Only this story writes here. */
  const [announced, setAnnounced] = useState('')
  /** what a session that was just taken over from LOST, shown in B5a's own sentence slot until it asks again or holds
   *  again. The assertive region SAYS it; this SHOWS it — a sighted person was otherwise never told. */
  const [lost, setLost] = useState<string | null>(null)
  /** when this session deliberately handed the lock over. It then stops trying to `acquire` for one nudge's worth
   *  of time, so it cannot take back the lock it just gave away before the requester's next poll reaches it.
   *  ponytail: one grace window; if hand-over ever needs to be instant across devices, the release becomes a CAS
   *  straight to `nudge_requested_by` instead of a DELETE. */
  const gaveAt = useRef(0)
  /** THIS PAGE IS COMING BACK, so the release on the way out must not fire. The take-over reloads — a reload IS a
   *  hydrate — and without this the `pagehide` release DELETED the row it had just won, so the re-acquire INSERTed
   *  a fresh one at generation 1 and the session that had been taken over from never learned it (executed against a
   *  local build, 2026-09-23: the displaced session was told nothing, because `displacedBy(1, 1)` is false). The tab
   *  id survives the reload in `sessionStorage`, so the lock is simply still ours on the way back in.
   *  ponytail: it covers a reload WE start. A customer's own F5 still releases and re-acquires, which is harmless —
   *  the same session id comes back and takes the row again — but leaves a sub-second window in which another
   *  session's poll could acquire first. A reload-aware release would need `navigation.type`, which is only readable
   *  on the way back IN. */
  const keeping = useRef(false)
  /** the `BroadcastChannel`'s send, mounted with the lock effect below */
  const tell = useRef<(signal: LockSignal) => void>(() => {})
  const takeover = useRef<HTMLDialogElement>(null)

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
  /** Story 5.15 — `core`'s handle for the canvas painted last: `stop()` before the next paint, and `paused`, the mounts
   *  it held still, which the PAUSED chips read (R-175). Null before the first paint. */
  const behaviours = useRef<ReturnType<typeof startBehaviours> | null>(null)
  /** each PAUSED chip's element, by the mount it marks — placed by the chrome loop */
  const chipEls = useRef(new Map<Element, HTMLElement>())
  /** B3b's Back to editing, which takes focus on the way in, and where focus was before it (Story 5.15) */
  const backButton = useRef<HTMLButtonElement>(null)
  const cameFrom = useRef<HTMLElement | null>(null)
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
  /** STORY 5.10 — can anything be placed on THIS canvas at all? One query (`offeredOn`), and the hairline, the
   *  "+ Add section" pill and the Layers footer's button are all readers of it: where nothing can be placed there
   *  is no affordance, rather than an affordance that opens an empty picker (UX-DR3). */
  const canAdd = offeredHere(entries, canvas.file, SITE.file).length > 0
  /** What this section may become, from the library and nowhere else (`ringFor` sits beside `offeredOn`). The
   *  design it IS is always in it; a design the library no longer holds gives an empty ring, which reads as one
   *  design with nowhere to go — the same answer every category gives today. */
  const ringOf = (designId: string): SectionRegistryEntry[] => {
    const entry_ = entries[designId]
    return entry_ === undefined ? [] : ringFor(Object.values(entries), entry_)
  }
  // the canvas document's handlers and paint read the latest values through here
  const latest = useRef({ key, docs, stack, selected, hovered, auto, mode, journal, device, canAdd, subject: previewing.subject, viewAs, viewed, preview, page, lock })
  latest.current = { key, docs, stack, selected, hovered, auto, mode, journal, device, canAdd, subject: previewing.subject, viewAs, viewed, preview, page, lock }
  /** Story 5.16 — R-180: the site-wide sections that have asked on THIS visit to page 2, by instance id. Emptied on
   *  every change of page, so a section asks again the next time page 2 is shown. */
  const asked = useRef(new Set<string>())
  /** …and the section whose change is HELD right now, until the dialog answers: a second section's change arriving in
   *  the same frame is dropped rather than silently replacing the one the dialog is about (review, 2026-09-22) */
  const holding = useRef<string | null>(null)

  /** Story 5.14 — the changed records, into the session and down the one write chain. Only rows that CHANGE reach it:
   *  `seen` hands back the same array and `afterChange` returns only what moved, so an empty map writes nothing. */
  const recordViewed = (changed: Readonly<Record<string, readonly Visitor[]>>) => {
    const keys = Object.keys(changed)
    if (keys.length === 0) return
    const next: Viewed = { ...latest.current.viewed, ...changed }
    latest.current = { ...latest.current, viewed: next }
    setViewed(next)
    viewedWrites.current = viewedWrites.current.then(async () => {
      // A REFUSED WRITE RIDES THE NEXT ONE (review, 2026-09-21): a lost `seen` only brings a reminder back, but a lost
      // `afterChange` leaves the database saying "viewed" of a page that has since changed — the reminder wrongly silent
      const sending = { ...unsavedViewed.current, ...changed }
      const rows = Object.keys(sending).map((templateKey) => ({ templateKey, states: [...(sending[templateKey] ?? [])] }))
      // a thrown call (the network dropped, the session is gone) is the same refusal as a returned one
      const answer = await setViewedStates(project.id, rows).catch((error: unknown) => ({ error: String(error) }))
      unsavedViewed.current = 'error' in answer ? sending : {}
      if ('error' in answer) console.warn('the looked-at record was not saved; the reminder may come back after a reload', answer.error)
    })
  }

  /** EVERY WRITE TO THE SESSION'S DOCS GOES THROUGH HERE, so AD-22's round trip is decided ONCE rather than at each of
   *  the three places that edit a doc. Two rules, and they are the whole of FR-D6's "untouched is a real state":
   *
   *  THE FIRST EDIT MATERIALISES. The canvas that was written to stops being auto-generated — its marker goes and
   *  its switcher dot fills. Nothing is persisted: Story 5.8 saves, so a reload starts over.
   *
   *  THE LAST SECTION OFF GIVES IT BACK. A synthesizable canvas whose doc now holds no instances is untouched again,
   *  so its Synthesis Default stack re-renders and the marker returns. HIDING every section does NOT do this
   *  (FR-D5): a hidden instance is retained, so `isDesigned` is still true.
   *
   *  STORY 5.16 — ONE DOC IS WRITTEN, `touched`, and nothing else in `written` is read: an edit on page 2 is handed page
   *  2's doc AS EDITED (its own, or the copy of page 1), and a map carrying that copy must never write it anywhere else.
   *  Page 2's round trip is `committed()`'s own: the first change stores the copy with it, zero instances returns page 2
   *  to following. And R-180's ask sits HERE, the one door every change passes: on page 2 the first change to each
   *  site-wide section is HELD, and FR-D5's dialog asks before it lands (`about` names the section). Null means held. */
  const commit = (written: Readonly<Record<string, ProjectDoc>>, touched: string, about?: About): boolean | null => {
    const now = latest.current
    // STORY 5.17 — FR-D18'S READ-ONLY GUARD, AND IT IS ONE EARLY RETURN. This is the one door every change passes,
    // which is why the rule cannot be forgotten at a call site: a session that does not hold the lock writes nothing
    // to the docs, nothing to the journal and nothing to the device. The control that was pressed is CONTROLLED by
    // the value in force, so it never moves — not even for a frame (B5a). Typing on the canvas is stopped a step
    // earlier, in `startEditing`, because a `contenteditable` element has already changed by the time it gets here.
    //
    // IT ANSWERS `null`, WHICH ALREADY MEANS "NOTHING HAPPENED — SAY NOTHING, REPAINT NOTHING" (R-180's hold, the
    // `HELD` symbol below). That is not a shortcut, it is the only answer that reaches every caller: `false` is a
    // SUCCESS that merely had no round trip, so `onChange` would go on to stamp the canvas root with the refused
    // value and `edit()` would announce "X duplicated" over a change that never landed.
    if (!now.lock.holder) return null
    if (now.page === 2 && touched === SITE.key && about !== undefined && !asked.current.has(about.instanceId)) {
      holdChange(written, touched, about)
      return null
    }
    // STORY 5.8: the touched doc either side of the transaction — the journal's whole record, taken HERE because this
    // is the only place that knows both (`addendum.md` §AD4). `before` is the SETTLED doc, so restoring it and running
    // `committed()` over it again is a no-op on the round trip rather than a second decision. For a page 2 that follows
    // it is NOTHING — what is stored for it — so an undo of its first change makes it follow again.
    const before = now.docs[touched] ?? EMPTY_DOC
    const next = committed({ ...now.docs, [touched]: written[touched] ?? EMPTY_DOC }, touched, stacks, now.auto)
    const after = next.docs[touched] ?? EMPTY_DOC
    // a following page 2 emptied of its copy's last section stores nothing, as it stored nothing before: no edit
    if (canvasOfPageTwoKey(touched) !== null && !isDesigned(before) && !isDesigned(after)) return next.back
    if (next.auto !== now.auto) setAuto(next.auto)
    latest.current = { ...now, docs: next.docs, auto: next.auto, stack: stackOf(next.docs, now.key, now.page, library) }
    setDocs(next.docs)
    journalise(touched, before, after)
    // STORY 5.14 — R-167: a change to the page makes its other visitors unviewed again, decided in ONE place. Story
    // 5.16: the page on screen is the page in force, and a page 2 that follows the doc changed has changed with it.
    recordViewed(afterChange(latest.current.viewed, touched, ownKeyOf(now.key, now.page), now.viewAs, followersOf(next.docs, touched)))
    return next.back
  }

  /** The doc the editor EDITS under a stored key — a page 2 that follows is edited as its copy of page 1, so its first
   *  change is made to the copy and stores it (`lib/page-two.ts`). Read through `latest`, as every handler reads. */
  const docOf = (docKey: string) => editedDoc(latest.current.docs, docKey, library)
  /** …as the one-key map `withState` takes: the change to one section, of the one doc that holds it. */
  const editable = (docKey: string): Record<string, ProjectDoc> => {
    const doc = docOf(docKey)
    return doc === undefined ? {} : { [docKey]: doc }
  }

  /* ─── Story 5.8 — one gesture, one transaction, one undo step, one edit (AD-16) ───────────────────────────────── */

  /** THE INDICATOR AT REST, AND R-144 IS THE WHOLE OF IT: the resting state reports whether anything is OWED, so
   *  it is derived from the journal rather than remembered. Green with nothing owed, grey the moment an edit lands.
   *  Never out of FALLBACK, which is sticky: once the device is not holding the work, nothing may show a state that
   *  says it is. */
  /*  AN EDIT NEVER ENDS A FLUSH'S STATE (the review): `journalise` and `restore` call this mid-request and mid-backoff,
   *  and replacing Syncing or Retrying there flickered the red panel shut for a second. Only the flush itself — which
   *  passes `done` — may leave them. And fallback is read from the device, not from the last state: Retrying used to
   *  overwrite it, and the next success then said "Saved on this device" about a device holding nothing. */
  const rest = (done = false) =>
    setSync((was) =>
      fellBack.current ? { kind: 'fallback' }
      : !done && (was.kind === 'syncing' || was.kind === 'retrying') ? was
      : restingState(latest.current.journal))

  /** The device is no longer holding the work, from this moment. The indicator changes in the same task the failure
   *  arrives in — never a stale *"Saved on this device"* — and every later change goes straight to the cloud. */
  const toFallback = () => {
    local.current = null
    fellBack.current = true
    // a new object even when Retrying stays, so the panel re-renders with the fallback's own sentence
    setSync((was) => (was.kind === 'retrying' ? { ...was } : { kind: 'fallback' }))
  }

  /**
   * THE LOCAL WRITE, AND NOTHING AWAITS IT (FR-D10, NFR-1). `commit()` has already returned by the time this runs, so
   * a slow or failing IndexedDB changes the indicator and never the edit.
   */
  const store = (j: Journal, docs: Readonly<Record<string, ProjectDoc>>, auto: ReadonlySet<CanvasKey>, entry?: Parameters<LocalStore['push']>[1], dropped?: readonly number[]) => {
    const s = local.current
    if (!s) {
      // FALLBACK: there is nowhere local to put it, so the cloud is the only place it can be
      void flush('change')
      return
    }
    void (async () => {
      const wrote = await s.save(project.id, { baseRevision: base.current, docs: { ...docs }, auto: [...auto], journal: j })
      const pushed = entry ? await s.push(project.id, entry, dropped ?? []) : true
      if (!wrote || !pushed) {
        toFallback()
        void flush('change')
      }
    })()
  }

  /** One transaction appended to the journal and written to the device. */
  const journalise = (docKey: string, before: ProjectDoc, after: ProjectDoc) => {
    const now = latest.current
    const { journal: next, entry, dropped } = append(now.journal, { txn: crypto.randomUUID(), docKey, before, after })
    latest.current = { ...latest.current, journal: next }
    setJournal(next)
    rest()
    store(next, latest.current.docs, latest.current.auto, entry, dropped)
  }

  /**
   * An undo or a redo applied: ONE doc, whole.
   *
   * FR-D9's "never half-applying" is this function's shape. The restored doc is checked against the library BEFORE any
   * of it is applied — one check, one assignment — and a design the library no longer holds no-ops with a notice and
   * leaves the pointer where it was.
   *
   * AD-22's round trip is decided by `committed()`, exactly as a forward edit decides it: taking the last section off a
   * synthesizable canvas and then undoing it moves the marker back and forth through the one rule.
   */
  const restore = (r: Restore | null) => {
    if (!r) return
    const missing = vanishedDesign(r.doc, (id) => entries[id] !== undefined)
    if (missing) {
      setSaid(`That change cannot be undone: the ${missing} design is no longer in the library.`)
      return
    }
    const now = latest.current
    const next = committed({ ...now.docs, [r.docKey]: r.doc }, r.docKey, stacks, now.auto)
    if (next.auto !== now.auto) setAuto(next.auto)
    latest.current = { ...now, docs: next.docs, auto: next.auto, stack: stackOf(next.docs, now.key, now.page, library), journal: r.journal }
    setDocs(next.docs)
    setJournal(r.journal)
    // STORY 5.16 — AN UNDO CAN TAKE PAGE 2 AWAY WHILE IT IS SHOWN: the journal is one list for the whole project, so ⌘Z
    // on page 2 can reach back into page 1 and remove its main feed. The canvas goes to page 1 BEFORE the paint and says
    // why — never a paint of a page that does not exist.
    const force = pageInForce(now.page, now.key, next.docs, now.subject)
    if (force.page !== now.page) {
      switchPage(force.page)
      setSaid(leftBecause(force.reason ?? ''))
    }
    // STORY 5.14 — R-167: undo and redo are changes, so they run the same rule `commit()` does
    recordViewed(afterChange(latest.current.viewed, r.docKey, ownKeyOf(now.key, latest.current.page), now.viewAs, followersOf(next.docs, r.docKey)))
    // a selection cannot outlive the section it was on, exactly as `apply()` decides it — read in the doc as EDITED, so
    // a page 2 that follows again still holds the copy's sections
    const pick = latest.current.selected
    if (pick && !docOf(pick.doc)?.instances.some((i) => i.instanceId === pick.instanceId)) choose(null)
    paint()
    rest()
    store(r.journal, next.docs, next.auto)
  }

  /** THE ARROWS AND THE KEYS CALL THESE TWO AND NOTHING ELSE (R-141): one handler, never a second implementation. */
  const onUndo = () => restore(undoIn(latest.current.journal))
  const onRedo = () => restore(redoIn(latest.current.journal))

  /* ─── Story 5.8 — the flush: one route, three callers (AD-15) ──────────────────────────────────────────────────
   *
   * The 3-minute timer, ⌘S and tab close all post the same body to the same route. There is exactly one place the
   * compare-and-set can be got wrong, and `sync/route.ts` is it.
   *
   * A CONFLICT WRITES NOTHING. `addendum.md` §AD1.1 resolves a differing revision at LOCK ACQUISITION, and there is no
   * lock until Story 5.17 — but a second tab is reachable today. The smallest honest answer, inventing no vocabulary:
   * the RPC refuses, and the editor opens the app's one dialog offering a reload. A reload IS a hydrate, so it runs
   * §AD1.1's second row exactly. Declining leaves the indicator at "Saved on this device", which is true, and the next
   * flush asks again.
   */
  const stopRetrying = () => {
    clearInterval(clocks.current.retry)
    clocks.current.retry = undefined
  }

  /** The backoff, counted down a second at a time so waiting feels finite (B6). */
  const scheduleRetry = () => {
    stopRetrying()
    if (gone.current) return
    attempt.current += 1
    let left = backoffSeconds(attempt.current)
    setSync({ kind: 'retrying', attempt: attempt.current, seconds: left })
    clocks.current.retry = setInterval(() => {
      left -= 1
      if (left > 0) {
        setSync({ kind: 'retrying', attempt: attempt.current, seconds: left })
        return
      }
      stopRetrying()
      void flush('retry')
    }, 1000)
  }

  /** THE SYNC ROUTE'S ADDRESS AS THE BROWSER MUST ASK FOR IT. On `app.inflozo.com` the proxy adds the internal `/app`
   *  prefix, so a plain `/projects/<id>/sync` is right; on localhost there is no proxy and the page itself is under
   *  the prefix, so the fetch must carry it. The same rule `canvasSrc` applies to the canvas iframe, read from the
   *  same `isApp(pathname)` (`routing.ts`) — one rule, two callers, never a second literal. */
  const syncUrl = () => `${isApp(pathname) ? '/app' : ''}${syncPath(project.id)}`

  const flush = async (why: FlushCall) => {
    const now = latest.current
    // ONE decision, in `lib/journal.ts` where `node --test` reaches it: autosave off stops the TIMER alone, nothing
    // owed sends nothing at all, and ⌘S is acknowledged either way — three matrix rows, one function.
    const asked = flushDecision(now.journal, why, autosave)
    if (asked === 'acknowledge') {
      // ⌘S WITH NOTHING OWED. Before R-144 this flashed "Synced" for four seconds, because the resting state could
      // not say it; now the indicator is ALREADY the green check and re-asserting it is the honest acknowledgement.
      // No request goes out, and none should: there is nothing to send.
      rest(true)
      return
    }
    if (asked === 'nothing') return
    const payload = flushPayload(now.journal, now.docs)
    if (Object.keys(payload).length === 0) return
    if (inFlight.current) {
      // owed, not dropped: in fallback this edit is held NOWHERE else, and a ⌘S pressed mid-flight meant it
      again.current = true
      return
    }
    inFlight.current = true
    // the clock this request is sending AT: an edit that lands while it is in flight has a higher stamp and is kept
    const sentStamp = now.journal.stamp
    const upTo = maxSeq(now.journal)
    setSync((was) => (was.kind === 'fallback' ? was : { kind: 'syncing' }))
    // Story 5.17: the tab's lock session rides along, so the route can refuse work from a session that was taken over
    // from. `|| undefined` drops it from the JSON before the tab knows its id — never an empty id the route could read
    // as a stranger's.
    const body = JSON.stringify({ base: base.current, docs: payload, session: tabId.current || undefined })
    let landed = false
    try {
      const answer = await fetch(syncUrl(), {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body,
        // THE TAB MAY BE GOING (`unload`): `keepalive` is the only thing the browser promises to finish. Browsers cap
        // such a body near 64KiB and REJECT a larger one outright, so a big document goes as an ordinary request — it
        // completes on a tab switch, and on a real close the device still holds it.
        keepalive: why === 'unload' && body.length < 60_000,
        // A REQUEST THAT NEVER ANSWERS MUST NOT WEDGE THE EDITOR (the review's deployed walk, 2026-09-19: a ⌘S sat on
        // "Syncing" for good, and with `inFlight` held every later flush was refused too). A stall is a failure like
        // any other: it lands in the `catch`, the indicator says Retrying, and the backoff takes it from there. If
        // the write DID land, the route's "already there" answer makes the retry a plain 200.
        signal: AbortSignal.timeout(20_000),
      })
      if (answer.status === 409) {
        // ANOTHER SESSION WROTE. Nothing was written and nothing of ours is lost — the local doc is untouched.
        stopRetrying()
        attempt.current = 0
        rest(true)
        setConflicted(true)
        requestAnimationFrame(() => openOnCancel(conflict.current))
        return
      }
      if (answer.status === 423) {
        // STORY 5.17 — TAKEN OVER FROM. The route refused to let this session's orphaned work cross the lock boundary
        // (AD-15). The lock's own read decides the rest, exactly as a beat that finds the generation moved would:
        // read-only, told assertively with the count STILL in this journal, and the journal cleared. No retry and no
        // conflict dialog — there is nothing to reconcile; the take-over said this work would be lost, and now it is.
        //
        // `rest` BEFORE `land`, deliberately: it leaves "Syncing" for the resting state the journal still describes,
        // which is exactly what a session displaced by its BEAT keeps, because `dropJournal` never re-rests the
        // indicator. Both paths therefore end on the same state. Whether a displaced session's indicator should
        // re-derive from the dropped journal is not something the spec rules — flagged for the review, not decided.
        stopRetrying()
        attempt.current = 0
        rest(true)
        land(await askLock(lockAt(), { intent: 'beat', session: tabId.current, unsynced: owedNow() }))
        return
      }
      if (!answer.ok) throw new Error(`HTTP ${answer.status}`)
      const done = (await answer.json()) as { applied: boolean; revision: number }
      base.current = done.revision
      landed = true
      const next = flushed(latest.current.journal, sentStamp, upTo)
      latest.current = { ...latest.current, journal: next }
      setJournal(next)
      stopRetrying()
      attempt.current = 0
      store(next, latest.current.docs, latest.current.auto)
      // `pending` is empty now, so the resting state reads green on its own (R-144)
      rest(true)
    } catch {
      // offline, a 5xx, a dropped connection: the local doc is untouched and nothing is lost
      scheduleRetry()
    } finally {
      inFlight.current = false
      if (again.current) {
        again.current = false
        // only after a SUCCESS: a refusal or a failure already has its own next step (the dialog, the backoff)
        if (landed && unsynced(latest.current.journal)) void flush('change')
      }
    }
  }

  /** B6's "Retry now": the backoff resets and the flush fires at once. R-98's busy state is `pressingRetry`. */
  const retryNow = () => {
    stopRetrying()
    attempt.current = 0
    setPressingRetry(true)
    void flush('retry').finally(() => setPressingRetry(false))
  }

  /* ─── Story 5.17 — FR-D18's lock: the heartbeat, the transport and the four gestures ─────────────────────────
   *
   * ONE ROUTE, ONE RECONCILER. Every answer from `lock/route.ts` lands in `land()`, so the generation test, the
   * displacement and the state of my own request are read in ONE place rather than after each of six calls.
   */

  /** THIS TAB'S IDENTITY, and it survives a reload (`sessionStorage`) so a refresh keeps the lock rather than
   *  orphaning it for ~60 s. A second TAB never shares it — that tab IS the other editing context. */
  const tabId = useRef('')
  const lockAt = () => lockUrl(project.id, isApp(pathname))
  /** AD-16's count for THIS session: EDITS above the watermark, never operations. `remixFold` already makes a Site
   *  Remix one `commit`, so a re-roll of any size reports 1. */
  const owedNow = () => unsyncedEdits(latest.current.journal)

  const putLock = (next: LockUi) => {
    latest.current = { ...latest.current, lock: next }
    setLock(next)
  }

  /** AD-15'S SECOND CLEARING RULE (`journalCleared`, beside `hydrationFor`): the journal of a displaced session
   *  goes UNCONDITIONALLY. There is no merge path and no recovery of orphaned edits, so an undo that could still
   *  reach them would be offering work the server will never accept. The DOCS are untouched — the canvas stays
   *  legible, which is the whole of B5a — and a reload runs §AD1.1 and brings the cloud's back. */
  const dropJournal = () => {
    latest.current = { ...latest.current, journal: EMPTY_JOURNAL }
    setJournal(EMPTY_JOURNAL)
    const store = local.current
    if (!store) return
    void store.clearJournal(project.id)
    void store.save(project.id, { baseRevision: base.current, docs: { ...latest.current.docs }, auto: [...latest.current.auto], journal: EMPTY_JOURNAL })
  }

  const land = (answer: LockAnswer | null) => {
    // `null` is "the server was not reached" — offline, a 5xx, a stall. A lock that cannot be heard from is not a
    // lock that was lost: change nothing and ask again on the next beat.
    if (answer === null) return
    const was = latest.current.lock
    const { row, held: mine } = answer

    // THE TAKE-OVER TEST IS THE GENERATION AND NOTHING ELSE (AD-15), which is why a take-over whose new holder has
    // written nothing still clears this journal: the revisions would be equal and the revision half would not fire.
    if (!mine && row !== null && heldGeneration.current !== null && displacedBy(heldGeneration.current, row.generation)) {
      const owed = owedNow()
      heldGeneration.current = null
      dropJournal()
      // UX-DR12: assertively, because it is work that is already gone. "**This** session", not "that": the sentence
      // is read BY the session it is about (R-189).
      setAnnounced(LOCK_COPY.displaced(owed))
      // SHOWN only when something was lost: with nothing owed, the reading-along bar already says all there is
      setLost(owed > 0 ? LOCK_COPY.displaced(owed) : null)
    }
    if (mine) setLost(null)
    // AND A SESSION THAT IS NO LONGER THE HOLDER GOES BACK TO ACQUIRING. Without this a holder whose ROW VANISHED —
    // the displacement test cannot fire on a null row — kept beating a row that was not there, and every beat changed
    // zero rows, so it was a reader of a free lock FOR EVER (executed against a local build, 2026-09-23: a soft
    // navigation out of the editor and back wedged the panel read-only). `heldGeneration` is the poll's own question,
    // so clearing it is the whole recovery: the next poll acquires, which against a live lock is simply a read.
    heldGeneration.current = mine && row !== null ? row.generation : null

    // my own request, as the row now answers it: still mine → waiting; cleared → the holder pressed Keep editing;
    // the row gone → the lock is free and the next poll simply acquires it.
    const waiting = was.askedAt !== null && stillAsking(row, tabId.current)
    if (was.askedAt !== null && !waiting && !mine && row !== null) setAnnounced(LOCK_COPY.kept)

    putLock({
      ...was,
      holder: mine,
      row,
      asking: waiting,
      askedAt: waiting ? was.askedAt : null,
      unanswered: waiting && was.unanswered,
      handOverFailed: mine ? was.handOverFailed : false,
    })
  }

  /** B5a's **Request editing** — the reader's whole affordance. */
  const requestEditing = async () => {
    const was = latest.current.lock
    if (was.asking) return
    setLost(null)
    putLock({ ...was, asking: true, unanswered: false })
    const answer = await askLock(lockAt(), { intent: 'nudge', session: tabId.current })
    if (answer === null || !answer.won) {
      // the write did not land: the button reports it by coming back, and stays pressable (the matrix's own row)
      putLock({ ...latest.current.lock, asking: false, askedAt: null })
      return
    }
    tell.current('nudge')
    putLock({ ...latest.current.lock, row: answer.row, asking: true, askedAt: Date.now(), unanswered: false })
  }

  /** B5b's **Hand over** — AD-15's flush contract, in the order the contract names. */
  const handOver = async () => {
    const was = latest.current.lock
    if (was.handingOver) return
    putLock({ ...was, handingOver: true, handOverFailed: false })
    // THE FLUSH GOES FIRST. `'release'` falls through the autosave test exactly as `manual` and `unload` do — AD-15
    // stops the TIMER alone — so a session with autosave off still sends its work before it gives up the lock.
    await flush('release')
    if (unsynced(latest.current.journal)) {
      // IT REFUSED (offline, a 409, a 5xx). THE ROW IS NOT DELETED: unsynced work never crosses a lock boundary, so
      // the popover says so and stays, and the lock is still this session's.
      putLock({ ...latest.current.lock, handingOver: false, handOverFailed: true })
      return
    }
    const answer = await askLock(lockAt(), { intent: 'release', session: tabId.current })
    if (answer === null) {
      putLock({ ...latest.current.lock, handingOver: false, handOverFailed: true })
      return
    }
    gaveAt.current = Date.now()
    heldGeneration.current = null
    setDismissed(null)
    tell.current('released')
    putLock({ ...latest.current.lock, holder: false, row: null, handingOver: false, handOverFailed: false, asking: false, askedAt: null, unanswered: false })
  }

  /** B5b's **Keep editing** — the nudge columns are cleared, and no take-over is offered from that request. */
  const keepEditing = async () => {
    setDismissed(latest.current.lock.row?.request ?? null)
    const answer = await askLock(lockAt(), { intent: 'keep', session: tabId.current })
    tell.current('answered')
    land(answer)
  }

  /** B5c's **Take over anyway** — the CAS, and then the last synced snapshot. */
  const takeOver = async () => {
    const was = latest.current.lock
    const row = was.row
    if (row === null) {
      // the row has vanished, so the lock is free: acquire normally rather than compare against nothing
      takeover.current?.close()
      land(await askLock(lockAt(), { intent: 'acquire', session: tabId.current, unsynced: owedNow() }))
      return
    }
    putLock({ ...was, taking: true })
    const answer = await askLock(lockAt(), { intent: 'takeover', session: tabId.current, generation: row.generation, unsynced: owedNow() })
    takeover.current?.close()
    if (answer === null || !answer.won) {
      // ZERO ROWS MEANS THE GENERATION MOVED UNDER US. Re-read and report the new state, never retry blindly.
      putLock({ ...latest.current.lock, taking: false })
      land(answer)
      return
    }
    tell.current('took-over')
    heldGeneration.current = answer.row?.generation ?? row.generation + 1
    putLock({ ...latest.current.lock, taking: false, holder: true, row: answer.row, asking: false, askedAt: null, unanswered: false })
    // AND I AM EDITING THE LAST SYNCED SNAPSHOT. A RELOAD IS A HYDRATE — the conflict dialog beside this one says so
    // in as many words — so §AD1.1 runs exactly and the cloud doc is what comes back. This tab's session id survives
    // it in `sessionStorage`, so the lock just taken is still ours on the way back in — and `keeping` is what stops
    // the release on the way out from deleting the row this take-over has just won.
    keeping.current = true
    window.location.reload()
  }

  /** A RELOAD THAT KEPT ITS TAB ID IS THE SAME SESSION, so it keeps the lock rather than flashing B5a's bar at its
   *  own reflection — which the take-over's own reload would otherwise do every single time, and which would make
   *  `commit()` refuse for the round trip it lasted. A LAYOUT effect, before the browser paints: the server render
   *  cannot know the tab's id (`sessionStorage` is the browser's), so this is the first moment it can be asked, and
   *  asking it a frame later would be a frame of the wrong screen. */
  useLayoutEffect(() => {
    tabId.current = tabSession()
    if (heldOnServer !== null && heldOnServer.holderSessionId === tabId.current) {
      heldGeneration.current = heldOnServer.generation
      putLock({ ...latest.current.lock, holder: true, row: heldOnServer })
    }
    // mount only — one tab, one id
  }, [])

  useEffect(() => {
    let alive = true

    const poll = async () => {
      // THE HOLDER BEATS; EVERY OTHER SESSION TRIES TO ACQUIRE, which is how the first opener, a released lock and a
      // stale one are all picked up with no seventh intent — an `acquire` against a LIVE lock writes nothing and
      // answers the row, so a reader polls through the same call.
      //
      // IT ASKS `heldGeneration`, NOT THE STATE. The opening state is optimistic — a first paint with no row shows
      // an editable shell rather than making the customer wait a round trip for one — and reading it here sent the
      // very first call as a `beat`, which matches no row, so the first opener became a reader of a lock that did
      // not exist and only acquired ~15 s later (executed against a local build, 2026-09-23). `heldGeneration` is
      // set ONLY when the server confirmed the lock is ours, which is exactly the question this asks.
      const wasHolder = heldGeneration.current !== null
      const holding = wasHolder || Date.now() - gaveAt.current < NUDGE_MS
      const answer = await askLock(lockAt(), { intent: holding ? 'beat' : 'acquire', session: tabId.current, unsynced: owedNow() })
      if (!alive) return
      // A BEAT THAT FOUND NO ROW AT ALL MEANS THE LOCK IS FREE — take it NOW, and let the ACQUIRE'S answer be the one
      // that lands, so the state never passes through "reader" on the way.
      //
      // This is the matrix's "Same session reloads" row. The outgoing page releases on `pagehide`, and that DELETE
      // usually lands after the new page's server render but before its first beat, so the first beat matches
      // nothing. Measured on `app.inflozo.com`: at d895c183 the session then read its own B5a bar — "You are editing
      // this site somewhere else", about its own tab — for a whole ~14 s heartbeat; at 2052bf5d, re-polling at once
      // but after `land` had flipped it, the bar still FLASHED on every navigation (reader at 1 s, holder by 2 s, five
      // of five) and a Hide pressed in that second was silently refused — step 69 of the editor walk, twice.
      //
      // BOUNDED TO EXACTLY ONE EXTRA CALL, and `wasHolder` is what bounds it: `heldGeneration` is cleared here, so the
      // re-poll sends `acquire` and its own `wasHolder` is false. It reads `heldGeneration` rather than `holding`
      // deliberately — `holding` stays true for a nudge's worth of time after Hand over (`gaveAt`), whose release
      // deletes the row too, and that pair would spin. Nothing `land` would have done for a missing row is lost:
      // the displacement test and the "kept" notice both need a row, and the acquire's own answer sets the rest.
      if (wasHolder && answer !== null && !answer.held && answer.row === null) {
        heldGeneration.current = null
        void poll()
        return
      }
      land(answer)
    }

    // LAYER 1 — the same browser, free and instant, and it is the case DW-203 is written about. NOTHING IS TRUSTED
    // FROM IT: a signal only says "read the row now", so a message that arrives late, twice or out of order costs
    // one request and can never move the protocol on its own.
    const channel = lockSignals(project.id, (signal) => {
      if (signal === 'released') gaveAt.current = 0
      void poll()
    })
    tell.current = channel.send
    void poll()
    // LAYER 3 — the floor, and with Realtime not used in v1 (R-191) it is what another device waits for. Nothing about
    // the transport is ever shown to the user.
    const beating = setInterval(() => void poll(), HEARTBEAT_MS)

    /** THE TAB IS GOING: the release rides `keepalive`, the only thing the browser promises to finish.
     *
     *  `pagehide` AND NOT `visibilitychange`, and the difference is load-bearing. `hidden` is also an ordinary TAB
     *  SWITCH — the flush uses it deliberately for exactly that — and a holder that released every time its tab lost
     *  focus would hand the lock to the other tab the moment you looked at it, which is the opposite of one editing
     *  context. A release that never lands costs nothing: the row goes stale in ~60 s and the next opener acquires
     *  it (the matrix's own error column).
     *
     *  AND IT IS `pagehide` ALONE — THE UNMOUNT DOES NOT RELEASE, unlike the flush's, which is a difference worth
     *  stating because it looks like an omission. A soft navigation out of the editor (Theme settings, the
     *  dashboard) keeps this TAB the editing context, and the tab is what the lock is about; releasing there raced
     *  the way back in, because the new mount's `acquire` and the old one's `release` carry the SAME session id from
     *  `sessionStorage`, so the release deleted the row the re-acquire had just inserted (executed, 2026-09-23). The
     *  same id is also what makes not releasing free: coming back re-reads its own row and simply beats. */
    const leaving = () => {
      if (keeping.current || !latest.current.lock.holder) return
      void askLock(lockAt(), { intent: 'release', session: tabId.current }, true)
    }
    window.addEventListener('pagehide', leaving)
    return () => {
      alive = false
      clearInterval(beating)
      window.removeEventListener('pagehide', leaving)
      channel.stop()
    }
    // one project, one mount — the `[id]` layout keeps this component through every canvas change
  }, [])

  /** UX-DR12: B5b IS ANNOUNCED ASSERTIVELY, because a request that arrives silently is a request a screen-reader
   *  user answers by not answering. It is the title alone — the popover's own body, strip and buttons are read when
   *  focus reaches them, and a region that read the whole card would talk over whatever was being typed. */
  useEffect(() => {
    if (lock.holder && (lock.row?.request ?? null) !== null && (lock.row?.request ?? null) !== dismissed) {
      setAnnounced(LOCK_COPY.askTitle)
    }
  }, [lock.holder, lock.row?.request, dismissed])

  /** THE REQUESTER'S OWN ~30 s (§AD4). It runs from the moment the request LANDED, and running out is the only
   *  thing that offers the take-over — B5c is never reachable from a request that was answered. */
  useEffect(() => {
    const at = lock.askedAt
    if (at === null || lock.unanswered || lock.holder) return
    const timer = setTimeout(() => {
      const now = latest.current.lock
      if (now.askedAt === at) putLock({ ...now, unanswered: true })
    }, NUDGE_MS)
    return () => clearTimeout(timer)
  }, [lock.askedAt, lock.unanswered, lock.holder])

  /** Each root's two attributes, from the latest selection and hover — after every paint, stamp and change of either. */
  const mark = () => {
    const now = latest.current
    // Story 5.15: in Preview the page IS the site, so no root carries a state mark and nothing inside the frame can
    // paint on one. The selection itself stays in state and is marked again on the way back.
    const on = !now.preview
    roots.current.forEach((root, n) => {
      const placed = now.stack[n]
      if (!root || !placed) return
      root.toggleAttribute('data-inflozo-selected', on && same(placed, now.selected))
      root.toggleAttribute('data-inflozo-hover', on && same(placed, now.hovered))
      // Story 5.10 — S4b's insertion hairline, painted inside the frame from `lib/canvas-chrome.css`. A SECOND mark
      // and not `data-inflozo-hover`, because the two genuinely differ: a canvas nothing can be placed on is hovered
      // exactly as any other and offers no gap to press.
      root.toggleAttribute('data-inflozo-insert', on && now.canAdd && same(placed, now.hovered))
      // Story 5.11 — the swap's 180ms settle. Re-applied here after every stamp for the same reason the two
      // above are: `stampControls` strips every root `data-*` it does not own.
      root.toggleAttribute('data-inflozo-swapped', on && same(placed, swapped.current))
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
    // `latest`, not `device`: Story 5.9 binds `1` `2` `3` on the window ONCE, at mount, so the render's own value
    // would be Desktop for ever and every later press would be swallowed as "already showing"
    if (next.name === latest.current.device.name) return
    setDevice(next)
    setSaid(deviceShown(next))
  }

  /** STORY 5.13's PRESS — FR-D22's stated choice, and it is deliberately NOT an edit.
   *
   * THE CANVAS REPAINTS FIRST and the write follows in a transition, which is why this is not a form submit: the
   * page has already changed, so there is nothing for R-98's busy label to describe. A REFUSED write leaves the
   * choice on the canvas for the session and puts one sentence in the menu — what the customer needs to know is
   * that it will not survive a reload, not that something failed.
   *
   * It never reaches `commit()`, so the doc, 5.8's journal, `⌘Z` and D5a's untouched marker are all untouched
   * (FR-D11: "set-and-forget context, not a per-edit action"; AD-15). And no key presses it (R-145 gains no row).
   */
  const chooseSubject = (next: orbitWeekly.Subject) => {
    const stored = templateKeyOf(latest.current.key)
    setSubjects((was) => ({ ...was, [stored]: next }))
    setSubjectRefusal(null)
    // `latest`, not the state: `paint()` reads through it in this same task, before React has re-rendered
    latest.current = { ...latest.current, subject: next }
    // STORY 5.16 — a subject whose archive fits one page has no page 2 (R-176): the canvas goes to page 1 BEFORE the
    // paint, and the sentence says why
    const force = pageInForce(latest.current.page, latest.current.key, latest.current.docs, next)
    if (force.page !== latest.current.page) switchPage(force.page)
    paint()
    setSaid(force.reason === null ? SUBJECT_SAID(next, subjectRows) : `${SUBJECT_SAID(next, subjectRows)} ${leftBecause(force.reason)}`)
    const turn = ++subjectTurn.current
    startSubject(async () => {
      // a thrown call (the network dropped) is the same refusal as a returned one, never the error boundary
      const answer = await setPreviewSubject(project.id, stored, next).catch(() => ({ error: SAVE_REFUSED }))
      // review, 2026-09-21: an answer that a later choice or a canvas switch has overtaken is dropped — a refusal
      // belongs to the canvas and the choice it was refused on. And it is SAID: the menu that carries the sentence
      // closed with the choice, so `#editor-said` is the only place it can be heard.
      if (!('error' in answer) || turn !== subjectTurn.current || templateKeyOf(latest.current.key) !== stored) return
      setSubjectRefusal(answer.error)
      setSaid(answer.error)
    })
  }

  /** STORY 5.14's PRESS — the visitor the canvas previews, and it is NOT an edit (FR-D16, AD-22).
   *
   * A REPAINT, NEVER 5.6's RE-STAMP: `gateMembers` REMOVES an element gated to another visitor on the canvas
   * (`core.ts`), so a change of visitor changes which elements exist and only a paint can draw that — through the one
   * door, `renderSection`'s `member`. `latest` is updated first because `paint()` reads through it in this same task,
   * before React has re-rendered — `chooseSubject`'s order exactly. The record follows in the effect below, the moment
   * the canvas is shown this way; no key presses this (FR-D11), and nothing reaches the doc, the journal or `⌘Z`. */
  const chooseVisitor = (next: Visitor) => {
    if (next === latest.current.viewAs) return
    latest.current = { ...latest.current, viewAs: next }
    setViewAs(next)
    paint()
    setSaid(VIEW_AS_SAID(next))
  }

  /** STORY 5.15's TWO DOORS — B3a's pill or `P` in, B3b's bar, `Esc` or `P` out — and they are `chooseVisitor`'s shape:
   *  `latest` first, because `paint()` reads it in this same task; then ONE repaint, so `core` starts again over the new
   *  nodes with Preview's answer (everything runs, or everything that is not edit-safe holds still); then the sentence.
   *  NEVER AN EDIT: nothing reaches `commit()`, the journal or `⌘Z`. Focus moves after the commit that hides or shows
   *  the chrome (the effect below): in to Back to editing, and out to wherever it was. */
  const enterPreview = () => {
    if (latest.current.preview) return
    cameFrom.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    latest.current = { ...latest.current, preview: true }
    setPreview(true)
    paint()
    setSaid(PREVIEW_SAID)
  }
  const leavePreview = () => {
    if (!latest.current.preview) return
    latest.current = { ...latest.current, preview: false }
    setPreview(false)
    paint()
    setSaid(BACK_SAID)
  }

  /** STORY 5.16 — THE ONE DOOR EVERY CHANGE OF PAGE PASSES: D5d's row both ways, the pill's Back to page 1, an undo that
   *  took page 2 away and a subject that has none. `latest` first, because `paint()` reads it in the same task; the
   *  selection CARRIED to the same section on the other page where it exists (a site-wide one is on every page); the
   *  hover let go; R-180's asks forgotten. NEVER AN EDIT: nothing reaches `commit()`, the journal or `⌘Z`. The caller
   *  paints and speaks. */
  const switchPage = (to: Page) => {
    const now = latest.current
    if (to === now.page) return
    const selected = carry(now.selected, to, now.key, now.docs, library)
    latest.current = { ...now, page: to, selected, hovered: null, stack: stackOf(now.docs, now.key, to, library) }
    setShownPage({ key: now.key, page: to })
    setSelected(selected)
    setHovered(null)
    asked.current.clear()
    showNote(null)
  }
  /** D5d's row, pressed to 2 — `chooseVisitor`'s shape: `latest`, the state, ONE repaint, then the sentence. Only where
   *  page 2 exists (R-176); the row is not drawn anywhere else, so this is the guard and never a refusal. */
  const enterPageTwo = () => {
    const now = latest.current
    if (now.page === 2 || !offersPageTwo(now.key, now.docs, now.subject)) return
    switchPage(2)
    paint()
    setSaid(ENTERED_SAID)
  }
  /** Back to page 1 — the pill's button or the row's 1. Focus goes to the canvas from the pill, and stays on the row
   *  from the row: the panel is keyed across the switch (`acrossPages`), so the pressed radio is the same element. */
  const leavePageTwo = (from: 'pill' | 'row') => {
    if (latest.current.page === 1) return
    switchPage(1)
    paint()
    setSaid(LEFT_SAID)
    if (from === 'pill') stage.current?.focus()
  }
  /** The row's choice, either way. A selection that could not be carried leaves no row to keep focus on, so it falls to
   *  the canvas, the stop the pill's way back lands on. */
  const choosePage = (to: Page) => {
    if (to === 2) enterPageTwo()
    else leavePageTwo('row')
    requestAnimationFrame(() => {
      if (document.activeElement === null || document.activeElement === document.body) stage.current?.focus()
    })
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
    // STORY 5.8: AND BEFORE THE LOCAL STORE HAS ANSWERED. A reload must never flash the cloud document over the local
    // one, so nothing is drawn until the hydrate below has decided which document this session is editing; it paints
    // when it lands, exactly as the two above do.
    if (!hydratedRef.current) return
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
      // STORY 5.16 — THE PAGE IN FORCE, at the render door: `second` is page 2 of the list this page renders, and the
      // page's own ADDRESS — `/`, `/page/2/`, `/tag/<slug>/`… — is handed to EVERY section, the site-wide header
      // included, which renders at `default.hbs` and would otherwise always be told `/`. So `{{navigation}}` marks what
      // Ghost marks on that address (DW-218). The address comes from `templateContext` itself, the one place it is
      // computed. Post, Page and 404 keep `/` (a DW).
      // STORY 5.16a — AND THE PAGE'S OWN NUMBER, for `{page_number}` (R-182), from the SAME call: one more
      // field of a result already taken. It is handed to every section ONLY on page 2 (R-186) — page 1 hands
      // none and prints nothing in the token's place, and Post, Page and 404 return no pagination at all, so
      // they hand none either (R-183). `Page` is the `1 | 2` union, so `now.page === 2` is the whole test.
      const feed = now.page === 2 ? 'second' : 'first'
      const { site } = orbitWeekly.templateContext(pageFileOf(now.key, now.page), feed, now.subject)
      const url = site.currentUrl
      const pageNumber = now.page === 2 ? (site.pagination as { page?: number } | undefined)?.page : undefined
      const parts = now.stack.map((i) => {
        const entry: SectionRegistryEntry | undefined = entries[i.designId]
        if (!entry) throw new Error(`${i.designId} was not read for this project`)
        // Story 5.4: HIDDEN IS RETAINED, NEVER REMOVED — the instance stays in the doc and renders nothing, so
        // `sectionRoots` gives it a null root exactly as a member-gated section does, and Epic 7 leaves it out of the
        // compile. R-124's audience reaches the render door as `visibility`, which gates the root on both emitters.
        if (i.hidden) return ''
        // Story 5.6: a repaint in dark must draw the DARK render — the mode picks the stored slice handed to the one
        // door, here as it does in `restampAll` and `onChange`, so no repaint ever silently returns to light
        // Story 5.13: the canvas's resolved subject reaches every section through the ONE door. A site-wide section
        // compiles to `default.hbs`, which carries no resource of its own, so the argument is simply unused there.
        // Story 5.14: and so does the visitor View as is previewing — Story 4.10's `gateMembers` decides the rest.
        return renderSection(doc, entry, { ...i, controls: storedFor(entry, i, now.mode) }, { target: i.target, rows: rows[i.designId], feed, url, page: pageNumber, member: now.viewAs, visibility: i.memberVisibility, assets, icons: lookup, editing: true, subject: now.subject })
      })
      // Story 5.15: the behaviours running on the markup about to be replaced stop first, putting every mount back
      // at rest — and the new markup is written PLAIN. Whether a mount runs is `core`'s to say, mount by mount, below;
      // `mountSections`' blanket `js-enabled` drew every mount in its JavaScript branch with nothing running.
      behaviours.current?.stop()
      behaviours.current = null
      mount.innerHTML = parts.join('')
      // Story 5.3: the stamps lifted into memory in the same task, so none is ever painted or observable
      stamps.current = takeStamps(mount.querySelectorAll<HTMLElement>('[data-inflozo-prop], [data-inflozo-ghost]'))
      const back = lock && lock.at >= 0 ? sameLock(lock.words)[lock.at] : undefined
      if (back && lock) showNote({ el: back, kind: 'lock', words: lock.words })
      roots.current = sectionRoots(parts, mount) as (HTMLElement | null)[]
      wire(doc)
      // STORY 5.15 — `core` STARTS HERE, over the new nodes, against the canvas's own window (DW-136). While designing
      // it holds still every module that is not edit-safe and hands those mounts back for the PAUSED chip (R-174,
      // R-175); in Preview everything runs. A restamp keeps the nodes, so it never reaches here and running mounts
      // survive it.
      if (doc.defaultView) behaviours.current = startBehaviours(doc.defaultView, !now.preview, reportBehaviour)
      // the hovered root was replaced, and the pointer has not said where it is since
      latest.current.hovered = null
      setHovered(null)
      mark()
      setPaints((n) => n + 1)
      frame.current.dataset.painted = now.key
      // Story 5.16 — which page was painted, for the deployed walk to wait on: a change of page is a same-canvas repaint
      frame.current.dataset.page = String(now.page)
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

  /** Is a point in the CANVAS document's coordinates inside one of S4b's pressed children, which live outside the
   *  frame? BOTH of them since Story 5.10 — the quick actions and the "+ Add section" — because crossing onto either
   *  arrives here as a `pointerout` with a null `relatedTarget` and would otherwise clear the very hover the pill is
   *  anchored to. Tested by GEOMETRY, because two documents' pointer events have no guaranteed order. */
  const overPill = (cx: number, cy: number) => {
    const f = frame.current
    if (!f) return false
    const fr = f.getBoundingClientRect()
    const k = fitOf(f, fr)
    const [x, y] = [fr.left + cx * k, fr.top + cy * k]
    const els = [pill.current, document.querySelector<HTMLElement>('[data-add-section]')]
    return els.some((el) => {
      if (!el || el.style.visibility === 'hidden') return false
      const p = el.getBoundingClientRect()
      return x >= p.left && x <= p.right && y >= p.top && y <= p.bottom
    })
  }

  /** One doc's own sections as they sit ON SCREEN, in `captureLayout`'s two offsets — what the pill's grip drags
   *  against, because the pointer is over the canvas rather than over the Layers list. A hidden or gated section has
   *  no root and contributes a zero-height row at the last one's edge, so a drag still passes it. */
  const screenRows = (docKey: string) => {
    const f = frame.current
    const fr = f?.getBoundingClientRect()
    const k = f && fr ? fitOf(f, fr) : 1
    let last = 0
    return (docOf(docKey)?.instances ?? []).map((inst) => {
      const n = latest.current.stack.findIndex((placed) => placed.doc === docKey && placed.instanceId === inst.instanceId)
      const r = (n === -1 ? null : roots.current[n])?.getBoundingClientRect()
      if (!r) return { offsetTop: last, offsetHeight: 0 }
      last = r.bottom * k
      return { offsetTop: r.top * k, offsetHeight: r.height * k }
    })
  }

  const startEditing = (target: HTMLElement, stamp: { path: string; item?: number }, n: number, caret: 'pointer' | 'end') => {
    // STORY 5.17 — the read-only session never begins an inline field. `commit()`'s guard would refuse the value,
    // but a `contenteditable` element shows the typed character before anything is committed, and B5a's rule is that
    // nothing moves at all. Refusing here leaves the press as an ordinary selection, which is what it was before 5.3.
    if (!latest.current.lock.holder) return false
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
        // held for R-180's ask on page 2: the dialog takes the focus, which ends this field, and it repaints either way
        if (commit(withState(editable(at.doc), at.doc, at.instanceId, state), at.doc, { instanceId: at.instanceId, name: at.layerName }) === null) return
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

  /* ─── Story 5.9 — FR-D11's MAP, ONE HANDLER (R-141, R-145, R-147) ──────────────────────────────────────────────
   *
   * THE MAP IS `lib/keymap.ts` AND THE ACTIONS ARE THE BUTTONS' OWN. `L` calls the fold the Collapse button calls,
   * `.` calls `flip`, `1` `2` `3` call `pickDevice`, `⌘D` and `Del` call `onDuplicate`/`onRemove` — the very
   * functions the pill and the `⋯` menu call — so a key and its button cannot drift (R-141's rule, already proved by
   * ⌘Z at Story 5.8). Nothing below decides what a key DOES; `shortcutFor` decides what a press IS.
   *
   * A BINDING WHOSE ACTION IS NOT BUILT NEVER REACHES HERE (R-145): `⌘⏎` carries no keys in the table — `⌘K`, `[`,
   * `]`, `⇧R` and `P` left that list with the actions they drive — so `shortcutFor` returns null for it, nothing is
   * prevented, nothing is announced and the `?` card does not list it.
   *
   * TWO GUARDS, AND THE SPLIT IS THE MODIFIER'S. A single-character press is inert while ANY text holds the caret
   * (UX-DR11, WCAG 2.1.4) — typing "dark" into a headline must never flip the canvas — and gives way to an open
   * popover or dialog, which owns its own keys. A ⌘-modified press is unaffected by the caret except for ⌘Z/⇧⌘Z,
   * whose refusal leaves the browser's own undo to the words being typed (Story 5.3), and every gesture but ⌘S gives
   * way to an open dialog, because a modal owns the document under it.
   *
   * BOUND ON BOTH DOCUMENTS, because the caret is usually in the OTHER one: a press while editing a headline is
   * delivered to the canvas document, which is a different window. `holdsCaret` is asked of whichever document the
   * press arrived in, plus this component's own `editing` ref — a `contenteditable` span inside a canvas `<button>`
   * is not the active element of anything until the caret is placed in it.
   */

  /** D8c's skip link and the `Esc` ladder's third rung land in the same place: the Controls sidebar's first control,
   *  which is the rail's Show button while it is folded. The REFS are asked and not `controls.folded`, because these
   *  handlers are bound once at mount — `show` exists only while the rail is drawn, so it answers the question. */
  const toChrome = () => (controls.show.current ?? controls.hide.current)?.focus()

  const run = (gesture: Gesture) => {
    const pick = latest.current.selected
    switch (gesture) {
      // STORY 5.10 — `⌘K`. With a section selected the picker opens at the gap AFTER it (`duplicateSection`'s own
      // precedent); with nothing selected, at the end of this canvas's own stack. Where nothing can be placed there
      // is nothing to open (UX-DR3), exactly as the sun does nothing on a Light-only project.
      case 'add': return openPicker(pick ? latest.current.stack.findIndex((i) => same(i, pick)) : null)
      // STORY 5.11 — the ring, ON THE SELECTION and never the hover, exactly as ⌘D and Del are. With nothing
      // selected, or where the category holds one design, nothing happens and nothing is announced (⌘D's rule).
      case 'prev': return stepDesign(pick, -1)
      case 'next': return stepDesign(pick, 1)
      case 'save': return void flush('manual')
      case 'undo': return onUndo()
      case 'redo': return onRedo()
      // ON THE SELECTION, NEVER THE HOVER, and obeying the rules the buttons obey: FR-D5 gives a site-wide section no
      // Duplicate at all, on its row, on its pill and therefore on this key, and its Delete asks first through the
      // one confirm. With nothing selected both do nothing and say nothing.
      case 'duplicate': return void (pick && pick.doc !== SITE.key && onDuplicate(pick))
      case 'remove': return void (pick && onRemove({ ...pick, layerName: layerNameOf(pick) }))
      case 'layers': return layers.toggle((was) => !was)
      // R-135: on a Light-only project there is no sun to press, so nothing happens and nothing is announced
      case 'dark': return void (darkEnabled && flip(latest.current.mode === 'dark' ? 'light' : 'dark'))
      case 'shortcuts': return openShortcuts(shortcuts)
      // STORY 5.12 — the key presses the DICE, not the fold: the confirm opens at once and the cube rolls only on
      // the confirmed Remix (R-164), so `⇧R` and the button are one control down to the animation (R-141)
      case 'remix': return remixDice.current?.press()
      // STORY 5.15 — `P` is B3a's pill on the way in and B3b's Back to editing on the way out: one toggle, the very
      // handlers the two buttons call (R-141)
      case 'preview': return latest.current.preview ? leavePreview() : enterPreview()
      // the ladder below owns it; `shortcutFor` never returns it, and this arm is here so the union stays exhaustive
      case 'deselect': return
      default: {
        const next = DEVICES.find((d) => d.name === gesture)
        if (next) pickDevice(next)
      }
    }
  }

  const onShortcut = (e: KeyboardEvent) => {
    if (e.defaultPrevented) return
    const target = e.target as HTMLElement | null
    const active = target?.ownerDocument?.activeElement as HTMLElement | null
    const inField = editing.current !== null || holdsCaret(target) || holdsCaret(active)
    const gesture = shortcutFor(e, inField)
    if (!gesture) return
    // an open dialog owns the page: ⌘Z must not change the document under a modal. A single-key press gives way to an
    // open POPOVER too — a Layers `⋯` menu, a picker — because the menu owns the key while it is up.
    const owner = SINGLE_KEY.has(gesture) ? ':popover-open, dialog[open]' : 'dialog[open]'
    if (gesture !== 'save' && target?.ownerDocument?.querySelector(owner)) return
    // a `<select>` has no caret but it does have type-ahead: `l` there is a letter of an option's name (review)
    if (SINGLE_KEY.has(gesture) && (target?.tagName === 'SELECT' || active?.tagName === 'SELECT')) return
    // STORY 5.15 — IN PREVIEW ONLY `P`, `⌘S` AND THE THREE DEVICES ACT (`IN_PREVIEW`). Every other binding drives chrome
    // that is hidden, so it does nothing — and is still claimed, so ⌘D never bookmarks the page instead
    if (latest.current.preview && !IN_PREVIEW.has(gesture)) return void e.preventDefault()
    // A HELD KEY IS ONE PRESS: auto-repeat would stack a duplicate per tick and strobe the panel. ⌘Z and ⇧⌘Z repeat
    // on purpose, as they do everywhere.
    if (e.repeat && gesture !== 'undo' && gesture !== 'redo') return void e.preventDefault()
    e.preventDefault()
    run(gesture)
  }

  /* THE `Esc` LADDER — three rungs, one key, each announcing where it landed (EXPERIENCE § the focus model (1)).
   *
   * RUNG 1 IS STORY 5.3'S AND NEVER REACHES HERE: `lib/inline.ts` ends editing on the press and prevents the default,
   * so `defaultPrevented` above takes it and the section stays selected.
   * RUNG 2 — a selection, not editing: deselected, and focus RESTS on the canvas container, which is why the
   * container is a tab stop of its own.
   * RUNG 3 — focus on the canvas container with nothing selected: focus leaves the canvas for the chrome.
   * A field, a select, a picker or an open dialog keeps the key: it belongs to the control it was pressed in.
   */
  const onEscape = (e: KeyboardEvent) => {
    if (e.key !== 'Escape' || e.defaultPrevented) return
    const target = e.target as HTMLElement | null
    const doc = target?.ownerDocument
    // an open popover or dialog anywhere in that document owns the key, whichever element holds focus — in Preview
    // that includes a module's own `<dialog>` in the page: the first Esc closes it, the next comes back
    if (doc?.querySelector(':popover-open, dialog[open]')) return
    // STORY 5.15 — THE PREVIEW RUNG, above every other: `Esc` is B3b's way back, from anywhere in either document
    if (latest.current.preview) {
      e.preventDefault()
      leavePreview()
      return
    }
    if (!escDeselects(target)) return
    if (latest.current.selected) {
      choose(null)
      stage.current?.focus()
      setSaid('Nothing selected. Focus is on the page area.')
      return
    }
    // RUNG 3, AND ONLY FROM THE CANVAS — from the Layers list or the panel there is nothing left to step out of.
    // "On the canvas" is either document: the container itself in this one, or anything inside the frame, which is
    // where focus goes when a press the canvas prevents blurs its target (Story 5.3).
    if (doc === document && document.activeElement !== stage.current) return
    toChrome()
    setSaid('Focus left the page area for the editor controls.')
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
      // AND NEITHER DOES A MENU'S (the owner, 2026-09-21: "Clicking anywhere outside the dropdowns should close the
      // dropdowns"). A popover's light dismiss listens to ITS document, and the canvas is another one, so a press on
      // the page left Template, View as or any panel menu open. It closes here, as the link panel does.
      closeMenus()
    }, true)
    doc.addEventListener('mousedown', (e) => {
      // STORY 5.15 — IN PREVIEW A PRESS REACHES THE PAGE: nothing starts editing and nothing is prevented, so words
      // select and a field takes focus and typing as a visitor's does
      if (latest.current.preview) return
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
    // Story 5.15: and in Preview nothing hovers — no outline, no tag, no pill, no chip
    doc.addEventListener('pointerover', (e) => {
      if (e.pointerType !== 'touch' && !latest.current.preview) point(pickAt(e.target))
    })
    doc.addEventListener('pointerout', (e) => {
      if (e.pointerType === 'touch' || e.relatedTarget !== null || latest.current.preview) return
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
      // Story 5.15: in Preview a touch is the visitor's, and no hold starts
      if (e.pointerType !== 'touch' || latest.current.preview) return
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
      // STORY 5.15 — IN PREVIEW EVERY CLICK REACHES THE PAGE and selects nothing, except the one AD-21 trap a click owns:
      // a link never navigates the canvas (`submit`, `auxclick` and the drops stay prevented above, in both modes).
      // `closest` rather than `instanceof`: the target lives in the canvas document's realm.
      if (latest.current.preview) {
        if ((e.target as Element | null)?.closest?.('a[href], area[href]')) e.preventDefault()
        return
      }
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
    // R-141: the caret is usually IN HERE, so the keys are bound on this document too
    doc.addEventListener('keydown', onShortcut)
  }

  // a change of canvas is a soft navigation: the iframe keeps its document and is repainted, and nothing stays chosen
  useEffect(() => {
    latest.current.selected = null
    setSelected(null)
    // Story 5.13: a refusal belongs to the canvas it was refused on, and each canvas holds its own subject
    setSubjectRefusal(null)
    // Story 5.16: a change of canvas is page 1 — the render already shows it (`shownPage` is keyed to its canvas), and
    // this makes it stick, so the canvas left on page 2 opens on page 1 on the way back too
    latest.current = { ...latest.current, page: 1, stack: stackOf(latest.current.docs, key, 1, library) }
    setShownPage({ key, page: 1 })
    asked.current.clear()
    paint()
    // paint reads the latest values through `latest`
  }, [key])

  /** FR-D22's "says so", ON OPEN. A stored subject that no row holds falls back to the fixture — the canvas is
   *  never empty and the stored value is never deleted — and the fallback is announced politely through the
   *  editor's one live region as well as shown in the menu. Silence would be the same failure as an empty canvas. */
  useEffect(() => {
    if (previewing.fellBack && previewing.subject !== null) setSaid(GONE(previewing.subject))
  }, [key, previewing.fellBack])

  /** Story 5.14 — A VISITOR COUNTS AS VIEWED THE MOMENT THE CANVAS IS SHOWN IN THAT STATE: on open, on a change of
   *  canvas and on every choice, and only once the hydrate has settled which docs this session shows. `seen` hands back
   *  the same array when the visitor is already in the record, so a canvas looked at before writes nothing. */
  useEffect(() => {
    if (!hydrated) return
    // Story 5.16: the PAGE on screen — page 2 keeps a record of its own (R-167)
    const stored = ownKeyOf(key, page)
    const was = latest.current.viewed[stored] ?? []
    const next = seen(was, viewAs)
    if (next !== was) recordViewed({ [stored]: next })
    // `recordViewed` reads the latest record through `latest`
  }, [hydrated, key, viewAs, page])

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
    // R-141's three, on the shell. The canvas document gets the same handler in `wire()`.
    window.addEventListener('keydown', onShortcut)
    // a press that starts on the canvas and lifts over the panel releases in the editor document, not the canvas's —
    // added once here, not once per canvas document wired (review, 2026-09-18)
    // ponytail: a lift outside the browser window reaches neither; the next press releases it
    window.addEventListener('mouseup', release)
    return () => {
      alive = false
      clearTimeout(settle.current)
      // Story 5.15: the behaviours running on the canvas stop with the editor, taking their listeners with them
      behaviours.current?.stop()
      behaviours.current = null
      el?.removeEventListener('load', ready)
      window.removeEventListener('keydown', onEscape)
      window.removeEventListener('keydown', onShortcut)
      window.removeEventListener('mouseup', release)
    }
    // mount only
  }, [])

  /* ─── Story 5.8 — the hydrate (AD-15, `addendum.md` §AD1.1) ────────────────────────────────────────────────────
   *
   * ONE COMPARISON DECIDES EVERYTHING: the cloud revision against the local `base_revision`, and NOTHING ELSE.
   * Equal → the local doc and the journal both survive. Different → the cloud doc replaces the local one and the
   * journal is cleared. No local record → the server's docs and an empty journal.
   *
   * The takeover half of AD-15's journal-clearing rule (`lock_generation` advancing) is not here: nothing writes
   * `edit_locks` until Story 5.17, so it has nothing to read. The revision half is, and a second tab reaches it today.
   */
  useEffect(() => {
    let alive = true
    const settle = (ok: boolean) => {
      if (!alive) return
      hydratedRef.current = true
      setHydrated(true)
      if (!ok) toFallback()
      paint()
    }
    void (async () => {
      const opened = await openLocal(userId)
      if (!alive) return
      if (!opened) {
        // NO IndexedDB: private mode, a blocked upgrade, site data switched off. Every change goes straight up and the
        // indicator says exactly that — never "Saved on this device" (FR-D10).
        settle(false)
        return
      }
      local.current = opened
      askToPersist()
      const held = await opened.read(project.id)
      if (!alive) return
      // OUR OWN TAB-CLOSE FLUSH (`ownFlushLanded`): the reload that sent the owed edits is the reload reading this
      const landed = held !== null && ownFlushLanded(held, revision, stored)
      const how = landed ? ({ kind: 'local' } as const) : hydrationFor(held, revision)
      // STORY 5.17 — AD-15's clearing rule, BOTH halves in one call: the revision half above, and the generation
      // half — a take-over — which cannot have happened before this mount, because this session has never held the
      // lock. It is passed explicitly rather than assumed, so the rule has one expression and not two. In session,
      // `land()` runs the same rule when the generation moves past the one this session holds.
      if (!journalCleared(how, false) && held) {
        // A LOCAL DOC MAY NAME A DESIGN THE SERVER'S DOCS DO NOT, and `entries` was built from the server's — so the
        // library is asked before the local document is trusted. Since 5.10 and 5.11 two surfaces can put one there
        // (a placement and a design swap), and the alternative to asking is a canvas that throws for the whole
        // editor on the next load. `read.ts` hands over every PLACEABLE design, which is exactly what a ring is
        // drawn from, so a swap made in this browser survives the reload.
        const unknown = Object.values(held.docs).some((doc) => vanishedDesign(doc, (id) => entries[id] !== undefined))
        if (!unknown) {
          const back = autoFrom(held.auto, canvases) as CanvasKey[]
          const kept = landed ? flushed(held.journal, held.journal.stamp, maxSeq(held.journal)) : held.journal
          base.current = landed ? revision : held.baseRevision
          latest.current = { ...latest.current, docs: held.docs, auto: new Set(back), journal: kept, stack: stackOf(held.docs, latest.current.key, latest.current.page, library) }
          setDocs(held.docs)
          setAuto(new Set(back))
          setJournal(kept)
          // review, 2026-09-22: the THIRD door page 2 can stop existing through — a local doc that outranks the server's
          // may have no main feed on page 1 — guarded as `restore()` and `chooseSubject` are: page 1 BEFORE the paint
          const force = pageInForce(latest.current.page, latest.current.key, held.docs, latest.current.subject)
          if (force.page !== latest.current.page) {
            switchPage(force.page)
            setSaid(leftBecause(force.reason ?? ''))
          }
          if (landed) void opened.save(project.id, { baseRevision: revision, docs: held.docs, auto: back, journal: kept })
          if (unsynced(kept)) rest()
          settle(true)
          return
        }
      }
      // §AD1.1's second and third rows: the server's docs win and the journal goes. `stored`, `synthesized` and
      // `revision` are already this component's props, so nothing is re-read to do it.
      base.current = revision
      await opened.clearJournal(project.id)
      if (!alive) return
      latest.current = { ...latest.current, journal: EMPTY_JOURNAL }
      setJournal(EMPTY_JOURNAL)
      await opened.save(project.id, { baseRevision: revision, docs: { ...stored }, auto: [...synthesized], journal: EMPTY_JOURNAL })
      settle(true)
    })()
    return () => {
      alive = false
    }
    // one project, one mount — the `[id]` layout keeps this component through every canvas change
  }, [])

  /* ─── Story 5.8 — the three flush callers ─────────────────────────────────────────────────────────────────────
   *
   * AUTOSAVE OFF STOPS THE TIMER ALONE (AD-15, FR-D10). The local journal, tab close and ⌘S are unchanged, which is
   * why the toggle's confirm can say plainly what it costs: not "your work is not saved" but "it goes up later".
   */
  useEffect(() => {
    if (!hydrated || !autosave) return
    const tick = setInterval(() => {
      // the matrix's own row: nothing unsynced means NO REQUEST AT ALL, and the indicator does not move. `flush`
      // asks `flushDecision` the same question, so this is the cheap guard and not a second rule.
      if (unsynced(latest.current.journal)) void flush('timer')
    }, FLUSH_MS)
    return () => clearInterval(tick)
  }, [hydrated, autosave])

  useEffect(() => {
    if (!hydrated) return
    /** THE TAB IS GOING. `keepalive` is the only thing the browser promises to finish, and a Server Action cannot be
     *  called from here at all — which is the whole reason the flush is a route handler. Nothing is shown: there is
     *  nowhere to show it. */
    const leaving = () => {
      // THE ONE FLUSH, NOT A SECOND ONE (the review). This used to be a fire-and-forget `fetch` of its own, and
      // `hidden` is also an ordinary TAB SWITCH: the write landed, nobody read the answer, and the next ⌘S sent the
      // old base and was refused as a conflict with the user's own save. `flush` reads the answer, keeps the
      // in-flight guard, and AUTOSAVE OFF STILL DOES NOT STOP IT (AD-15): `flushDecision` lets `unload` through.
      if (document.visibilityState === 'hidden') void flush('unload')
    }
    document.addEventListener('visibilitychange', leaving)
    return () => document.removeEventListener('visibilitychange', leaving)
  }, [hydrated, autosave])

  // every timer this component owns, stopped with it
  useEffect(
    () => {
      gone.current = false
      return () => {
        // LEAVING BY A LINK IS LEAVING TOO: no `visibilitychange` fires on a soft navigation, so what is owed goes now
        void flush('unload')
        gone.current = true
        clearInterval(clocks.current.retry)
      }
    },
    [],
  )

  // the fit: re-measured whenever a fold or the window changes THE ROOM AVAILABLE. The stage's content box, never the
  // card's — since R-137 the card is the device's size fitted, so measuring it would measure this effect's own answer
  useLayoutEffect(() => {
    if (!stage.current) return
    const watch = new ResizeObserver(([row]) => row && setSize({ width: row.contentRect.width, height: row.contentRect.height }))
    watch.observe(stage.current)
    return () => watch.disconnect()
  }, [])
  useLayoutEffect(mark, [selected, hovered])
  /* Story 5.15 — FOCUS FOLLOWS PREVIEW, after the commit that hides or shows the chrome: in, onto B3b's Back to editing;
     out, back to where it was — or onto the pill, if that element has gone or will not take it. `previewed` stays false until Preview has
     been entered once, so the first render moves nothing. */
  const previewed = useRef(false)
  useLayoutEffect(() => {
    if (preview) {
      previewed.current = true
      backButton.current?.focus()
      return
    }
    if (!previewed.current) return
    const was = cameFrom.current
    cameFrom.current = null
    const there = was && was.isConnected && was !== document.body ? was : null
    there?.focus()
    // an element still in the document but no longer focusable (inside a panel that folded, a light-dismissed popover's
    // row) takes nothing, so the fallback is read off the result and not off the element (review)
    if (document.activeElement !== there) document.getElementById('editor-preview')?.focus()
  }, [preview])

  const rootOf = (pick: Pick | null) => {
    const n = pick ? stack.findIndex((i) => same(i, pick)) : -1
    return n === -1 ? null : (roots.current[n] ?? null)
  }
  /** THE CANVAS SCROLLS TO A SECTION CHOSEN IN LAYERS (the owner's ruling of 2026-09-20). Only from Layers: a press
   *  ON the canvas is already looking at the section, and moving the page under that pointer would be a bug rather
   *  than a courtesy. The canvas document is what scrolls — the iframe is exactly the device's size (R-137) and its
   *  own document is longer — so this is `contentWindow.scrollTo`, never the stage's.
   *
   *  `REVEAL_GAP` is in CANVAS pixels, so it shrinks with the fit exactly as the section does.
   *  ponytail: 24 is a guess at "minor space", the owner's words. It is the one number here. */
  const REVEAL_GAP = 24
  const reveal = (pick: Pick | null) => {
    const root = pick && rootOf(pick)
    const win = frame.current?.contentWindow
    if (!root || !win) return
    // A SECTION THAT TRAVELS WITH THE VIEWPORT IS ALREADY IN VIEW, and there is nothing to scroll to — a sticky
    // header is the case, and it is not a guess: executed on the harness canvas at scroll 2425, the stuck root
    // reported `getBoundingClientRect().top` 0 AND `offsetTop` 2425, so neither number says where it lives. Without
    // this the reveal read 2425 as its position and nudged the page 24px for nothing.
    if (['sticky', 'fixed'].includes(win.getComputedStyle(root).position)) return
    // reduced motion is honoured in JS because this scroll is not a CSS animation — and `canvas-chrome.css` cannot
    // carry a `scroll-behavior` rule anyway: every selector in it must be keyed on `data-inflozo-` (`pilots.test.ts`)
    const still = win.matchMedia('(prefers-reduced-motion: reduce)').matches
    win.scrollTo({ top: Math.max(0, root.getBoundingClientRect().top + win.scrollY - REVEAL_GAP), behavior: still ? 'auto' : 'smooth' })
  }

  const chosen = selected ? stack.find((i) => same(i, selected)) : undefined
  const pointed = hovered ? stack.find((i) => same(i, hovered)) : undefined
  const entry = chosen ? entries[chosen.designId] : undefined
  const pro = plan === 'free' && entry?.tier === 'pro'
  /* Story 5.11 — the SELECTED section's ring feeds the panel block, the HOVERED one's feeds the pill: the pill is
     drawn for what the pointer is over, which is not always what is chosen. Both are derived, so a category that
     holds one design draws no arrow anywhere without a second rule saying so (UX-DR3). */
  const chosenRing = chosen ? ringOf(chosen.designId) : []
  const chosenAt = chosen ? chosenRing.findIndex((e) => e.id === chosen.designId) : -1
  const pointedRing = pointed ? ringOf(pointed.designId) : []
  // on a hovered selection the selected box's 1.5px is the only outline (S4c)
  const hoverOutline = pointed && !same(hovered, selected)
  const hoveredRoot = pointed ? rootOf(hovered) : null
  const selectedRoot = chosen ? rootOf(selected) : null

  // THE CHROME LAYER (the owner's finding, 2026-09-17): the boxes, the tag and the badge are portalled into the canvas
  // document, so the compositor scrolls them with their section in the same frame (`lib/canvas-layer.ts`)
  const [chrome, setChrome] = useState<ChromeLayers | null>(null)
  // Story 5.15: in Preview the layer is dropped, so no outline, tag, badge, lock pill or chip can exist — while the
  // selection itself stays in state and is drawn again on the way back
  const showing = !preview && !!(hoveredRoot || selectedRoot)
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
  const layerFor = (root: HTMLElement | null) => (preview || !root || !chrome ? null : pinned(root) ? chrome.view : chrome.page)

  /* STORY 5.15 — B3a's PAUSED CHIPS (R-175). One for each mount `core` held still whose part MOVES BY ITSELF — on a
     timer or as the page scrolls, with nothing pressed (the registry's `movesByItself`) — inside the hovered root and
     inside the selected one, and none in Preview. The list is `core`'s own (`paused`), never a second one kept here,
     so a part that waits for a press — a phone menu, a sign-up form — never carries one. */
  const chips = preview
    ? []
    : [...new Set([hoveredRoot, selectedRoot])].flatMap((root) =>
        !root
          ? []
          : (behaviours.current?.paused ?? [])
              .filter((el) => root.contains(el) && movesByItself(el.getAttribute('data-module') ?? ''))
              .map((el) => ({ el: el as HTMLElement, root })),
      )

  // positions follow layout, not scroll: a section that grows, a header that shrinks, a fold that re-fits the canvas
  useLayoutEffect(() => {
    if (!chrome) return
    const all: [HTMLElement | null, HTMLElement | null, Parameters<typeof place>[3]][] = [
      [hoverBox.current, hoveredRoot, 'fill'],
      [selectedBox.current, selectedRoot, 'fill'],
      [tag.current, hoveredRoot, 'top-left'],
      [badge.current, selectedRoot, 'top-right'],
      [noteBox.current, note?.el ?? null, 'above'],
      // Story 5.15: each PAUSED chip, 8px inside its mount's bottom-left corner
      ...chips.map(({ el }): [HTMLElement | null, HTMLElement, 'bottom-left'] => [chipEls.current.get(el) ?? null, el, 'bottom-left']),
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
    // the doc AS EDITED: on page 2 its own design, or while it follows, the copy of page 1 (Story 5.16)
    (editedDoc(docs, docKey, library)?.instances ?? []).map((i, at) => ({
      doc: docKey, instanceId: i.instanceId, layerName: i.layerName, hidden: i.hidden, at,
      // R-133: the `⋯` item is ABSENT where nothing could be cleared, and the engine's own definition decides.
      // R-135 (owner, 2026-09-19): and absent on a LIGHT-ONLY project, where Theme settings greys the same act with
      // its reason — the editor shows nothing about dark there, exactly as the sun is gone rather than disabled.
      darkOverride: darkEnabled && darkOverridesInForce(entries[i.designId] ?? { controlSchema: [] }, i).length > 0,
    }))

  /** One operation over one template's doc: the session's next `docs`, painted once. Answers the refusal, or null.
   *  `about` names the section a site-wide change is about, for R-180's ask; it is the pick's own section by default. */
  const apply = (pick: Pick, op: (doc: ProjectDoc) => ProjectDoc | string, about?: About): string | null | typeof HELD => {
    // Story 5.10: a canvas with NO ROW YET is a canvas you can add the first section to — R-129's three membership
    // templates and Private are never synthesized, so `docs` holds nothing for them until something is placed. Every
    // other caller addresses a doc it drew a row from, so the fallback only ever answers the picker. Story 5.16: the
    // doc AS EDITED, so an operation on a following page 2 is made to its copy of page 1.
    const doc = docOf(pick.doc) ?? EMPTY_DOC
    const next = op(doc)
    if (typeof next === 'string') return next
    const now = latest.current
    const back = commit({ [pick.doc]: next }, pick.doc, about ?? { instanceId: pick.instanceId, name: layerNameOf(pick) })
    // R-180: held for its ask — nothing has changed yet, so there is nothing to repaint and nothing refused
    if (back === null) return HELD
    // a selection cannot outlive the section it was on — and neither can it (or a hover) outlive a canvas returning to
    // untouched. `back` is asked, not the ids: synthesis DERIVES them (`auto-tag-1`), so the default stack that returns
    // can repeat the id of the very section just removed, and a test by id would keep the panel open on a new instance
    // (review, 2026-09-18). A page 2 that follows page 1 again is the same case: its copy repeats page 1's ids.
    const gone = !docOf(pick.doc)?.instances.some((i) => i.instanceId === pick.instanceId)
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
  /** True when the change LANDED — a held one (R-180) has not yet, so its caller says nothing. */
  const edit = (pick: Pick, op: (doc: ProjectDoc) => ProjectDoc | string) => {
    const refused = apply(pick, op)
    if (refused === HELD) return false
    if (refused !== null) refuse(pick, refused)
    return refused === null
  }

  /** What Layers calls this section, read from the session's own stack — the one name the row, the canvas tag, the
   *  panel heading and every announcement below all use. */
  const layerNameOf = (pick: Pick) => latest.current.stack.find((i) => same(i, pick))?.layerName ?? 'Section'

  /* ANNOUNCED POLITELY, AND FROM HERE (Story 5.9, UX-DR12). `⌘D` and `Del` call these same two functions — one
     handler per action, never a second implementation (R-141's rule) — so the announcement has to live where BOTH
     the key and the button reach it, exactly as `moveTo`'s does. A refusal says nothing here: `refuse` puts P0-1's
     pill over the section, which is where the press was. */
  const onDuplicate = (pick: Pick) => {
    const name = layerNameOf(pick)
    if (edit(pick, (doc) => duplicateSection(doc, pick.instanceId, crypto.randomUUID()))) setSaid(`${name} duplicated`)
  }
  const onRename = (pick: Pick, name: string) => {
    const refused = apply(pick, (doc) => renameSection(doc, pick.instanceId, name))
    // held for R-180's ask is not a refusal: the rename dialog closes, and the site-wide dialog asks
    return refused === HELD ? null : refused
  }

  /* ─── Story 5.11 — THE DESIGN RING: four doors, one handler, one edit (FR-D19, AD-15, AD-16) ─────────────────
   *
   * `onDesign` is the whole of it. The panel's thumbnails call it with a design id; its arrows, the section pill's
   * arrows and `[` / `]` call `stepDesign`, which is `step()` over the same ring; the pill's Shuffle — its one seat
   * since the owner's test of 2026-09-20 — calls `onShuffle`. Every one of them ends in ONE `switchDesign` through `apply` → `commit`, so a swap is one
   * transaction and one `⌘Z` — a Shuffle is not several edits — and the polite announcement is made HERE, where
   * the key and every button reach it (`onDuplicate`'s own rule, UX-DR12).
   */

  /** `canvas-chrome.css`'s settle: the attribute goes on after the paint and comes off when the animation's own
   *  180ms is up. Never on the next frame — that would cancel the animation rather than end it. */
  const SWAP_MS = 180
  const markSwapped = (pick: Pick) => {
    swapped.current = pick
    mark()
    clearTimeout(settle.current)
    settle.current = setTimeout(() => {
      if (!same(swapped.current, pick)) return
      swapped.current = null
      mark()
    }, SWAP_MS)
  }

  const onDesign = (pick: Pick, to: string) => {
    const placed = latest.current.stack.find((i) => same(i, pick))
    if (!placed || to === placed.designId) return
    const ring = ringOf(placed.designId)
    if (!edit(pick, (doc) => switchDesign(doc, pick.instanceId, to, ring))) return
    setSaid(announce(ring.findIndex((e) => e.id === to), ring.length, entries[to]?.name ?? to))
    markSwapped(pick)
  }

  /** `[` `]`, the panel's ◀ ▶ and the pill's: one step around the ring, wrapping (UX-DR5 — a dead key at the end
   *  of a list reads as broken). Nothing selected, or a ring of one, does nothing and says nothing. */
  const stepDesign = (pick: Pick | null, by: number) => {
    const placed = pick ? latest.current.stack.find((i) => same(i, pick)) : undefined
    if (!pick || !placed) return
    const ring = ringOf(placed.designId)
    if (ring.length < 2) return
    const at = ring.findIndex((e) => e.id === placed.designId)
    onDesign(pick, ring[step(at, ring.length, by)]!.id)
  }

  /** FR-D13's Shuffle, from its ONE seat — the section's pill (the owner's test of the deployed page, 2026-09-20,
   *  amending R-159: the panel's `Try a design` card was built and removed). The randomness lives HERE and never in
   *  the core (AD-1), and since nothing names the destination before the press it is drawn AT the press rather than
   *  held in state. */
  const onShuffle = (pick: Pick | null) => {
    const placed = pick ? latest.current.stack.find((i) => same(i, pick)) : undefined
    if (!pick || !placed) return
    const ring = ringOf(placed.designId)
    const to = shuffleTo(ring.length, ring.findIndex((e) => e.id === placed.designId), Math.random)
    if (to !== null && ring[to]) onDesign(pick, ring[to]!.id)
  }

  /** Story 5.12 — `⇧R` and the dice are ONE handler (R-141): the key presses the button (R-164: the press asks, the roll answers), so the cube, the
   *  confirm and the fold below can never have a second implementation between them. */
  const remixDice = useRef<RemixHandle | null>(null)

  /* ─── Story 5.12 — SITE REMIX: one pure picker, one existing operation, ONE transaction (FR-D17) ────────────
   *
   * THE WHOLE RE-ROLL IS ONE `commit`, and that is the only real decision in this story. `commit(written,
   * touched)` journals `{ docKey, before, after }` for ONE doc, so committing per section would write N journal
   * entries and cost N `⌘Z` presses — FR-D17's single-step undo would be false. Folding every pick into one next
   * doc and committing once makes it one entry, one `⌘Z` and one lit Undo arrow, and FR-D9's "never
   * half-applying" is then one check before one assignment: a refusal from `switchDesign` aborts the fold and
   * writes nothing at all.
   *
   * R-161 (owner, 2026-09-20): THE CANVAS'S OWN DOC ALONE. `stack` holds the site-wide header and footer too,
   * and including them means a second doc and therefore a second `⌘Z`; the tick-box and the `txn`-grouped undo
   * land with the first story that has a site-wide ring to prove them on.
   *
   * It goes through `apply` for everything after the fold — the commit, the round trip, the selection and the
   * repaint — which is the one place in this editor that gets all four right. The `instanceId` it is handed is
   * only there because `apply` addresses a doc through a `Pick`; nothing is removed here, so its selection
   * bookkeeping has nothing to do.
   */
  const onRemix = () => {
    const now = latest.current
    // Story 5.16: the doc on screen — on page 2, page 2's design (R-177: re-rolled like page 1, never page 1 itself)
    const docKey = ownKeyOf(now.key, now.page)
    const picks = remixPicks(docOf(docKey)?.instances ?? [], ringOf, Math.random)
    if (picks.length === 0) return
    const refused = apply({ doc: docKey, instanceId: picks[0]!.instanceId }, (doc) =>
      remixFold(doc, picks, (next, p) => switchDesign(next, p.instanceId, p.to, ringOf(p.from))),
    )
    // NOTHING HAPPENED IS NOT A REFUSAL AND NOT A ROLL: R-180's hold (the dialog is still asking) and Story 5.17's
    // read-only guard both answer `HELD`, and announcing "Remixed 6 sections" over either would be a sentence about
    // a change that did not land.
    if (refused === HELD) return
    // UX-DR12, and never a toast: `#editor-said` is the editor's one live region (EXPERIENCE.md:541). A refusal
    // is SAID too (review, 2026-09-20): the cube has already rolled, and a roll that lands on silence reads as broken
    setSaid(typeof refused === 'string' ? refused : remixSaid(picks.length, canvas.label))
  }

  /** FR-D5: a site-wide section is ONE shared instance, so removing or hiding it changes every template — the app's
   *  one dialog vocabulary asks first, opening on Cancel (EXPERIENCE § destructive confirms). SHOWING one again asks
   *  nothing: it is the restoring half. The dialog lives here and not in Layers, because the canvas pill's Delete
   *  must open the same one. */
  const [ask, setAsk] = useState<
    | { kind: 'hide' | 'remove'; pick: Pick; name: string }
    | { kind: 'change'; pick: Pick; name: string; held: { written: Readonly<Record<string, ProjectDoc>>; touched: string; base: ProjectDoc | undefined; also?: string; said?: string } }
    | null
  >(null)
  const confirm = useRef<HTMLDialogElement>(null)
  const askFirst = (kind: 'hide' | 'remove', row: Pick & { layerName: string }) => {
    setAsk({ kind, pick: { doc: row.doc, instanceId: row.instanceId }, name: row.layerName })
    // opened on the frame after the one that filled its words in
    requestAnimationFrame(() => openOnCancel(confirm.current))
  }
  /** STORY 5.16 — R-180: THE FIRST CHANGE TO A SITE-WIDE SECTION MADE ON PAGE 2 IS HELD while FR-D5's own dialog asks,
   *  in its words adapted to a change (`lib/page-two.ts`'s `SITE_WIDE_ASK`), opening on Cancel. Change it everywhere
   *  lands the held change — on every page, page 1 included — and Cancel drops it and repaints, so nothing a field or
   *  a stamp already showed survives it. That section asks nothing more on this visit to page 2. */
  const holdChange = (written: Readonly<Record<string, ProjectDoc>>, touched: string, about: About) => {
    // one section at a time: a change to ANOTHER section while this one's ask is pending is dropped, never swapped in
    if (holding.current !== null && holding.current !== about.instanceId) return
    holding.current = about.instanceId
    // the LATEST change to that section is the one held: characters typed before the dialog takes the focus all land
    // with the confirm. `base` is the site doc the change was made over, so a doc that moved under the dialog (a
    // hydrate landing) is never overwritten by the stale one
    setAsk({ kind: 'change', pick: { doc: SITE.key, instanceId: about.instanceId }, name: about.name, held: { written, touched, base: latest.current.docs[SITE.key], also: about.also, said: about.said } })
    // asked again INSIDE the frame: two changes before it runs must not call `showModal` twice
    requestAnimationFrame(() => { if (!confirm.current?.open) openOnCancel(confirm.current) })
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

  const onRemove = (row: Pick & { layerName: string }) => {
    if (row.doc === SITE.key) return askFirst('remove', row)
    if (edit(row, (doc) => removeSection(doc, row.instanceId))) setSaid(`${row.layerName} removed`)
  }
  const onToggleHidden = (row: LayerRow) =>
    row.doc === SITE.key && !row.hidden ? askFirst('hide', row) : edit(row, (doc) => setHidden(doc, row.instanceId, !row.hidden))

  /* ─── Story 5.10 — opening the picker, and the one placement it makes (FR-D12, AD-15, AD-16, R-152) ──────────── */

  /** `from` is the STACK INDEX the gesture was made at, or null for the end of this canvas's own stack. */
  const openPicker = (from: number | null) => {
    if (!latest.current.canAdd || picker.current?.open) return
    setInvoked(from)
    setPickerRefusal(null)
    setOpened(true)
    setPicking(true)
    // opened on the frame after the one that mounted it, exactly as the site-wide confirm is. On every open AFTER
    // the first the dialog is already in the tree and this is simply the next frame (the owner's ruling of
    // 2026-09-20): nothing is re-created, and the previews are the ones already drawn.
    // `open` is asked again INSIDE the frame: two presses before it runs would otherwise call `showModal` twice
    requestAnimationFrame(() => { if (!picker.current?.open) picker.current?.showModal() })
  }

  /**
   * ONE GESTURE, ONE EDIT, ONE TRANSACTION, ONE UNDO STEP (AD-15, AD-16). The insert goes through `apply` →
   * `commit`, the editor's single doc-write door, so `⌘Z` puts it back with no extra code and AD-22's round trip
   * (an edit materialises an untouched template) is free.
   *
   * A SITE-WIDE DESIGN IS THE ONE EXCEPTION TO "where it was invoked" (R-152): the stack order is DERIVED
   * (`canvasStack`, `editor.test.ts:103`), so a header cannot land between two canvas sections however it was
   * invoked. It goes into the SITE doc, and A SECOND ONE IN THE SAME CATEGORY REPLACES THE FIRST — in the same
   * transaction, so one `⌘Z` puts the old one back. The card said so before the press, with the Kit's globe; nothing
   * is explained afterwards, and the only thing said aloud is the polite announcement every placement already makes.
   */
  const onPlace = ({ entry: design, siteWide }: Placement) => {
    const now = latest.current
    // Story 5.16: the page on screen — a section added on page 2 lands in page 2's design (R-177), never page 1's
    const docKey = siteWide ? SITE.key : ownKeyOf(now.key, now.page)
    const layerName = `${design.categoryTitle} — ${design.name}`
    const instance = {
      instanceId: crypto.randomUUID(),
      layerName,
      designId: design.id,
      content: defaultContent(design.contentSchema),
      controls: {},
      data: {},
      darkOverrides: {},
      parkedControls: {},
      hidden: false,
      memberVisibility: 'everyone' as const,
      isMainFeed: false,
    }
    let replaced: string | null = null
    // R-180: a site-wide placement made on page 2 changes every page, so it asks — about the section it REPLACES where
    // it replaces one (a header already asked about on this visit does not ask again), else about itself
    const replacing = siteWide ? (now.docs[SITE.key]?.instances ?? []).find((i) => categoryOf(i.designId) === design.category) : undefined
    const about: About = replacing === undefined
      ? { instanceId: instance.instanceId, name: layerName }
      : { instanceId: replacing.instanceId, name: replacing.layerName, also: instance.instanceId }
    const refused = apply({ doc: docKey, instanceId: instance.instanceId }, (doc) => {
      if (!siteWide) return insertSection(doc, invokedAt(now.stack, docKey, invoked), instance)
      // category for category: a header replaces a header, never a footer
      const at = doc.instances.findIndex((i) => categoryOf(i.designId) === design.category)
      if (at === -1) return insertSection(doc, doc.instances.length, instance)
      replaced = doc.instances[at]?.layerName ?? null
      const cleared = removeSection(doc, doc.instances[at]!.instanceId)
      return typeof cleared === 'string' ? cleared : insertSection(cleared, at, instance)
    }, about)
    // R-180: a site-wide placement made on page 2 is held while the site-wide dialog asks; the picker makes way for it
    if (refused === HELD) {
      picker.current?.close()
      return
    }
    if (refused !== null) {
      // DW-190: the refusal has a home now — the picker itself, which is where the press was. Nothing is written.
      setPickerRefusal(refused)
      return
    }
    picker.current?.close()
    setSaid(
      siteWide
        ? `${layerName} added to the Site-wide group${replaced === null ? '' : `, replacing ${replaced as string}`}`
        : `${layerName} added`,
    )
  }

  /** The drop, and `⌥↑`/`⌥↓`: one `moveSection`, announced politely in its own words (UX-DR12). */
  const moveTo = (pick: Pick, to: number): string | null => {
    const doc = docOf(pick.doc)
    const moved = doc ? moveSection(doc, pick.instanceId, to) : 'there is no template to edit'
    if (typeof moved === 'string') return null
    if (apply(pick, () => moved.doc, { instanceId: pick.instanceId, name: layerNameOf(pick), said: moved.announce }) === HELD) return null
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

  /** DW-209, EXECUTED (2026-09-20, Chromium through this repository's own Playwright, standing rule 1): a wheel
   *  dispatched over `[data-add-section]` scrolled the canvas document 0px and the identical wheel over the iframe
   *  500px. The editor's own page does not scroll (`h-dvh overflow-hidden`), so the canvas simply STALLS while the
   *  pointer rests on a pill — which a customer feels, and which is also why the deployed walk's sticky-scroll
   *  check failed most runs: it wheels at x=700, the "+ Add section" pill's own place on a 1440 editor. The pills
   *  forward their wheel here, to the document the pointer looks like it is over. */
  const wheelToCanvas = (deltaX: number, deltaY: number, deltaMode: number) =>
    wheelToFrame(frame.current?.contentWindow, deltaX, deltaY, deltaMode)

  /** The pill's grip: the SAME reorder as a Layers row's, read against the sections as they sit on the canvas,
   *  because that is where the pointer is. Layers draws the dashed slot either way. */
  const pillGrip: HTMLAttributes<HTMLSpanElement> = {
    onPointerDown: (event) => {
      const pick = latest.current.hovered
      if (event.button !== 0 || drag !== null || !pick) return
      const from = (docOf(pick.doc)?.instances ?? []).findIndex((i) => i.instanceId === pick.instanceId)
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
      const moved = docOf(doc)?.instances[from]
      if (to !== from && moved) moveTo({ doc, instanceId: moved.instanceId }, to)
    },
    onPointerCancel: () => setDrag(null),
  }

  if (failure) throw failure

  /** STORY 5.17 — is a request waiting on THIS session? Derived, never stored twice: the row's own nudge columns,
   *  minus the one this holder has already answered or let expire. */
  const askedBy = lock.holder ? (lock.row?.nudgeRequestedBy ?? null) : null
  const nudged = askedBy !== null && askedBy !== tabId.current && (lock.row?.request ?? null) !== dismissed

  const src = canvasPath ?? canvasSrc(isApp(pathname))

  const onChange = (next: ControlState, kind: Edit) => {
    const now = latest.current
    const pick = now.selected
    if (!pick) return
    // Story 5.16: the doc as edited (page 2's copy while it follows), and held for R-180's ask on page 2 — then nothing
    // is stamped: the panel still shows the value in force until the change lands
    if (commit(withState(editable(pick.doc), pick.doc, pick.instanceId, next), pick.doc, { instanceId: pick.instanceId, name: layerNameOf(pick) }) === null) return
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
      {/* Story 5.15: in Preview the whole bar is HIDDEN, never unmounted — its menus, its focus and every value in it
          come back exactly as they were */}
      <header hidden={preview} className="relative flex h-12 shrink-0 items-center gap-[10px] border-b border-line bg-paper px-3">
        {/* D8c (`D8 Editor Below 1440.dc.html:311-345`) — THE FIRST FOCUSABLE THING IN THE SHELL, not rendered at
            rest and drawn on the first Tab as the frame draws it: a surface pill at left 10 / top 9, 30px high,
            `0 13px`, 12 radius, 1px line, the sm shadow AND the corrected 2px ring together (A7 item 7) — one
            `box-shadow` of both, because a second utility would replace the first.
            A BUTTON, NOT THE FRAME'S ANCHOR: the frame is a mock of a bar with no sidebar beside it, so its
            `href="#d8-canvas"` points AT the canvas; the link skips PAST it, to the Controls sidebar's first control
            (`EXPERIENCE.md:444-449`). Since the iframe leaves the tab order at this story it saves one stop rather
            than the dozens that note describes — it stays because it is drawn and approved, because it is the first
            thing a keyboard user meets, and because the day a story puts a focusable control INSIDE the canvas it is
            the affordance already in place. */}
        <button
          type="button"
          data-skip-canvas
          onClick={toChrome}
          className="sr-only font-semibold outline-none focus:not-sr-only focus:absolute focus:left-[10px] focus:top-[9px] focus:z-10 focus:inline-flex focus:h-[30px] focus:items-center focus:rounded focus:border focus:border-line focus:bg-surface focus:px-[13px] focus:text-[12.5px] focus:text-ink focus:shadow-[var(--shadow-sm),var(--shadow-focus)]"
        >
          Skip the canvas
        </button>
        <Link
          href="/"
          aria-label="Back to dashboard"
          title="Back to dashboard"
          className={`inline-flex size-7 items-center justify-center rounded-sm text-ink-soft transition-colors hover:bg-paper-sunk ${ring}`}
        >
          <ChevronLeft size={15} />
        </Link>
        {/* THE NAME STOPS SHORT OF THE CENTRED GROUP, which since Story 5.14 holds View as too. The widest group today —
            "Template · Member home" beside View as's slot at its widest name — starts 213px left of centre; with the
            name at its limit, the bar's left cluster (padding, back link, name, indicator, undo pair and their gaps)
            ends at `50% + 132px - N`. So `N = 360` leaves a 15px gap at any width — measured in the harness at 1440
            and 1280, where the old `320` let a long name run 25px under the group. The deployed walk's step 90
            measures it with a long name.
            ponytail: a constant sized to today's widest canvas label; Story 7.16's custom templates can carry longer
            names, and then the bar wants a three-column grid (`1fr auto 1fr`) instead of a number */}
        <span className="max-w-[calc(50%-360px)] truncate text-ui-dense font-semibold">{project.name}</span>
        {/* S4a`:32` — the bar's third item, directly after the project name. Since R-142 it is an ICON IN A CIRCLE
            rather than B6's dot and label, and since R-144 its resting state reports what is OWED: a green check
            when everything is on the server, a grey clock the moment there is an edit that is not. The words are
            still B6's five — they are the hover and the announcement now, not printed. One indicator, one place
            (`EXPERIENCE.md`'s own rule), and still never a spinner. */}
        <span id="editor-save-state">
          {/* nothing is claimed before the device has answered: the initial state is green "Synced", and a reload with
              edits owed must never show that for the moment IndexedDB takes (the review) */}
          {hydrated ? <SaveState state={sync} onRetry={retryNow} retrying={pressingRetry} held={!fellBack.current} /> : null}
        </span>
        {/* R-143 (owner, 2026-09-19): THE PAIR SITS HERE, immediately after the indicator, and no longer in S4a's
            right-hand cluster where `S4 Editor.dc.html:41-43` draws it. His reason is the one the frame could not
            have: undo and the save state are the same question — "what has happened to my work" — so they belong
            to the same glance. Everything about the buttons themselves is still the frame's (28 × 28, 8px radius,
            2px apart, the unavailable one at `opacity:.35`); only where they sit has moved.
            THE KEYS ARE THE ARROWS' OWN HANDLERS (R-141), so the two can never disagree.
            `aria-disabled`, never `disabled`: the control stays in the tab order and stays announced. */}
        <div id="editor-history" className="flex items-center gap-[2px]">
          <IconButton
            id="editor-undo"
            label="Undo"
            title="Undo"
            aria-disabled={!canUndo(journal) || undefined}
            onClick={canUndo(journal) ? onUndo : undefined}
            className={canUndo(journal) ? undefined : 'opacity-[.35]'}
          >
            <UndoIcon size={14} />
          </IconButton>
          <IconButton
            id="editor-redo"
            label="Redo"
            title="Redo"
            aria-disabled={!canRedo(journal) || undefined}
            onClick={canRedo(journal) ? onRedo : undefined}
            className={canRedo(journal) ? undefined : 'opacity-[.35]'}
          >
            <RedoIcon size={14} />
          </IconButton>
        </div>
        {/* S4a's CENTRED GROUP (`S4 Editor.dc.html:33`, D5a :37): Template, a gap of 8, then View as — where every drawn
            top bar puts the eye (S4a–c, S6, S7, S14, P0-6, D8, M1). The owner removed the marker CHIP that stood
            beside the switcher at his test of Story 5.5 (R-130); he did not remove the group's second control, which
            Story 5.14 built. ABSOLUTELY centred, as the frame draws it, so it does not move as the project's name
            grows — and a change of visitor does not move it either, because View as's value slot is as wide as its
            widest name. S4d's "2 not viewed" marker is not drawn here: the owner moved the reminder into the menu
            (R-169), so nothing hangs off the trigger. The deployed walk measures THIS group against the bar (step 2),
            not the switcher alone. */}
        <div id="editor-centre" className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-2">
          <TemplateSwitcher projectId={project.id} current={key} canvases={canvases} auto={auto} empty={empty} />
          {/* this canvas's record, with the visitor on screen already in it: the row in force never carries R-169's
              dot, because the page you are looking at is being looked at */}
          <ViewAs visitor={viewAs} viewed={seen(viewed[own] ?? [], viewAs)} onChoose={chooseVisitor} />
        </div>
        {/* S4a's RIGHT-HAND CLUSTER (:35-40). R-132's one button leads it and S4a's device track sits IMMEDIATELY
            RIGHT OF IT, as the frame draws them; Ship it (7.18) lands beside them later (R-118). Undo and redo left
            for the indicator's side at R-143. View as was once expected here, and that was an earlier story's guess and
            never a ruling: every drawn bar puts it in the centred group above, which is where Story 5.14 built it.
            The sun is ABSENT, NOT DISABLED, on a Light-only project (UX-DR3, R-118, R-128, and AD-17's own Rule in so
            many words): there is no toggle rather than a theme that declares less. The device track is NOT scoped by
            dark — R-135 scopes the mode and nothing else — so it is drawn on every project. */}
        <div className="ml-auto flex items-center gap-[10px]">
          {/* STORY 5.12 — the dice LEADS the cluster rather than following the sun, and the reason is R-135:
              `ModeToggle` is not rendered at all on a Light-only project, so a dice placed after it would move on
              some projects and not others. First, its seat is the same everywhere — and it is still "next to the
              dark mode button" wherever that button exists.
              THE COUNT IS THIS CANVAS'S OWN DOC (R-161): `stack` carries the site-wide header and footer too, and
              Remix leaves them alone. Derived from the rings, never written down (standing rule 4) — in the shipped
              library every ring is length 1, so it is 0 and the confirm says so honestly. */}
          <RemixDice
            canvas={canvas.label}
            count={remixable(editedDoc(docs, own, library)?.instances ?? [], ringOf)}
            undoable
            onRemix={onRemix}
            handle={remixDice}
          />
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
          {/* STORY 5.15 — B3a's Preview pill (`B Missing Surfaces.dc.html:645-649`), LAST in the cluster: B3a draws it
              immediately left of the ship button, and Story 7.18 places "Ship it" to its right. */}
          <PreviewButton onPress={enterPreview} />
        </div>
      </header>

      {/* STORY 5.17 — B5a's bar, ABOVE the canvas and below the top bar, where the frame draws it. Hidden in
          Preview with everything else: Preview is the site, and the site has no chrome. */}
      {lock.holder ? null : (
        <LockBar
          hidden={preview}
          notice={lost}
          asking={lock.asking}
          onRequest={() => void requestEditing()}
          unanswered={
            lock.unanswered
              ? {
                  // X is the OTHER session's count, read off its last heartbeat — never this one's
                  words: LOCK_COPY.noResponse(lock.row?.unsyncedEdits ?? 0),
                  onTakeOver: () => openOnCancel(takeover.current),
                }
              : null
          }
        />
      )}

      <div className="flex min-h-0 flex-1">
        <aside id="editor-layers" aria-label="Layers" hidden={layers.folded || preview} className="flex w-[240px] shrink-0 flex-col border-r border-line bg-paper">
          <div className="flex items-center gap-2 px-4 pt-[10px]">
            <span className="flex-1 text-[12.5px] font-semibold">Layers</span>
            <IconButton ref={layers.hide} label="Collapse layers" title="Collapse layers" aria-expanded aria-controls="editor-layers" onClick={() => layers.toggle(true)}>
              <Panel size={15} />
            </IconButton>
          </div>
          {/* B7's two groups, every row pressable — and R-123's third ground inside it (`controls/layers.tsx`) */}
          <Layers
            site={rowsOf(SITE.key)}
            page={rowsOf(own)}
            // Story 5.16: on page 2 the group heads "This page · Home · Page 2", over page 2's own rows
            label={page === 2 ? `${canvas.label} · ${PAGE_TWO_WORDS}` : canvas.label}
            siteKey={SITE.key}
            // derived, never written down (standing rule 4): the templates this project's site-wide sections reach
            templates={templates}
            autoGenerated={page === 2 ? follows(docs, key) : auto.has(key)}
            // page 2's marker, while it follows page 1: D5a's row with its own sentence
            markerWords={page === 2 ? COPY_MARKER : undefined}
            selectedKey={selected ? keyOf(selected) : null}
            hoveredKey={hovered ? keyOf(hovered) : null}
            drag={drag}
            onDrag={setDrag}
            // the owner's ruling of 2026-09-20: choosing a row brings its section into view, with a little air above it
            onSelect={(pick) => { choose(pick); reveal(pick) }}
            onGround={() => choose(null)}
            onToggleHidden={onToggleHidden}
            onRename={onRename}
            onDuplicate={onDuplicate}
            onRemove={onRemove}
            onClearDark={askClearDark}
            onMove={moveTo}
          />
          {/* S4 Editor.dc.html:172 — the Layers footer's full-width dashed button, redrawn identically at 834 and 720
              (`D8 Editor Below 1440.dc.html:72`, `:202`). It is the Kit's `AddButton`, which `/kit` already draws with
              these very words. OUTSIDE the scrolling list, as the frame draws it, so it is always in reach — which is
              also the empty canvas's one affordance: there is no gap to hover when there is no section.
              ABSENT where nothing can be placed on this canvas (UX-DR3), never a button that opens an empty picker. */}
          {canAdd ? (
            <div className="border-t border-line p-[10px]">
              <AddButton id="editor-add-section" onClick={() => openPicker(null)}>
                + Add section
              </AddButton>
            </div>
          ) : null}
        </aside>
        {layers.folded ? <Rail fold={layers} label="Show layers" controls="editor-layers" side="left" hidden={preview} /> : null}

        <section
          ref={stage}
          aria-label="Canvas"
          // UX-DR9 / §7.3(1): THE CANVAS IS ONE STOP IN THE TAB ORDER, between Layers and the Controls sidebar, and
          // focus lands on this container rather than inside the rendered site — which is what the iframe's
          // `tabindex="-1"` below makes true. It is also where the `Esc` ladder's second rung puts focus.
          tabIndex={0}
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
            // Story 5.15: in Preview the ground is the page's backdrop, and a selection survives Preview whole
            if (!preview && e.button === 0 && e.target === e.currentTarget) choose(null)
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
          // Story 5.15: in Preview the stage is the whole window, so the ground's padding goes with the chrome and R-137's
          // fit is 1:1 in a 1440 × 900 window (B3b, "the site runs edge to edge")
          // Story 5.16: on page 2 the ground's top padding is D5d's pill's bottom (4px + its 38) plus R-138's 8px, so the
          // pill never meets the page card on any device — the ground grows rather than the pill's 30px targets shrink
          className={`relative flex min-w-0 flex-1 flex-col items-center justify-center bg-canvas-ground ${preview ? '' : page === 2 ? 'px-7 pb-8 pt-[50px]' : 'px-7 py-8'}`}
        >
          {/* R-137: the card is the DEVICE's size, fitted — centred in the ground, rounded on all four corners, with
              ground below it. `shrink-0` because the fit already guarantees it is never larger than the stage.
              HIDDEN UNTIL THE STAGE IS MEASURED (review, 2026-09-19): before the first `ResizeObserver` callback the
              fit is 1, and the server's HTML would otherwise paint a full 1440 × 900 card across both panels — the
              old card was `w-full overflow-hidden` and clipped the same state, this one is `shrink-0`. */}
          <div
            style={{ width: device.width * scale, height: device.height * scale, visibility: size.width > 0 && size.height > 0 ? undefined : 'hidden' }}
            // Story 5.15: and the card loses its radius and its shadow — the page is the site, edge to edge
            className={`relative shrink-0 overflow-hidden bg-paper-raised ${preview ? '' : 'rounded-[6px] shadow-canvas-page'}`}
          >
            <iframe
              ref={frame}
              src={src}
              title={`${canvas.label} canvas`}
              // THE WHOLE EMBEDDED DOCUMENT LEAVES SEQUENTIAL NAVIGATION — executed in Chromium 1228 through this
              // repository's own Playwright (the spec's Design Notes): plain gives
              // `layers → canvas → site-1 → site-2 → controls` and `-1` gives `layers → canvas → controls`, with
              // click and programmatic focus untouched, so the caret still lands in a headline under the pointer.
              // NEVER `inert`: it would take the pointer with it and the canvas would stop being editable.
              tabIndex={-1}
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
            {/* STORY 5.15 — B3a's PAUSED chip (`B Missing Surfaces.dc.html:658-661`), R-175's two conditions above. Chrome
                in the canvas layer and not R-120's `::after`: inside the frame its 9.5px words would paint at 5.7px at
                the 1440 window's 0.6 fit, take over a design's own `::after` and need a positioned mount. So it is the
                name tag's kind — one screen pixel per unit, Inter, the pointer passing through — in `ViewportChip`'s two
                rounded colours (B3a's fill and hairline, drawn as `paper` and `line-strong` as that chip names them),
                with the frame's 9px pause glyph, "PAUSED" at 9.5/600 tracked .02em, `2px 8px` and a 5px gap. */}
            {chips.map(({ el, root }, n) =>
              layerFor(root)
                ? createPortal(
                    <span
                      ref={(node) => {
                        if (node) chipEls.current.set(el, node)
                        else chipEls.current.delete(el)
                      }}
                      aria-hidden
                      data-chrome="paused"
                      className="pointer-events-none absolute flex items-center gap-[5px] whitespace-nowrap rounded-pill border border-line-strong bg-paper px-2 py-[2px] text-[9.5px] font-semibold tracking-[.02em] text-ink-soft-aa"
                      style={{ visibility: 'hidden' }}
                    >
                      <Pause size={9} className="shrink-0" />
                      {PAUSED}
                    </span>,
                    layerFor(root) as ShadowRoot,
                    `paused-${n}`,
                  )
                : null,
            )}
          </div>
          {/* Story 5.15: B11's chip and B9's pill are hidden in Preview, never unmounted — `contents`, so the wrapper
              draws no box of its own, and both stay positioned against this ground */}
          <div hidden={preview} className="contents">
            {/* B11's chip: the true size first, the fit second, and nothing sets it (UX-DR17, UX-DR20). LAST, not first:
                the page card must stay this ground's `firstElementChild`, which is how the harness and step 27's gutter
                find it — and out of flow it paints over the ground either way. */}
            <ViewportChip device={device} fit={scale} />
            {/* STORY 5.16 — D5d's pill at the ground's top centre while page 2 is shown, 4px down (R-138's inset, the chip's),
                and LAST for the chip's reason: the page card stays this ground's `firstElementChild` */}
            {page === 2 ? <PageTwoPill onBack={() => leavePageTwo('pill')} /> : null}
            {/* B9's CONTENT-SOURCE PILL at the canvas foot (FR-D15, FR-D22), and LAST for the same reason the chip is:
                the page card must stay this ground's `firstElementChild`, which is how the harness and step 27's
                gutter find it. R-166 builds it at 24px inside R-139's existing 32px ground, so it clears the card on
                every device and `py-8` does not move — the measurement the deployed walk makes first. */}
            <SourcePill
              subject={previewing.subject}
              rows={subjectRows}
              fellBack={previewing.fellBack}
              refusal={subjectRefusal}
              onChoose={chooseSubject}
            />
          </div>
          {/* P0-1's toolbar and its link panel, and S4b's quick-action pill: all pressed, so all outside the frame
              (AD-21) — and all hidden from the first canvas scroll, placed again 150ms after the last, and in Preview */}
          <InlineTools id="canvas-inline" session={session} selection={inlineAt} hidden={scrolling || preview} resources={links} handle={tools} />
          <SectionPill
            shown={!!pointed}
            canAdd={canAdd}
            hidden={scrolling || preview}
            boxOf={pillBox}
            // FR-D5: a site-wide section is one shared instance, so its Duplicate is absent here as it is in Layers
            canDuplicate={pointed?.doc !== SITE.key}
            // S4b + S6's ring, on the section itself (B1b's claim). Null — so the arrows, the counter and
            // Shuffle are all absent — wherever the hovered section's category holds one design.
            ringCount={pointedRing.length > 1 ? pillPosition(pointedRing.findIndex((e) => e.id === pointed?.designId), pointedRing.length) : null}
            onPrevDesign={() => stepDesign(hovered, -1)}
            onNextDesign={() => stepDesign(hovered, 1)}
            onShuffle={() => onShuffle(hovered)}
            name={pointed?.layerName ?? ''}
            pillRef={pill}
            onDuplicate={() => pointed && onDuplicate(pointed)}
            onDelete={() => pointed && onRemove(pointed)}
            // S4b's "+ Add section", on the gap under the hovered section: the picker opens at THAT gap
            onAdd={() => openPicker(hovered ? stack.findIndex((i) => same(i, hovered)) : null)}
            gripProps={pillGrip}
            onWheel={wheelToCanvas}
            onPointerLeave={(e) => {
              // leaving the pill for the canvas is the canvas document's own `pointerover`; leaving it for a panel or
              // the bar reaches neither document, so the hover is let go here. Never mid-drag, which holds the pointer.
              const f = frame.current?.getBoundingClientRect()
              if (drag || !f) return
              if (e.clientX < f.left || e.clientX > f.right || e.clientY < f.top || e.clientY > f.bottom) point(null)
            }}
          />
        </section>

        {controls.folded ? <Rail fold={controls} label="Show controls" controls="editor-controls" side="right" hidden={preview} /> : null}
        {/* STORY 5.17 — B5a: THE SETTINGS SIDEBAR DIMS TO 55% and the canvas stays fully legible. The controls stay
            VISIBLE so the reader can see what is set, stay in the tab order and stay announced — `aria-disabled` on
            the panel, never `inert` and never `hidden`, either of which would take them out of the accessibility
            tree and leave a screen-reader user unable to read their own site. NOTHING RESPONDS because `commit()`
            is the one door and refuses: every control is CONTROLLED by the value in force, so a press never moves
            it, not even for a frame. The panel still SCROLLS, which is what `pointer-events-none` would have cost.
            Layers is untouched — the frame dims this one aside and no other.
            WHY IT IS DESCRIBED AND NOT `aria-disabled`: `aria-disabled` is not a global ARIA attribute, so on a
            `complementary` landmark it is `aria-allowed-attr` — a WCAG 4.1.2 violation axe reports. `describedby`
            points at B5a's own sentence, which is the honest answer to "why does nothing here respond". */}
        <aside
          id="editor-controls"
          aria-label={chosen ? 'Section settings' : 'Page settings'}
          hidden={controls.folded || preview}
          aria-describedby={lock.holder ? undefined : 'editor-lock-reason'}
          data-readonly={lock.holder ? undefined : ''}
          className={`flex w-[280px] shrink-0 flex-col gap-4 overflow-y-auto border-l border-line bg-paper p-4 ${slimScrollbar} ${
            lock.holder ? '' : 'opacity-[.55]'
          }`}
        >
          {/* -6px each way: the 28px toggle leaves the label where S4a draws it, 16px from the top */}
          <div className="-my-[6px] flex items-center justify-between gap-2">
            {/* the instance's layer name, as Layers prints it, with S4c's CATEGORY WORD beneath it (Story 5.11):
                the name is the customer's and the category is the library's, and the panel says both. S4c's
                "4 / 18" is not here — it is the Design block's counter, three lines below. */}
            <span className="flex min-w-0 flex-col">
              <PanelLabel id="editor-panel-name">{chosen ? chosen.layerName : 'Page'}</PanelLabel>
              {chosen && entry ? <span id="editor-panel-category" className="truncate text-[11.5px] text-ink-soft">{entry.categoryTitle}</span> : null}
            </span>
            <IconButton ref={controls.hide} label="Collapse controls" title="Collapse controls" aria-expanded aria-controls="editor-controls" onClick={() => controls.toggle(true)}>
              <Panel size={15} className="-scale-x-100" />
            </IconButton>
          </div>
          {chosen && entry ? (
            <>
            {/* B1a — the Design block, ABOVE the settings groups and inside none of them (FR-F3: the design
                picker is not a setting). With one design in the ring it is the counter, the name and one
                sentence; with more it grows its arrows and its strip (the key chips and the Try-a-design card were built and
                removed at the owner's test of 2026-09-20, findings 3 and 4)
                on its own, because every count in it is derived (R-158). */}
            <DesignPicker
              ring={chosenRing}
              at={chosenAt}
              target={chosen.target}
              rows={rows}
              pool={pool}
              icons={icons.current}
              mode={mode}
              src={src}
              subject={previewing.subject}
              // Story 5.14 — a tile previews the page as the visitor View as is previewing, through the same door
              member={viewAs}
              onDesign={(to) => onDesign(chosen, to)}
              onStep={(by) => stepDesign(chosen, by)}
            />
            {/* R-113's panel, mounted and not redrawn, fed what `/pilots` feeds it */}
            <Sidebar
              // Story 5.16: keyed ACROSS THE PAGE SWITCH — page 2's copy of a section is that section — so the panel stays
              // mounted, its open groups stay open, and focus stays on D5d's row when the row was pressed
              key={acrossPages(chosen)}
              entry={entry}
              state={chosen}
              onChange={onChange}
              // Story 5.6 — the mode's own swatch values, so the Background-role dots are the colours the canvas
              // is actually painting; the mode itself scopes every resolution, write and reset in the panel
              swatches={swatches[mode]}
              mode={mode}
              // R-135: absent on a Light-only project — `sidebar.tsx` draws no row at all without this
              onClearDark={darkEnabled ? () => askClearDark(chosen) : undefined}
              // Story 5.16 — D5d's row, on the main feed of a page that has a page 2 (R-176): a plain callback, never an edit
              page={feedHere !== null && same(chosen, feedHere) ? { value: page, onChange: choosePage } : undefined}
              // Story 5.16a — WHERE THE PANEL IS, which is all R-186 and R-187 need before a field offers
              // `{page_number}`: the page on screen (the same `page` the pill and the address read, threaded rather
              // than derived a second way, because the panel is keyed ACROSS the switch) and whether this section is
              // the site's own — the instance's own stamp, which `stackOf` sets (R-187: a header is on every page).
              shownPage={page}
              siteWide={chosen.doc === SITE.key}
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
                      // Story 5.14: R-124's caption follows View as — R-168's "left out, and the panel says for whom"
                      previews: viewAs,
                      onChange: (value) => edit(chosen, (doc) => setMemberVisibility(doc, chosen.instanceId, value)),
                    }
                  : undefined
              }
            />
            </>
          ) : (
            <EmptyPanel title="Nothing selected" instruction="Click any section on the canvas — its controls appear here." />
          )}
        </aside>
      </div>

      {/* STORY 5.15 — B3b's floating bar (`B Missing Surfaces.dc.html:700-710`), the one piece of chrome Preview keeps:
          the way back and the three devices, the current one lit. Its devices are the top bar's own control and
          handler (`pickDevice`, R-141), so a device chosen here is the device you come back to. */}
      {preview ? <PreviewBar device={device} onDevice={pickDevice} onBack={leavePreview} back={backButton} /> : null}

      {/* A completed move, announced politely in `moveSection`'s own words — from here, so a drop on either grip
          (a Layers row's or the canvas pill's) reads out through one live region (UX-DR12) */}
      <p id="editor-said" aria-live="polite" className="sr-only">
        {said}
      </p>

      {/* STORY 5.17 — UX-DR12'S SECOND REGION, AND IT IS ASSERTIVE: the edit-lock request and the take-over notice
          are the only two things in this editor that interrupt, because one is a request waiting on this person and
          the other is work that is already gone. `#editor-said` above STAYS POLITE — widening it would make every
          design-ring announcement, every Shuffle and every completed move shout. Nothing else writes here. */}
      <p id="editor-announced" aria-live="assertive" className="sr-only">
        {announced}
      </p>

      {/* FR-D5's site-wide confirm, for both entry points: a Layers row's menu (Hide or Delete), and the canvas pill's bin.
          STORY 5.16 — AND R-180's ASK, the same dialog adapted to a change made on page 2: "Change {name} everywhere?",
          `lib/page-two.ts`'s words, opening on Cancel. Cancel — the button, Esc or the scrim — drops the held change and
          repaints; Change it everywhere lands it. Hide and Delete keep their own words on every page, and on page 2 their
          confirm IS that section's ask. */}
      <dialog
        ref={confirm}
        onClick={closeOnBackdrop}
        onClose={() => {
          holding.current = null
          // a held change that was not confirmed is dropped: the canvas is painted again from the docs, so a stamp or a
          // typed character it already showed goes with it
          if (ask?.kind === 'change' && !asked.current.has(ask.pick.instanceId)) paint()
        }}
        aria-labelledby="editor-sitewide-title"
        aria-describedby="editor-sitewide-body"
        className={`${sheet} gap-[18px]`}
      >
        <div className="flex flex-col gap-[6px]">
          <h2 id="editor-sitewide-title" className={title}>
            {ask?.kind === 'change' ? SITE_WIDE_ASK.title(ask.name) : `${ask?.kind === 'remove' ? 'Delete' : 'Hide'} ${ask?.name ?? 'this section'}?`}
          </h2>
          <p id="editor-sitewide-body" className="text-ui-dense leading-[1.55] text-ink-soft">
            {ask?.kind === 'change' ? (
              SITE_WIDE_ASK.body
            ) : (
              <>
                This section is site-wide: it is one shared thing that appears on every template of your site, so{' '}
                {ask?.kind === 'remove' ? 'deleting' : 'hiding'} it here changes all {templates}{' '}
                templates.
              </>
            )}
          </p>
        </div>
        <div className="flex justify-end gap-[10px]">
          <Button type="button" variant="secondary" size={36} data-cancel onClick={() => confirm.current?.close()}>
            {SITE_WIDE_ASK.cancel}
          </Button>
          <Button
            type="button"
            variant={ask?.kind === 'remove' ? 'danger' : 'coral'}
            size={36}
            onClick={() => {
              if (!ask) return confirm.current?.close()
              // on page 2 this confirm IS the section's ask (R-180): the change it confirms, and every one after it on
              // this visit, lands without asking again
              asked.current.add(ask.pick.instanceId)
              if (ask.kind === 'change' && ask.held.also !== undefined) asked.current.add(ask.held.also)
              confirm.current?.close()
              if (ask.kind === 'change') {
                // a site doc that moved while the dialog was open (a hydrate landing) is not overwritten by the stale
                // hold: the change is dropped and the next one asks again
                if (latest.current.docs[SITE.key] !== ask.held.base) {
                  asked.current.delete(ask.pick.instanceId)
                  paint()
                  return
                }
                commit(ask.held.written, ask.held.touched)
                paint()
                if (ask.held.said !== undefined) setSaid(ask.held.said)
                return
              }
              edit(ask.pick, (doc) => (ask.kind === 'remove' ? removeSection(doc, ask.pick.instanceId) : setHidden(doc, ask.pick.instanceId, true)))
            }}
          >
            {ask?.kind === 'change' ? SITE_WIDE_ASK.confirm : ask?.kind === 'remove' ? 'Delete section' : 'Hide section'}
          </Button>
        </div>
      </dialog>

      {/* STORY 5.8 — ANOTHER SESSION WROTE. `addendum.md` §AD1.1 resolves a differing revision at LOCK ACQUISITION and
          there is no lock until Story 5.17, but a second tab is reachable today — so this is the honest stop-gap, in
          the app's one dialog vocabulary and inventing none of its own. NOTHING OF THEIRS IS THROWN AWAY: the RPC
          wrote nothing, the local doc is untouched, and a reload IS a hydrate, so Reload runs §AD1.1's second row
          exactly — the cloud doc replaces the local one and the journal is cleared. Not now leaves the indicator at
          "Saved on this device", which is TRUE, and the next flush asks again. Opens on the way OUT (R-115, UX-DR14),
          which here is "Not now": losing this session's work is what the dialog is about. */}
      <dialog
        ref={conflict}
        onClick={closeOnBackdrop}
        aria-labelledby="editor-conflict-title"
        aria-describedby="editor-conflict-body"
        className={`${sheet} gap-[18px]`}
      >
        <div className="flex flex-col gap-[6px]">
          <h2 id="editor-conflict-title" className={title}>
            This project was changed somewhere else
          </h2>
          <p id="editor-conflict-body" className="text-ui-dense leading-[1.55] text-ink-soft">
            Another tab or another device has saved this project since you opened it, so we have not sent your latest
            changes — nothing of yours has been overwritten. Reloading brings that version in and starts again from it,
            which means the changes you have made in this tab since then will be let go.
          </p>
        </div>
        <div className="flex justify-end gap-[10px]">
          <Button type="button" variant="secondary" size={36} data-cancel onClick={() => conflict.current?.close()}>
            Not now
          </Button>
          <Button
            type="button"
            variant="coral"
            size={36}
            onClick={() => {
              conflict.current?.close()
              window.location.reload()
            }}
          >
            Reload
          </Button>
        </div>
      </dialog>

      {/* STORY 5.17 — B5b, the request as it reaches the HOLDER. A popover and not a modal: the holder is
          mid-sentence. It is mounted only while a request is outstanding, so its countdown starts with it. */}
      {nudged ? (
        <LockRequest
          owed={unsyncedEdits(journal)}
          handingOver={lock.handingOver}
          failed={lock.handOverFailed}
          onHandOver={() => void handOver()}
          onKeep={() => void keepEditing()}
          // F-079: it runs out only when nobody is there — every interaction inside it, focus and a resting pointer
          // included, has already put the countdown back to the start.
          onExpire={() => setDismissed(lock.row?.request ?? null)}
        />
      ) : null}

      {/* STORY 5.17 — B5c. Mounted always so `openOnCancel` has a dialog to open; a closed `<dialog>` draws
          nothing. Its strings are props, which is the whole of what this story owes D8g (DW-238). */}
      <LockTakeover
        dialog={takeover}
        body={LOCK_COPY.takeoverBody(lock.askedAt === null ? 0 : Date.now() - lock.askedAt, (lock.row?.unsyncedEdits ?? 0) > 0)}
        owed={lock.row?.unsyncedEdits ?? 0}
        taking={lock.taking}
        onConfirm={() => void takeOver()}
      />

      {/* R-147's card, opened by `?` — the editor draws no account menu (`shell.tsx:295-297`), so this is its only
          door from in here. Its rows are the map's own (R-145): exactly the keys that work. */}
      <ShortcutsSheet dialog={shortcuts} />

      {/* STORY 5.10 — S5a's Section Picker. MOUNTED ON THE FIRST OPEN AND KEPT (the owner's ruling of 2026-09-20,
          Question 5): a closed `<dialog>` is `display:none`, which keeps every preview's browsing context alive
          without drawing anything, so the second and every later `⌘K` is instant — and a customer presses `⌘K` once
          per section they add, which is what he asked about. A RESTING editor that has never opened it still carries
          no frames at all. `onClose` is the platform's — `Esc`, the ×, a press on the scrim — and the platform also
          returns focus to whatever opened it; the one thing it cannot do is put focus back on a control that has
          since gone (the hover pill the placement itself cleared), so the canvas catches it. */}
      {opened ? (
        <SectionPicker
          dialog={picker}
          open={picking}
          entries={entries}
          file={canvas.file}
          siteFile={SITE.file}
          rows={rows}
          pool={pool}
          icons={icons.current}
          mode={mode}
          onMode={flip}
          darkEnabled={darkEnabled}
          src={src}
          // EXPERIENCE.md:877 — a preview card wears the project's content source, which since this story includes
          // WHICH page it is: a card previewing a different post from the canvas behind it shows the wrong shape
          subject={previewing.subject}
          // Story 5.14 — and as the visitor the canvas behind it is previewing (FR-D16)
          member={viewAs}
          refusal={pickerRefusal}
          onAdd={onPlace}
          onClose={() => {
            setPicking(false)
            setPickerRefusal(null)
            if (document.activeElement === document.body || document.activeElement === null) stage.current?.focus()
          }}
        />
      ) : null}

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
