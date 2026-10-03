'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { memo, Profiler, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore, useTransition, type CSSProperties, type HTMLAttributes, type PointerEvent, type RefObject } from 'react'
import { createPortal } from 'react-dom'
import { categoryOf, DEFAULT_LIMIT, isPaywallDesign, orbitWeekly, PAGINATED_TARGETS, paywallRing, postAccess, ringFor, type IconLookup, type SectionRegistryEntry } from '@inflozo/library'
import {
  clearDarkOverrides, darkOverridesInForce, defaultContent, designate, duplicateSection, FEED_KEY, feedBase, feedlessArchive,
  feedQuery, getPath, insertSection, isDesigned, isFeed, mainFeedOf, makeMainFeed, moveSection, removeSection,
  renameSection, serializeMarks, setContent, setHidden, setMemberVisibility, stampControls, storedFor, switchDesign,
  withData,
} from '@inflozo/section-runtime'
import type { ControlState, DocInstance, FeedRole, MarkNode, MemberState, Mode, ProjectDoc, PropValue, RuntimeElement, SynthesisLibrary } from '@inflozo/section-runtime'
import { loadIcons } from '@/components/controls/icon-picker'
import { HowReadersReachIt, Layers, type LayerRow, type SectionDrag } from '@/components/controls/layers'
import { DesignPicker } from '@/components/editor/design-picker'
import { DeviceSwitch, ViewportChip } from '@/components/editor/device-switch'
import { ModeToggle, modeShown, modeWords } from '@/components/editor/mode-toggle'
import { PageTwoPill } from '@/components/editor/page-two-pill'
import { LockBar } from '@/components/editor/lock-bar'
import { LockRequest } from '@/components/editor/lock-request'
import { LockTakeover } from '@/components/editor/lock-takeover'
import { PaywallNotice } from '@/components/editor/paywall-notice'
import { PreviewBar, PreviewButton } from '@/components/editor/preview-toggle'
import { RemixDice, type RemixHandle } from '@/components/editor/remix-dice'
import { SectionPicker, type Placement } from '@/components/editor/section-picker'
import { SmallScreenNotice } from '@/components/editor/small-screen-notice'
import { SourcePill } from '@/components/editor/source-pill'
import { SaveState } from '@/components/editor/save-state'
import { openShortcuts, ShortcutsSheet } from '@/components/editor/shortcuts-sheet'
import { TemplateSwitcher } from '@/components/editor/template-switcher'
import { ViewAs } from '@/components/editor/view-as'
import { CanvasNote, InlineTools, type InlineToolsHandle, type ScreenSelection } from '@/components/controls/mark-toolbar'
import { SectionPill, type PillBox } from '@/components/controls/section-pill'
import { Sidebar, type Edit } from '@/components/controls/sidebar'
import { MainFeedChip, ProBadge } from '@/components/kit/badge'
import { AddButton, Button, IconButton } from '@/components/kit/button'
import { closeOnBackdrop, openOnCancel, sheet, title } from '@/components/kit/dialog'
import { EmptyPanel } from '@/components/kit/empty-panel'
import { Skeleton } from '@/components/kit/loading'
import { ReadOnly, ring, slimScrollbar } from '@/components/kit/greyed'
import { ChevronLeft, InfoCircle, Laptop, Moon, Panel, Pause, PreviewEye, Redo as RedoIcon, Refresh, Sun, Undo as UndoIcon, X } from '@/components/kit/icons'
import { glyphOf, LayerThumb } from '@/components/kit/layers-row'
import { Menu, type MenuItem } from '@/components/kit/select'
import { PanelLabel } from '@/components/kit/labels'
import { movesByItself, startBehaviours } from '@/lib/behaviours'
import { canvasAssets, canvasSrc, paywallPage, renderSection, rowsFor, sampleRows, shownRows, sitePage, surfaceSheetSrc, wheelToFrame, type DesignRows, type Queries, type RenderContext, type SitePage } from '@/lib/canvas'
import { chromeLayers, dropChromeLayers, pinned, place, prepareChrome, type ChromeLayers } from '@/lib/canvas-layer'
import { DESKTOP, DEVICES, deviceShown, fitFor, type Device } from '@/lib/device'
import { COMPACT, PHONE } from '@/lib/floor'
import { CANVASES, canvasOfPageTwoKey, canvasOfPath, canvasOfTemplateKey, canvasPath as pathOfCanvas, fileOfKey, isSiteFooter, isSurface, landWithin, settingsPath, SITE, siteSlot, syncPath, templateKeyOf, type CanvasKey } from '@/lib/editor'
import { ANNOUNCEMENT_CSS, announcementFor, buttonMarkup, GHOST_ROWS, GHOST_WORDS, ghostName, ghostRowsOf, portalFor, readHidden, rowsOn, SHEET, shimsOn, stripMarkup, SURFACE, writeHidden, type Shim, type SurfaceId } from '@/lib/ghost-surfaces'
import { adminAt, askLine, membersOff, PAYWALL_WORDS, tierText } from '@/lib/paywall'
import {
  append, autoFrom, backoffSeconds, canRedo, canUndo, EMPTY_JOURNAL, flushed, flushPayload, FLUSH_MS,
  flushDecision, hydrationFor, isSentMessage, journalCleared, maxSeq, ownFlushLanded, redo as redoIn, restingState,
  SENT_CHANNEL, undo as undoIn, SYNC_TIMEOUT_MS, unsynced, unsyncedEdits, vanishedDesign, type FlushCall, type Journal,
  type Restore, type SyncState,
} from '@/lib/journal'
import {
  askedNow, edgePoll, HEARTBEAT_MS, isStale, LOCK_COPY, NUDGE_MS, partyOf, type AskedOf, type LockRow,
} from '@/lib/lock'
import { askLock, lockSignals, lockUrl, tabSession, tabSessionKept, type LockAnswer, type LockSignal } from '@/lib/lock-client'
import { edits, holdsCaret, IN_PREVIEW, KEYMAP, shortcutFor, SINGLE_KEY, type Gesture } from '@/lib/keymap'
import { BACK_SAID, PAUSED, PAUSED_SAID, PREVIEW, PREVIEW_SAID } from '@/lib/preview'
import { remixFold, remixPicks, remixSaid, remixable } from '@/lib/remix'
import { announce, pillPosition, shuffleTo, step } from '@/lib/ring'
import { invokedAt, isSiteWide, offeredHere } from '@/lib/picker'
import { askToPersist, openLocal, type LocalStore } from '@/lib/local-store'
import { arrowKeys, closeMenus, openMenu } from '@/lib/menu'
import { committed, EMPTY_DOC, templatesOpen } from '@/lib/round-trip'
import {
  carry, COPY_MARKER, editedDoc, ENTERED_SAID, follows, followersOf, leftBecause, LEFT_SAID, mainFeedOn, offersPageTwo,
  ownKeyOf, PAGE_TWO_WORDS, pageFileOf, pageInForce, SITE_WIDE_ASK, stackOf, type Page, type Placed,
} from '@/lib/page-two'
import { startInline, type Inline, type InlineSelection } from '@/lib/inline'
import { captureLayout, landingAt, oneValue, type Layout } from '@/lib/reorder'
import { canvasFirst, counted, useHanded, useSaid, useStable } from '@/lib/renders'
import { escDeselects, hold, HOLD_IDLE, HOLD_MS, rootFrom, samePropElsewhere, sectionRoots, takeStamps, withState, type HoldEvent, type Stamp } from '@/lib/selection'
import { GONE, SAVE_UNANSWERED, SUBJECT_SAID, bundledSource, cappedPosts, clearPending, hasSubject, readPending, siteSubjects, subjectOptions, writePending } from '@/lib/preview-subject'
import {
  bindingReads, feedShortfall, getShortfall, keyOf as liveKey, LISTS, LIVE_WORDS, named, PUBLIC_TIERS, reader, retriable, SEARCH_DEBOUNCE_MS,
  searchFor, searchInForce, SETTINGS, siteLinks, siteTotal, subjectRead, withFound, type Cause, type LiveQuery,
} from '@/lib/live-content'
import { ADDED_AS_MAIN, CAPPED_LIST, FEEDLESS, NOW_MAIN, withTransfer } from '@/lib/data-group'
import { liveStore, type LiveStore } from '@/lib/live-client'
import { VIEW_AS_SAID, afterChange, seen, type Viewed, type Visitor } from '@/lib/view-as'
import { isApp, stripApp } from '@/routing'
import { recheckSite, setPreviewSubject, setViewedStates } from './actions'
import { EditorSkeleton } from './editor-skeleton'
import type { EditorData } from './read'
import { StylePackCard, StylePackHead, StylePackRoster } from './style-pack'

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

   THE PAINT REDRAWS ONLY WHAT CHANGED (Story 5.23a — R-206, R-208): A DESIGN CHANGE REPLACES ONE SECTION, AND A MOVE MOVES
   ONE. `paint()` keeps a record of what it drew, per section — the JSON of the stack entry it drew from, EVERY top-level
   node its part parsed to (a part may open with a comment), its root and its stamps — and the render context all of them
   were drawn under. A section whose entry and context are unchanged keeps its nodes; any other is rendered and parsed
   ALONE, with an element of `#canvas`'s kind as the parse's context, in a full repaint too; then every drawing's nodes
   are put in stack order. So another canvas, page, mode, visitor, subject or source, Preview, or a read that lands (the
   store's `version()`) repaints the page — one walk, which a full repaint takes with nothing to reuse. A record is
   trusted only while nothing else has written its section, so whatever writes one outside `paint()` drops it: the
   control stamp, an inline editing session, a mode flip (every record), and the two that take the page's roots away.
   Everything after the write is as after a full repaint: editing ended, `core` stopped before and started after,
   `mark()`, the shims — and the hover as a customer sees it. A full repaint let the hover go and the browser hovered the
   new node under a resting pointer again; a kept node gets no such word from the browser, so a hover whose section was
   kept stays (R-209, the owner's reading of the story's "the hover clears"). The Paywall surface keeps its own page write and no records. The keyboard gate
   proves it on the harness's long Home, node for node against a full repaint; the frame times are NFR-1's manual trace
   (`tools/perf/fps-trace.mjs`).

   THE PANELS REDRAW ONLY WHAT CHANGED, AND THE CANVAS COMES FIRST (Story 5.23b — R-208, R-210). Every part beside the canvas
   is a `memo` part handed values that keep their identity while unchanged: the Layers rows and the rail's, the Controls
   panel (its Design block and its settings), the bar's controls, the chrome and the pill. The derivations they are drawn
   from are memoized on what they read, the selected and the pointed sections are kept BY VALUE (a stack rebuilt around them
   hands the panel the same object), and every handler a part is given is of fixed identity (`lib/renders.ts`'s
   `useStable`), calling the latest committed render. The drag in flight is a store of one value that Layers alone reads
   (`lib/reorder.ts`), so a pointer move redraws the slot and the rows it slides and not the editor. React's own
   `<Profiler>` inside each part counts its renders, and the keyboard gate reads the counts on the long Home.
   R-210 (owner, 2026-09-28): A SECTION OPERATION — a design change, a move, hide or show, duplicate, delete, a placement,
   Remix, undo and redo — paints the canvas and moves `latest` in the press's own task, and HANDS React its state over in
   the next (`apply`, `restore` → `lib/renders.ts`'s `canvasFirst`; every state here is `useHanded`), so the panels follow a
   frame later and the press's task stays short; a drop's slot stays until its row lands. Not a React transition: those
   wait for whatever server call is in flight (the deployed walk found it). A control change stays in its own frame
   (FR-F4). Because a render can be drawn before a hand-over lands, `latest` is written by the HANDLERS for what they
   change and by a commit only for what it derives, never from a render's own state; the chrome and the pill are placed
   from the paint's CURRENT roots, never against one a paint removed; and a press on a Controls panel still drawn for a
   replaced design or section is dropped, never written (`onChange`).

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
   it draws no node and has a null root exactly as a gated section does; R-124's Member visibility is an instance field
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
   reported. `1` `2` `3` are Story 5.9's whole keyboard map.

   THE FLOOR (Story 5.22 — D4f, D8, R-201, R-202). ONE GATE AND ONE REARRANGEMENT, and both rules are `lib/floor.ts`'s. A
   PHONE — a touch screen whose shorter side is under 500px — never mounts this shell: `Editor` below asks `PHONE` once,
   in the browser, as the project opens, and draws D4f's Small Screen Notice instead, so no lock, heartbeat, sync,
   IndexedDB or live read ever starts there; the server always draws the skeleton, in the device's shape by CSS (R-98).
   Every OTHER touch screen, and a fine-pointer window below 1280 (a 1440 display at 200% zoom included, WCAG 1.4.4),
   gets D8's ONE rearrangement, live (`COMPACT`): Layers is the icon rail and opens over the canvas, Controls is an
   overlay on the right that a pick opens, behind a scrim that stops at the rail, and the bar's right-hand cluster moves
   WHOLE into one ⋯ menu — mounted and hidden, its rows calling the controls' own handlers (R-141) in their own words
   (R-170). The pointer changes only target sizes (`D8:33`): 44px on touch, by ONE rule in `globals.css`. Opening a
   panel never resizes the canvas, one overlay is open at a time (`D8:283`), and nothing reads or blocks browser zoom.

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

   LIVE CONTENT FROM THE CONNECTED SITE (Story 5.18 — B9's connected state, D5e's SOURCE group, FR-H4, AD-10). On a
   project linked to a readable site THE BROWSER READS THE SITE'S CONTENT API ITSELF, through ONE store per session
   (`lib/live-client.ts`: a 60 s cache, one request per key shared by the canvas, the picker's cards, the ring's tiles,
   D5e and the Link Picker, a ceiling, and a failure policy that never retries a refusal, because Ghost counts every
   failure against the customer's own network). Reads are triggered by what the customer does — opening the editor, a
   canvas, a subject, page 2, a source, a picker — through `request()`, which paints ONCE when they land; a paint never
   reads, and an edit's repaint reads nothing. What the site answers goes through the library's own `resolveSubject`
   and `assemble` (`lib/canvas.ts`'s `sitePage`), so a render given no live content is today's render byte for byte,
   and A RENDER IS ONE SOURCE THROUGHOUT: a page whose reads are not all in hand is sample content from end to end. The
   source is a VIEW like View as and the device — session state, never stored, never an edit, live for a reader — and
   the pill says what the LAST PAINT used (R-165), with the cause in words. The body is never read (`formats=mobiledoc`,
   MEASUREMENTS §51), and the key never reaches the render context, the markup or a log.

   STORY 6.2 — S4a'S STYLE PACK CARD AT REST, AND S7a'S ROSTER BEHIND ITS CHANGE (`style-pack.tsx`), LOOKING ONLY: the card
   is 6.2's and Change opens the list, which is a view and so stays live while reading along (R-192); choosing a pack —
   a cell that switches, the canvas wearing it — is 6.3's (R-118), and so is reaching the list below 1280, where the panel
   is an overlay a selection opens (DW-322).

   ABSENT, NOT GREYED (UX-DR3), each until its story: Ship it (7.18), the name's rename underline (no story yet) and
   the Style Pack switch (6.3) (R-118); S4's own "Dark mode / Readers get a moon toggle" sidebar row, which is the
   VISITOR's `mode-toggle` and a different setting (`EXPERIENCE.md:652`) whose refusal has nothing to read before
   Epic 7 (R-118 a third time); clicking an icon on the canvas, its empty slot and a button's icon (9.1, R-121), P0-1's
   docked bar at 390 (R-87), the lock pill on a text prop promoted to Ghost Admin (7.10) and P0-2's filled-slot
   popover. S4a's posts-per-page note, S4c's pinned Quick Controls card
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

/** One of the rail's section buttons (Story 5.22), a `memo` part since Story 5.23b: its fields are primitives, so a
 *  selection redraws the two whose `aria-current` changed and a hover none. Counted for the keyboard gate. */
type RailItem = { key: string; name: string; hidden: boolean; selected: boolean; doc: string; instanceId: string; category: string }

const RAIL_CELL = `inline-flex size-8 shrink-0 items-center justify-center rounded-sm transition-colors ${ring}`

const RailRow = memo(function RailRow({ id, name, hidden, selected, doc, instanceId, category, onRow }: Omit<RailItem, 'key'> & { id: string; onRow: (pick: Pick) => void }) {
  const label = hidden ? `${name}, hidden` : name
  return (
    <Profiler id="rail-row" onRender={counted}>
      <button
        type="button"
        data-rail-row={id}
        aria-label={label}
        title={label}
        aria-current={selected ? 'true' : undefined}
        onClick={() => onRow({ doc, instanceId })}
        className={`${RAIL_CELL} ${selected ? 'bg-coral-tint' : 'hover:bg-paper-sunk'} ${hidden ? 'opacity-40' : ''}`}
      >
        {/* DW-281 (Story 5.24e) — D8's own picture per kind, and its tinted edge on the selected tile (`:67`, `:197`) */}
        <LayerThumb glyph={glyphOf(category)} at="rail" selected={selected} />
      </button>
    </Profiler>
  )
})

/** STORY 5.22 — D8's ICON RAIL (`D8 Editor Below 1440.dc.html:63-73`, `:193-203`), the Layers panel's left edge: folded
 *  at full width, and always below 1280. One rail, not two — at full width the fold used to be the one Show button.
 *
 *  "Show layers", a 1px divider, one button per section of the stack the page paints, then "+" (`Add section`) where
 *  anything can be placed. Each row button is its section's kind's picture (DW-281, Story 5.24e: D8a's one per category,
 *  `LayerThumb`'s glyph) and is NAMED by its layer name — the rail has no room for the words, so they are its accessible
 *  name and hover title; the selected one carries `aria-current` and the coral tint, a hidden one is dimmed and says so.
 *  The pointer changes only target sizes (`D8:33`): 32px rows and 26 × 19 thumbs in a 44px rail on a mouse, 44px rows
 *  (the editor's touch rule) and 34 × 24 thumbs in a 56px rail on touch. The Show button sits in a head of its own, 44
 *  wide, so the rail's rule is drawn over its right edge (`after:`) rather than taking a pixel of it. Hidden in Preview,
 *  never unmounted. `memo` since Story 5.23b: a hover leaves it alone. */
const IconRail = memo(function IconRail({
  show,
  hidden,
  expanded,
  rows,
  onShow,
  onRow,
  canAdd,
  addReadOnly,
  onAdd,
}: {
  /** the fold's Show button — the rail's head, which the fold's focus handoff lands on */
  show: RefObject<HTMLButtonElement | null>
  hidden: boolean
  /** is the Layers panel open over the canvas right now (the compact overlay) */
  expanded: boolean
  rows: readonly RailItem[]
  onShow: () => void
  onRow: (pick: Pick) => void
  /** "+" is drawn where anything can be placed on this canvas */
  canAdd: boolean
  addReadOnly: boolean
  onAdd: () => void
}) {
  return (
    <div
      hidden={hidden}
      data-icon-rail
      className="relative flex w-11 shrink-0 flex-col items-center bg-paper py-[6px] after:pointer-events-none after:absolute after:inset-y-0 after:right-0 after:w-px after:bg-line coarse:w-14"
    >
      <div className="flex w-full shrink-0 justify-center">
        <button
          ref={show}
          type="button"
          aria-label="Show layers"
          title="Show layers"
          aria-expanded={expanded}
          aria-controls="editor-layers"
          onClick={onShow}
          className={`${RAIL_CELL} text-ink-soft hover:bg-paper-sunk`}
        >
          <Panel size={15} />
        </button>
      </div>
      <span aria-hidden className="my-[3px] h-px w-6 shrink-0 bg-line coarse:my-1 coarse:w-8" />
      <div className={`flex min-h-0 w-full flex-1 flex-col items-center gap-[2px] overflow-y-auto py-[2px] ${slimScrollbar}`}>
        {rows.map((row) => (
          <RailRow key={row.key} id={row.key} name={row.name} hidden={row.hidden} selected={row.selected} doc={row.doc} instanceId={row.instanceId} category={row.category} onRow={onRow} />
        ))}
      </div>
      {canAdd ? (
        <ReadOnly on={addReadOnly}>
          <button
            type="button"
            data-rail-add
            aria-label="Add section"
            title="Add section"
            onClick={onAdd}
            className={`${RAIL_CELL} mt-[2px] border border-dashed border-line-strong text-[15px] text-ink-soft hover:border-coral hover:text-coral-deep disabled:opacity-35 disabled:hover:border-line-strong disabled:hover:text-ink-soft`}
          >
            +
          </button>
        </ReadOnly>
      ) : null}
    </div>
  )
})

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

/** a canvas no visitor has been looked at as yet — one array, so a record with nothing in it keeps its identity */
const NOT_VIEWED_YET: readonly Visitor[] = []

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
  /** DW-243 (Story 5.24e): the holder and generation the request was made against — `askedNow` ends it when either moves */
  askedOf: AskedOf | null
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

type EditorProps = EditorData & {
  project: { id: string; name: string }
  /** Story 5.9 — the canvas document's address, defaulting to the app's own `/canvas`. The keyboard harness serves
   *  the SAME `pilotsCanvasDocument()` bytes from a path of its own and names it here, so the real route keeps its
   *  session guard rather than having it bypassed for a test. */
  canvasSrc?: string
  /** Story 5.20 — where this editor's canvases live when it is not the app's `/projects/<id>`: the keyboard harness's
   *  own pages (`/app/harness/editor/<key>`), so its walk can switch canvas with no database (R-146). The app passes none. */
  canvasBase?: string
  /** DW-279 — the linked site's re-read, `recheckSite` unless named. The keyboard harness names its own, which answers
   *  one fixture site with a snapshot, so a database-less journey sees a re-read that LANDS redraw Ghost's two surfaces.
   *  The app passes none. */
  reread?: typeof recheckSite
}

/** P0-1's pill on the selected section (R-122, and the limit's sentence) — the element it is placed over, and its words. */
type Note = { el: HTMLElement; kind: 'lock' | 'limit'; words: string }

/* ─── THE CANVAS CHROME (Stories 5.2 to 5.21 drew it; Story 5.23b made it a part of its own, R-208, R-210) ──────────────
 *
 * The boxes, the name tag, R-119's Pro badge, D5c's MAIN FEED chip, P0-1's pill and B3a's PAUSED chips — the editor's own
 * elements PORTALLED into the chrome hosts on the canvas document's `<body>` (`lib/canvas-layer.ts`), so the compositor
 * scrolls them with their section in the same frame. A MODULE-LEVEL `memo` part with explicit props: it redraws when what
 * it shows changes — a hover, a selection, a root a paint replaced, a root that may have changed layer (`pinTick`: a
 * scroll that sticks it, a restamp in place) — and never for the editor's other renders. The layer is asked only here.
 *
 * PLACED FROM THE PAINT'S CURRENT ROOTS, ON ONE LOOP. Position follows LAYOUT, not render — a section that grows, a header
 * that shrinks, a fold that re-fits the canvas — so a frame loop places every element; it starts when chrome shows and no
 * render restarts it. Each frame it asks `roots()` for the hovered and the selected section's root AS THE CANVAS DRAWS THEM
 * NOW — never the roots this render was drawn with, which since R-210 may be a frame behind a paint — and an element whose
 * root is gone is hidden rather than placed against a root a paint removed. Every render of this part is placed at once too,
 * before the browser paints it. */
type ChromeProps = {
  /** the canvas document's two chrome hosts, or null — nothing is drawn (Preview drops them) */
  layers: ChromeLayers | null
  fit: number
  /** the pointed section's or shim's root as this render found it — which host its chrome is drawn in */
  hovered: HTMLElement | null
  /** the hover box: a hovered selection's 1.5px selected box is its only outline (S4c) */
  outline: boolean
  /** the name tag's words, or null where nothing is pointed */
  tag: string | null
  /** the chosen section's or shim's root as this render found it */
  selected: HTMLElement | null
  /** a section or a shim is chosen: the selected box */
  chosen: boolean
  /** R-119: a Pro design on a Free plan, selected */
  pro: boolean
  /** P0-1's pill, while a SECTION is chosen */
  note: Note | null
  /** D5c's chip, on the main feed while it is pointed at or chosen — which of the two, and whether the tag is beside it */
  chip: 'hovered' | 'selected' | null
  chipBesideTag: boolean
  /** B3a's PAUSED chips: the held-still mounts that move by themselves, in the pointed and the chosen roots (R-175) */
  paused: readonly { el: HTMLElement; root: HTMLElement }[]
  /** R-119's badge, which the pill also reads (R-125: the pill sits to its left) */
  badge: RefObject<HTMLDivElement | null>
  /** which host each root's chrome was drawn in, for the canvas's scroll listener (Story 5.21's stuck test) */
  pins: RefObject<WeakMap<HTMLElement, boolean>>
  /** a sticky root stuck or came unstuck, or a restamp in place may have moved a root (a control change, a flip): which
   *  host its chrome goes in is asked again */
  pinTick: number
  /** the paint's CURRENT hovered and selected roots, read every frame */
  roots: () => { hovered: HTMLElement | null; selected: HTMLElement | null }
}

const CanvasChrome = memo(function CanvasChrome({ layers, fit, hovered, outline, tag, selected, chosen, pro, note, chip, chipBesideTag, paused, badge, pins, roots }: ChromeProps) {
  const hoverBox = useRef<HTMLDivElement>(null)
  const selectedBox = useRef<HTMLDivElement>(null)
  const tagEl = useRef<HTMLDivElement>(null)
  const chipEl = useRef<HTMLSpanElement>(null)
  const noteBox = useRef<HTMLDivElement>(null)
  /** each PAUSED chip's element, by the mount it marks */
  const chipEls = useRef(new Map<Element, HTMLElement>())
  /** Story 5.21 — a sticky root is pinned only while it is STUCK (`pinned`), and the host its chrome is drawn in is recorded
   *  for the canvas's scroll listener, which re-renders when the root's answer changes. Asked ONCE per root per render. */
  const layerFor = (root: HTMLElement | null) => {
    if (!root || !layers) return null
    const stuck = pinned(root)
    pins.current.set(root, stuck)
    return stuck ? layers.view : layers.page
  }
  const hoverLayer = layerFor(hovered)
  const selectedLayer = selected === hovered ? hoverLayer : layerFor(selected)
  const chipRoot = chip === 'hovered' ? hovered : chip === 'selected' ? selected : null
  const chipLayer = chip === 'hovered' ? hoverLayer : chip === 'selected' ? selectedLayer : null

  const placeAll = useStable(() => {
    if (!layers) return
    const now = roots()
    const put = (el: HTMLElement | null, root: HTMLElement | null, how: Parameters<typeof place>[3], offset?: { x: number; y: number }) => {
      if (!el) return
      if (!root?.isConnected) {
        if (el.style.visibility !== 'hidden') el.style.visibility = 'hidden'
        return
      }
      place(el, root, fit, how, offset)
    }
    put(hoverBox.current, now.hovered, 'fill')
    put(selectedBox.current, now.selected, 'fill')
    put(tagEl.current, now.hovered, 'top-left')
    put(badge.current, now.selected, 'top-right')
    put(noteBox.current, note?.el ?? null, 'above')
    // Story 5.15: each PAUSED chip, 8px inside its mount's bottom-left corner
    for (const { el } of paused) put(chipEls.current.get(el) ?? null, el, 'bottom-left')
    // Story 5.19 — D5c's chip, in the tag's corner: against the tag's right edge while the tag shows, centred on its
    // line, so it never covers the name (R-125); the offsets are only how that rule is delivered (R-138's precedent)
    const c = chipEl.current
    if (c) {
      const t = chipBesideTag ? tagEl.current : null
      put(c, chip === 'hovered' ? now.hovered : chip === 'selected' ? now.selected : null, 'top-left', t ? { x: t.offsetWidth + 4, y: (t.offsetHeight - c.offsetHeight) / 2 } : { x: 6, y: 6 })
    }
  })
  // every render of this part — only when what it shows changes — is placed before the browser paints it…
  useLayoutEffect(() => placeAll())
  // …and every frame while chrome shows, by one loop that no render restarts
  useLayoutEffect(() => {
    if (!layers) return
    let id = requestAnimationFrame(function loop() {
      placeAll()
      id = requestAnimationFrame(loop)
    })
    return () => cancelAnimationFrame(id)
  }, [layers, placeAll])

  return (
    <Profiler id="chrome" onRender={counted}>
      {/* The outlines (R-120): boxes over the root, whose line is an inset box-shadow spread, which paints its exact
          width where a border or an outline is floored to whole pixels: S4b's 1px (:181) and S4c's 1.5px (:293),
          `globals.css`. Inside the canvas document since the owner's finding, so they scroll with their section. */}
      {outline && hoverLayer
        ? createPortal(<div ref={hoverBox} aria-hidden data-chrome="hover" className="pointer-events-none absolute canvas-outline-hover" style={{ visibility: 'hidden' }} />, hoverLayer)
        : null}
      {chosen && selectedLayer
        ? createPortal(<div ref={selectedBox} aria-hidden data-chrome="selected" className="pointer-events-none absolute canvas-outline-selected" style={{ visibility: 'hidden' }} />, selectedLayer)
        : null}
      {/* S4b's name tag (S4 Editor.dc.html:181), drawn at its own 11px in the app's Inter. Never pressed: the pointer
          passes through to the section. */}
      {tag !== null && hoverLayer
        ? createPortal(
            <div
              ref={tagEl}
              aria-hidden
              data-chrome="tag"
              className="pointer-events-none absolute whitespace-nowrap rounded-[0_0_6px_0] bg-coral-text px-[9px] py-[3px] text-helper-caption font-semibold text-surface"
              style={{ visibility: 'hidden' }}
            >
              {tag}
            </div>,
            hoverLayer,
          )
        : null}
      {/* STORY 5.19 — D5c's MAIN FEED chip (`D5 Canvas Markers and Template Switcher.dc.html:312`), on the main feed's
          outline while it is hovered or selected and never at rest (AD-37). Chrome in the canvas layer, as the tag is,
          the pointer passing through. */}
      {chipRoot && chipLayer
        ? createPortal(
            <span ref={chipEl} aria-hidden data-chrome="main-feed" className="pointer-events-none absolute flex" style={{ visibility: 'hidden' }}>
              <MainFeedChip on="canvas" />
            </span>,
            chipLayer,
          )
        : null}
      {/* R-119, B10 (B Missing Surfaces.dc.html:1424-1451): a price tag, not a lock — the Kit's span, never a button */}
      {pro && selectedLayer
        ? createPortal(
            <div ref={badge} data-chrome="pro" className="pointer-events-none absolute flex w-max" style={{ visibility: 'hidden' }}>
              <ProBadge />
            </div>,
            selectedLayer,
          )
        : null}
      {/* P0-1's pill (R-122, and the limit's sentence): chrome in the canvas's own layer, so it scrolls with its words */}
      {note && selectedLayer ? createPortal(<CanvasNote ref={noteBox} kind={note.kind} words={note.words} />, selectedLayer) : null}
      {/* STORY 5.15 — B3a's PAUSED chip (`B Missing Surfaces.dc.html:658-661`), R-175's two conditions. Chrome in the canvas
          layer and not R-120's `::after`: inside the frame its 9.5px words would paint at 5.7px at the 1440 window's 0.6
          fit, take over a design's own `::after` and need a positioned mount. So it is the name tag's kind — one screen
          pixel per unit, Inter, the pointer passing through — in `ViewportChip`'s two rounded colours (B3a's fill and
          hairline, drawn as `paper` and `line-strong` as that chip names them), with the frame's 9px pause glyph,
          "PAUSED" at 9.5/600 tracked .02em, `2px 8px` and a 5px gap. */}
      {paused.map(({ el, root }, n) => {
        const at = root === hovered ? hoverLayer : root === selected ? selectedLayer : layerFor(root)
        return at
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
              at,
              `paused-${n}`,
            )
          : null
      })}
    </Profiler>
  )
})

/* ─── STORY 5.22 — THE GATE (R-201, D4f) ─────────────────────────────────────────────────────────────────────────────
 *
 * A PHONE NEVER MOUNTS THE EDITOR. Every mount side effect — the lock and its heartbeat, the tab session, the IndexedDB
 * hydrate, the autosave and the flushes, the Ghost re-read, the live reads, the "looked at" write — lives in
 * `EditorShell`'s effects, so NOT MOUNTING IT is the whole of keeping a phone out: no redirect, no route of its own (R-98's
 * second effect would make a `redirect()` behind the boundary a client navigation anyway).
 *
 * ASKED ONCE, IN THE BROWSER, BEFORE ANY EDITOR EFFECT RUNS: the server cannot know the pointer, so it draws the skeleton,
 * in this device's shape by CSS, and so does the first client render; a layout effect then reads `PHONE` before the
 * browser paints again. NO SUBSCRIPTION (R-201): the viewport changes under an editor in use — the device turns, a split
 * view, some keyboards — and a live re-check would unmount the editor mid-edit. The cost is one case: a small tablet
 * opened in a narrow split view keeps the notice until a reload. Both callers (the `(editor)` layout and the keyboard
 * harness) import THIS name, so both get the gate. */
export function Editor(props: EditorProps) {
  const [phone, setPhone] = useState<boolean | null>(null)
  useLayoutEffect(() => setPhone(window.matchMedia(PHONE).matches), [])
  if (phone === null) return <EditorSkeleton name={props.project.name} />
  return phone ? <SmallScreenNotice name={props.project.name} /> : <EditorShell {...props} />
}

/** The stored announcement, parsed in an INERT document — `DOMParser`'s runs nothing and loads nothing. `EditorShell` renders
 *  in the browser alone (Story 5.22's gate), so the parser is always there. */
const inertBody = (html: string) => new DOMParser().parseFromString(html, 'text/html').body as unknown as MarkNode

/** DW-223 (Story 5.24e): this TAB's store, or null where the browser refuses even to hand it over */
const tabStore = (): Storage | null => {
  try {
    return window.sessionStorage
  } catch {
    return null
  }
}

/** R-202's rule, LIVE — `useSyncExternalStore` over `matchMedia(COMPACT)`, so a window crossing 1280 (or a zoom) re-renders
 *  the one editor and remounts nothing. Module-level, so the subscription is one function for the component's life. */
const compactNow = () => window.matchMedia(COMPACT).matches
const onCompact = (change: () => void) => {
  const query = window.matchMedia(COMPACT)
  query.addEventListener('change', change)
  return () => query.removeEventListener('change', change)
}

function EditorShell({
  project,
  docs: stored,
  entries,
  postsPerPage,
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
  site,
  stylePack,
  canvasSrc: canvasPath,
  canvasBase,
  reread = recheckSite,
}: EditorProps) {
  const pathname = usePathname()
  /** the canvas document's address — and, since Story 5.19, where the sample's pictures are served for the panel too */
  const src = canvasPath ?? canvasSrc(isApp(pathname))
  // the layout 404s every segment that is not a canvas, so a null here is never drawn
  const key = canvasOfPath(stripApp(pathname)) ?? 'home'
  const canvas = CANVASES[key]
  /** STORY 5.20 — THIS CANVAS IS A TEMPLATE SURFACE (the Paywall): not a page, so no site doc, no Section Picker, no
   *  Remix and no Preview, an ink bar, C3a's strip, and a paint of its own (`paywallPage`). */
  const surface = isSurface(key)
  /* STORY 6.2 — S7a's roster in place of the rest panel: Change opens it with focus on the back button, and the back button
     or Esc returns with focus on Change. Esc is the ladder's own rung (`onEscape`). A selection replaces the rest panel, so it leaves the roster too. */
  const [packList, setPackList] = useState(false)
  const packMoved = useRef(false)
  const packBack = useRef<HTMLButtonElement>(null)
  const packChange = useRef<HTMLButtonElement>(null)
  const showPacks = (open: boolean) => {
    packMoved.current = true
    setPackList(open)
  }
  useEffect(() => {
    if (!packMoved.current) return
    packMoved.current = false
    ;(packList ? packBack : packChange).current?.focus()
  }, [packList])
  /** where a canvas lives — the app's address, or the harness's own pages (`canvasBase`) */
  const pathOf = (k: CanvasKey) =>
    canvasBase === undefined ? `${isApp(pathname) ? '/app' : ''}${pathOfCanvas(project.id, k)}` : k === 'home' ? canvasBase : `${canvasBase}/${k}`
  // STORY 5.8 — EDITS NO LONGER LIVE FOR THE SESSION. They are still held here, and they are also written to this
  // browser's IndexedDB on every `commit()` and sent to the server on the timer, at tab close and on ⌘S. The server's
  // docs are the OPENING value only: the hydrate below replaces them with the local ones when the revisions agree.
  const [docs, setDocs] = useHanded(stored)
  /** Story 5.5 — the canvases that are UNTOUCHED right now: D5a's Layers marker and D5b's hollow dot read this one set.
   *  It starts as the server's `synthesized` and `commit()` is the only thing that changes it. */
  const [auto, setAuto] = useHanded<ReadonlySet<CanvasKey>>(() => new Set(synthesized))
  /** Story 5.16 — the library as page 2 asks it: R-127's fallback in `pageTwoStack` synthesizes, and that reads the
   *  designs this editor holds. `entries` never changes in a session, so every render's copy reads the same map. */
  const library = useCallback<SynthesisLibrary>((designId) => entries[designId], [entries])
  /* ─── Story 5.19 — THE MAIN FEED AND THE DATA GROUP (FR-H2, P0·5, D5c) ──────────────────────────────────────────
   *
   * ONE RULE KEEPS EXACTLY ONE MAIN FEED ON EVERY PAGINATED PAGE, and it is the runtime's (`designate`, AD-27(d)). Every
   * door a doc enters this editor through passes it — `read.ts` on the server, the hydrate and an undo here, and `apply`
   * for every edit, with the doc before the edit as `previous` so a transfer knows where the flag stood — so placing,
   * deleting, hiding, duplicating and reassigning a feed are one rule, each part of the gesture that caused it: one
   * `apply`, one journal entry, one `⌘Z`.
   *
   * A FEED THAT IS NOT THE MAIN FEED renders ITS OWN QUERY (`feedQuery`): the page's posts, sized by the project's
   * `posts_per_page`, folded with the instance's `data.posts` — and every section's declared queries are FOLDED with its
   * Data values too. So a query is the INSTANCE's now, and its rows are too: the sample's resolved here
   * (`sampleRows`), the site's read per query through 5.18's one store (`sitePage`'s `queries`). */
  const sampleSource = useMemo(() => orbitWeekly.bundledAt(postsPerPage), [postsPerPage])
  /** the Section Picker's cards and the ring's tiles preview a DESIGN as it always did: its declared queries, resolved */
  const designRows = useMemo(() => Object.fromEntries(Object.values(entries).map((e) => [e.id, sampleRows(e.dataBindings)])), [entries])
  /** A section's queries: its design's declared ones folded with its stored Data values, and a secondary feed's own. */
  const queriesOf = (i: DocInstance & { target: string }): Queries => {
    const design = entries[i.designId]
    if (design === undefined) return {}
    const feed = feedQuery(design, i, i.target, postsPerPage)
    return { ...withData(design.dataBindings, i.data), ...(feed === undefined ? {} : { [FEED_KEY]: feed }) }
  }
  /** A section's key among a page's queries — an `instanceId` is unique inside a doc, not across the two groups. */
  const queryKey = (i: { doc: string; instanceId: string }) => `${i.doc}:${i.instanceId}`
  /** The doc as the main-feed rule leaves it — the one door, asked with the doc's own file (`fileOfKey`). */
  const designated = (docKey: string, doc: ProjectDoc, previous?: ProjectDoc) => designate(doc, fileOfKey(docKey), library, previous)
  /* ─── Story 5.16 — PAGE 2 (FR-D21, D5d, R-176 to R-180) ────────────────────────────────────────────────────────
   *
   * A CANVAS STATE beside the mode, the device, View as and Preview: session state, never in the URL, never stored,
   * never an edit. It is KEYED TO THE CANVAS it was chosen on, so the render that shows another canvas already shows
   * its page 1, and the `[key]` effect below puts it back to page 1 for good — the way back included. Which pages
   * exist, what page 2 is and which stack it paints are `lib/page-two.ts`'s; the stack KNOWS THE PAGE, so the roots,
   * the picks, the marks, the restamps, the panel's fast path and every edit agree with what is painted. */
  const [shownPage, setShownPage] = useHanded<{ key: CanvasKey; page: Page }>({ key, page: 1 })
  const page: Page = shownPage.key === key ? shownPage.page : 1
  /** the doc this canvas EDITS on the page in force — page 2's own key on page 2; the preview SUBJECT stays the canvas's */
  const own = ownKeyOf(key, page)
  // Story 5.23b: every derivation a part is drawn from is memoized on what it reads, so a render that changed none of it
  // hands the part the same value and the part skips its render (R-208)
  const stack = useMemo(() => stackOf(docs, key, page, library), [docs, key, page, library])
  /** How many templates a site-wide section really reaches — the Site-wide heading's number and the confirm's. */
  const templates = useMemo(() => templatesOpen(canvases, docs, auto), [canvases, docs, auto])
  /** D5b's third dot state: a canvas with no default stack — R-129's three and Private — that nothing has designed
   *  yet. Derived from `defaults`, which holds exactly the synthesizable canvases, so it needs no second list. */
  const empty = useMemo(
    () => new Set(canvases.filter((k) => stacks[templateKeyOf(k)] === undefined && !isDesigned(docs[templateKeyOf(k)] ?? EMPTY_DOC))),
    [canvases, stacks, docs],
  )
  const [selected, setSelected] = useHanded<Pick | null>(null)
  const [hovered, setHovered] = useHanded<Pick | null>(null)
  /** R-217 (Story 5.24e): where the pointed section was pointed at from — the canvas, or its Layers row (`point`) */
  const [pointedFrom, setPointedFrom] = useHanded<'canvas' | 'layers'>('canvas')
  const hoverVia = useRef<'canvas' | 'layers'>('canvas')
  const [paints, setPaints] = useHanded(0)
  /** Story 5.6 — the mode the canvas is SHOWING. Session state, like `pilots/review.tsx`'s: it is never in the URL
   *  (`lib/editor.ts`) and never a stored per-canvas preference. A Light-only project has no way to leave 'light'. */
  const [mode, setMode] = useHanded<Mode>('light')
  /** Story 5.7 — the device the canvas IS. Session state like the mode, for the same reason: it is a property of the
   *  person looking and not of the canvas, so it survives a canvas switch (this component stays mounted), resets to
   *  Desktop on reload, and no column stores it. R-137 makes Desktop a viewport too, so there is no state in which the
   *  card fills the room available. */
  const [device, setDevice] = useHanded<Device>(DESKTOP)
  /** Story 5.14 — the visitor the canvas PREVIEWS (FR-D16). Session state like the mode and the device, and for the
   *  same reason: it is a property of the person looking and not of the canvas, so it survives a canvas switch (this
   *  component stays mounted), goes back to the logged out user on reload, and is never in the URL or a column —
   *  `EXPERIENCE.md:230` makes View as a mode. It reaches every surface through `renderSection`'s one `member` option:
   *  the canvas, R-124's caption, the Section Picker's cards and the Design ring's tiles. */
  const [viewAs, setViewAs] = useHanded<Visitor>('anonymous')
  /** Story 5.15 — PREVIEW (FR-D20, B3a · B3b). Session state like the mode, the device and the visitor, and for the
   *  same reason: `EXPERIENCE.md:230` makes it a mode. It is never in the URL, never stored and never an edit — nothing
   *  reaches `commit()`, the journal or `⌘Z` — and a reload is back to editing. View as, the mode, the device and the
   *  preview subject all carry into it, because `paint()` reads them all through `latest`. */
  const [preview, setPreview] = useHanded(false)
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
  /** DW-223 (Story 5.24e): the picks this tab made whose writes had not answered when it last went — a reload in that
   *  moment. They win over what the server holds, and are sent again on opening (below). The shell mounts in the browser
   *  alone (Story 5.22's gate), so the store is there to read. */
  const [waiting] = useState(() =>
    Object.fromEntries(canvases.flatMap((canvas) => {
      const pick = hasSubject(CANVASES[canvas].file) ? readPending(tabStore(), project.id, templateKeyOf(canvas)) : null
      return pick === null ? [] : [[templateKeyOf(canvas), pick] as const]
    })))
  const [subjects, setSubjects] = useHanded(() => ({ ...storedSubjects, ...waiting }))
  /** the last save's refusal, carried in the menu: the choice stands for the session and will not survive a reload */
  const [subjectRefusal, setSubjectRefusal] = useHanded<string | null>(null)
  const [, startSubject] = useTransition()
  const subjectTurn = useRef(0)
  /** the bundled publication — the sample content (R-165) */
  const bundled = useMemo(bundledSource, [])
  /** the subject stored for this canvas, whichever source it was chosen from (Story 5.18) */
  const storedSubject = subjects[templateKeyOf(key)] ?? null

  /* ─── Story 5.18 — LIVE CONTENT FROM THE CONNECTED SITE (FR-H4, AD-10, FR-D15, B9, D5e) ─────────────────────────
   *
   * `site` is SERVER TRUTH (`read.ts`): readable, unreadable with its reason, or null where no site is linked — and an
   * unlinked project reads NOTHING, which is the story's control. ONE STORE PER SESSION holds every read (`liveStore`),
   * made on the first read the customer asks for, in the browser.
   *
   * THE SOURCE IS A VIEW (`EXPERIENCE.md:230`), beside View as and the device: session state, never stored, never an
   * edit — nothing reaches `commit()`, the journal or `⌘Z` — and live in a session reading along (R-192). It starts on
   * the site wherever the site can be read (FR-C4: connecting "switches the canvas to live content").
   *
   * `painted` IS WHAT THE LAST PAINT USED, and the pill, D5e, the Link Picker, the panel's note and page 2's offer all
   * read it — the pill describes the canvas and never the paperwork (R-165). `site` there is the site's page, or null
   * where the canvas shows sample content; `cause` is why, where the site was chosen and did not answer. */
  const readable = site !== null && 'key' in site
  const reads = useRef<LiveStore | null>(null)
  const readsOf = (): LiveStore | null => {
    if (site === null || !('key' in site)) return null
    reads.current ??= liveStore(site.origin, site.key)
    return reads.current
  }
  const [source, setSource] = useHanded<'site' | 'sample'>(readable ? 'site' : 'sample')
  type Shown = { source: 'site' | 'sample'; cause: Cause | null; nothing: 'tag' | 'author' | null }
  const [painted, setPainted] = useHanded<{ shown: Shown; site: SitePage | null; key: CanvasKey | null }>({
    shown: { source: readable ? 'site' : 'sample', cause: null, nothing: null },
    site: null,
    key: null,
  })
  /** a read the customer asked for has landed: every surface that reads the rows in hand derives again */
  const [liveTick, setLiveTick] = useHanded(0)
  /** R-98: the row a read is in flight for — `'site'` for the SOURCE row, or a subject's slug — until its paint lands */
  const [busy, setBusy] = useHanded<string | null>(null)
  /** the newest read the customer asked for: an older one landing late never paints over it */
  const readTurn = useRef(0)
  /** a read the customer asked for is in flight, and it paints when it lands — every other paint waits for it */
  const pending = useRef(false)
  /** Story 5.19 — the site's reads an EDIT has asked for (by key), each once: one that did not answer is never asked
   *  again by a paint, so the page falls to the sample as a press's does rather than retrying against Ghost's limiter */
  const editReads = useRef(new Set<string>())
  /** the canvas and page the last paint drew, and whether the canvas is blank for another page's reads (`blank`) */
  const paintedAt = useRef<{ key: CanvasKey; page: Page } | null>(null)
  const [blanked, setBlanked] = useHanded(false)
  /** the named causes already said aloud, once each (FR-H4's named tier); choosing the site again forgets them */
  const announcedCauses = useRef(new Set<Cause>())
  /** R-170: the site's ONE name — the title its `/settings/` reports once answered, `sites.title` until then (or its
   *  host), and the same name in the pill, the SOURCE row and every sentence */
  const siteNameOf = () => {
    const title = reads.current?.peek(SETTINGS)?.rows[0]?.['title']
    return typeof title === 'string' && title.trim() !== '' ? title.trim() : (site?.title ?? '')
  }
  const siteName = siteNameOf()
  /* ─── Story 5.20 — FR-H6's RECORD OF THE MEMBER SWITCHES, and C3b's Re-check ──────────────────────────────────────
   *
   * SERVER TRUTH at first paint (`read.ts` reads `site_settings.members`), and a Re-check replaces it with Ghost's own
   * answer — C3b's button, and the Paywall canvas's own re-check each time it opens ("we re-check whenever you open this
   * screen"). A site with no record yet warns nothing anywhere. A Re-check is a LOOK, never an edit: nothing reaches
   * `commit()`, the journal or `⌘Z`, and it stays live reading along (R-192). Its busy state is the transition's (R-98).
   *
   * STORY 5.21 — THE SAME READ, WIDENED TO THE SITE'S SNAPSHOT, AND MADE ONCE AS THE EDITOR OPENS. `recheckSite` writes
   * every key Ghost's settings payload decides through the one mapping connect and the daily check share, and hands back
   * the members record AND `surfaces` — the snapshot Ghost's two shims are drawn from (FR-H5, `lib/ghost-surfaces.ts`) —
   * so a bar cleared or a button switched in Ghost admin shows at the next open instead of the next daily check. It is
   * silent unless C3b's card is up to speak about it, and a refusal leaves the stored snapshot drawn. */
  const [members, setMembers] = useHanded(site === null ? null : (site.members ?? null))
  const membersNow = useRef(members)
  membersNow.current = members
  const [surfaces, setSurfaces] = useHanded(site === null ? null : (site.surfaces ?? null))
  const surfacesNow = useRef(surfaces)
  surfacesNow.current = surfaces
  /** STORY 5.21's FIX (the owner's finding, 2026-09-26, Question 2 ruled option 1) — the two shims are rows in Layers
   *  under "From your Ghost site", each with a section row's own Hide / Show. HIDDEN IS THE BUILDER'S: kept in this
   *  browser per project (`readHidden`), never in the doc or the theme, and not in Preview, which is the site as a
   *  visitor meets it. A pointer over a shim shows the tag sections get; a press chooses its row and lets any section go
   *  (one selection); the row's Enter and Space are the keyboard's path. Refs beside each state: the canvas's listeners
   *  and `drawShims` read them, as they read `latest`. */
  const [ghostHidden, setGhostHidden] = useHanded<SurfaceId[]>([])
  const ghostHiddenNow = useRef<SurfaceId[]>([])
  const [ghostHover, setGhostHover] = useHanded<SurfaceId | null>(null)
  const ghostHoverNow = useRef<SurfaceId | null>(null)
  const [ghostChosen, setGhostChosen] = useHanded<SurfaceId | null>(null)
  const ghostChosenNow = useRef<SurfaceId | null>(null)
  const [rechecking, startRecheck] = useTransition()
  const [recheckRefusal, setRecheckRefusal] = useHanded<string | null>(null)
  /** C3b's card is up: the Paywall canvas, members switched off by the record, and the canvas chosen to show the site's
   *  content — ONE rule, which the card's draw (`offCard`, below) and a re-read's voice both read */
  const cardUp = (key_: CanvasKey, record: typeof members, from: 'site' | 'sample') =>
    isSurface(key_) && membersOff(record) && from === 'site' && site !== null && 'origin' in site
  const recheck = (pressed: boolean) => {
    if (site === null) return
    setRecheckRefusal(null)
    startRecheck(async () => {
      // a thrown call (the network dropped, the session is gone) is the same refusal as a returned one
      const answer = await reread(project.id).catch(() => ({ refused: true as const }))
      const name = siteNameOf()
      // the press speaks; a re-read nobody pressed speaks only where C3b's card is up to say it about
      const speaks = pressed || cardUp(latest.current.key, membersNow.current, latest.current.source)
      if ('refused' in answer) {
        if (speaks) {
          setRecheckRefusal(PAYWALL_WORDS.refused(name))
          setSaid(PAYWALL_WORDS.refused(name))
        }
        return
      }
      membersNow.current = answer.members
      setMembers(answer.members)
      // STORY 5.21 — the snapshot as Ghost now answers it: only the two shims are redrawn, never the page
      surfacesNow.current = answer.surfaces
      setSurfaces(answer.surfaces)
      // R-215 (Story 5.24e): a chosen or pointed Ghost row the answer no longer shows is let go; a hidden one keeps its id
      // in this browser's list, so a surface switched off and on again comes back hidden (`ghostRowsOf`)
      const shownNow = rowsOn(answer.surfaces, answer.members, inertBody)
      if (ghostChosenNow.current !== null && !shownNow.some((r) => r.id === ghostChosenNow.current)) {
        ghostChosenNow.current = null
        setGhostChosen(null)
      }
      if (ghostHoverNow.current !== null && !shownNow.some((r) => r.id === ghostHoverNow.current)) {
        ghostHoverNow.current = null
        setGhostHover(null)
      }
      // …only into a document that holds a painted `#canvas`: a fresh document ahead of its paint gets them from `paint()`
      const doc = frame.current?.contentDocument
      if (doc && paintedAt.current !== null && doc.getElementById('canvas') !== null) drawShims(doc)
      if (speaks) setSaid(membersOff(answer.members) ? PAYWALL_WORDS.stillOff(name) : PAYWALL_WORDS.on(name))
    })
  }
  /** STORY 5.21 — ONE re-read per opening of the editor, beside the Paywall's own on entry: an editor opened ON the Paywall
   *  canvas makes the one read that serves both, and leaving it makes none. Only for a CONNECTED site (the snapshot is
   *  handed for one alone, `read.ts`); a disconnected site has no key to read with. `handled` is the `surface` value the
   *  last run answered, so a second run for the same value is never a second entry — React runs a mount's effects twice in
   *  development (Strict Mode), and the keyboard journey counted two reads on the Paywall before this guard. */
  const handled = useRef<boolean | undefined>(undefined)
  useEffect(() => {
    if (handled.current === surface) return
    const opening = handled.current === undefined
    handled.current = surface
    if (surface || (opening && site !== null && site.surfaces !== undefined)) recheck(false)
    // entering the surface is the question; `recheck` reads the record and the site through refs
  }, [surface])
  /** `painted.shown` as the handlers see it, in the same task the paint set it — before React has re-rendered */
  const paintedRef = useRef<Shown>(painted.shown)

  /** the site's page AS PAINTED FOR THIS CANVAS — null while another canvas's reads are in flight (review, 2026-09-24:
   *  the last paint's page belongs to the canvas it drew, and the pill, D5e's rows, page 2's offer and a pick made in
   *  that window must describe the canvas in force, in its own kind, never the one taken off) */
  const livePage = painted.key === key ? painted.site : null
  /** the subject the canvas renders: the site's where the last paint was the site's, else the sample's own resolution */
  const previewing = useMemo(() => livePage ?? orbitWeekly.resolveSubject(canvas.file, storedSubject), [livePage, canvas.file, storedSubject])
  /** the source the list's pages are counted in — the site's page 1 where it shows, else the bundled publication at the
   *  project's own page size (Story 5.19) */
  const contentSource = livePage?.source ?? sampleSource
  /** Story 5.16 — does this canvas have a page 2 at all (R-176): a main feed on page 1 whose list runs past one page */
  const offered = useMemo(() => offersPageTwo(key, docs, previewing.subject, contentSource), [key, docs, previewing.subject, contentSource])
  /** …and the section whose panel carries D5d's row: page 1's main feed, or on page 2 its copy */
  const feedHere = useMemo(() => (offered ? mainFeedOn(docs, key, page, library) : null), [offered, docs, key, page, library])
  /* DW-248 (Story 5.24e): THE ONE TERM the open search box holds — D5e's, the Link Picker's or a Data group's (one opens at
     a time), each reporting it as it is typed and '' as it empties or closes. While the site's posts list is capped and the
     session's search share holds, that term is ONE `title:~` read at Ghost, sent `SEARCH_DEBOUNCE_MS` after the last key,
     whose rows join the list in hand by id (`withFound`); otherwise every box searches the rows in hand under the capped
     line, as before. Posts only — pages, tags and writers are never capped searches. */
  const [term, setTerm] = useHanded('')
  // the search is `lib/live-content.ts`'s two rules: sent while the share holds and kept once landed (`searchFor`), and
  // standing in for the capped line only while it is coming or has come (`searchInForce`)
  const search = livePage !== null && reads.current !== null ? searchFor(reads.current.peek, reads.current.reading(), term, cappedPosts(reads.current.peek) !== null) : null
  const searchKey = search === null ? null : liveKey(search)
  /** the key of a search that settled with no answer — failed, or never sent because reading stopped */
  const [searchFailed, setSearchFailed] = useHanded<string | null>(null)
  useEffect(() => {
    const s = reads.current
    if (search === null || s === null) return
    const at = window.setTimeout(() => {
      void s.ensure([search]).then(() => {
        if (s.peek(search) === undefined) setSearchFailed(liveKey(search))
        setLiveTick((n) => n + 1)
      })
    }, SEARCH_DEBOUNCE_MS)
    return () => window.clearTimeout(at)
    // the term's own read is the question; a new term is a new key
  }, [searchKey])
  const searching = reads.current !== null && searchInForce(reads.current.peek, reads.current.reading(), search, searchFailed)
  // a term belongs to the canvas it was typed on — a box left open across a switch reports nothing more
  useEffect(() => setTerm(''), [key])
  const subjectRows = useMemo(
    () =>
      previewing.subject === null ? []
      : subjectOptions(
          livePage !== null && reads.current !== null
            // the chosen post's own read rides along, so a pick found by a search keeps its title once the search clears
            ? siteSubjects(withFound(reads.current.peek, search, previewing.subject.kind === 'post' ? subjectRead(previewing.subject) : null), livePage.zone)
            : bundled,
          previewing.subject.kind,
        ),
    [bundled, livePage, previewing.subject?.kind, previewing.subject?.slug, searchKey, liveTick],
  )
  /** the Link Picker's rows in hand — the site's own pages, posts, tags and writers where they show; DW-248: with a search
   *  at Ghost's found posts among them, and the capped line only while no such search is in force */
  const linksNow = useMemo(() => {
    if (livePage === null || reads.current === null) return links
    const found = siteLinks(reader(withFound(reads.current.peek, search)), livePage.zone)
    return { ...found, ...(searching ? { capped: undefined } : {}), onQuery: setTerm }
  }, [livePage, links, liveTick, searchKey, searching])
  /** the time zone the panel names under a date: the source's own */
  const zoneNow = livePage?.zone ?? timezone
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
  const [viewed, setViewed] = useHanded<Viewed>(storedViewed)
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
  const [journal, setJournal] = useHanded<Journal>(EMPTY_JOURNAL)
  const [sync, setSync] = useHanded<SyncState>({ kind: 'rest', owed: false })
  const [hydrated, setHydrated] = useHanded(false)
  // `paint()` is called from the canvas document's own handlers, which never re-close over a new render's state
  const hydratedRef = useRef(false)
  /** B6's "Retry now" is in flight — R-98's swapped label and its two aria attributes */
  const [pressingRetry, setPressingRetry] = useHanded(false)
  const [conflicted, setConflicted] = useHanded(false)
  const conflict = useRef<HTMLDialogElement>(null)
  /** R-147's card, opened by `?` here and by the account menu's row everywhere else — one component, one door */
  const shortcuts = useRef<HTMLDialogElement>(null)
  /* ─── Story 5.10 — the Section Picker (FR-D12, S5a) ───────────────────────────────────────────────────────────
   * A native modal `<dialog>`, so `Esc`, the focus trap and the return of focus to the invoking control are the
   * platform's (`EXPERIENCE.md:502`). `invoked` is the STACK INDEX the "+" was pressed under, or null for `⌘K`
   * with nothing selected; `lib/picker.ts`'s `invokedAt` turns it into one position in the canvas's own doc. */
  const picker = useRef<HTMLDialogElement>(null)
  const [picking, setPicking] = useHanded(false)
  const [invoked, setInvoked] = useHanded<number | null>(null)
  /** has the picker been opened in this session? Once it has, it stays mounted (R-155's pair, the owner's ruling of
   *  2026-09-20): `picking` still says whether it is SHOWN, and a closed dialog draws nothing. */
  const [opened, setOpened] = useHanded(false)
  /** DW-190's home: R-37's refusal, shown in the picker where the press was */
  const [pickerRefusal, setPickerRefusal] = useHanded<string | null>(null)
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
  /** R-213 (Story 5.24e): the last answer the sync route gave was 401 — the session ended. The backoff keeps running
   *  while it holds, showing Signed out rather than a countdown, and a visit back to the tab tries at once */
  const signedOut = useRef(false)
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
  const [lock, setLock] = useHanded<LockUi>(() => ({
    // A READER MUST NOT FLASH AN EDITABLE SHELL, so the first paint is decided by the row `read.ts` read above the
    // boundary: a live lock held by somebody else is read-only from the very first frame, and the `acquire` below
    // only confirms it.
    holder: isStale(heldOnServer),
    row: heldOnServer,
    asking: false,
    askedAt: null,
    askedOf: null,
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
  const [dismissed, setDismissed] = useHanded<string | null>(null)
  /** UX-DR12's SECOND live region, and it is ASSERTIVE. `#editor-said` is the editor's polite one and stays polite:
   *  widening it would make every design-ring announcement shout. Only this story writes here. */
  const [announced, setAnnounced] = useSaid()
  /** what a session that was just taken over from LOST, shown in B5a's own sentence slot until it asks again or holds
   *  again. The assertive region SAYS it; this SHOWS it — a sighted person was otherwise never told. */
  const [lost, setLost] = useHanded<string | null>(null)
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
   *  It covers a reload WE start. A customer's own F5 used to release and re-acquire, leaving a sub-second window in
   *  which another session's poll could acquire first; since DW-240 (Story 5.24e) the way out LEAVES instead, and the
   *  row stays this session's for `LEAVE_GRACE_MS`, which the reloaded page's first beat lands inside. */
  const keeping = useRef(false)
  /** A RELOAD IS A HYDRATE (§AD1.1 runs exactly, and the cloud doc is what comes back), and `keeping` stops the
   *  release on the way out from deleting the lock this session has just gained. The take-over and a reader that
   *  gains the lock both come through here. */
  const hydrate = () => {
    keeping.current = true
    window.location.reload()
  }
  /** the `BroadcastChannel`'s send, mounted with the lock effect below */
  const tell = useRef<(signal: LockSignal) => void>(() => {})
  const takeover = useRef<HTMLDialogElement>(null)

  const layers = useFold()
  const controls = useFold()
  /* ─── Story 5.22 — D8's REARRANGEMENT (R-202), and its ONE overlay ────────────────────────────────────────────────
   *
   * `compact` is live: every touch screen that reached the editor, and a fine-pointer window below 1280. `sheet` is the
   * one overlay a compact editor has open — Layers over the canvas beside the rail, or Controls on the right — and ONE
   * state is how "only one overlay at a time" (`D8:283`) holds by construction; a bar menu opening closes it too. It is
   * layout, never an edit, and it is session state that nothing stores. */
  const compact = useSyncExternalStore(onCompact, compactNow, () => false)
  const [sheet, setSheet] = useHanded<'layers' | 'controls' | null>(null)
  /** what held focus when a sheet opened — where closing it gives focus back, or the canvas where it cannot */
  const sheetFrom = useRef<HTMLElement | null>(null)
  /** a door that moves focus INTO the sheet it opens (`L`, Show layers, the skip link) names it here for the effect below */
  const focusInto = useRef<'layers' | 'controls' | null>(null)
  /** …and a close names where focus goes BACK. Both move after the render, never in the handler: until it commits, the
   *  sheet being opened is still `hidden` and the canvas being uncovered is still `inert`, and focus goes to neither */
  const focusBack = useRef<HTMLElement | 'stage' | null>(null)
  const bar = useRef<HTMLElement>(null)
  const frame = useRef<HTMLIFrameElement>(null)
  /** the canvas ground: its CONTENT BOX is the room the card is fitted into — the card itself is the answer, so
   *  measuring it would measure the fit rather than the space (Story 5.7; it was the card until R-137) */
  const stage = useRef<HTMLElement>(null)
  /** R-119's Pro badge, drawn by the chrome (`CanvasChrome`) and read by the pill, which sits to its left (R-125) */
  const badge = useRef<HTMLDivElement>(null)
  const icons = useRef<IconLookup | null>(null)
  /** index-aligned with the stack last painted; null where a section rendered nothing */
  const roots = useRef<(HTMLElement | null)[]>([])
  /** Story 5.15 — `core`'s handle for the canvas painted last: `stop()` before the next paint, and `paused`, the mounts
   *  it held still, which the PAUSED chips read (R-175). Null before the first paint. */
  const behaviours = useRef<ReturnType<typeof startBehaviours> | null>(null)
  /** B3b's Back to editing, which takes focus on the way in, and where focus was before it (Story 5.15) */
  const backButton = useRef<HTMLButtonElement>(null)
  const cameFrom = useRef<HTMLElement | null>(null)
  const [size, setSize] = useHanded({ width: 0, height: 0 })
  // A section that will not draw is a broken doc or design, not a canvas to show around it: thrown in render, so the
  // app's error boundary shows it (the spec's "never a partly drawn canvas").
  const [failure, setFailure] = useHanded<Error | null>(null)
  // Story 5.3 — each paint's editing stamps, the field being edited, its toolbar, and the pill
  const stamps = useRef(new Map<HTMLElement, Stamp>())
  /** STORY 5.23a — what `paint()` drew, per section (`queryKey`): the signature of the stack entry it drew from (its JSON),
   *  EVERY top-level node its part parsed to — a part may open with a comment, and the section owns that too — its root
   *  and its stamps; and the render context they were all drawn under. Trusted only while nothing else has written the
   *  section: whatever writes one outside `paint()` drops its record, or every record (`restampAll`, `blank`). */
  type Drawn = { sig: string; nodes: ChildNode[]; root: HTMLElement | null; stamps: Map<HTMLElement, Stamp> }
  const drawn = useRef(new Map<string, Drawn>())
  const drawnUnder = useRef<string | null>(null)
  type Editing = { inline: Inline; target: HTMLElement; path: string; item?: number; n: number }
  const editing = useRef<Editing | null>(null)
  const [session, setSession] = useHanded<Inline | null>(null)
  const [inlineAt, setInlineAt] = useHanded<ScreenSelection | null>(null)
  const [scrolling, setScrolling] = useHanded(false)
  // Story 5.4 — the one reorder, held here because EITHER grip starts it: a Layers row's or the canvas pill's. Story 5.23b:
  // in a store of one value that Layers alone subscribes to, so a pointer move never re-renders the editor (R-208)
  const [dragStore] = useState(() => oneValue<SectionDrag | null>(null))
  /** the pill drag's own start: the pointer's Y and the dragged doc's sections as they sat ON SCREEN */
  const pillDrag = useRef<{ y: number; layout: Layout }>({ y: 0, layout: { tops: [], heights: [], gap: 0 } })
  const pill = useRef<HTMLDivElement | null>(null)
  /** what a completed move says, politely — `moveSection`'s own words, announced from here so both grips announce */
  const [said, setSaid] = useSaid()
  const [note, setNote] = useHanded<Note | null>(null)
  // the pill as the canvas document's handlers see it, in the same task it was set — paint reads it before React has
  // rendered the state
  const noteRef = useRef<Note | null>(null)
  const showNote = (next: Note | null) => {
    noteRef.current = next
    setNote(next)
  }
  /** the elements a paint stamped with this lock's name, in document order — the same order on every paint of the same docs */
  const sameLock = (words: string) => [...stamps.current].filter(([, s]) => 'ghost' in s && `${s.ghost} — set in Ghost` === words).map(([el]) => el)
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
  const canAdd = useMemo(() => !surface && offeredHere(entries, canvas.file, SITE.file).length > 0, [surface, entries, canvas.file])
  /** What this section may become, from the library and nowhere else (`ringFor` sits beside `offeredOn`). The
   *  design it IS is always in it; a design the library no longer holds gives an empty ring, which reads as one
   *  design with nowhere to go — the same answer every category gives today. Story 5.23b: ONE RING PER DESIGN ID, kept
   *  for the session — `entries` never changes in one, and a ring scanned the library per call (40 sections a render for
   *  the dice's count), while the Design block, handed the same array, skips its render. */
  const rings = useMemo(() => new Map<string, SectionRegistryEntry[]>(), [entries])
  const ringOf = (designId: string): SectionRegistryEntry[] => {
    const kept = rings.get(designId)
    if (kept !== undefined) return kept
    const entry_ = entries[designId]
    // Story 5.20 — a paywall is a treatment, so `ringFor` (placeable designs) never holds one: its ring is every paywall
    // design this editor holds (A32's from Story 10.107; the harness's two stand-ins, R-158)
    const ring = entry_ === undefined ? [] : isPaywallDesign(entry_) ? paywallRing(Object.values(entries)) : ringFor(Object.values(entries), entry_)
    rings.set(designId, ring)
    return ring
  }
  // the canvas document's handlers and paint read the latest values through here
  // Story 5.18: and the SOURCE chosen, the canvas's STORED subject (a paint resolves it against the source it paints
  // with) and the source the last paint counted pages in
  // Story 5.22: and the layout, and the sheet open in it — `choose`, `L`, the skip link and `Esc` are bound once
  const latest = useRef({ key, docs, stack, selected, hovered, auto, mode, journal, device, canAdd, subject: previewing.subject, viewAs, viewed, preview, page, lock, source, stored: storedSubject, contentSource, compact, sheet, packList })
  /* STORY 5.23b — `latest` NEVER GOES BACK (R-210's Always). A section operation's state reaches React a task after the
     canvas (the hand-over), so a render can be drawn before it lands — never one this component's own setters cause, since
     each pays what is owed first, but one an external store causes (the layout crossing 1280) — and a render that wrote
     `latest` from its own state would put an OLDER doc back: the next edit would be made against it, and an edit would be
     lost. So the HANDLERS are the only writers of what they change — the docs, the stack, `auto`, the journal, the
     selection, the hover, the page, the mode, the device, the visitor, the looked-at record, Preview, the source, the lock
     and the sheet — and a COMMIT writes only what it derives and no handler writes: the canvas in force (the URL's), what
     can be placed on it, the layout, the list its pages are counted in, and its subject (which `chooseSubject` also writes,
     for the paint in its own task). In a layout effect, so a render React throws away writes nothing, and before this
     component's other layout effects, which read it. */
  useLayoutEffect(() => {
    latest.current = { ...latest.current, key, canAdd, compact, contentSource, subject: previewing.subject, stored: storedSubject, packList }
  })
  /** Story 5.16 — R-180: the site-wide sections that have asked on THIS visit to page 2, by instance id. Emptied on
   *  every change of page, so a section asks again the next time page 2 is shown. */
  const asked = useRef(new Set<string>())
  /** …and the section whose change is HELD right now, until the dialog answers: a second section's change arriving in
   *  the same frame is dropped rather than silently replacing the one the dialog is about (review, 2026-09-22) */
  const holding = useRef<string | null>(null)

  /* ─── Story 5.22 — THE SHEET'S DOORS (D8). Open: a customer's pick (`choose`), the selected section's rail item, "Show
   *  layers" and `L`, a Layers row, and the skip link and `Esc`'s third rung. Close: its close button, a press on the
   *  scrim, `Esc`, a bar menu opening, and crossing 1280. Closing keeps the selection and gives focus back to what opened
   *  it, or to the canvas. Only in the compact layout — at full width both panels are docked and there is no sheet. */
  const putSheet = (next: 'layers' | 'controls' | null) => {
    latest.current = { ...latest.current, sheet: next }
    setSheet(next)
  }
  const openSheet = (which: 'layers' | 'controls', focusIn = false) => {
    const now = latest.current
    if (!now.compact) return
    if (now.sheet === which) {
      // already drawn, so focus can go now — unless this very task put it there, and then the effect below takes it
      const close = (which === 'layers' ? layers.hide : controls.hide).current
      if (focusIn && close?.checkVisibility()) close.focus()
      else if (focusIn) focusInto.current = which
      return
    }
    // the way back is what opened the FIRST sheet: a Layers row that hands over to Controls has gone with its panel
    if (now.sheet === null) {
      const at = document.activeElement
      sheetFrom.current = at instanceof HTMLElement && at !== document.body ? at : null
    }
    if (focusIn) focusInto.current = which
    putSheet(which)
  }
  const closeSheet = (giveBack = true) => {
    if (latest.current.sheet === null) return
    focusBack.current = giveBack ? (sheetFrom.current ?? 'stage') : null
    sheetFrom.current = null
    putSheet(null)
  }
  const toggleLayers = () => (latest.current.sheet === 'layers' ? closeSheet() : openSheet('layers', true))

  /** Story 5.14 — the changed records, into the session and down the one write chain. Only rows that CHANGE reach it:
   *  `seen` hands back the same array and `afterChange` returns only what moved, so an empty map writes nothing. */
  const recordViewed = (changed: Readonly<Record<string, readonly Visitor[]>>) => {
    const keys = Object.keys(changed)
    if (keys.length === 0) return
    const next: Viewed = { ...latest.current.viewed, ...changed }
    latest.current = { ...latest.current, viewed: next }
    setViewed(next)
    // DW-225 (Story 5.24e): ONLY THE HOLDER RECORDS WHAT WAS LOOKED AT. A window reading along changes its own session's
    // dots and writes nothing (5.24a's routine call 5) — asked here and again when the write's turn comes, so one queued
    // while holding is not sent after the lock has gone.
    if (!latest.current.lock.holder) return
    viewedWrites.current = viewedWrites.current.then(async () => {
      if (!latest.current.lock.holder) return
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
    if (heldBack(written, touched, about)) return null
    const now = latest.current
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

  /** `commit`'s two early answers, asked on their own so `apply` can ask them BEFORE its hand-over holds anything (Story
   *  5.23b, R-210): R-180's dialog opens on the next frame, and its words must be in by then. True when
   *  the change does not land — nothing happened, say nothing, repaint nothing.
   *
   *  STORY 5.17 — FR-D18'S READ-ONLY GUARD, AND IT IS ONE EARLY RETURN. This is the one door every change passes,
   *  which is why the rule cannot be forgotten at a call site: a session that does not hold the lock writes nothing
   *  to the docs, nothing to the journal and nothing to the device. The control that was pressed is CONTROLLED by
   *  the value in force, so it never moves — not even for a frame (B5a). Typing on the canvas is stopped a step
   *  earlier, in `startEditing`, because a `contenteditable` element has already changed by the time it gets here.
   *
   *  `commit` then ANSWERS `null`, WHICH ALREADY MEANS "NOTHING HAPPENED — SAY NOTHING, REPAINT NOTHING" (R-180's hold,
   *  the `HELD` symbol below). That is not a shortcut, it is the only answer that reaches every caller: `false` is a
   *  SUCCESS that merely had no round trip, so `onChange` would go on to stamp the canvas root with the refused
   *  value and `edit()` would announce "X duplicated" over a change that never landed. */
  const heldBack = (written: Readonly<Record<string, ProjectDoc>>, touched: string, about?: About): boolean => {
    const now = latest.current
    if (!now.lock.holder) return true
    if (now.page === 2 && touched === SITE.key && about !== undefined && !asked.current.has(about.instanceId)) {
      holdChange(written, touched, about)
      return true
    }
    return false
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
  /*  R-213 (Story 5.24e): Signed out is a flush's state too, kept exactly as Retrying is — and both are kept IN FALLBACK
   *  as well, which they were not: there every edit sends at once, so an edit that closed the panel had it reopen one
   *  round trip later, a flicker per keystroke over the very sentence (R-227's) a fallback tab most needs to read. */
  const rest = (done = false) =>
    setSync((was) =>
      !done && (was.kind === 'syncing' || was.kind === 'retrying' || was.kind === 'signed-out') ? was
      : fellBack.current ? { kind: 'fallback' }
      : restingState(latest.current.journal))

  /** The device is no longer holding the work, from this moment. The indicator changes in the same task the failure
   *  arrives in — never a stale *"Saved on this device"* — and every later change goes straight to the cloud. */
  const toFallback = () => {
    local.current = null
    fellBack.current = true
    // a new object even when Retrying or Signed out stays, so the panel re-renders with the fallback's own sentence
    setSync((was) => (was.kind === 'retrying' || was.kind === 'signed-out' ? { ...was } : { kind: 'fallback' }))
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
   *
   * R-210 (Story 5.23b): UNDO AND REDO ARE SECTION OPERATIONS — the canvas is painted and `latest` moves in this task, and
   * every state update below is handed to React in the next (`canvasFirst`), so the panels follow a frame later.
   */
  const restore = (r: Restore | null) => {
    if (!r) return
    const missing = vanishedDesign(r.doc, (id) => entries[id] !== undefined)
    if (missing) {
      setSaid(`That change cannot be undone: the ${missing} design is no longer in the library.`)
      return
    }
    canvasFirst(() => restored(r))
  }
  const restored = (r: Restore) => {
    const now = latest.current
    // Story 5.19 — an undo is a door too: a journal written before the main-feed rule may hold a doc it would repair
    const next = committed({ ...now.docs, [r.docKey]: designated(r.docKey, r.doc) }, r.docKey, stacks, now.auto)
    if (next.auto !== now.auto) setAuto(next.auto)
    latest.current = { ...now, docs: next.docs, auto: next.auto, stack: stackOf(next.docs, now.key, now.page, library), journal: r.journal }
    setDocs(next.docs)
    setJournal(r.journal)
    // STORY 5.16 — AN UNDO CAN TAKE PAGE 2 AWAY WHILE IT IS SHOWN: the journal is one list for the whole project, so ⌘Z
    // on page 2 can reach back into page 1 and remove its main feed. The canvas goes to page 1 BEFORE the paint and says
    // why — never a paint of a page that does not exist.
    const force = pageInForce(now.page, now.key, next.docs, now.subject, now.contentSource)
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

  /** The backoff, counted down a second at a time so waiting feels finite (B6). R-213: while the route answers 401 the
   *  same backoff runs under Signed out, with no countdown — a sign-in elsewhere is what it waits for, not a clock. */
  const scheduleRetry = () => {
    stopRetrying()
    if (gone.current) return
    attempt.current += 1
    let left = backoffSeconds(attempt.current)
    setSync(signedOut.current ? { kind: 'signed-out' } : { kind: 'retrying', attempt: attempt.current, seconds: left })
    clocks.current.retry = setInterval(() => {
      left -= 1
      if (left > 0) {
        if (!signedOut.current) setSync({ kind: 'retrying', attempt: attempt.current, seconds: left })
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
  /** R-213 — the sign-in page Signed out's link opens, by the same rule */
  const signInUrl = `${isApp(pathname) ? '/app' : ''}/sign-in`

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
    // A BACKOFF WHOSE TURN FINDS NOTHING TO SEND, OR NO LOCK TO SEND UNDER, IS OVER (the review, 2026-10-02): the timer
    // that called this has stopped, so without this the indicator said Retrying — or Signed out — for good, about work
    // this session no longer owes or may no longer send (a take-over mid-backoff drops the journal; `land` re-rests only
    // the signed-out case).
    const backoffOver = () => {
      if (why !== 'retry') return
      signedOut.current = false
      attempt.current = 0
      rest(true)
    }
    if (asked === 'nothing') return backoffOver()
    // DW-203 (Story 5.24e): ONLY THE HOLDER SENDS. A tab reading along in the same browser shares the holder's
    // IndexedDB, and before this it adopted the holder's pending journal, sent it when hidden, took the 423 and then
    // dropped the holder's own on-device record (executed at 5.24e's Create). The hydrate no longer adopts it either;
    // this is the second wall, and the one that holds whatever a reader's journal came to hold.
    // ponytail: the FIRST-OPENER RACE no longer reaches the sync route's 423 — a tab that typed on its optimistic first
    // paint and then lost the `acquire` keeps those edits in its journal, unsent and unannounced, where before this wall
    // the 423 path displaced it and said so (review, 2026-09-24). The shared on-device record is deliberately NOT reset
    // here: in the same-browser race it is the holder's. The upgrade is `land()` telling a session that typed before its
    // first answer, when that answer makes it a reader, what it holds — DW-308, Story 7.18's.
    if (!now.lock.holder) return backoffOver()
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
    // R-213: Signed out stays up while the backoff's attempt is in flight, so its Sign in link never blinks away
    setSync((was) => (was.kind === 'fallback' || was.kind === 'signed-out' ? was : { kind: 'syncing' }))
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
        signal: AbortSignal.timeout(SYNC_TIMEOUT_MS),
      })
      // R-213 (Story 5.24e): THE ONE REFUSAL SIGNING IN CURES. Before it a 401 was "Retrying … when the connection
      // returns" — a connection that was fine, and a Retry that could only meet the same answer. The backoff keeps
      // trying underneath; a 404, 400 or 422 cannot be cured by a sign-in and stays Retrying below (DW-304, 7.18).
      signedOut.current = answer.status === 401
      if (answer.status === 401) {
        scheduleRetry()
        return
      }
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
        // a displaced session owes nothing a sign-in could send: never left on Signed out (R-213)
        signedOut.current = false
        rest(true)
        // THE ROUTE'S ANSWER IS ITSELF THE DISPLACEMENT: a free lock and an unknown id refuse nothing, so 423 can only
        // mean another session holds it. Decided HERE rather than left to `land`'s generation test, because a session
        // that never had its generation confirmed (an optimistic first paint that typed before `acquire` answered) has
        // nothing for that test to compare and would otherwise keep the orphaned journal and be told nothing (review,
        // 2026-09-24). With the generation cleared first, `land` cannot announce it a second time.
        const owed = owedNow()
        heldGeneration.current = null
        dropJournal()
        setAnnounced(LOCK_COPY.displaced(owed))
        setLost(owed > 0 ? LOCK_COPY.displaced(owed) : null)
        land(await askLock(lockAt(), { intent: 'beat', session: tabId.current, unsynced: 0 }))
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
      signedOut.current = false
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

  /** R-214 (Story 5.24e): A SIGN-OUT IN ANOTHER TAB SENT THIS EDITOR'S OWED RECORD, and says so (`SENT_CHANNEL`). Taken
   *  EXACTLY as this editor's own flush's 200 — the work up to that journal's stamp is marked sent and the base moves to
   *  the revision it made — but only when it was sent from the base this editor holds; anything else is someone else's
   *  record, or an answer this editor has already moved past. Without it the next edit carried the old base, met a 409
   *  and the conflict dialog, over work this editor had itself handed the sign-out. */
  const heardSent = useRef<(message: unknown) => void>(() => {})
  heardSent.current = (message) => {
    if (!isSentMessage(message) || message.project !== project.id || message.base !== base.current) return
    base.current = message.revision
    signedOut.current = false
    const next = flushed(latest.current.journal, message.stamp, message.upTo)
    latest.current = { ...latest.current, journal: next }
    setJournal(next)
    stopRetrying()
    attempt.current = 0
    store(next, latest.current.docs, latest.current.auto)
    rest(true)
  }
  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') return
    let channel: BroadcastChannel
    try {
      channel = new BroadcastChannel(SENT_CHANNEL(project.id))
    } catch {
      return
    }
    channel.onmessage = (event: MessageEvent<unknown>) => heardSent.current(event.data)
    return () => channel.close()
    // one project, one mount
  }, [])

  /* ─── Story 5.17 — FR-D18's lock: the heartbeat, the transport and the four gestures ─────────────────────────
   *
   * ONE ROUTE, ONE RECONCILER. Every answer from `lock/route.ts` lands in `land()`, so the generation test, the
   * displacement and the state of my own request are read in ONE place rather than after each call.
   */

  /** THIS TAB'S IDENTITY, and it survives a reload (`sessionStorage`) so a refresh keeps the lock rather than
   *  orphaning it for ~60 s. A second TAB never shares it — that tab IS the other editing context. */
  const tabId = useRef('')
  const lockAt = () => lockUrl(project.id, isApp(pathname))
  /** AD-16's count for THIS session: EDITS above the watermark, never operations. `remixFold` already makes a Site
   *  Remix one `commit`, so a re-roll of any size reports 1. */
  const owedNow = () => unsyncedEdits(latest.current.journal)
  /** AD-16's count as the lock is told it — none until this device's journal is read, so a reload's first beat never
   *  writes 0 over the count the row kept (DW-240, Story 5.24e; `countPatch`) */
  const countNow = () => (hydratedRef.current ? owedNow() : undefined)

  const putLock = (next: LockUi) => {
    latest.current = { ...latest.current, lock: next }
    setLock(next)
  }

  /** AD-15'S SECOND CLEARING RULE (`journalCleared`, beside `hydrationFor`): the journal of a displaced session
   *  goes UNCONDITIONALLY. There is no merge path and no recovery of orphaned edits, so an undo that could still
   *  reach them would be offering work the server will never accept. The DOCS are untouched — the canvas stays
   *  legible, which is the whole of B5a — and a reload runs §AD1.1 and brings the cloud's back.
   *
   *  THE LOCAL RECORD IS PUT BACK TO THE SERVER'S SNAPSHOT (`stored` at `revision`), NOT TO THE DOCS ON SCREEN. The
   *  docs on screen still carry the orphaned edits, and a record holding them at `base.current` read as "local, in
   *  step with the cloud" whenever the new holder had written nothing — so the reload on gaining the lock brought the
   *  very work B5c said "will be lost" back onto the canvas, and its next flush sent it (review, 2026-09-24: three
   *  layers found it). `stored` at `revision` is a record that is true whatever happened since: unchanged cloud → the
   *  same docs; moved cloud → `hydrationFor` answers 'cloud'. */
  const dropJournal = () => {
    latest.current = { ...latest.current, journal: EMPTY_JOURNAL }
    setJournal(EMPTY_JOURNAL)
    const store = local.current
    if (!store) return
    void store.clearJournal(project.id)
    void store.save(project.id, { baseRevision: revision, docs: { ...stored }, auto: [...latest.current.auto], journal: EMPTY_JOURNAL })
  }

  const land = (answer: LockAnswer | null) => {
    // `null` is "the server was not reached" — offline, a 5xx, a stall. A lock that cannot be heard from is not a
    // lock that was lost: change nothing and ask again on the next beat.
    if (answer === null) return
    const was = latest.current.lock
    const { row, held: mine } = answer

    // THE TAKE-OVER TEST IS THE GENERATION AND NOTHING ELSE (AD-15), which is why a take-over whose new holder has
    // written nothing still clears this journal: the revisions would be equal and the revision half would not fire.
    if (partyOf(row, tabId.current, heldGeneration.current, false) === 'displaced') {
      const owed = owedNow()
      heldGeneration.current = null
      dropJournal()
      // R-213: a session displaced while Signed out owes nothing a sign-in could send, so it leaves that state and its
      // backoff — `dropJournal` never re-rests the indicator, and it would otherwise say Signed out for good
      if (signedOut.current) {
        signedOut.current = false
        stopRetrying()
        attempt.current = 0
        rest(true)
      }
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

    // THE OWNER'S FINDING (2026-09-24): a session that GAINS the lock after reading along must show what the last
    // holder left — the addendum's own nudge flow, "requester flips to editable and hydrates from the fresh server
    // snapshot". A reader's docs are whatever it loaded, so without this it showed the old design after a hand-over,
    // and its first save met a 409. Only a GAIN: a session already holding (the first opener, a reload keeping its own
    // row) has nothing newer to fetch, so this cannot loop.
    if (mine && !was.holder) {
      hydrate()
      return
    }

    // my own request, as the row now answers it (DW-243, `askedNow`): the same holder and generation with the columns
    // cleared → the holder pressed Keep editing, and only then is "kept" said; the holder or generation moved → it
    // ended, and the next poll decides; anything else, a request REPLACED by a third device's included → still waiting
    const asked = was.askedAt === null ? null : askedNow(row, was.askedOf)
    const waiting = asked === 'waiting'
    if (asked === 'kept' && !mine) setAnnounced(LOCK_COPY.kept)

    putLock({
      ...was,
      holder: mine,
      row,
      asking: waiting,
      askedAt: waiting ? was.askedAt : null,
      askedOf: waiting ? was.askedOf : null,
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
      // the write did not land: the button comes back, stays pressable, and the polite region SAYS so (the matrix's
      // own row — "reports it" is a sentence, not a label reverting)
      putLock({ ...latest.current.lock, asking: false, askedAt: null, askedOf: null })
      setSaid(LOCK_COPY.unreachable)
      return
    }
    tell.current('nudge')
    const at = answer.row
    putLock({ ...latest.current.lock, row: at, asking: true, askedAt: Date.now(), askedOf: at && { holder: at.holderSessionId, generation: at.generation }, unanswered: false })
  }

  /** B5b's **Hand over** — AD-15's flush contract, in the order the contract names. */
  const handOver = async () => {
    const was = latest.current.lock
    if (was.handingOver) return
    putLock({ ...was, handingOver: true, handOverFailed: false })
    // ponytail: a flush already in flight (a timer's, a ⌘S) makes `flush` return without sending, which read as a
    // refusal that never happened; polling the guard is the smallest wait that is correct.
    while (inFlight.current) await new Promise((r) => setTimeout(r, 150))
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
    putLock({ ...latest.current.lock, holder: false, row: null, handingOver: false, handOverFailed: false, asking: false, askedAt: null, askedOf: null, unanswered: false })
  }

  /** B5b's **Keep editing** — the nudge columns are cleared, and no take-over is offered from that request. */
  const keepEditing = async () => {
    const answer = await askLock(lockAt(), { intent: 'keep', session: tabId.current })
    // DISMISSED ONLY ONCE THE WRITE LANDED. Dismissed first, a `null` answer took the card away while the row still
    // carried the request, and the requester was then offered a take-over the holder had never turned down (review,
    // 2026-09-24). Not landed → the card stays and Keep editing is pressable again.
    if (answer === null) return
    setDismissed(latest.current.lock.row?.request ?? null)
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
      land(await askLock(lockAt(), { intent: 'acquire', session: tabId.current, unsynced: countNow() }))
      return
    }
    putLock({ ...was, taking: true })
    const answer = await askLock(lockAt(), { intent: 'takeover', session: tabId.current, generation: row.generation, unsynced: countNow() })
    takeover.current?.close()
    if (answer === null || !answer.won) {
      // ZERO ROWS MEANS THE GENERATION MOVED UNDER US. Re-read and report the new state, never retry blindly. `null`
      // is the server not reached at all (a 502 carries the route's logged code, `42501` included) — said politely,
      // because a dialog that closes over nothing swallows what the matrix says is surfaced.
      putLock({ ...latest.current.lock, taking: false })
      if (answer === null) setSaid(LOCK_COPY.unreachable)
      land(answer)
      return
    }
    tell.current('took-over')
    heldGeneration.current = answer.row?.generation ?? row.generation + 1
    putLock({ ...latest.current.lock, taking: false, holder: true, row: answer.row, asking: false, askedAt: null, askedOf: null, unanswered: false })
    // AND I AM EDITING THE LAST SYNCED SNAPSHOT. A RELOAD IS A HYDRATE — the conflict dialog beside this one says so
    // in as many words — so §AD1.1 runs exactly and the cloud doc is what comes back. This tab's session id survives
    // it in `sessionStorage`, so the lock just taken is still ours on the way back in — and `keeping` is what stops
    // the release on the way out from deleting the row this take-over has just won.
    hydrate()
  }

  /** A RELOAD THAT KEPT ITS TAB ID IS THE SAME SESSION, so it keeps the lock rather than flashing B5a's bar at its
   *  own reflection — which the take-over's own reload would otherwise do every single time, and which would make
   *  `commit()` refuse for the round trip it lasted. A LAYOUT effect, before the browser paints: the server render
   *  cannot know the tab's id (`sessionStorage` is the browser's), so this is the first moment it can be asked, and
   *  asking it a frame later would be a frame of the wrong screen. DW-242 (Story 5.24e): this effect is the WHOLE of it
   *  since Story 5.22 — the shell mounts from a layout effect, so nothing is painted before this asks — and Story 5.17's
   *  pre-paint `<html>` mark, dead since, is gone; the journey's rAF sampler goes red if this becomes a `useEffect`. */
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
    /** DW-244 (Story 5.24e): the one extra poll at a live row's staleness edge (`edgePoll`), never more than one waiting */
    let edge: ReturnType<typeof setTimeout> | undefined

    const poll = async () => {
      // THE HOLDER BEATS; EVERY OTHER SESSION TRIES TO ACQUIRE, which is how the first opener, a released lock and a
      // stale one are all picked up with no intent of their own — an `acquire` against a LIVE lock writes nothing and
      // answers the row, so a reader polls through the same call.
      //
      // IT ASKS `heldGeneration`, NOT THE STATE. The opening state is optimistic — a first paint with no row shows
      // an editable shell rather than making the customer wait a round trip for one — and reading it here sent the
      // very first call as a `beat`, which matches no row, so the first opener became a reader of a lock that did
      // not exist and only acquired ~15 s later (executed against a local build, 2026-09-23). `heldGeneration` is
      // set ONLY when the server confirmed the lock is ours, which is exactly the question this asks.
      const wasHolder = heldGeneration.current !== null
      const holding = wasHolder || Date.now() - gaveAt.current < NUDGE_MS
      const answer = await askLock(lockAt(), { intent: holding ? 'beat' : 'acquire', session: tabId.current, unsynced: countNow() })
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
      // DW-244 (Story 5.24e): A ROW ABOUT TO GO STALE IS ASKED ABOUT AT ITS EDGE, not up to a heartbeat later — after a
      // going holder's `leave` that is the grace and a quarter of a second, so a closed tab is free no later than at HEAD
      clearTimeout(edge)
      const at = answer === null ? null : edgePoll(answer.row, answer.held)
      if (at !== null) edge = setTimeout(() => void poll(), at)
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
    /*  DW-240 (Story 5.24e): IT LEAVES, IT DOES NOT RELEASE. `leave` backdates this tab's own beat — the one it last heard,
     *  so a late leave matches nothing once the reloaded page has beaten — and the row stays this tab's for
     *  `LEAVE_GRACE_MS`: a reload's first beat keeps it, where the DELETE let another window's poll acquire in the gap. A
     *  closed tab is stale after the grace, for the next opener's edge poll. With no beat heard yet it releases, as
     *  before; Hand over keeps `release`, because there the row must go at once.
     *  ponytail: a beat still in flight as the tab goes moves `heartbeat_at` past the one heard, so that leave matches
     *  nothing and the going tab's row goes stale as a crashed tab's does (~60 s, the matrix's own error row): a close
     *  landing inside a beat's round trip, or a hard navigation whose request outlasts the next beat (the lock walk met
     *  it typing a URL away). A reload is unaffected — its own first beat keeps the row — and leaving by a link is a soft
     *  navigation, which keeps the lock anyway. The upgrade is a per-page token on the row: a column, so a migration —
     *  DW-307, Story 7.18 (R-228: the owner kept this ceiling for v1). */
    const leaving = () => {
      if (keeping.current || !latest.current.lock.holder) return
      // a tab whose id this browser does not keep comes back from a reload as ANOTHER session: the grace would only hold
      // the lock against it, so that tab releases, as before (`tabSessionKept`)
      const beat = tabSessionKept(tabId.current) ? (latest.current.lock.row?.beat ?? null) : null
      void askLock(lockAt(), beat === null ? { intent: 'release', session: tabId.current } : { intent: 'leave', session: tabId.current, beat }, true)
    }
    window.addEventListener('pagehide', leaving)
    return () => {
      alive = false
      clearTimeout(edge)
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

  /** DW-241 (Story 5.24e): LOSING THE LOCK CLOSES WHAT EDITS (R-192) — whichever way it goes: `land()`'s flip, Hand over or
   *  the sync route's 423. Before this, a menu, a confirm or a field opened while holding stayed open on a reader's
   *  screen, live-looking over a panel that had greyed (four of five, at the Create): every menu (`closeMenus`); every
   *  confirm and picker the editor draws — Site Remix, the panel's Reset box, Clear dark overrides, Rename, the site-wide
   *  Hide confirm, the Section Picker — all of which edit, while the shortcuts card only lists keys and stays; and a
   *  field being typed in, ended by its own end, which redraws its section from the doc (the typing was refused by
   *  `commit`'s guard). What only views — selection, View as, Template, the devices — stays live, as R-192 rules. */
  useEffect(() => {
    if (lock.holder) return
    closeMenus()
    for (const open of document.querySelectorAll<HTMLDialogElement>('[data-editor] dialog[open]:not([data-shortcuts-sheet])')) open.close()
    editing.current?.inline.end()
  }, [lock.holder])

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
      // R-217: never for a section pointed at from its Layers row — the hairline is a place to press, and that is the canvas's
      root.toggleAttribute('data-inflozo-insert', on && now.canAdd && same(placed, now.hovered) && hoverVia.current !== 'layers')
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
    // Story 5.23a: every root is written here, outside the paint, so no record of a drawing may be trusted after it —
    // not even when a flip back returns the mode the page was drawn in before the next paint
    drawn.current.clear()
    roots.current.forEach((root, n) => {
      const placed = now.stack[n]
      const input = placed ? slice(placed) : undefined
      if (root && input) stampControls(root as unknown as RuntimeElement, input)
    })
    // `stampControls` strips every root `data-*` it does not own, `data-inflozo-*` included
    mark()
    // Story 5.23b: the chrome asks `pinned` only when it renders, and every restamp in place asks it again, as the canvas's
    // scroll listener does. No flip can move a root between the two layers today — the mode-scoped controls are colours
    // (`bg`, the fixture's `tint`) — but the declaration decides, never the name (`controls.ts`'s `scoped`), so a design
    // declaring a mode-scoped position works the day it lands; the flip renders the editor anyway, so this costs nothing
    setPinTick((t) => t + 1)
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
    // would be Desktop for ever and every later press would be swallowed as "already showing" — and since Story 5.23b
    // the handler writes it, as every handler writes what it changes (R-210's Always)
    if (next.name === latest.current.device.name) return
    latest.current = { ...latest.current, device: next }
    setDevice(next)
    setSaid(deviceShown(next))
  }

  /* ─── Story 5.18 — THE READS THE CUSTOMER ASKS FOR, and the ONE paint each one lands in ────────────────────────── */

  /** Every Content API read a surface beyond the canvas stands on — `@site`, and the lists in hand D5e, the Link
   *  Picker and R-193's starting archive read — asked for at every press so a stale one revalidates in the background. */
  const SURFACES: readonly LiveQuery[] = [SETTINGS, LISTS.post, LISTS.page, LISTS.tag, LISTS.author]

  /** THE PAGE `now` DESCRIBES, AS THE SITE ANSWERS IT — `sitePage` over the rows in hand: every target a section of it
   *  renders at and every design it draws, so one walk says what it still needs or, missing nothing, what it is. */
  const siteOf = (now: typeof latest.current) => {
    const s = readsOf()
    if (s === null) return null
    const pageFile = pageFileOf(now.key, now.page)
    return sitePage(s.peek, {
      file: CANVASES[now.key].file,
      stored: now.stored,
      page: now.page,
      pageFile,
      targets: [...new Set([pageFile, ...now.stack.map((i) => i.target)])],
      // Story 5.19 — every section's OWN queries, folded, and a secondary feed's: one read per distinct query
      queries: Object.fromEntries(now.stack.map((i) => [queryKey(i), queriesOf(i)])),
      perPage: postsPerPage,
      // Story 5.20 — and each post's `access` re-read for the visitor View as previews (Ghost's own rule)
      visitor: now.viewAs,
    })
  }

  /** the canvas taken off while another page's reads are in flight: its roots are index-aligned with the stack it was
   *  painted from, which is no longer the stack in force, so nothing on it may be pointed at or pressed */
  const blank = () => {
    const mount = frame.current?.contentDocument?.getElementById('canvas')
    behaviours.current?.stop()
    behaviours.current = null
    if (mount) mount.innerHTML = ''
    roots.current = []
    stamps.current = new Map()
    drawn.current.clear()
    paintedAt.current = null
    latest.current.hovered = null
    setHovered(null)
    setBlanked(true)
  }

  /** the SOURCE menu, closed once the paint its choice was waiting for has landed (R-98) */
  const closeSourceMenu = () => {
    const menu = document.getElementById('editor-source-menu')
    if (menu?.matches(':popover-open')) menu.hidePopover()
  }

  /**
   * A READ THE CUSTOMER ASKED FOR — opening the editor, a canvas, a subject, page 2, a source (never a paint, and never
   * an edit): the reads the page on screen needs, then ONE paint when they land. With the sample chosen, or every read
   * already in memory, it paints at once — in this same task — and answers true; otherwise it answers false, `row`
   * says it is loading (R-98) and every other paint waits for this one. A read that does not answer is not asked for
   * again by the same press: the page is then sample content throughout, and the pill says why. `then` runs after the
   * paint, with the reason the canvas had to go back to page 1 where a list turned out to fit one page (R-176).
   */
  const request = (row: string | null = null, then?: (reason: string | null) => void): boolean => {
    const s = readsOf()
    const turn = ++readTurn.current
    const land = () => {
      if (turn !== readTurn.current) return
      pending.current = false
      if (s !== null) {
        setBusy(null)
        setLiveTick((n) => n + 1)
      }
      // THE PAGE IN FORCE for what is about to paint: a source or a subject whose list fits one page has no page 2
      const now = latest.current
      const view = now.source === 'site' ? siteOf(now) : null
      const ready = view !== null && 'ready' in view && reads.current?.reading().stopped === null ? view.ready : null
      const subject = ready?.subject ?? orbitWeekly.resolveSubject(CANVASES[now.key].file, now.stored).subject
      const force = pageInForce(now.page, now.key, now.docs, subject, ready?.source ?? sampleSource)
      if (force.page !== now.page) switchPage(force.page)
      paint()
      then?.(force.page !== now.page ? force.reason : null)
    }
    if (s === null || latest.current.source !== 'site' || s.reading().stopped !== null) {
      land()
      return true
    }
    let waited = false
    void (async () => {
      try {
        const tried = new Set<string>()
        for (let first = true; ; first = false) {
          const view = siteOf(latest.current)
          const need = view !== null && 'need' in view ? view.need : []
          // a read this press already asked for did not answer: this page is sample content throughout
          if (need.some((q) => tried.has(liveKey(q)))) break
          const wanted = first ? [...need, ...SURFACES] : need
          const missing = s.missing(wanted)
          if (missing.length === 0) {
            // every read in memory: a stale one is shown at once and revalidated once in the background, never painted
            void s.ensure(wanted)
            break
          }
          for (const q of missing) {
            tried.add(liveKey(q))
            // Story 5.19: and a paint never asks it again (`editReads`) — the press's own answer stands
            editReads.current.add(liveKey(q))
          }
          waited = true
          pending.current = true
          if (row !== null) setBusy(row)
          // a NEW PAGE — another canvas, or page 2 — is not drawn until its reads land: the old one's sections are taken
          // off rather than left under a stack that no longer matches them, and the card shows the skeleton meanwhile
          if (paintedAt.current !== null && (paintedAt.current.key !== latest.current.key || paintedAt.current.page !== latest.current.page)) blank()
          await s.ensure(wanted)
          if (turn !== readTurn.current) return
          if (s.reading().stopped !== null) break
        }
        land()
      } catch (error) {
        // review (2026-09-24): a walk that throws over an answer's shape must not leave `pending` set, which would drop
        // every later paint of the session in silence — it lands as the error boundary, as a paint that throws does
        if (turn !== readTurn.current) return
        pending.current = false
        setBusy(null)
        setFailure(error instanceof Error ? error : new Error(String(error)))
      }
    })()
    return !waited
  }

  /** THE PICKER'S CARDS AND THE RING'S TILES read their designs' `{{#get}}` rows as they open — the same store, so a key
   *  the canvas already holds costs nothing — and repaint when those rows land (FR-H4 names the picker's previews). */
  const requestDesigns = (designs: readonly SectionRegistryEntry[]) => {
    const s = readsOf()
    if (s === null || latest.current.source !== 'site' || s.reading().stopped !== null) return
    const wanted = designs.flatMap((e) =>
      Object.values(e.dataBindings ?? {}).flatMap((b) => {
        // DW-259 (Story 5.24e): a hand-picked list past `LIST_LIMIT` is read in chunks, each its own read
        const r = bindingReads(b)
        return [...r.newest, ...r.oldest]
      }),
    )
    if (s.missing(wanted).length === 0) {
      void s.ensure(wanted)
      return
    }
    void s.ensure(wanted).then(() => setLiveTick((n) => n + 1))
  }

  /** A CARD'S OR A TILE'S CONTENT, ONE SOURCE PER CARD: the site's where every read it needs is in hand and the canvas
   *  shows the site, else nothing — and the card draws the sample, whole. */
  // keyed on WHETHER the site shows, never on the paint itself: every edit paints, and a card that repainted with it
  // would redraw the whole picker on every keystroke
  const siteShown = livePage !== null
  const cardLive = useMemo(() => {
    const s = reads.current
    if (!siteShown || s === null) return undefined
    return (entry: SectionRegistryEntry, target: string): { context: RenderContext; rows: DesignRows | undefined } | null => {
      const view = sitePage(s.peek, { file: canvas.file, stored: storedSubject, page: 1, pageFile: canvas.file, targets: [target], queries: { [entry.id]: entry.dataBindings ?? {} }, perPage: postsPerPage })
      return 'ready' in view && s.reading().stopped === null ? { context: view.ready.contexts[target] as RenderContext, rows: view.ready.rows[entry.id] } : null
    }
  }, [siteShown, liveTick, canvas.file, storedSubject])

  /** STORY 5.18's PRESS — A SOURCE, from the pill's SOURCE group or R-194's note in the panel: ONE action, two doors.
   *  A VIEW, never an edit: nothing is stored, journalled or undoable, and a session reading along can still switch
   *  it (R-192). Sample content repaints at once from the bundled data. Choosing the site is the ONE "try again" —
   *  never after a refused key or the ceiling, where the row is greyed — and its row says it is loading until the
   *  paint lands (R-98). Answers true where the paint has already landed. */
  const chooseSource = (next: 'site' | 'sample'): boolean => {
    if (next === 'sample') {
      latest.current = { ...latest.current, source: 'sample' }
      setSource('sample')
      return request(null, (reason) => {
        closeSourceMenu()
        setSaid(reason === null ? LIVE_WORDS.showingSample : `${LIVE_WORDS.showingSample} ${leftBecause(reason)}`)
      })
    }
    const s = readsOf()
    if (s === null || !retriable(s.reading().stopped)) return true
    s.retry()
    // review (2026-09-25): the one "try again" (5.18's `retried`) covers an edit's own reads too — a paint may ask again
    editReads.current.clear()
    announcedCauses.current.clear()
    latest.current = { ...latest.current, source: 'site' }
    setSource('site')
    return request('site', (reason) => {
      closeSourceMenu()
      const shown = paintedRef.current
      const name = siteNameOf()
      // one failure is silent (FR-H4's split), and a named cause has already been said by the paint that showed it
      if (shown.source === 'site') setSaid(reason === null ? LIVE_WORDS.showing(name) : `${LIVE_WORDS.showing(name)} ${leftBecause(reason)}`)
    })
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
   *
   * STORY 5.18 — A SUBJECT CHOSEN OVER THE SITE carries the site's mark, so it is only ever "gone" from its own source,
   * and a subject whose content must be read says so on its row until its paint lands (R-98). Answers true where the
   * paint has already landed, so the menu closes at once as it always did.
   */
  const chooseSubject = (picked: orbitWeekly.Subject): boolean => {
    const stored = templateKeyOf(latest.current.key)
    const next: orbitWeekly.Subject = livePage !== null ? { kind: picked.kind, slug: picked.slug, source: 'site' } : { kind: picked.kind, slug: picked.slug }
    setSubjects((was) => ({ ...was, [stored]: next }))
    setSubjectRefusal(null)
    // `latest`, not the state: `paint()` reads through it in this same task, before React has re-rendered
    latest.current = { ...latest.current, subject: next, stored: next }
    // STORY 5.16 — a subject whose archive fits one page has no page 2 (R-176): `request` puts the canvas on page 1
    // BEFORE the paint, and the sentence says why
    const done = request(next.slug, (reason) => {
      closeSourceMenu()
      // Story 5.18: a subject chosen over the site whose read did not answer is NOT what the canvas shows — the sample's
      // own starting subject is, silently (FR-H4's one-failure tier; a named cause the paint has said already) — so it
      // is never announced as if it were. Review (2026-09-24): and the same the other way — a sample subject picked
      // while the site was chosen but not showing, whose press then brought the site back, shows the site's own
      // starting subject (`resolveSubject`'s source rule), so only a choice the paint used is said
      if (paintedRef.current.source !== (next.source ?? 'sample')) return
      setSaid(reason === null ? SUBJECT_SAID(next, subjectRows) : `${SUBJECT_SAID(next, subjectRows)} ${leftBecause(reason)}`)
    })
    sendPick(stored, next)
    return done
  }

  /** The pick's write. DW-223 (Story 5.24e): the pick waits in this tab's store from before the action leaves until its
   *  answer — kept or refused — so a reload in between brings it back and sends it again (`waiting`, below). */
  const sendPick = (stored: string, next: orbitWeekly.Subject) => {
    writePending(tabStore(), project.id, stored, next)
    const turn = ++subjectTurn.current
    startSubject(async () => {
      // a thrown call (the network dropped) is the same refusal as a returned one, never the error boundary — but only an
      // ANSWER clears the waiting pick: a call that threw may have landed or not, and the commonest throw is this very
      // page going away mid-call, the reload the pick waits for (executed: clearing on it lost the pick every time)
      const answer = await setPreviewSubject(project.id, stored, next).then(
        (said) => {
          clearPending(tabStore(), project.id, stored, next)
          return said
        },
        // …so its sentence is the one that is true of a pick still waiting, never `SAVE_REFUSED`'s "will go back"
        () => ({ error: SAVE_UNANSWERED }),
      )
      // review, 2026-09-21: an answer that a later choice or a canvas switch has overtaken is dropped — a refusal
      // belongs to the canvas and the choice it was refused on. And it is SAID: the menu that carries the sentence
      // closed with the choice, so `#editor-said` is the only place it can be heard.
      if (!('error' in answer) || turn !== subjectTurn.current || templateKeyOf(latest.current.key) !== stored) return
      setSubjectRefusal(answer.error)
      setSaid(answer.error)
    })
  }
  // DW-223: the picks a reload interrupted are sent again as the editor opens — each was shown from the first paint
  useEffect(() => {
    for (const [stored, pick] of Object.entries(waiting)) sendPick(stored, pick)
    // mount only: `waiting` is read once, as the editor opens
  }, [])

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
    // Story 5.20 — a template surface is no page of the site, so it has no Preview: B3a's pill is absent there, and `P`
    // does nothing (the spec's top bar for the Paywall canvas carries no Preview)
    if (latest.current.preview || isSurface(latest.current.key)) return
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
    if (now.page === 2 || !offersPageTwo(now.key, now.docs, now.subject, now.contentSource)) return
    switchPage(2)
    // Story 5.18: page 2 is a read the customer asked for — on the site's content its rows are read, then painted
    request(null, (reason) => setSaid(reason === null ? ENTERED_SAID : leftBecause(reason)))
  }
  /** Back to page 1 — the pill's button or the row's 1. Focus goes to the canvas from the pill, and stays on the row
   *  from the row: the panel is keyed across the switch (`acrossPages`), so the pressed radio is the same element. */
  const leavePageTwo = (from: 'pill' | 'row') => {
    if (latest.current.page === 1) return
    switchPage(1)
    // page 1's own rows are always in hand once page 2 has been (its count decides the offer), so this paints at once
    request(null, () => setSaid(LEFT_SAID))
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

  const choose = (asked: Pick | null) => {
    // Story 5.21's Fix: one selection — choosing a section, or nothing, lets a chosen Ghost row go
    if (ghostChosenNow.current !== null) {
      ghostChosenNow.current = null
      setGhostChosen(null)
    }
    // STORY 5.20 — ON THE PAYWALL CANVAS THE PANEL IS THE PAYWALL'S: "nothing selected" there is its one instance, where
    // a design is chosen, so its ring and its controls stay in the panel whatever the press — the box is the only thing
    // on the canvas a customer can change, and C3a draws it selected
    const only = isSurface(latest.current.key) ? latest.current.stack[0] : undefined
    const pick = asked === null && only !== undefined ? { doc: only.doc, instanceId: only.instanceId } : asked
    if (same(pick, latest.current.selected) || (!pick && !latest.current.selected)) return
    latest.current.selected = pick
    setSelected(pick)
    showNote(null)
    // a change of selection ends editing
    editing.current?.inline.end()
    mark()
    // STORY 5.22 — below 1280 a CUSTOMER's pick opens Controls as the overlay (D8). Only a non-null `asked` is one: the
    // Paywall canvas maps `choose(null)` to its one instance, and that is the editor choosing, not the customer
    if (asked !== null) openSheet('controls')
  }
  /** R-217 (DW-188, Story 5.24e): `via` says where the pointer is. Over the canvas a pointed section gets S4b's whole
   *  hover — outline, name tag, pill and the insertion hairline; over its LAYERS ROW it gets the outline and the name tag
   *  alone, nothing pressable, and the page never moves (only a click reveals, R-156). */
  const point = (pick: Pick | null, via: 'canvas' | 'layers' = 'canvas') => {
    if ((same(pick, latest.current.hovered) || (!pick && !latest.current.hovered)) && via === hoverVia.current) return
    latest.current.hovered = pick
    hoverVia.current = via
    setHovered(pick)
    setPointedFrom(via)
    mark()
  }

  /** STORY 5.21 — GHOST'S TWO SURFACES ON THE CANVAS (FR-H5): the announcement strip as the body's FIRST child, before
   *  `#canvas` — where Ghost prepends `#announcement-bar-root`, so it takes real space and pushes the design down — and
   *  Portal's button as a shadow host at the body's END — at rest; the chrome hosts the editor appends later on a hover
   *  or a selection (`chromeLayers`) may follow it, and stack above it as they do above Portal's own — fixed bottom-right.
   *  Drawn by `paint()` after it writes `#canvas`,
   *  and by a re-read that lands (the shims alone); never by `/pilots`, the Picker, the ring or any snapshot, which never
   *  call this. Every rule is `lib/ghost-surfaces.ts`'s; this is the DOM write. Both go and come back whole each time,
   *  per the visitor View as previews, the snapshot in hand and the canvas in force (never a template surface). Dark mode
   *  and a device change need no redraw: the strip is Ghost's look, and the button's 640px rule is a media query. */
  const drawShims = (doc: Document) => {
    const now = latest.current
    const s = shimsOn(now.key, site) ? surfacesNow.current : null
    // the stored HTML is parsed in an INERT document — `DOMParser`'s runs nothing and loads nothing
    const bar = announcementFor(s, now.viewAs, inertBody)
    const look = portalFor(s, membersNow.current, now.viewAs)
    for (const el of doc.querySelectorAll('[data-ghost-surface]')) el.remove()
    const root = (shim: Shim) => {
      const el = doc.createElement('div')
      for (const [name, value] of Object.entries(shim.attributes)) el.setAttribute(name, value)
      return el
    }
    // Story 5.21's Fix: a hidden shim is not drawn — while building; Preview shows the site as a visitor meets it
    const hidden = latest.current.preview ? [] : ghostHiddenNow.current
    if (bar !== null && s !== null && !hidden.includes(SURFACE.strip)) {
      // Ghost's script appends its sheet to `<head>` once, at run time — so does this, once per canvas document, and it
      // stays there once a bar has drawn (a canvas with the sheet and no strip is the Paid visitor's, and inert)
      if (doc.head.querySelector(`[${SHEET}]`) === null) {
        const sheet = doc.createElement('style')
        sheet.setAttribute(SHEET, SURFACE.strip)
        sheet.textContent = ANNOUNCEMENT_CSS
        doc.head.append(sheet)
      }
      const shim = stripMarkup(bar, s.accent)
      const strip = root(shim)
      strip.innerHTML = shim.html
      doc.body.prepend(strip)
    }
    if (look !== null && s !== null && !hidden.includes(SURFACE.button)) {
      const shim = buttonMarkup(look, s.accent)
      const host = root(shim)
      host.attachShadow({ mode: 'open' }).innerHTML = shim.html
      doc.body.append(host)
    }
  }
  /** Story 5.21's Fix — what a pointer meets of a shim, and what its chrome is drawn on: the strip's root, and the
   *  button's pill inside its fixed frame (`pinned` walks up to the frame, so the pill's chrome rides the viewport) */
  const ghostEl = (id: SurfaceId | null): HTMLElement | null => {
    const doc = frame.current?.contentDocument
    const root = id === null || !doc ? null : doc.querySelector<HTMLElement>(`[data-ghost-surface="${id}"]`)
    if (!root) return null
    return id === SURFACE.button ? (root.shadowRoot?.querySelector<HTMLElement>('.gh-portal-triggerbtn-container') ?? null) : root
  }
  /** the shim under a point, BY ITS BOX: both let every event through (inert, `pointer-events: none`), so no target ever
   *  names them — the drawn box does. A box with no size (the button below 640px) is nothing to meet. */
  const ghostAt = (x: number, y: number): SurfaceId | null => {
    for (const { id } of GHOST_ROWS) {
      const r = ghostEl(id)?.getBoundingClientRect()
      if (r && r.width > 0 && r.height > 0 && x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) return id
    }
    return null
  }
  const pointGhost = (id: SurfaceId | null) => {
    if (ghostHoverNow.current === id) return
    ghostHoverNow.current = id
    setGhostHover(id)
  }
  /** a chosen row: the one selection, so any section is let go first (`choose(null)` also clears a chosen row) */
  const chooseGhost = (id: SurfaceId) => {
    choose(null)
    ghostChosenNow.current = id
    setGhostChosen(id)
  }
  /** the shims redrawn where a painted canvas stands — a hidden list changed, or Preview entered or left */
  const redrawShims = () => {
    const doc = frame.current?.contentDocument
    if (doc && paintedAt.current !== null && doc.getElementById('canvas') !== null) drawShims(doc)
  }
  const toggleGhostHidden = (id: SurfaceId) => {
    const was = ghostHiddenNow.current.includes(id)
    const next = was ? ghostHiddenNow.current.filter((h) => h !== id) : [...ghostHiddenNow.current, id]
    ghostHiddenNow.current = next
    setGhostHidden(next)
    writeHidden(window.localStorage, project.id, next)
    redrawShims()
    setSaid(was ? GHOST_WORDS.shown(ghostName(id)) : GHOST_WORDS.hidden(ghostName(id)))
  }
  useEffect(() => {
    // this browser's list, read once as the editor opens — after the first render, so the server's markup is not
    // contradicted on hydration
    const stored = readHidden(window.localStorage, project.id)
    if (stored.length === 0) return
    ghostHiddenNow.current = stored
    setGhostHidden(stored)
    redrawShims()
    // once, as the editor opens; the store is read here alone
  }, [])
  useEffect(() => {
    // Preview shows a hidden shim — the site as a visitor meets it — and leaving Preview hides it again
    redrawShims()
    // `latest.current.preview` is what `drawShims` reads, and it is set by this render
  }, [preview])

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
    // STORY 5.18: AND WHILE A READ THE CUSTOMER ASKED FOR IS IN FLIGHT. It paints when it lands, so no page is ever
    // painted from half its reads — which is also how the first paint of the site's content waits for its reads, as it
    // waits for the hydrate above.
    if (pending.current) return
    const now = latest.current
    // DW-275 (Story 5.24e): AND, ON A SURFACE, UNTIL ITS POST-BODY SHEET HAS LANDED. The sheet is no longer inlined in every
    // canvas document (`pilots.ts`), so the first Paywall paint links it in — before `3-pilots`, the place its `data-order`
    // always held, or last in the head where that is missing — and every paint waits until it is MARKED landed: its
    // `load` (or `error`, which paints without it rather than never) sets the mark and paints again. A link that is only
    // PRESENT is not enough — a paint in between drew the article unstyled and measured the cut on it (the review).
    const surfaceSheet = doc.querySelector<HTMLLinkElement>('[data-order="2b-surface"]')
    if (isSurface(now.key) && !surfaceSheet?.hasAttribute('data-landed')) {
      if (surfaceSheet === null) {
        const link = doc.createElement('link')
        link.rel = 'stylesheet'
        link.href = surfaceSheetSrc(src)
        link.setAttribute('data-order', '2b-surface')
        const landed = () => {
          link.setAttribute('data-landed', '')
          paint()
        }
        link.addEventListener('load', landed, { once: true })
        link.addEventListener('error', landed, { once: true })
        const pilots = doc.querySelector('[data-order="3-pilots"]')
        if (pilots) pilots.before(link)
        else doc.head.append(link)
      }
      return
    }
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
      const pageFile = pageFileOf(now.key, now.page)
      // STORY 5.18 — ONE SOURCE THROUGHOUT. The site's content where it was chosen, reading has not stopped and every
      // read this page needs is in hand; otherwise the sample, WHOLE — and a subject chosen over the site is then the
      // sample's own starting subject, silently (`resolveSubject`'s source rule).
      const view = now.source === 'site' ? siteOf(now) : null
      const reading = reads.current?.reading()
      // STORY 5.19 — AN EDIT CAN NEED A READ NO PRESS HAS MADE: a Source, a tag, a writer or picks chosen, a feed placed
      // or duplicated — a query that is the INSTANCE's, which nothing read in advance. Painted as it stood, that page
      // would drop WHOLE to the sample (one source per render). So the paint hands it to the one door a read goes
      // through, `request()`, which paints when the rows land — each such read asked once (`editReads`), so one that
      // does not answer leaves the page on the sample, as a press's does. Meanwhile the old paint stays on screen but
      // nothing on it may be pointed at or pressed: its roots are aligned with the stack it was painted from.
      if (view !== null && 'need' in view && reading?.stopped === null && view.need.some((q) => !editReads.current.has(liveKey(q)))) {
        for (const q of view.need) editReads.current.add(liveKey(q))
        roots.current = []
        stamps.current = new Map()
        // Story 5.23a: the page left standing is not a drawing anything may be kept from
        drawn.current.clear()
        latest.current.hovered = null
        setHovered(null)
        mark()
        request()
        return
      }
      const live = view !== null && 'ready' in view && reading?.stopped === null ? view.ready : null
      const sampleSubject = orbitWeekly.resolveSubject(CANVASES[now.key].file, now.stored).subject
      // STORY 5.20 — THE PAYWALL SURFACE: a visitor who may read the paid post meets the whole article and no box, as
      // Ghost renders the partial only where access is false — so its instance, where one is chosen, renders nothing
      const paywall = isSurface(now.key)
      const whole = paywall && postAccess({ visibility: 'paid' }, now.viewAs)
      const { site: at } = live !== null ? (live.contexts[pageFile] as RenderContext) : orbitWeekly.templateContext(pageFile, feed, sampleSubject, postsPerPage)
      const url = at.currentUrl
      const pageNumber = now.page === 2 ? (at.pagination as { page?: number } | undefined)?.page : undefined
      /** One section's markup, exactly as every paint has drawn it. */
      const partOf = (i: Placed): string => {
        const entry: SectionRegistryEntry | undefined = entries[i.designId]
        if (!entry) throw new Error(`${i.designId} was not read for this project`)
        // Story 5.4: HIDDEN IS RETAINED, NEVER REMOVED — the instance stays in the doc and renders nothing, so it owns no
        // node and has no root, exactly as a member-gated section, and Epic 7 leaves it out of the compile. R-124's
        // audience reaches the render door as `visibility`, which gates the root on both emitters.
        if (i.hidden || whole) return ''
        // Story 5.6: a repaint in dark must draw the DARK render — the mode picks the stored slice handed to the one
        // door, here as it does in `restampAll` and `onChange`, so no repaint ever silently returns to light
        // Story 5.13: the canvas's resolved subject reaches every section through the ONE door. A site-wide section
        // compiles to `default.hbs`, which carries no resource of its own, so the argument is simply unused there.
        // Story 5.14: and so does the visitor View as is previewing — Story 4.10's `gateMembers` decides the rest.
        // Story 5.18: and the SOURCE — the site's assembled context and rows, or nothing, which is today's render
        // Story 5.19: THE INSTANCE'S OWN QUERIES — its folded declared ones and, for a secondary feed, its own — and their
        // rows from the source in force; the main feed keeps the page's native posts, sized by the project's page size
        const queries = queriesOf(i)
        const secondary = queries[FEED_KEY]
        const own: DesignRows | undefined = live === null ? sampleRows(queries) : live.rows[queryKey(i)]
        return renderSection(doc, entry, { ...i, controls: storedFor(entry, i, now.mode) }, {
          target: i.target, rows: own, feed, url, page: pageNumber, member: now.viewAs, visibility: i.memberVisibility,
          assets, icons: lookup, editing: true, subject: sampleSubject, perPage: postsPerPage, visitor: now.viewAs,
          live: live === null ? undefined : { context: live.contexts[i.target] as RenderContext, rows: own },
          secondary: secondary === undefined ? undefined : { query: secondary, rows: rowsFor(secondary, own?.[FEED_KEY]) },
        })
      }
      // Story 5.3: the stamps are lifted into memory in the same task they are parsed, so none is ever painted or observable
      const STAMPED = '[data-inflozo-prop], [data-inflozo-ghost]'
      /* STORY 5.23a — THE KEYED PAINT (R-206): a section whose stack entry (its JSON — equal JSON is equal plain data, so a
         false "same" cannot happen) and render context are both unchanged KEEPS ITS NODES; any other is rendered and
         parsed alone. The context is every input of `renderSection` but the instance — the icons are set once before the
         first paint and the design entries never change in a session — plus Preview, which decides how `core` starts;
         so another canvas, page, mode, visitor, subject or source, Preview, or a read that lands repaints the page.
         One walk: a full repaint is the same walk with nothing to reuse. */
      const context = JSON.stringify([
        now.key, now.page, pageFile, feed, url, pageNumber ?? null, now.mode, now.viewAs, now.preview, now.source,
        live === null ? null : (reads.current?.version() ?? null), now.stored ?? null, sampleSubject ?? null, postsPerPage, assets,
      ])
      const keep = context === drawnUnder.current ? drawn.current : new Map<string, Drawn>()
      /* EACH PART IS PARSED ALONE, with an element of `#canvas`'s own kind in the canvas document as its context — the
         parse `#canvas.innerHTML` gave the whole page before — so a section parses the same whether it is redrawn alone or
         with every other. Through `innerHTML` and never `Range.createContextualFragment`, which un-marks a `<script>`: EXECUTED
         (2026-09-27) on the harness canvas under its own policy, a `<script src>` inserted from a contextual fragment was
         fetched and RAN — `'strict-dynamic'` admits a script that is not parser-inserted — while `innerHTML` and a
         `<template>` fetched nothing. No part carries a script (`validate.ts`'s `authored-script`), and this keeps it inert
         if one ever did. */
      const parse = (html: string): ChildNode[] => {
        if (html === '') return []
        const into = doc.createElement(mount.localName)
        into.innerHTML = html
        return [...into.childNodes]
      }
      const order = paywall
        ? []
        : now.stack.map((i): [string, Drawn] => {
            const id = queryKey(i)
            const sig = JSON.stringify(i)
            const was = keep.get(id)
            if (was !== undefined && was.sig === sig && was.nodes.every((node) => node.parentNode === mount)) return [id, was]
            // a section OWNS every top-level node its part parses to — the controls fixtures open with a comment — and its
            // root is the one element among them; a hidden or gated section's `''` owns nothing and has no root
            const nodes = parse(partOf(i))
            const elements = nodes.filter((node): node is HTMLElement => node.nodeType === Node.ELEMENT_NODE)
            const stamped = elements.flatMap((el) => [...(el.matches(STAMPED) ? [el] : []), ...el.querySelectorAll<HTMLElement>(STAMPED)])
            return [id, { sig, nodes, root: elements[0] ?? null, stamps: takeStamps(stamped) }]
          })
      // Story 5.20: the surface's page is written whole, as it always was, and keeps no drawing
      const parts = paywall ? now.stack.map(partOf) : []
      // Story 5.15: the behaviours running on the markup about to be replaced stop first, putting every mount back
      // at rest — and the new markup is written PLAIN. Whether a mount runs is `core`'s to say, mount by mount, below;
      // `mountSections`' blanket `js-enabled` drew every mount in its JavaScript branch with nothing running.
      // ponytail: EVERY mount stops and restarts, kept or not — `core` scans the whole document once at start and has no
      // per-root scope, and a full repaint restarted them all before Story 5.23a; `sync()` already halts and restarts a
      // mount on the same element, so a module survives it. Scope it to the redrawn sections the day a running module's
      // restart becomes visible — a change to `core.js`, which is Ask First.
      behaviours.current?.stop()
      behaviours.current = null
      // STORY 5.20 — the post-body stylesheet is ON for the surface alone, and the surface's page is the article, the cut
      // and the box, its instance's markup inside the box (`paywallPage`). DW-275: it is the `<link>` the first Paywall
      // paint put in (above), absent from a canvas that has never shown the surface
      if (surfaceSheet) surfaceSheet.media = paywall ? 'all' : 'not all'
      const arriving = paintedAt.current?.key !== now.key
      const accent = live !== null ? live.site['accent_color'] : orbitWeekly.site().accent_color
      /** did this paint KEEP the hovered section's drawing? Then the node under a resting pointer is the same node */
      let hoverKept = false
      if (paywall) {
        // DW-273 (Story 5.24e): the connection's major, as the shims follow the connection and not the content pill
        mount.innerHTML = paywallPage({ visitor: now.viewAs, accent, box: parts.some((p) => p !== '') ? parts.join('') : null, major: site?.major })
        stamps.current = takeStamps(mount.querySelectorAll<HTMLElement>(STAMPED))
        // a section's root is its part's element — on the surface, in the box
        roots.current = sectionRoots(parts, mount.querySelector('[data-inflozo-box]') ?? mount) as (HTMLElement | null)[]
        drawn.current = new Map()
        drawnUnder.current = null
      } else {
        // every child no kept drawing owns goes (the last page's, a blanked canvas's, the surface's); then each drawing's
        // nodes are put in stack order — a kept node already in its place stays where it is, so a move moves one section
        const owned = new Set(order.flatMap(([, d]) => d.nodes))
        for (const node of [...mount.childNodes]) if (!owned.has(node)) node.remove()
        let cursor = mount.firstChild
        for (const [, d] of order) {
          for (const node of d.nodes) {
            if (node === cursor) cursor = node.nextSibling
            else mount.insertBefore(node, cursor)
          }
        }
        const hoveredKey = now.hovered === null ? null : queryKey(now.hovered)
        hoverKept = order.some(([id, d]) => id === hoveredKey && d === keep.get(id))
        drawn.current = new Map(order)
        drawnUnder.current = context
        // document order, section by section — `sameLock`'s index reads it
        stamps.current = new Map(order.flatMap(([, d]) => [...d.stamps]))
        roots.current = order.map(([, d]) => d.root)
      }
      // STORY 5.21 — Ghost's strip and button, outside `#canvas`, for the visitor and the canvas this paint drew
      drawShims(doc)
      const back = lock && lock.at >= 0 ? sameLock(lock.words)[lock.at] : undefined
      if (back && lock) showNote({ el: back, kind: 'lock', words: lock.words })
      // STORY 5.20 — the Paywall canvas OPENS at the cut (or where the gated part begins): the article above it is context
      const cut = paywall && arriving ? mount.querySelector('[data-inflozo-cut], [data-inflozo-gated]') : null
      if (cut && doc.defaultView) doc.defaultView.scrollTo({ top: Math.max(0, cut.getBoundingClientRect().top + doc.defaultView.scrollY - doc.defaultView.innerHeight / 3) })
      wire(doc)
      // STORY 5.15 — `core` STARTS HERE, over the new nodes, against the canvas's own window (DW-136). While designing
      // it holds still every module that is not edit-safe and hands those mounts back for the PAUSED chip (R-174,
      // R-175); in Preview everything runs. A restamp keeps the nodes, so it never reaches here and running mounts
      // survive it.
      if (doc.defaultView) behaviours.current = startBehaviours(doc.defaultView, !now.preview, reportBehaviour)
      // the hovered root was replaced, and the pointer has not said where it is since — so the browser says it: a resting
      // pointer over a NEW node gets its own `pointerover`, which hovers it again. Over a KEPT node the browser says
      // nothing, so the hover stays, or its outline and pill would vanish under a pointer that never moved (Story 5.23a,
      // executed: a full repaint's hover came back by itself, a kept node's did not). A layout that moves other content
      // under the pointer is the browser's to report, as it always was.
      if (!hoverKept) {
        latest.current.hovered = null
        setHovered(null)
      }
      mark()
      setPaints((n) => n + 1)
      frame.current.dataset.painted = now.key
      // Story 5.16 — which page was painted, for the deployed walk to wait on: a change of page is a same-canvas repaint
      frame.current.dataset.page = String(now.page)
      // STORY 5.18 — WHAT THIS PAINT USED, which is all the pill ever says (R-165): the site's content, or the sample and
      // why, where the site was chosen — a cause in WORDS, and the named tier said aloud once (FR-H4)
      // review (2026-09-24): `last` is cleared by ANY later answer — a card's rows, a background revalidation — while
      // the read this page needed was not asked again (an edit reads nothing), so the cause the last paint gave stands
      // until a read the customer asks for replaces it
      const cause: Cause | null =
        now.source === 'site' && live === null && view !== null && !('nothing' in view) ? (reading?.stopped ?? reading?.last ?? paintedRef.current.cause) : null
      const shown: Shown = { source: live !== null ? 'site' : 'sample', cause, nothing: view !== null && 'nothing' in view ? view.nothing : null }
      paintedRef.current = shown
      paintedAt.current = { key: now.key, page: now.page }
      setBlanked(false)
      setPainted({ shown, site: live, key: now.key })
      frame.current.dataset.source = shown.source
      if (named(cause) && cause !== null && !announcedCauses.current.has(cause)) {
        announcedCauses.current.add(cause)
        setSaid(LIVE_WORDS.sentence(cause, siteNameOf()))
      }
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
    // Story 5.23a: the session writes this section's DOM itself (the span below, `lib/inline.ts`, the same prop drawn
    // twice), so its drawing is dropped — the repaint after editing ends draws it fresh, typed into or not
    drawn.current.delete(queryKey(placed))
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
  const toChrome = () => {
    // Story 5.22: below 1280 the panel is the overlay, so this door opens it and lands on its close button
    if (latest.current.compact) return openSheet('controls', true)
    ;(controls.show.current ?? controls.hide.current)?.focus()
  }

  const run = (gesture: Gesture) => {
    // R-192 — a session reading along edits nothing, whatever key asks (`lib/keymap.ts`'s `edits`)
    if (!latest.current.lock.holder && edits(gesture)) return
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
      // Story 5.22: below 1280 `L` opens and closes Layers as the overlay, as "Show layers" does; at full width, the fold
      case 'layers': return latest.current.compact ? toggleLayers() : layers.toggle((was) => !was)
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
    // STORY 5.22 — THE SHEET'S RUNG, FIRST: an overlay open below 1280 closes, the selection stays, and focus goes back
    // to what opened it (D8). The next Esc is rung 2's, as it always was.
    if (latest.current.sheet !== null) {
      e.preventDefault()
      closeSheet()
      return
    }
    // STORY 6.2 — S7a's roster is left by Esc from ANYWHERE (review, 2026-10-03): its cells are not tab stops, so focus
    // is soon outside the panel, and a handler on the panel alone left the roster open. Focus goes back to Change.
    if (latest.current.packList) {
      e.preventDefault()
      showPacks(false)
      return
    }
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
      // Story 5.21's Fix: a press on a shim is the shim's (its click chooses the row) — never a caret in what lies beneath
      if (ghostAt(e.clientX, e.clientY) !== null) {
        e.preventDefault()
        return
      }
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
      // STORY 5.21 — A STICKY ROOT IS PINNED ONLY WHILE STUCK (`pinned`): the hovered or selected root's chrome moves
      // between the page's layer and the viewport's the moment its answer changes, so re-render then — whichever of the
      // two it is. A root with no chrome drawn has no answer, and nothing to move.
      const now = latest.current
      for (const pick of [now.hovered, now.selected]) {
        const n = pick ? now.stack.findIndex((i) => same(i, pick)) : -1
        const root = n === -1 ? null : (roots.current[n] ?? null)
        const drawn = root ? drawnPinned.current.get(root) : undefined
        if (root && drawn !== undefined && drawn !== pinned(root)) {
          setPinTick((t) => t + 1)
          break
        }
      }
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
      // Story 5.21's Fix: over a shim nothing beneath is hovered — the shim is (its box, `ghostAt`)
      if (e.pointerType !== 'touch' && !latest.current.preview) point(ghostAt(e.clientX, e.clientY) === null ? pickAt(e.target) : null)
    })
    doc.addEventListener('pointermove', (e) => {
      if (e.pointerType === 'touch' || latest.current.preview) return
      const shim = ghostAt(e.clientX, e.clientY)
      pointGhost(shim)
      if (shim !== null) point(null)
    }, { passive: true })
    doc.addEventListener('pointerout', (e) => {
      if (e.pointerType === 'touch' || e.relatedTarget !== null || latest.current.preview) return
      // Story 5.4: the pointer crossing from the iframe onto S4b's pill arrives HERE, as a `pointerout` with a null
      // relatedTarget — the pill is outside the frame (AD-21) — so clearing the hover would take the pill away from
      // under the pointer that is inside it. Tested by GEOMETRY and not by the pill's own `pointerenter`, because two
      // documents' pointer events have no guaranteed order.
      if (overPill(e.clientX, e.clientY)) return
      point(null)
      pointGhost(null)
    })
    let pressed: EventTarget | null = null
    let pressedAt = { x: 0, y: 0 }
    let state = HOLD_IDLE
    let timer: ReturnType<typeof setTimeout> | undefined
    /** STORY 5.22 — THIS TAP OPENED THE CONTROLS OVERLAY. A tap selects on its lift, and the browser fires the lift's
     *  mouse events and its click AFTER that, hit-tested again — onto the scrim, or onto whichever control the overlay
     *  now puts under the finger. So the tap that opened it ends there: its `touchend` is cancelled, which is what stops
     *  the compatibility mouse events and the click (pointer events arrive before touch events, so this is set first). */
    let tapOpened = false
    const step = (event: HoldEvent) => {
      const [next, outcome] = hold(state, event)
      state = next
      if (outcome === 'hover') point(pickAt(pressed))
      if (outcome === 'tap') {
        // Story 5.21's Fix: a tap on a shim chooses its row, as a click does
        const shim = ghostAt(pressedAt.x, pressedAt.y)
        const pick = shim === null ? pickAt(pressed) : null
        if (shim !== null) chooseGhost(shim)
        else if (pick) {
          const was = latest.current.sheet
          choose(pick)
          tapOpened = latest.current.sheet !== was
        }
      }
      return outcome
    }
    doc.addEventListener('touchend', (e) => {
      if (!tapOpened) return
      tapOpened = false
      e.preventDefault()
    }, { passive: false })
    // review, 2026-09-27: a lift the browser cancels instead of ending would leave the flag armed for the NEXT tap
    doc.addEventListener('touchcancel', () => {
      tapOpened = false
    })
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
      pressedAt = { x: e.clientX, y: e.clientY }
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
      // Story 5.21's Fix: a press on a shim chooses its Layers row (Question 2) — found by its box, since the shim lets
      // the event through — and the section beneath is not taken
      const shim = ghostAt(e.clientX, e.clientY)
      if (shim !== null) {
        showNote(null)
        chooseGhost(shim)
        return
      }
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
  // Story 5.23b (review, 2026-09-28): `latest`'s selection, page and stack move with the key IN THE SAME LAYOUT EFFECT
  // PASS as the key itself — a passive effect runs after paint, and the chrome's frame loop reads `latest.stack` before
  // it would have; derived from `latest.docs`, never from a render's state, so it cannot go back (the Always).
  useLayoutEffect(() => {
    latest.current = { ...latest.current, selected: null, page: 1, stack: stackOf(latest.current.docs, key, 1, library) }
  }, [key])
  useEffect(() => {
    setSelected(null)
    // Story 5.13: a refusal belongs to the canvas it was refused on, and each canvas holds its own subject
    setSubjectRefusal(null)
    // Story 5.16: a change of canvas is page 1 — the render already shows it (`shownPage` is keyed to its canvas), and
    // this makes it stick, so the canvas left on page 2 opens on page 1 on the way back too
    setShownPage({ key, page: 1 })
    asked.current.clear()
    // Story 5.18: opening the editor and a canvas are reads the customer asked for — on the site's content they are
    // read, then painted once; with the sample, or everything in hand, this paints at once exactly as before
    request()
    // Story 5.20 — and the Paywall canvas opens with its instance in the panel, where a design is chosen (`choose`)
    if (isSurface(key)) choose(null)
    // paint reads the latest values through `latest`
  }, [key])

  /** FR-D22's "says so", ON OPEN. A stored subject that no row holds falls back to the fixture — the canvas is
   *  never empty and the stored value is never deleted — and the fallback is announced politely through the
   *  editor's one live region as well as shown in the menu. Silence would be the same failure as an empty canvas. */
  useEffect(() => {
    if (previewing.fellBack && previewing.subject !== null) setSaid(GONE(previewing.subject))
    // Story 5.18: keyed on the canvas the LAST PAINT drew, because on the site's content the subject is the painted
    // one — a canvas switch whose reads are in flight must not say "gone" about the canvas it is leaving
  }, [painted.key, previewing.fellBack])

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
    // DW-203 (Story 5.24e): A TAB THAT OPENS READING ALONG NEITHER ADOPTS NOR REWRITES THIS BROWSER'S RECORD. It shares
    // the holder's IndexedDB, and adopting its pending journal is how a reader came to send the holder's work and then
    // drop the holder's own record (executed at the Create). Asked at mount: the layout effect above has already told a
    // reload of the holder from a genuine reader. A reader that later GAINS the lock reloads, and that hydrate adopts.
    const reading = !latest.current.lock.holder
    const settle = (ok: boolean) => {
      if (!alive) return
      hydratedRef.current = true
      setHydrated(true)
      if (!ok) toFallback()
      // Story 5.18: the hydrate is the editor OPENING — its docs decide which designs the page reads for, so the reads
      // are asked for again over them (shared with any already in flight) and the first paint lands with them
      request()
    }
    void (async () => {
      // R-214 (Story 5.24e): a sign-out in another tab deletes this database, and its `versionchange` is the moment this
      // editor stops holding the work — so it falls back there and then, and its next refusal says R-227's sentence
      const opened = await openLocal(userId, () => toFallback())
      if (!alive) return
      if (!opened) {
        // NO IndexedDB: private mode, a blocked upgrade, site data switched off. Every change goes straight up and the
        // indicator says exactly that — never "Saved on this device" (FR-D10).
        settle(false)
        return
      }
      local.current = opened
      askToPersist()
      if (reading) {
        // the server's docs, already this component's props, and an empty journal — the record on disk is the holder's
        settle(true)
        return
      }
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
          // STORY 5.19 — the local hydrate is a door the main-feed rule stands at, as the server read is: a doc this
          // device kept from before the rule is repaired here and stored repaired with the next edit of its canvas
          const docs = Object.fromEntries(Object.entries(held.docs).map(([k, d]) => [k, designated(k, d)]))
          latest.current = { ...latest.current, docs, auto: new Set(back), journal: kept, stack: stackOf(docs, latest.current.key, latest.current.page, library) }
          setDocs(docs)
          setAuto(new Set(back))
          setJournal(kept)
          // review, 2026-09-22: the THIRD door page 2 can stop existing through — a local doc that outranks the server's
          // may have no main feed on page 1 — guarded as `restore()` and `chooseSubject` are: page 1 BEFORE the paint
          const force = pageInForce(latest.current.page, latest.current.key, docs, latest.current.subject, latest.current.contentSource)
          if (force.page !== latest.current.page) {
            switchPage(force.page)
            setSaid(leftBecause(force.reason ?? ''))
          }
          if (landed) void opened.save(project.id, { baseRevision: revision, docs, auto: back, journal: kept })
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
      // R-213 (Story 5.24e): BACK ON THE TAB WHILE SIGNED OUT, ONE TRY AT ONCE. The cookie jar is shared, so a sign-in
      // in another tab rides this tab's next request (executed at the Create) — and coming back is the moment to make it
      else if (signedOut.current) retryNow()
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
  /* STORY 5.22 — THE LAYOUT FOLLOWS THE WINDOW, and whatever overlay was open closes as it crosses 1280: the sheet, and
     every bar menu. Focus stays where it is — at full width both panels are docked, so nothing it was on has gone.
     AND A CONFIRM OPEN IN A PANEL THE NEW LAYOUT NO LONGER DRAWS: under a `hidden` aside a modal `<dialog>` stays open,
     modal and 0 × 0 — executed in the harness (the panel's "Reset this design?" at 1280, then 1000): every press on the
     editor was blocked by a confirm nobody could see. So it closes, which is the Cancel it would otherwise have been. */
  useEffect(() => {
    closeSheet(false)
    closeMenus()
    for (const open of document.querySelectorAll<HTMLDialogElement>('[data-editor] dialog[open]')) if (!open.checkVisibility()) open.close()
    // the layout is the question; both read the latest state through refs
  }, [compact])
  /* …and ONE OVERLAY AT A TIME (`D8:283`): a bar menu opening — Template, View as, ⋯, the save state — closes the sheet
     and keeps the focus it took. `toggle` does not bubble, so it is heard on the way DOWN, once, for every menu in the bar. */
  useEffect(() => {
    const el = bar.current
    if (!el) return
    const opened = (e: Event) => {
      if ((e as ToggleEvent).newState === 'open') closeSheet(false)
    }
    el.addEventListener('toggle', opened, true)
    return () => el.removeEventListener('toggle', opened, true)
    // mount only; `closeSheet` reads the sheet through `latest`
  }, [])
  /* …and focus follows the sheet, once it is drawn: a door that opened one to go INTO it (`L`, Show layers, the skip link,
     a Layers row) lands on its close button — the fold's own handoff, for the overlay — and a close gives focus back to
     what opened it where that can still take it, else to the canvas (an iframe opener IS the canvas: a press on the page,
     whose one tab stop is the stage). */
  useLayoutEffect(() => {
    const into = focusInto.current
    focusInto.current = null
    if (into !== null && into === sheet) return void (into === 'layers' ? layers.hide : controls.hide).current?.focus()
    const back = focusBack.current
    focusBack.current = null
    if (back === null || sheet !== null) return
    if (back !== 'stage' && back.isConnected && back.tagName !== 'IFRAME' && back.checkVisibility()) back.focus()
    else stage.current?.focus()
  }, [sheet])
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

  /** A section's root AS THE CANVAS DRAWS IT NOW: the paint's own roots, found through `latest`'s stack, which every paint
   *  is aligned with — never the render's stack, which since R-210 can be a frame behind the canvas (Story 5.23b). */
  const rootOf = (pick: Pick | null) => {
    const n = pick ? latest.current.stack.findIndex((i) => same(i, pick)) : -1
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

  /* The selected and the pointed section, KEPT BY VALUE (Story 5.23b, R-208): `stackOf` builds every entry anew on each
     change, so a move elsewhere on the page would otherwise hand the Controls panel a "new" section and redraw it whole.
     Keyed on the paint's own signature for an entry (Story 5.23a) — equal JSON is equal plain data. */
  const chosenNow = selected ? stack.find((i) => same(i, selected)) : undefined
  const chosenSig = chosenNow === undefined ? '' : JSON.stringify(chosenNow)
  const chosen = useMemo(() => chosenNow, [chosenSig])
  // Story 6.2 — a selection, or the Paywall's panel, replaces the rest panel and leaves S7a's roster with it
  const resting = !surface && !chosen
  useEffect(() => {
    if (!resting) setPackList(false)
  }, [resting])
  const pointedNow = hovered ? stack.find((i) => same(i, hovered)) : undefined
  const pointedSig = pointedNow === undefined ? '' : JSON.stringify(pointedNow)
  const pointed = useMemo(() => pointedNow, [pointedSig])
  const entry = chosen ? entries[chosen.designId] : undefined
  /* STORY 5.19 — THE PANEL'S DATA GROUP for the selected section: its part in the page's feeds (the MAIN feed's Count is
     the page size in force, greyed — D5c; a SECONDARY feed's rows are the engine's over `data.posts` and its base
     query), its queries' rows as the canvas shows them, and the lists its tag, writer and post pickers search — the
     source in force's own, since a value belongs to the source it was chosen from. */
  const role = useMemo<FeedRole | undefined>(
    () =>
      chosen === undefined || !isFeed(entry) || !PAGINATED_TARGETS.has(chosen.target) ? undefined
      : chosen.isMainFeed ? { kind: 'main', postsPerPage }
      : { kind: 'secondary', base: feedBase(postsPerPage) },
    [chosen, entry, postsPerPage],
  )
  /** the panel's design, with its part in the page's feeds where it has one — one object per section and role */
  const panelEntry = useMemo(() => (entry === undefined || role === undefined ? entry : { ...entry, feed: role }), [entry, role])
  const chosenRows = useMemo((): Readonly<Record<string, readonly unknown[]>> => {
    if (chosen === undefined || entry === undefined) return {}
    const queries = queriesOf(chosen)
    const own = livePage !== null ? livePage.rows[queryKey(chosen)] : sampleRows(queries)
    // review (2026-09-25): the site's rows for a query the last paint did not hold are NOT KNOWN yet — its read is in
    // flight — so no row is handed and the panel marks nothing lacking, rather than every pick for one round trip
    if (own === undefined) return {}
    const feed = queries[FEED_KEY]
    return { ...shownRows(entry, chosen, own), ...(feed === undefined ? {} : { [FEED_KEY]: rowsFor(feed, own?.[FEED_KEY]) }) }
  }, [chosen, entry, livePage])
  const dataLists = useMemo(() => {
    const s = reads.current
    if (livePage === null || s === null) {
      // the sample's writers' pictures sit on its reserved origin, which the canvas route serves (`withImages`)
      const picture = (url: unknown) => (typeof url === 'string' ? url.replace(new RegExp(`^${orbitWeekly.ORBIT_WEEKLY_ORIGIN.replace(/[.]/g, '\\.')}/images/([a-z0-9-]+)\\.svg$`), `${src.split('?')[0]}?image=$1`) : url)
      const authors = orbitWeekly.authors().map((a) => ({ ...a, profile_image: picture(a.profile_image) }))
      return { held: 'sample' as const, tags: orbitWeekly.tags(), authors, posts: orbitWeekly.posts(), capped: null, listCapped: { tag: null, author: null } }
    }
    // DW-248: a search at Ghost's found posts join the list, and the capped line is said only while no such search runs
    const r = reader(withFound(s.peek, search))
    const rows = (q: LiveQuery) => (r.got(q)?.rows ?? []) as readonly Readonly<Record<string, unknown>>[]
    // review (2026-09-25): the tag and writer lists are read at the same limit as the posts — a site past it is told so
    const listCapped = (which: 'tag' | 'author') => {
      const got = r.got(which === 'tag' ? LISTS.tag : LISTS.author)
      return got !== undefined && got.total > got.rows.length ? CAPPED_LIST(which, got.rows.length) : null
    }
    return {
      held: { site: siteName }, tags: rows(LISTS.tag), authors: rows(LISTS.author), posts: rows(LISTS.post),
      capped: searching ? null : cappedPosts(s.peek), listCapped: { tag: listCapped('tag'), author: listCapped('author') }, onQuery: setTerm,
    }
  }, [livePage, liveTick, siteName, searchKey, searching])
  const pro = plan === 'free' && entry?.tier === 'pro'
  /* Story 5.11 — the SELECTED section's ring feeds the panel block, the HOVERED one's feeds the pill: the pill is
     drawn for what the pointer is over, which is not always what is chosen. Both are derived, so a category that
     holds one design draws no arrow anywhere without a second rule saying so (UX-DR3). */
  const chosenRing = chosen ? ringOf(chosen.designId) : []
  const chosenAt = chosen ? chosenRing.findIndex((e) => e.id === chosen.designId) : -1
  // Story 5.18: the ring's tiles are a picker too — where the strip is drawn (a ring of more than one), its designs'
  // rows are read from the one store as it opens, and the tiles repaint when they land
  const ringKey = chosenRing.length > 1 ? chosenRing.map((e) => e.id).join(' ') : ''
  useEffect(() => {
    if (ringKey !== '') requestDesigns(chosenRing)
    // the ring's own ids are the question; `requestDesigns` reads the store and the source through refs
  }, [ringKey])

  /* STORY 5.18 — D5e's SITE ROW: greyed with its reason where choosing it could do nothing — a site that cannot be read,
     a refused key (never retried) or the ceiling (a reload starts over) — and otherwise pressable, carrying the
     sentence of the failure that put the sample on the canvas, which choosing it tries again. */
  const stopped = reads.current?.reading().stopped ?? null
  const siteRow = useMemo(
    (): { greyed: string | null; sentence: string | null } =>
      site === null ? { greyed: null, sentence: null }
      : 'unreadable' in site ? { greyed: LIVE_WORDS.unreadable(site.unreadable, siteName), sentence: null }
      : stopped !== null && !retriable(stopped) ? { greyed: LIVE_WORDS.sentence(stopped, siteName), sentence: null }
      : { greyed: null, sentence: painted.shown.cause === null ? null : LIVE_WORDS.sentence(painted.shown.cause, siteName) },
    [site, siteName, stopped, painted.shown.cause],
  )

  /* STORY 5.18 — THE PANEL'S NOTE for the selected section, while the SITE's content shows: its main feed where the whole
     list fits one page and does not fill it (a short page 2 is ordinary pagination), and each `{{#get}}` the site cannot
     fill to the limit the section asked for — zero included, which is never back-filled (R-36). R-194 puts the sample
     one press away beside it. */
  const shortfall = useMemo(() => {
    if (livePage === null || chosen === undefined || entry === undefined || reads.current === null) return null
    const r = reader(reads.current.peek)
    const notes: string[] = []
    const pagination = livePage.contexts[chosen.target]?.ghost['pagination'] as { total?: number; pages?: number } | undefined
    // Story 5.19: every query this section ASKS — its folded declared ones and a secondary feed's own — so the main feed's
    // note is the main feed's alone, and a secondary feed's is its own query's ("This site has 9 posts…")
    const queries = queriesOf(chosen)
    if (entry.bindingContext.includes('posts') && queries[FEED_KEY] === undefined && pagination !== undefined) {
      const whose = canvas.file === 'tag.hbs' ? 'tag' : canvas.file === 'author.hbs' ? 'author' : 'site'
      const note = feedShortfall(whose, pagination.total ?? 0, pagination.pages ?? 1, postsPerPage)
      if (note !== null) notes.push(note)
    }
    for (const binding of Object.values(queries)) {
      const fallback: unknown = DEFAULT_LIMIT[binding.source as keyof typeof DEFAULT_LIMIT]
      const limit = binding.limit ?? (typeof fallback === 'number' ? fallback : null)
      // a hand-picked list asks for no limit (R-20: the pick IS the list), so it has nothing to fall short of — each pick
      // the site lacks says so on its own row in the Data group instead
      if (limit === null || binding.ids !== undefined) continue
      const note = getShortfall(binding.source, siteTotal(binding, r), limit)
      if (note !== null) notes.push(note)
    }
    return notes.length === 0 ? null : notes.join(' ')
  }, [livePage, chosen, entry, liveTick, canvas.file, postsPerPage])
  /** Story 5.19 — the Layers note's sentence while THIS page is a Tag or Author page with no visible feed, else null */
  const feedless = useMemo(
    () => (feedlessArchive(editedDoc(docs, own, library) ?? EMPTY_DOC, pageFileOf(key, page), library) ? FEEDLESS(canvas.file === 'author.hbs' ? 'Author' : 'Tag') : null),
    [docs, own, library, key, page, canvas.file],
  )
  /** Story 5.19 — the chip's section on the canvas: the main feed, while it is hovered or selected (AD-37: never at rest) */
  const chipOn = pointed?.isMainFeed === true ? 'hovered' : chosen?.isMainFeed === true ? 'selected' : null
  /** …and whether the name tag is drawn beside it, which the chip then sits against rather than over (R-125) */
  const chipBesideTag = pointed?.isMainFeed === true
  const pointedRing = pointed ? ringOf(pointed.designId) : []
  // on a hovered selection the selected box's 1.5px is the only outline (S4c)
  // Story 5.21's Fix: a pointed or chosen Ghost row's chrome is drawn on its shim, in the tag's and the outline's own shape
  const hoverOutline = (pointed && !same(hovered, selected)) || (ghostHover !== null && ghostHover !== ghostChosen)
  const hoveredRoot = pointed ? rootOf(hovered) : ghostEl(ghostHover)
  const selectedRoot = chosen ? rootOf(selected) : ghostEl(ghostChosen)

  // THE CHROME LAYER (the owner's finding, 2026-09-17): the boxes, the tag and the badge are portalled into the canvas
  // document, so the compositor scrolls them with their section in the same frame (`lib/canvas-layer.ts`) — drawn and
  // placed by `CanvasChrome` since Story 5.23b; the two hosts are made and dropped here
  const [chrome, setChrome] = useHanded<ChromeLayers | null>(null)
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
  /* DW-290 (Story 5.24e): THE CHROME'S FACES AND SHEET, MADE READY IN IDLE TIME after a paint and before any gesture —
     so the session's first selection no longer builds them inside its own long task (`prepareChrome`). It adds nothing to
     the DOM; a later call is free. `requestIdleCallback` is not Baseline (Safari lacks it), so a timer stands in there. */
  useEffect(() => {
    const doc = frame.current?.contentDocument
    // only after a paint, into a document that holds the painted page — at mount the frame is still `about:blank`
    if (paints === 0 || !doc?.getElementById('canvas')) return
    const ready = () => {
      // a frame reloaded in the meantime: this document is dead, and the next paint prepares the new one
      if (doc.defaultView) prepareChrome(doc)
    }
    if (typeof window.requestIdleCallback === 'function') {
      const at = window.requestIdleCallback(ready)
      return () => window.cancelIdleCallback(at)
    }
    const at = setTimeout(ready, 1)
    return () => clearTimeout(at)
  }, [paints])
  /** Story 5.21 — which layer each root's chrome was drawn in at the last render: a sticky root is pinned only while it is
   *  STUCK (`pinned`), so the canvas's scroll listener compares the root's answer now with this one and re-renders on a
   *  change (`setPinTick`) — the one switch, as the root sticks or comes unstuck. Story 5.23b: the chrome is a `memo` part
   *  that asks only when it renders, so the two doors that restamp a root IN PLACE — a control change and a flip — tick it
   *  too: a stamp can make a root stop sticking (On scroll → Static, the deployed walk's step 12) with no new node for the
   *  chrome to see */
  const drawnPinned = useRef(new WeakMap<HTMLElement, boolean>())
  const [pinTick, setPinTick] = useHanded(0)
  /** the hovered and the selected root AS THE CANVAS DRAWS THEM NOW, for the chrome's loop — every frame, never a render's */
  const chromeRoots = useStable(() => {
    const now = latest.current
    return {
      hovered: now.hovered ? rootOf(now.hovered) : ghostEl(ghostHoverNow.current),
      selected: now.selected ? rootOf(now.selected) : ghostEl(ghostChosenNow.current),
    }
  })

  /* STORY 5.15 — B3a's PAUSED CHIPS (R-175). One for each mount `core` held still whose part MOVES BY ITSELF — on a
     timer or as the page scrolls, with nothing pressed (the registry's `movesByItself`) — inside the hovered root and
     inside the selected one, and none in Preview. The list is `core`'s own (`paused`), never a second one kept here,
     so a part that waits for a press — a phone menu, a sign-up form — never carries one. */
  const chips = useMemo(
    () =>
      preview
        ? []
        : [...new Set([hoveredRoot, selectedRoot])].flatMap((root) =>
            !root
              ? []
              : (behaviours.current?.paused ?? [])
                  // DW-226 (Story 5.24e): at the DEVICE's width — a part declared to run only below a width never moves
                  // at or above it, so it is not paused there either; a device change repaints nothing, so it is a dependency
                  .filter((el) => root.contains(el) && movesByItself(el.getAttribute('data-module') ?? '', device.width))
                  .map((el) => ({ el: el as HTMLElement, root })),
          ),
    // `core`'s handle is replaced by every paint, which `paints` counts
    [preview, hoveredRoot, selectedRoot, paints, device.width],
  )
  /** DW-229 (Story 5.24e): the selected section holds a part still — the chip is `aria-hidden` chrome, so the Controls
   *  panel SAYS it, once, for a screen reader (`PAUSED_SAID`) */
  const pausedHere = selectedRoot !== null && chips.some((chip) => chip.root === selectedRoot)

  // ─── Story 5.4 — every section operation, through `doc-edit.ts`, and the two surfaces that ask for one ───

  /** A row's identity across both Layers groups: an `instanceId` is unique inside a doc, not between two. */
  const keyOf = (p: Pick) => `${p.doc}:${p.instanceId}`

  /** One doc's own instances as Layers rows, in DOC order — the card's are `site`'s, the page group's are this
   *  canvas's. Doc order, not `canvasStack`'s: the row's `at` is the position `moveSection` is given, and B7 draws
   *  the card's rows as the site doc stores them — since DW-187 (Story 5.24e) in canvas order too, every move clamped to its
   *  band (`landWithin`) and a placement put before the first footer, so the two orders agree. */
  const rowsOf = (docKey: string): LayerRow[] => {
    // Story 5.19: only a natively paginated page has a main feed to mark or to hand on
    const paginated = PAGINATED_TARGETS.has(fileOfKey(docKey))
    // the doc AS EDITED: on page 2 its own design, or while it follows, the copy of page 1 (Story 5.16)
    return (editedDoc(docs, docKey, library)?.instances ?? []).map((i, at) => ({
      doc: docKey, instanceId: i.instanceId, layerName: i.layerName, hidden: i.hidden, at, category: categoryOf(i.designId),
      footer: docKey === SITE.key && isSiteFooter(i.designId),
      // R-133: the `⋯` item is ABSENT where nothing could be cleared, and the engine's own definition decides.
      // R-135 (owner, 2026-09-19): and absent on a LIGHT-ONLY project, where Theme settings greys the same act with
      // its reason — the editor shows nothing about dark there, exactly as the sun is gone rather than disabled.
      darkOverride: darkEnabled && darkOverridesInForce(entries[i.designId] ?? { controlSchema: [] }, i).length > 0,
      // Story 5.19 — D5c's chip, and "Make this the main feed": ABSENT on the main feed itself, a hidden row, a section
      // that is no feed and a page that does not paginate (UX-DR3), never greyed
      mainFeed: i.isMainFeed,
      canLead: paginated && !i.isMainFeed && !i.hidden && isFeed(entries[i.designId]),
    }))
  }
  /** Story 5.23b — the two groups' rows, derived again only when a doc changes: every field a row is drawn from is a
   *  primitive, so the rows whose fields did not change skip their render (`controls/layers.tsx`) */
  const siteRows = useMemo(() => rowsOf(SITE.key), [docs, library, entries, darkEnabled])
  const pageRows = useMemo(() => rowsOf(own), [docs, own, library, entries, darkEnabled])

  /** One operation over one template's doc: the session's next `docs`, painted once. Answers the refusal, or null.
   *  `about` names the section a site-wide change is about, for R-180's ask; it is the pick's own section by default. */
  const apply = (pick: Pick, op: (doc: ProjectDoc) => ProjectDoc | string, about?: About): string | null | typeof HELD => {
    // Story 5.10: a canvas with NO ROW YET is a canvas you can add the first section to — R-129's three membership
    // templates and Private are never synthesized, so `docs` holds nothing for them until something is placed. Every
    // other caller addresses a doc it drew a row from, so the fallback only ever answers the picker. Story 5.16: the
    // doc AS EDITED, so an operation on a following page 2 is made to its copy of page 1.
    const doc = docOf(pick.doc) ?? EMPTY_DOC
    const done = op(doc)
    if (typeof done === 'string') return done
    // STORY 5.19 — THE MAIN-FEED RULE IS PART OF EVERY EDIT: a placement that designates, a delete or a hide that hands
    // the flag on, a duplicate that must not carry it — decided in the same `commit`, so one `⌘Z` undoes both
    const next = designated(pick.doc, done, doc)
    const asking = about ?? { instanceId: pick.instanceId, name: layerNameOf(pick) }
    // R-180: held for its ask (or a session reading along) — nothing has changed yet, so there is nothing to repaint and
    // nothing refused. Asked BEFORE the hand-over below, so the ask's dialog opens on the next frame with its words in
    if (heldBack({ [pick.doc]: next }, pick.doc, asking)) return HELD
    /* R-210 — CANVAS FIRST, THE PANELS A FRAME LATER (Story 5.23b). Inside the hand-over `commit` moves `latest` and the
       journal, and `paint()` redraws the canvas, in THIS task exactly as before; what React is handed — the docs, the
       journal, the selection, the hover, what the paint drew, and whatever the caller says after — is held and handed over
       at once in the NEXT task (`lib/renders.ts`), so the panels follow a frame later and the press stays short. Never a
       transition: those wait for any server call in flight. `latest` is the handlers' alone, so nothing moves it back. */
    canvasFirst(() => {
      const now = latest.current
      const back = commit({ [pick.doc]: next }, pick.doc, asking)
      // a selection cannot outlive the section it was on — and neither can it (or a hover) outlive a canvas returning to
      // untouched. `back` is asked, not the ids: synthesis DERIVES them (`auto-tag-1`), so the default stack that returns
      // can repeat the id of the very section just removed, and a test by id would keep the panel open on a new instance
      // (review, 2026-09-18). A page 2 that follows page 1 again is the same case: its copy repeats page 1's ids.
      const gone = !docOf(pick.doc)?.instances.some((i) => i.instanceId === pick.instanceId)
      if (back && now.hovered?.doc === pick.doc) point(null)
      if (now.selected?.doc === pick.doc && (back || (same(now.selected, pick) && gone))) choose(null)
      paint()
    })
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
  /** Story 5.20 — the paywall's doc holds AT MOST ONE instance (`read.ts` refuses a second), and the way back to Ghost's
   *  own box is ⌘Z alone until Story 10.107 draws one (DW-262): so its instance is never duplicated or removed, by any
   *  door — Layers has no rows there and the pill is absent, so these two handlers are the keys' last door. */
  const onSurfaceDoc = (docKey: string) => {
    const owner = canvasOfTemplateKey(docKey)
    return owner !== null && isSurface(owner)
  }
  const onDuplicate = (pick: Pick) => {
    if (onSurfaceDoc(pick.doc)) return
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

  /** STORY 5.20 — CHOOSING A PAYWALL DESIGN FROM UNTOUCHED (FR-H6, R-197): one instance of it in the `paywall` doc —
   *  ONE `apply`, one `commit`, one `⌘Z` back to Ghost's own box. At most one: a paywall already designed swaps through
   *  the ring instead (`onDesign`, 5.11's carry / park / default), and `read.ts` refuses a doc holding two. */
  const choosePaywall = (designId: string) => {
    const now = latest.current
    const design = entries[designId]
    const docKey = templateKeyOf(now.key)
    if (design === undefined || !isSurface(now.key) || (docOf(docKey)?.instances.length ?? 0) > 0) return
    const instance = {
      instanceId: crypto.randomUUID(),
      layerName: `${PAYWALL_WORDS.panel} — ${design.name}`,
      designId,
      content: defaultContent(design.contentSchema),
      controls: {},
      data: {},
      darkOverrides: {},
      parkedControls: {},
      hidden: false,
      memberVisibility: 'everyone' as const,
      isMainFeed: false,
    }
    if (!edit({ doc: docKey, instanceId: instance.instanceId }, (doc) => insertSection(doc, 0, instance))) return
    const ring = ringOf(designId)
    // in the same hand-over as the placement (R-210, still open in this task), so the panel opens on the instance in the
    // render that first holds it
    setSaid(announce(ring.findIndex((e) => e.id === designId), ring.length, design.name))
    choose({ doc: docKey, instanceId: instance.instanceId })
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
    // Story 5.20 — an untouched paywall steps INTO its ring: ▶ chooses the first design and ◀ the last
    if (!placed && isSurface(latest.current.key)) {
      const ring = paywallRing(Object.values(entries))
      const to = by > 0 ? ring[0] : ring[ring.length - 1]
      if (to !== undefined) choosePaywall(to.id)
      return
    }
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
  const [ask, setAsk] = useHanded<
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
  const [askDark, setAskDark] = useHanded<{ pick: Pick; name: string; count: number } | null>(null)
  const clearDark = useRef<HTMLDialogElement>(null)
  const askClearDark = (row: Pick & { layerName: string }) => {
    const placed = latest.current.stack.find((i) => same(i, row))
    const entry_ = placed ? entries[placed.designId] : undefined
    const count = placed && entry_ ? darkOverridesInForce(entry_, placed).length : 0
    if (count === 0) return
    setAskDark({ pick: { doc: row.doc, instanceId: row.instanceId }, name: row.layerName, count })
    requestAnimationFrame(() => openOnCancel(clearDark.current))
  }

  /** Story 5.19 — the section the main-feed flag moved TO in the gesture just made, or null where it did not move. */
  const handedTo = (docKey: string, before: DocInstance | undefined): string | null => {
    const after = mainFeedOf(docOf(docKey))
    return before !== undefined && after !== undefined && after.instanceId !== before.instanceId ? after.layerName : null
  }
  const onRemove = (row: Pick & { layerName: string }) => {
    if (onSurfaceDoc(row.doc)) return
    if (row.doc === SITE.key) return askFirst('remove', row)
    const before = mainFeedOf(docOf(row.doc))
    // "the gesture's own sentence, then {name} is now the main feed." where the delete handed the flag on
    if (edit(row, (doc) => removeSection(doc, row.instanceId))) setSaid(withTransfer(`${row.layerName} removed`, handedTo(row.doc, before)) ?? '')
  }
  const onToggleHidden = (row: LayerRow) => {
    // the section as the NEWEST doc holds it: the row pressed can be a frame behind the canvas (R-210), and a second Space
    // inside that frame must show what the first hid rather than hide it again
    const hidden = docOf(row.doc)?.instances.find((i) => i.instanceId === row.instanceId)?.hidden ?? row.hidden
    if (row.doc === SITE.key && !hidden) return askFirst('hide', row)
    const before = mainFeedOf(docOf(row.doc))
    if (!edit(row, (doc) => setHidden(doc, row.instanceId, !hidden))) return
    // Hide says nothing of its own; where it handed the flag on, that is said
    const said = withTransfer(null, handedTo(row.doc, before))
    if (said !== null) setSaid(said)
  }
  /** D5c's **Make this the main feed**: ONE edit through `apply`, announced politely. The old main feed becomes a
   *  secondary feed with its own stored Data values — Latest, the page size and Newest where it has none. */
  const onMakeMainFeed = (row: LayerRow) => {
    const file = fileOfKey(row.doc)
    if (edit(row, (doc) => makeMainFeed(doc, file, row.instanceId, library))) setSaid(NOW_MAIN(row.layerName))
  }

  /* ─── Story 5.10 — opening the picker, and the one placement it makes (FR-D12, AD-15, AD-16, R-152) ──────────── */

  /** `from` is the STACK INDEX the gesture was made at, or null for the end of this canvas's own stack. */
  const openPicker = (from: number | null) => {
    if (!latest.current.canAdd || picker.current?.open) return
    setInvoked(from)
    setPickerRefusal(null)
    setOpened(true)
    setPicking(true)
    // Story 5.18: a picker is a read the customer asked for — its cards' `{{#get}}` rows, from the one store
    requestDesigns(offeredHere(entries, CANVASES[latest.current.key].file, SITE.file))
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
      // Story 5.19: never decided here — `apply` passes the doc through the main-feed rule, which makes the first feed
      // placed on a paginated page with none its main feed
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
      // DW-189 (Story 5.24e): a new header or bar lands BEFORE the first footer, so the site doc is stored in the order the
      // page draws it (`canvasStack`) and `screenRows`' tops rise in order; a footer still goes last (`siteSlot`)
      if (at === -1) return insertSection(doc, siteSlot(doc.instances.map((i) => i.designId), design.id), instance)
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
    // Story 5.19: a placement the main-feed rule designated says so
    const main = docOf(docKey)?.instances.find((i) => i.instanceId === instance.instanceId)?.isMainFeed === true
    setSaid(
      siteWide
        ? `${layerName} added to the Site-wide group${replaced === null ? '' : `, replacing ${replaced as string}`}`
        : main ? ADDED_AS_MAIN(layerName) : `${layerName} added`,
    )
  }

  /** DW-187 (Story 5.24e): the site doc's band per instance — its footers, which the page draws last; a page doc has none */
  const footersOf = (docKey: string) => (docOf(docKey)?.instances ?? []).map((i) => docKey === SITE.key && isSiteFooter(i.designId))

  /** The drop, and `⌥↑`/`⌥↓`: one `moveSection`, announced politely in its own words (UX-DR12). DW-187 (Story 5.24e): the ONE
   *  door every move passes — Layers' drop and keys and the pill's grip — so a site-wide move is clamped to its band here
   *  whoever asked (`landWithin`), and the site doc stays in the order the page draws it. */
  const moveTo = (pick: Pick, asked: number): string | null => {
    const doc = docOf(pick.doc)
    const from = (doc?.instances ?? []).findIndex((i) => i.instanceId === pick.instanceId)
    const to = landWithin(footersOf(pick.doc), from, asked)
    const moved = doc && to !== from ? moveSection(doc, pick.instanceId, to) : 'there is no move to make'
    if (typeof moved === 'string') return null
    if (apply(pick, () => moved.doc, { instanceId: pick.instanceId, name: layerNameOf(pick), said: moved.announce }) === HELD) return null
    setSaid(moved.announce)
    return moved.announce
  }

  /** S4b's pill, read from outside the frame every frame: the hovered section's rect on screen, the card's own box to
   *  stay inside, and — R-125 — R-119's Pro tag's left edge while the tag is drawn on THIS section. Story 5.23b: of fixed
   *  identity, and read from the paint's CURRENT roots through refs — the pill's one loop calls it every frame, and in the
   *  frame before the editor follows a paint (R-210) the render's root may be one the paint removed. */
  const pillBox = useStable((): PillBox | null => {
    const f = frame.current
    const now = latest.current
    const root = rootOf(now.hovered)
    if (!f || !root) return null
    const fr = f.getBoundingClientRect()
    const k = fitOf(f, fr)
    const r = root.getBoundingClientRect()
    // the badge is placed on the SELECTED root, and drawn only for a Pro design on a Free plan: only a hovered selection
    // puts the two in the same corner
    const b = same(now.hovered, now.selected) && badge.current?.isConnected ? badge.current.getBoundingClientRect() : undefined
    return {
      rect: { left: fr.left + r.left * k, top: fr.top + r.top * k, right: fr.left + r.right * k, bottom: fr.top + r.bottom * k },
      bounds: { left: fr.left, top: fr.top, right: fr.right, bottom: fr.bottom },
      badgeLeft: b && b.width > 0 ? fr.left + b.left * k : null,
    }
  })

  /** DW-209, EXECUTED (2026-09-20, Chromium through this repository's own Playwright, standing rule 1): a wheel
   *  dispatched over `[data-add-section]` scrolled the canvas document 0px and the identical wheel over the iframe
   *  500px. The editor's own page does not scroll (`h-dvh overflow-hidden`), so the canvas simply STALLS while the
   *  pointer rests on a pill — which a customer feels, and which is also why the deployed walk's sticky-scroll
   *  check failed most runs: it wheels at x=700, the "+ Add section" pill's own place on a 1440 editor. The pills
   *  forward their wheel here, to the document the pointer looks like it is over. */
  const wheelToCanvas = useStable((deltaX: number, deltaY: number, deltaMode: number) =>
    wheelToFrame(frame.current?.contentWindow, deltaX, deltaY, deltaMode))

  /** The pill's grip: the SAME reorder as a Layers row's, read against the sections as they sit on the canvas,
   *  because that is where the pointer is. Layers draws the dashed slot either way. Story 5.23b: the drag is the store's
   *  (`dragStore`), which Layers alone subscribes to, and a move that does not change the landing writes nothing. */
  const gripDown = useStable((event: PointerEvent<HTMLSpanElement>) => {
    const pick = latest.current.hovered
    if (event.button !== 0 || dragStore.get() !== null || !pick) return
    const from = (docOf(pick.doc)?.instances ?? []).findIndex((i) => i.instanceId === pick.instanceId)
    if (from === -1) return
    event.currentTarget.setPointerCapture(event.pointerId)
    pillDrag.current = { y: event.clientY, layout: captureLayout(screenRows(pick.doc)) }
    dragStore.set({ doc: pick.doc, from, to: from, dy: 0, via: 'pill' })
  })
  const gripMove = useStable((event: PointerEvent<HTMLSpanElement>) => {
    const now = dragStore.get()
    if (!now || now.landing) return
    // dy stays 0: the row in Layers is not the thing being dragged, so only the slot follows the pointer — and it never
    // leaves the section's band (DW-187)
    const to = landWithin(footersOf(now.doc), now.from, landingAt(pillDrag.current.layout, now.from, event.clientY, pillDrag.current.y))
    if (to !== now.to) dragStore.set({ ...now, to })
  })
  const gripUp = useStable(() => {
    const now = dragStore.get()
    if (!now || now.landing) return
    const moved = docOf(now.doc)?.instances[now.from]
    // R-210: a drop that moved keeps its slot until its row lands in Layers, which lets it go; any other lets it go now
    if (now.to !== now.from && moved && moveTo({ doc: now.doc, instanceId: moved.instanceId }, now.to) !== null) dragStore.set({ ...now, landing: true })
    else dragStore.set(null)
  })
  const gripCancel = useStable(() => dragStore.set(null))
  const pillGrip = useMemo<HTMLAttributes<HTMLSpanElement>>(
    () => ({ onPointerDown: gripDown, onPointerMove: gripMove, onPointerUp: gripUp, onPointerCancel: gripCancel }),
    [gripDown, gripMove, gripUp, gripCancel],
  )

  /** STORY 5.17 — is a request waiting on THIS session? Derived, never stored twice: the row's own nudge columns,
   *  minus the one this holder has already answered or let expire. */
  const askedBy = lock.holder ? (lock.row?.nudgeRequestedBy ?? null) : null
  const nudged = askedBy !== null && askedBy !== tabId.current && (lock.row?.request ?? null) !== dismissed

  /** THE PANEL'S WRITE — urgent, so the panel shows a control change in the render that commits it (FR-F4).
   *
   *  R-210 (Story 5.23b): A PRESS ON A PANEL STILL DRAWN FOR ANOTHER DESIGN OR SECTION IS DROPPED, NEVER WRITTEN. The panel
   *  follows the canvas a frame after a section operation, and what it hands up is its OWN drawn state with one value
   *  changed — which `withState` writes whole over the instance, every stored value and never the design — so a press in
   *  that frame on a panel drawn for the design just replaced would write that design's values over the new one's.
   *  `drawnFor` is the section the panel was drawn for; the section as the canvas holds it now must be the same one, on
   *  the same design — AND HOLDING THE SAME VALUES (review, 2026-09-28): an undo or a Remix changes a control value on the
   *  same design, and a press in that frame on the panel still showing the old values would write them all back — or
   *  nothing is written and nothing is said. The paint's own signature is the equality (`chosenSig`). */
  const onChange = (next: ControlState, kind: Edit, drawnFor: Placed | undefined) => {
    const now = latest.current
    // Story 5.20 — on the Paywall canvas the panel is its one instance's, selected or not (`choose`)
    const only = isSurface(now.key) ? now.stack[0] : undefined
    const pick = now.selected ?? (only === undefined ? null : { doc: only.doc, instanceId: only.instanceId })
    if (!pick) return
    const n = now.stack.findIndex((i) => same(i, pick))
    const placed = now.stack[n]
    if (placed === undefined || drawnFor === undefined || !same(placed, drawnFor) || JSON.stringify(placed) !== JSON.stringify(drawnFor)) return
    // Story 5.16: the doc as edited (page 2's copy while it follows), and held for R-180's ask on page 2 — then nothing
    // is stamped: the panel still shows the value in force until the change lands
    if (commit(withState(editable(pick.doc), pick.doc, pick.instanceId, next), pick.doc, { instanceId: pick.instanceId, name: layerNameOf(pick) }) === null) return
    const root = roots.current[n]
    const design = entries[placed.designId]
    // a control changes only the root's attributes, so it is stamped in place (`/pilots`' fast path); no root means
    // the section is gated away, and anything else needs a render
    const input = kind === 'control' ? slice(placed, next) : undefined
    if (input && root && design) {
      stampControls(root as unknown as RuntimeElement, input)
      // Story 5.23a: stamped in place, so the root is no longer what its record says was drawn — an undo back to the
      // stored value would otherwise match the record and keep this stamp
      drawn.current.delete(queryKey(placed))
      mark()
      // Story 5.23b: and the stamp can move the root between the chrome's two layers (On scroll → Static, the deployed
      // walk's step 12), which the chrome asks only when it renders — so it is asked again
      setPinTick((t) => t + 1)
    } else paint()
  }

  /* ─── Story 5.20 — THE PAYWALL CANVAS, as the render reads it ─────────────────────────────────────────────────── */
  /** does the visitor View as previews read the paid post whole (Ghost's own rule) — S4d's indicator — or meet the cut? */
  const whole = postAccess({ visibility: 'paid' }, viewAs)
  /** the paywall designs this editor holds (A32 from Story 10.107; the harness's stand-ins), and where the chosen one is */
  const paywalls = useMemo(() => (surface ? paywallRing(Object.values(entries)) : []), [surface, entries])
  const paywallAt = surface && stack[0] !== undefined ? paywalls.findIndex((e) => e.id === stack[0]?.designId) : -1
  /** C3b's card: members switched off by the record, while the canvas is chosen to show the site's content (`cardUp`, the
   *  one rule a re-read's voice reads too) */
  const offCard = cardUp(key, members, source)
  /** the tier line counts the source in force's public tiers — absent where the site was chosen and could not be read */
  const tiersShown = !surface
    ? null
    : tierText(livePage === null ? null : { rows: reads.current?.peek(PUBLIC_TIERS)?.rows }, painted.shown.cause !== null, orbitWeekly.tiers())
  /** Ghost admin's Tiers, for the site's own content alone */
  const tiersHref = surface && livePage !== null && site !== null && 'origin' in site ? adminAt(site.origin, 'tiers') : null
  /** the ink surround's words and hovers, for the controls that sit straight on the bar (C3a :1368-1386): the Kit's own
   *  utilities read these variables, so they are re-pointed for the bar's plain controls and for nothing else — never
   *  for a menu, whose card stays paper */
  const onInk = useMemo(
    () =>
      surface
        ? ({ '--color-ink-soft': 'var(--color-ink-deep-soft)', '--color-ink': 'var(--color-ink-deep-text)', '--color-paper-sunk': 'var(--color-ink-hover)' } as CSSProperties)
        : undefined,
    [surface],
  )

  /* STORY 5.22 — THE ⋯ MENU (D8a's "one overflow menu", `D8 Editor Below 1440.dc.html:283-293`): below 1280 the bar's
     right-hand cluster moves into it WHOLE, in the cluster's order, and the cluster itself stays MOUNTED and hidden, so
     every row calls the control's OWN handler (R-141) — the dice's press, the sun's flip, the device track's pick,
     Theme settings' link, the pill's Preview — in the control's own words (R-170, the chips are `KEYMAP`'s). A row is
     absent where its control is (UX-DR3): no dark row on a Light-only project, no Remix or Preview on a template
     surface, which has Back to post instead. The device is ONE row that moves to the next device, because the menu is
     "one item deep" (`D8:293`). Undo and redo stay beside the indicator (R-143), and D8a's Export row has no control at
     1440 to be (Ship it's own menu carries Download theme, 7.18). Only the Remix row edits, so it alone greys reading
     along (R-192). */
  const chipsOf = (gesture: Gesture) => KEYMAP.find((b) => b.gesture === gesture)?.chips
  /** the glyph slot of a row whose control draws none (Theme settings is words at 1440, and R-92 forbids inventing one):
   *  empty, so its words line up with the rows that do carry one, as every D8a row does */
  const noGlyph = <span aria-hidden className="size-[13px] shrink-0" />
  const nextDevice = DEVICES[(DEVICES.findIndex((d) => d.name === device.name) + 1) % DEVICES.length] ?? DESKTOP
  const more: MenuItem[] = [
    ...(surface ? [] : [{ label: KEYMAP.find((b) => b.gesture === 'remix')?.action ?? 'Site Remix', icon: <Refresh size={13} />, keys: chipsOf('remix'), readOnly: !lock.holder, onSelect: () => remixDice.current?.press() }]),
    ...(darkEnabled ? [{ label: modeWords(mode), icon: mode === 'dark' ? <Moon size={13} /> : <Sun size={13} />, keys: chipsOf('dark'), onSelect: () => flip(latest.current.mode === 'dark' ? 'light' : 'dark') }] : []),
    { label: `Device — ${device.label}`, icon: <Laptop size={13} />, onSelect: () => pickDevice(nextDevice) },
    { label: 'Theme settings', icon: noGlyph, href: settingsPath(project.id) },
    ...(surface ? [] : [{ label: PREVIEW, icon: <PreviewEye size={13} />, keys: chipsOf('preview'), onSelect: enterPreview }]),
    ...(surface ? [{ label: PAYWALL_WORDS.back, icon: noGlyph, href: pathOf('post') }] : []),
  ]
  /** the rail's rows: the stack the page paints, in its order — none on a template surface, whose Layers holds no rows */
  const railRows = useMemo(
    (): RailItem[] =>
      (surface ? [] : stack).map((i) => ({ key: keyOf(i), name: i.layerName, hidden: i.hidden, selected: same(i, selected), doc: i.doc, instanceId: i.instanceId, category: categoryOf(i.designId) })),
    [surface, stack, selected],
  )
  /** Controls is drawn: docked unless folded at full width, and only while it is the sheet below 1280 */
  const controlsShown = !preview && (compact ? sheet === 'controls' : !controls.folded)

  /* ─── STORY 5.23b — EVERY HANDLER A `memo` PART IS HANDED, OF FIXED IDENTITY (R-208) ───────────────────────────────
   *
   * Each calls this component's latest committed render, so a part handed one never redraws because the editor did. What
   * a handler needs to be NEWEST — the docs, the selection, the hover — it reads through `latest`; what it takes from its
   * render is only what the part on screen was drawn for (the Controls panel's `chosen`, which `onChange` compares with the
   * section as the canvas holds it now, R-210). The pill's are read off the paint's current hover, never the render's. */
  const on = {
    selectRow: useStable((pick: Pick) => {
      choose(pick)
      reveal(pick)
      // Story 5.22: below 1280 the row's press hands the overlay to Controls — the row goes with its panel, so focus goes
      // to Controls' close — and it does so for the section already selected too
      openSheet('controls', true)
    }),
    ground: useStable(() => choose(null)),
    toggleHidden: useStable(onToggleHidden),
    rename: useStable(onRename),
    duplicate: useStable(onDuplicate),
    remove: useStable(onRemove),
    clearDark: useStable(askClearDark),
    makeMainFeed: useStable(onMakeMainFeed),
    // R-210: a row's `at` is where Layers DREW it, which can be a frame behind the doc — a second ⌥↓ in that frame would
    // otherwise move the section onto the place it already holds (a journal entry that moves nothing). The move is made
    // from where the section IS: the displacement asked for, re-based on the newest doc (a drop's `at` is its drag's own)
    move: useStable((row: LayerRow, to: number) => {
      const at = docOf(row.doc)?.instances.findIndex((i) => i.instanceId === row.instanceId) ?? -1
      return moveTo(row, at === -1 ? to : to + (at - row.at))
    }),
    chooseGhost: useStable(chooseGhost),
    pointGhost: useStable(pointGhost),
    /** R-217: a Layers row's mouse points at its section; leaving lets go only a hover that row made */
    pointRow: useStable((row: { doc: string; instanceId: string } | null) => {
      if (row !== null) point({ doc: row.doc, instanceId: row.instanceId }, 'layers')
      else if (hoverVia.current === 'layers') point(null)
    }),
    toggleGhostHidden: useStable(toggleGhostHidden),
    railShow: useStable(() => (latest.current.compact ? toggleLayers() : layers.toggle(false))),
    // a rail item chooses and reveals exactly as a Layers row does, and below 1280 it (re-)opens Controls
    railRow: useStable((pick: Pick) => {
      choose(pick)
      reveal(pick)
      openSheet('controls')
    }),
    addAtEnd: useStable(() => openPicker(null)),
    change: useStable((next: ControlState, kind: Edit) => onChange(next, kind, chosen)),
    clearDarkChosen: useStable(() => {
      if (chosen) askClearDark(chosen)
    }),
    choosePage: useStable(choosePage),
    toSample: useStable(() => {
      chooseSource('sample')
      document.getElementById('editor-source')?.focus()
    }),
    visibility: useStable((value: MemberState) => {
      if (chosen) edit(chosen, (doc) => setMemberVisibility(doc, chosen.instanceId, value))
    }),
    designChosen: useStable((to: string) => {
      if (chosen) onDesign(chosen, to)
    }),
    stepChosen: useStable((by: number) => stepDesign(chosen ?? null, by)),
    choosePaywall: useStable(choosePaywall),
    stepPaywall: useStable((by: number) => stepDesign(null, by)),
    pathOf: useStable(pathOf),
    chooseVisitor: useStable(chooseVisitor),
    retryNow: useStable(retryNow),
    remix: useStable(onRemix),
    flip: useStable(flip),
    pickDevice: useStable(pickDevice),
    enterPreview: useStable(enterPreview),
    leavePreview: useStable(leavePreview),
    chooseSubject: useStable(chooseSubject),
    chooseSource: useStable(chooseSource),
    pillPrev: useStable(() => stepDesign(latest.current.hovered, -1)),
    pillNext: useStable(() => stepDesign(latest.current.hovered, 1)),
    pillShuffle: useStable(() => onShuffle(latest.current.hovered)),
    pillDuplicate: useStable(() => {
      const pick = latest.current.hovered
      if (pick) onDuplicate(pick)
    }),
    pillDelete: useStable(() => {
      const pick = latest.current.hovered
      if (pick) onRemove({ ...pick, layerName: layerNameOf(pick) })
    }),
    // S4b's "+ Add section", on the gap under the hovered section: the picker opens at THAT gap
    pillAdd: useStable(() => {
      const pick = latest.current.hovered
      openPicker(pick ? latest.current.stack.findIndex((i) => same(i, pick)) : null)
    }),
    pillLeave: useStable((e: { clientX: number; clientY: number }) => {
      // leaving the pill for the canvas is the canvas document's own `pointerover`; leaving it for a panel or the bar
      // reaches neither document, so the hover is let go here. Never mid-drag, which holds the pointer.
      const f = frame.current?.getBoundingClientRect()
      if (dragStore.get() || !f) return
      if (e.clientX < f.left || e.clientX > f.right || e.clientY < f.top || e.clientY > f.bottom) point(null)
    }),
  }

  /* …and every value a `memo` part is handed, keeping its identity while unchanged (Story 5.23b) */
  /** this canvas's record, with the visitor on screen already in it: the row in force never carries R-169's dot */
  const viewedHere = useMemo(() => seen(viewed[own] ?? NOT_VIEWED_YET, viewAs), [viewed, own, viewAs])
  /** THE DICE'S COUNT IS THIS CANVAS'S OWN DOC (R-161), derived from the rings, never written down (standing rule 4) */
  const remixCount = useMemo(() => remixable(editedDoc(docs, own, library)?.instances ?? [], ringOf), [docs, own, library])
  const assets = useMemo(() => pool.map((a) => ({ id: a.id, src: `${src}?image=${a.id}`, meta: `${Math.max(1, Math.round(a.bytes / 1024))} KB · SVG` })), [pool, src])
  /** Story 5.16 — D5d's row, on the main feed of a page that has a page 2 (R-176): a plain callback, never an edit */
  const pageRow = useMemo(
    () => (feedHere !== null && chosen !== undefined && same(chosen, feedHere) ? { value: page, onChange: on.choosePage } : undefined),
    [feedHere, chosen, page, on.choosePage],
  )
  const shortfallNote = useMemo(() => (shortfall === null ? undefined : { words: shortfall, onSample: on.toSample }), [shortfall, on.toSample])
  const visibilityRow = useMemo(
    () => (chosen !== undefined && memberVisibility[chosen.designId] === true ? { value: chosen.memberVisibility, previews: viewAs, onChange: on.visibility } : undefined),
    [chosen, memberVisibility, viewAs, on.visibility],
  )
  /** R-215 (DW-277, Story 5.24e): the rows THE SITE SHOWS, off the snapshot in hand (a landed re-read included) — the bar
   *  while its content has an audience (Ghost's `isFilled`), the button while `portal_button` is on and sign-up is open —
   *  never what View as previews or the window's width. None shown is no group at all. Its own memo, so a hover never
   *  parses the announcement again. */
  const ghostShown = useMemo(() => (shimsOn(key, site) ? rowsOn(surfaces, members, inertBody) : []), [key, site, surfaces, members])
  const ghostRows = useMemo(
    () =>
      ghostShown.length === 0
        ? undefined
        : {
            rows: ghostRowsOf(ghostShown, ghostHidden),
            selectedId: ghostChosen,
            hoveredId: ghostHover,
            onSelect: on.chooseGhost,
            onToggleHidden: on.toggleGhostHidden,
            onPoint: on.pointGhost,
          },
    [ghostShown, ghostHidden, ghostChosen, ghostHover, on.chooseGhost, on.toggleGhostHidden, on.pointGhost],
  )
  const sourceSite = useMemo(
    () =>
      site === null
        ? null
        : {
            name: siteName,
            shown: painted.shown.source,
            cause: painted.shown.cause === null ? null : LIVE_WORDS.cause(painted.shown.cause, siteName),
            row: siteRow,
            nothing: painted.shown.nothing === null ? null : LIVE_WORDS.nothing(painted.shown.nothing, siteName),
            // DW-248: the capped line unless a search at Ghost is coming or has come
            capped: livePage !== null && previewing.subject?.kind === 'post' && reads.current !== null && !searching ? cappedPosts(reads.current.peek) : null,
            onChoose: on.chooseSource,
          },
    [site, siteName, painted.shown, siteRow, livePage, previewing.subject?.kind, liveTick, on.chooseSource, searchKey, searching],
  )

  if (failure) throw failure

  return (
    // Story 5.22: `data-editor` is the 44px touch rule's scope (`globals.css`), and where the dice's confirm is portalled
    <div data-editor className="flex h-dvh flex-col overflow-hidden bg-paper text-ink">
      {/* Story 5.15: in Preview the whole bar is HIDDEN, never unmounted — its menus, its focus and every value in it
          come back exactly as they were */}
      {/* STORY 5.20 — ON A TEMPLATE SURFACE THE BAR IS INK (C3a, DESIGN.md:310-313): a canvas that is not a page says so */}
      {/* STORY 5.22 — A THREE-COLUMN GRID: the centred group is centred on the bar while both sides have room, as S4a draws
          it at 1440, and a grid never overlaps its columns, so the group can meet neither side at any width — which
          retires the name's `360px` constant its own comment asked this to replace (R-143's "re-tunes the name's
          truncation"). The side tracks are `minmax(min-content, 1fr)` rather than `minmax(0, 1fr)`: each side's controls
          can then never overflow into the group — a narrow tablet held upright moves the group over instead — and the
          name contributes NOTHING to that minimum, so it is what shrinks and truncates first (the Paywall's NOT A PAGE
          SECTION chip and C3b's MEMBERS OFF chip are each whole or absent, below — DW-283). 56px on touch, with D8a's own
          6px padding and gaps (`D8 Editor Below 1440.dc.html:42`). */}
      <header
        ref={bar}
        hidden={preview}
        data-surface={surface || undefined}
        className={`relative grid h-12 shrink-0 grid-cols-[minmax(min-content,1fr)_auto_minmax(min-content,1fr)] items-center gap-x-[10px] border-b px-3 coarse:h-14 coarse:gap-x-[6px] coarse:px-[6px] ${surface ? 'border-ink-deep bg-ink-deep' : 'border-line bg-paper'}`}
      >
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
        {/* the left column: the way back, the name — which truncates here, before the centred group — and the history */}
        <div className="flex min-w-0 items-center gap-[10px] coarse:gap-[6px]">
        <Link
          href="/"
          aria-label="Back to dashboard"
          title="Back to dashboard"
          style={onInk}
          className={`inline-flex size-7 shrink-0 items-center justify-center rounded-sm text-ink-soft transition-colors hover:bg-paper-sunk ${ring}`}
        >
          <ChevronLeft size={15} />
        </Link>
        {/* THE NAME STOPS SHORT OF THE CENTRED GROUP BY CONSTRUCTION (Story 5.22): it grows to its own width and no further
            (`max-w-fit`) from a basis of nothing (`w-0`), so it adds nothing to the column's minimum and is what gives way,
            truncating with an ellipsis where the column ends — at 1440, at 720 and beside Story 7.16's longest custom
            template name alike. The deployed walk's step 90 measures it with a long name. */}
        <span className={`${surface ? 'text-ink-deep-text' : ''} w-0 min-w-0 max-w-fit grow truncate text-ui-dense font-semibold`}>{project.name}</span>
        {surface ? (
          // Story 5.22: WHOLE OR NOT AT ALL. Truncated beside the name it read as a fragment — "NO" at 720, with the name
          // gone to nothing (measured in the harness) — so it never shrinks, and below 1280 it is not drawn: the ink bar
          // and the strip under it already say this canvas is not a page, and the name keeps the room it gives back
          <span data-surface-chip className="shrink-0 rounded-pill border border-ink-mid px-[9px] py-[3px] font-mono text-[10.5px] uppercase text-ink-deep-soft compact:hidden">
            {PAYWALL_WORDS.chip}
          </span>
        ) : null}
        {/* S4a`:32` — the bar's third item, directly after the project name. Since R-142 it is an ICON IN A CIRCLE
            rather than B6's dot and label, and since R-144 its resting state reports what is OWED: a green check
            when everything is on the server, a grey clock the moment there is an edit that is not. The words are
            still B6's five — they are the hover and the announcement now, not printed. One indicator, one place
            (`EXPERIENCE.md`'s own rule), and still never a spinner. */}
        <span id="editor-save-state" className="shrink-0">
          {/* nothing is claimed before the device has answered: the initial state is green "Synced", and a reload with
              edits owed must never show that for the moment IndexedDB takes (the review) */}
          {hydrated ? <SaveState state={sync} onRetry={on.retryNow} retrying={pressingRetry} held={!fellBack.current} signIn={signInUrl} /> : null}
        </span>
        {/* R-143 (owner, 2026-09-19): THE PAIR SITS HERE, immediately after the indicator, and no longer in S4a's
            right-hand cluster where `S4 Editor.dc.html:41-43` draws it. His reason is the one the frame could not
            have: undo and the save state are the same question — "what has happened to my work" — so they belong
            to the same glance. Everything about the buttons themselves is still the frame's (28 × 28, 8px radius,
            2px apart, the unavailable one at `opacity:.35`); only where they sit has moved.
            THE KEYS ARE THE ARROWS' OWN HANDLERS (R-141), so the two can never disagree.
            `aria-disabled`, never `disabled`: the control stays in the tab order and stays announced. */}
        <div id="editor-history" style={onInk} className="flex shrink-0 items-center gap-[2px]">
          <IconButton
            id="editor-undo"
            label="Undo"
            title="Undo"
            aria-disabled={!(lock.holder && canUndo(journal)) || undefined}
            onClick={lock.holder && canUndo(journal) ? onUndo : undefined}
            className={lock.holder && canUndo(journal) ? undefined : 'opacity-[.35]'}
          >
            <UndoIcon size={14} />
          </IconButton>
          <IconButton
            id="editor-redo"
            label="Redo"
            title="Redo"
            aria-disabled={!(lock.holder && canRedo(journal)) || undefined}
            onClick={lock.holder && canRedo(journal) ? onRedo : undefined}
            className={lock.holder && canRedo(journal) ? undefined : 'opacity-[.35]'}
          >
            <RedoIcon size={14} />
          </IconButton>
        </div>
        </div>
        {/* S4a's CENTRED GROUP (`S4 Editor.dc.html:33`, D5a :37): Template, a gap of 8, then View as — where every drawn
            top bar puts the eye (S4a–c, S6, S7, S14, P0-6, D8, M1). The owner removed the marker CHIP that stood
            beside the switcher at his test of Story 5.5 (R-130); he did not remove the group's second control, which
            Story 5.14 built. ABSOLUTELY centred, as the frame draws it, so it does not move as the project's name
            grows — and a change of visitor does not move it either, because View as's value slot is as wide as its
            widest name. S4d's "2 not viewed" marker is not drawn here: the owner moved the reminder into the menu
            (R-169), so nothing hangs off the trigger. The deployed walk measures THIS group against the bar (step 2),
            not the switcher alone. Since Story 5.22 it is the grid's middle column rather than absolutely centred, and
            Template and View as keep their size and their words at every width (D8). */}
        <div id="editor-centre" className="flex w-max items-center gap-2">
          <TemplateSwitcher projectId={project.id} current={key} canvases={canvases} auto={auto} empty={empty} pathOf={canvasBase === undefined ? undefined : on.pathOf} />
          {/* this canvas's record, with the visitor on screen already in it: the row in force never carries R-169's
              dot, because the page you are looking at is being looked at */}
          <ViewAs visitor={viewAs} viewed={viewedHere} onChoose={on.chooseVisitor} />
        </div>
        {/* S4a's RIGHT-HAND CLUSTER (:35-40). R-132's one button leads it and S4a's device track sits IMMEDIATELY
            RIGHT OF IT, as the frame draws them; Ship it (7.18) lands beside them later (R-118). Undo and redo left
            for the indicator's side at R-143. View as was once expected here, and that was an earlier story's guess and
            never a ruling: every drawn bar puts it in the centred group above, which is where Story 5.14 built it.
            The sun is ABSENT, NOT DISABLED, on a Light-only project (UX-DR3, R-118, R-128, and AD-17's own Rule in so
            many words): there is no toggle rather than a theme that declares less. The device track is NOT scoped by
            dark — R-135 scopes the mode and nothing else — so it is drawn on every project. */}
        {/* the right column: the cluster, or below 1280 the ⋯ it collapses into (Story 5.22) */}
        <div className="flex min-w-0 items-center justify-end gap-[10px] coarse:gap-[6px]">
          {/* C3b's MEMBERS OFF chip, in the bar while the card is up (:1662). DW-283 (Story 5.24e): WHOLE OR NOT AT ALL, as
              the Paywall's NOT A PAGE SECTION chip is (`data-surface-chip`): truncated below 1280 it read as a fragment and
              pushed the bar past the window on a 600px tablet. Below 1280 it is not drawn, and nothing is lost — C3b's own
              card says "Members are switched off" at every width */}
          {offCard ? (
            <span data-members-off-chip className="shrink-0 rounded-pill border border-ink-mid px-2 py-[2px] font-mono text-[10px] text-ink-deep-soft compact:hidden">
              {PAYWALL_WORDS.offChip}
            </span>
          ) : null}
        {/* STORY 5.22 — HIDDEN BELOW 1280, NEVER UNMOUNTED: the ⋯ rows press these very controls, and the dice's confirm
            is portalled out of here so it still opens (`remix-dice.tsx`). The walk reads the cluster's order off this
            element's own children (steps 46 and 54). */}
        <div hidden={compact} className="flex items-center gap-[10px]">
          {/* STORY 5.12 — the dice LEADS the cluster rather than following the sun, and the reason is R-135:
              `ModeToggle` is not rendered at all on a Light-only project, so a dice placed after it would move on
              some projects and not others. First, its seat is the same everywhere — and it is still "next to the
              dark mode button" wherever that button exists.
              THE COUNT IS THIS CANVAS'S OWN DOC (R-161): `stack` carries the site-wide header and footer too, and
              Remix leaves them alone. Derived from the rings, never written down (standing rule 4) — in the shipped
              library every ring is length 1, so it is 0 and the confirm says so honestly. */}
          {/* Story 5.20 — ABSENT on a template surface: Site Remix never touches a treatment (FR-D17) */}
          {surface ? null : (
            <ReadOnly on={!lock.holder}>
            <RemixDice
              canvas={canvas.label}
              count={remixCount}
              undoable
              onRemix={on.remix}
              handle={remixDice}
            />
            </ReadOnly>
          )}
          {/* the sun sits straight on the bar, so on the ink surround its glyph takes the surround's words (`onInk`) —
              on the button itself, never a wrapper: R-132's cluster is read as the bar's own children (the deployed
              walk's steps 46 and 54), dice, sun, device track */}
          {darkEnabled ? <ModeToggle mode={mode} onMode={on.flip} style={onInk} /> : null}
          <DeviceSwitch device={device} onDevice={on.pickDevice} />
          {/* R-131's screen, reached from the editor and from nowhere else — it is the project's, not the account's,
              so it is never a shell-nav destination (`EXPERIENCE.md:172`). Words, not a glyph: the export draws no
              icon for it, and R-92 forbids inventing one here. */}
          <Link
            href={settingsPath(project.id)}
            id="editor-theme-settings"
            style={onInk}
            className={`rounded-sm px-[6px] py-1 text-ui-dense text-ink-soft transition-colors hover:bg-paper-sunk hover:text-ink ${ring}`}
          >
            Theme settings
          </Link>
          {/* STORY 5.15 — B3a's Preview pill (`B Missing Surfaces.dc.html:645-649`), LAST in the cluster: B3a draws it
              immediately left of the ship button, and Story 7.18 places "Ship it" to its right. */}
          {/* Story 5.20 — a template surface is no page of the site, so it has no Preview (`enterPreview`) */}
          {surface ? null : <PreviewButton onPress={on.enterPreview} />}
          {/* C3a :1385 — the way back to the canvas the paywall is part of: a navigation, never an edit, so it is live
              reading along (R-192). A link, as Theme settings is, so the editor stays mounted across it. */}
          {surface ? (
            <Link
              href={pathOf('post')}
              id="paywall-back"
              className={`inline-flex h-8 items-center rounded-thumb border border-ink-mid px-[13px] text-control-label font-semibold text-ink-deep-text transition-colors hover:bg-ink-hover ${ring}`}
            >
              {PAYWALL_WORDS.back}
            </Link>
          ) : null}
        </div>
          {/* D8's ⋯ (`:54`, `:184`): 28px on a mouse, 44 on touch by the editor's rule, and the Kit's menu card (D8a's). */}
          <IconButton
            id="editor-more"
            hidden={!compact}
            label="More editor actions"
            title="More editor actions"
            style={onInk}
            popoverTarget="editor-more-menu"
            onClick={(event) => {
              const menu = document.getElementById('editor-more-menu')
              if (menu) openMenu(menu, event.currentTarget, { side: 'down', align: 'right' })
            }}
          >
            <span aria-hidden className="text-[13px] font-semibold leading-none">⋯</span>
          </IconButton>
          <div id="editor-more-menu" popover="auto" onKeyDown={arrowKeys} className="overflow-visible border-0 bg-transparent p-0">
            <Menu label="More editor actions" items={more} />
          </div>
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

      {/* STORY 5.22 — `relative`, because below 1280 both panels are OVERLAYS positioned over this row: Layers beside the
          rail, Controls on the right. Nothing in flow moves when one opens, so the stage's measured size — the fit, and
          the chip's words — never changes under it (`D8:161`, `:298`). */}
      <div className="relative flex min-h-0 flex-1">
        <aside
          id="editor-layers"
          aria-label="Layers"
          hidden={preview || (compact ? sheet !== 'layers' : layers.folded)}
          className={`flex w-[240px] shrink-0 flex-col border-r border-line bg-paper ${compact ? 'absolute inset-y-0 left-11 z-30 coarse:left-14' : ''}`}
        >
          <div className="flex items-center gap-2 px-4 pt-[10px]">
            <span className="flex-1 text-[12.5px] font-semibold">Layers</span>
            {/* below 1280 it is an overlay's close, D8's X (D8b draws Controls' at :224; Layers' is extrapolated from it) */}
            {compact ? (
              <IconButton ref={layers.hide} label="Close layers" title="Close layers" onClick={() => closeSheet()}>
                <X size={15} />
              </IconButton>
            ) : (
              <IconButton ref={layers.hide} label="Collapse layers" title="Collapse layers" aria-expanded aria-controls="editor-layers" onClick={() => layers.toggle(true)}>
                <Panel size={15} />
              </IconButton>
            )}
          </div>
          {/* B7's two groups, every row pressable — and R-123's third ground inside it (`controls/layers.tsx`). STORY 5.20 —
              on a template surface the panel keeps its name and holds no rows: C3a's "How readers reach it" card instead */}
          {surface ? <HowReadersReachIt tiers={tiersShown} tiersHref={tiersHref} /> : (
          <Layers
            readOnly={!lock.holder}
            site={siteRows}
            page={pageRows}
            // Story 5.16: on page 2 the group heads "This page · Home · Page 2", over page 2's own rows
            label={page === 2 ? `${canvas.label} · ${PAGE_TWO_WORDS}` : canvas.label}
            siteKey={SITE.key}
            // derived, never written down (standing rule 4): the templates this project's site-wide sections reach
            templates={templates}
            autoGenerated={page === 2 ? follows(docs, key) : auto.has(key)}
            // page 2's marker, while it follows page 1: D5a's row with its own sentence
            markerWords={page === 2 ? COPY_MARKER : undefined}
            // Story 5.19 — FR-H2's archive case: a Tag or Author page with no visible feed says, in D5a's shape, that its
            // later pages would repeat page 1 — gone the moment a feed shows again, and never on Home
            feedless={feedless}
            selectedKey={selected ? keyOf(selected) : null}
            hoveredKey={hovered ? keyOf(hovered) : null}
            drag={dragStore}
            // the owner's ruling of 2026-09-20: choosing a row brings its section into view, with a little air above it
            onSelect={on.selectRow}
            onPoint={on.pointRow}
            onGround={on.ground}
            onToggleHidden={on.toggleHidden}
            onRename={on.rename}
            onDuplicate={on.duplicate}
            onRemove={on.remove}
            onClearDark={on.clearDark}
            onMakeMainFeed={on.makeMainFeed}
            onMove={on.move}
            // Story 5.21's Fix — the two rows, where the canvas draws the shims (never on a surface, never unlinked)
            ghost={ghostRows}
          />
          )}
          {/* S4 Editor.dc.html:172 — the Layers footer's full-width dashed button, redrawn identically at 834 and 720
              (`D8 Editor Below 1440.dc.html:72`, `:202`). It is the Kit's `AddButton`, which `/kit` already draws with
              these very words. OUTSIDE the scrolling list, as the frame draws it, so it is always in reach — which is
              also the empty canvas's one affordance: there is no gap to hover when there is no section.
              ABSENT where nothing can be placed on this canvas (UX-DR3), never a button that opens an empty picker. */}
          {canAdd ? (
            <div className="border-t border-line p-[10px]">
              <ReadOnly on={!lock.holder}>
                <AddButton id="editor-add-section" onClick={on.addAtEnd}>
                  + Add section
                </AddButton>
              </ReadOnly>
            </div>
          ) : null}
        </aside>
        {/* STORY 5.22 — D8's icon rail: where Layers is folded at full width, and always below 1280 */}
        {compact || layers.folded ? (
          <IconRail
            show={layers.show}
            hidden={preview}
            expanded={compact && sheet === 'layers'}
            rows={railRows}
            onShow={on.railShow}
            onRow={on.railRow}
            canAdd={canAdd}
            addReadOnly={!lock.holder}
            onAdd={on.addAtEnd}
          />
        ) : null}

        {/* STORY 5.20 — THE CANVAS COLUMN: C3a's strip above the stage on a template surface, and nothing above it on any
            other canvas. The wrapper is on EVERY canvas, so a canvas switch never remounts the stage or its frame.
            STORY 5.22 — `inert` while a sheet is open over it: the scrim takes the press that closes it, and nothing on
            the page behind can be reached (never in Preview, where there is no sheet to draw). */}
        <div className="flex min-h-0 min-w-0 flex-1 flex-col" inert={compact && sheet !== null && !preview}>
        {surface && !offCard ? (
          <div data-paywall-strip hidden={preview} className="flex shrink-0 items-center gap-[9px] border-b border-paywall-strip-line bg-paywall-strip px-4 py-2">
            {/* static text, never a menu (R-118): the visitor is View as's to choose */}
            <span data-paywall-showing className="flex items-center gap-[6px] rounded-pill border border-paywall-strip-line bg-paywall-pill px-[11px] py-1 text-[12px] text-ink-mid">
              {PAYWALL_WORDS.showingLead} <span className="font-semibold text-ink-deep">{PAYWALL_WORDS.showing(whole)}</span>
            </span>
            {paywallAt >= 0 && stack[0] !== undefined ? (
              <span data-paywall-design className="rounded-pill border border-paywall-strip-line bg-paywall-pill px-[9px] py-[3px] font-mono text-[10.5px] text-ink-mid">
                {PAYWALL_WORDS.design(paywallAt + 1, paywalls.length, entries[stack[0].designId]?.name ?? '')}
              </span>
            ) : null}
            <span className="ml-auto text-[11.5px] text-ink-mid">{PAYWALL_WORDS.context(whole)}</span>
          </div>
        ) : null}
        <section
          ref={stage}
          aria-label="Canvas"
          // Story 5.18: busy until the site's first paint lands, where one is being read
          aria-busy={readable && (paints === 0 || blanked) ? true : undefined}
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
          // Story 5.20: a template surface sits on C3a's darker mat, so a canvas that is not a page reads as one
          // Story 5.22: on a touch screen the source pill is 44px, so the ground's bottom is 52 (its 4px inset, 44 and 4),
          // and on page 2 D5d's pill is 52 tall, so the top is 64 (4, 52 and R-138's 8) — the fit shrinks on its own
          // (`fitFor` measures the content box), and no pill ever meets the card
          className={`relative flex min-h-0 min-w-0 flex-1 flex-col items-center justify-center ${surface ? 'bg-paywall-mat' : 'bg-canvas-ground'} ${preview ? '' : page === 2 ? 'px-7 pb-8 pt-[50px] coarse:pb-[52px] coarse:pt-16' : 'px-7 py-8 coarse:pb-[52px]'}`}
        >
          {/* R-137: the card is the DEVICE's size, fitted — centred in the ground, rounded on all four corners, with
              ground below it. `shrink-0` because the fit already guarantees it is never larger than the stage.
              HIDDEN UNTIL THE STAGE IS MEASURED (review, 2026-09-19): before the first `ResizeObserver` callback the
              fit is 1, and the server's HTML would otherwise paint a full 1440 × 900 card across both panels — the
              old card was `w-full overflow-hidden` and clipped the same state, this one is `shrink-0`. */}
          <div
            // Story 5.20: and hidden under C3b's card, which stands in for the canvas while members are switched off
            style={{ width: device.width * scale, height: device.height * scale, visibility: size.width > 0 && size.height > 0 && !offCard ? undefined : 'hidden' }}
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
            {/* STORY 5.18 — THE FIRST PAINT OF THE SITE'S CONTENT WAITS FOR ITS READS, as it waits for the hydrate, and the
                card says so with the Kit's skeleton (R-98, DESIGN.md § Loading — never a spinner). Only where a site can
                be read: an unlinked project's first frames are exactly what they were. */}
            {readable && (paints === 0 || blanked) ? (
              <div aria-hidden data-live-skeleton className="pointer-events-none absolute inset-0 flex flex-col gap-8 bg-paper-raised p-8">
                <Skeleton />
                <Skeleton />
                <Skeleton />
              </div>
            ) : null}
            {/* THE CANVAS CHROME — the outlines, the name tag, the badge, the MAIN FEED chip, P0-1's pill and the PAUSED chips,
                portalled into the canvas document and placed from the paint's current roots (`CanvasChrome`, above) */}
            <CanvasChrome
              layers={preview ? null : chrome}
              fit={scale}
              hovered={hoveredRoot}
              outline={hoverOutline}
              tag={pointed ? pointed.layerName : ghostHover !== null ? GHOST_WORDS.tag(ghostName(ghostHover)) : null}
              selected={selectedRoot}
              chosen={chosen !== undefined || ghostChosen !== null}
              pro={pro}
              note={chosen ? note : null}
              chip={chipOn}
              chipBesideTag={chipBesideTag}
              paused={chips}
              badge={badge}
              pins={drawnPinned}
              pinTick={pinTick}
              roots={chromeRoots}
            />
          </div>
          {/* Story 5.15: B11's chip and B9's pill are hidden in Preview, never unmounted — `contents`, so the wrapper
              draws no box of its own, and both stay positioned against this ground */}
          <div hidden={preview} className="contents">
            {/* STORY 5.22 — ONE ROW FOR THE CHIP AND THE PILL, 4px in (R-138's inset): a `1fr auto 1fr` grid with B11's chip in
                the first column and D5d's pill in the second, so the pill is centred while there is room and slides right of
                the chip when there is not — "never overlaps" by construction. It lets presses through to the ground (R-123),
                and the pill takes its own back. LAST, not first, as both always were: the page card must stay this ground's
                `firstElementChild`, which is how the harness and step 27's gutter find it. */}
            <div className="pointer-events-none absolute inset-x-1 top-1 z-10 grid grid-cols-[1fr_auto_1fr] items-start gap-x-2">
              {/* B11's chip: the true size first, the fit second, and nothing sets it (UX-DR17, UX-DR20) */}
              <ViewportChip device={device} fit={scale} />
              {/* STORY 5.16 — D5d's pill at the ground's top centre while page 2 is shown */}
              {page === 2 ? <PageTwoPill onBack={() => leavePageTwo('pill')} /> : null}
            </div>
            {/* STORY 5.20 — C3b, in the page card's place while members are switched off and the canvas is chosen to show
                the site's content (the card is hidden above, and stays this ground's `firstElementChild`) */}
            {offCard && site !== null && 'origin' in site ? (
              <div className="absolute inset-0 flex items-center justify-center overflow-y-auto p-[30px]">
                <PaywallNotice site={siteName} url={site.origin} busy={rechecking} refusal={recheckRefusal} onRecheck={() => recheck(true)} />
              </div>
            ) : null}
            {/* B9's CONTENT-SOURCE PILL at the canvas foot (FR-D15, FR-D22), and LAST for the same reason the chip is:
                the page card must stay this ground's `firstElementChild`, which is how the harness and step 27's
                gutter find it. R-166 builds it at 24px inside R-139's existing 32px ground, so it clears the card on
                every device and `py-8` does not move — the measurement the deployed walk makes first. */}
            <SourcePill
              subject={previewing.subject}
              rows={subjectRows}
              fellBack={previewing.fellBack}
              refusal={subjectRefusal}
              onChoose={on.chooseSubject}
              busy={busy}
              // STORY 5.18 — B9's connected look and D5e's SOURCE group, wherever a site is linked (Home becomes
              // pressable then, and only then). Every word is `lib/live-content.ts`'s, and the site has one name.
              site={sourceSite}
              // DW-248: posts are the one capped search — D5e on a Page, Tag or Author canvas searches its rows in hand
              onQuery={previewing.subject?.kind === 'post' ? setTerm : undefined}
            />
          </div>
          {/* P0-1's toolbar and its link panel, and S4b's quick-action pill: all pressed, so all outside the frame
              (AD-21) — and all hidden from the first canvas scroll, placed again 150ms after the last, and in Preview */}
          <InlineTools id="canvas-inline" session={session} selection={inlineAt} hidden={scrolling || preview} resources={linksNow} handle={tools} />
          <SectionPill
            readOnly={!lock.holder}
            // Story 5.20 — ABSENT on a template surface: the paywall is not placed, moved, copied or deleted (DW-262).
            // R-217 — and for a section pointed at from its Layers row: the outline says where it is, nothing more
            shown={!!pointed && !surface && pointedFrom !== 'layers'}
            canAdd={canAdd}
            hidden={scrolling || preview}
            boxOf={pillBox}
            // FR-D5: a site-wide section is one shared instance, so its Duplicate is absent here as it is in Layers
            canDuplicate={pointed?.doc !== SITE.key}
            // S4b + S6's ring, on the section itself (B1b's claim). Null — so the arrows, the counter and
            // Shuffle are all absent — wherever the hovered section's category holds one design.
            ringCount={pointedRing.length > 1 ? pillPosition(pointedRing.findIndex((e) => e.id === pointed?.designId), pointedRing.length) : null}
            onPrevDesign={on.pillPrev}
            onNextDesign={on.pillNext}
            onShuffle={on.pillShuffle}
            name={pointed?.layerName ?? ''}
            pillRef={pill}
            onDuplicate={on.pillDuplicate}
            onDelete={on.pillDelete}
            onAdd={on.pillAdd}
            gripProps={pillGrip}
            onWheel={wheelToCanvas}
            onPointerLeave={on.pillLeave}
          />
        </section>
        </div>

        {/* STORY 5.22 — THE SCRIM (`D8:119`, `:219`): `scrim` at 70% is D8's .28, over the canvas column ONLY — never the bar
            and never the rail, because "the one thing that survives the overlay is the way back to another section". A
            press on it closes the sheet and keeps the selection. */}
        {compact && sheet !== null ? (
          // hidden in Preview, never unmounted, like everything else this story adds (Story 5.15; review, 2026-09-27)
          <div aria-hidden hidden={preview} data-scrim onClick={() => closeSheet()} className="absolute inset-y-0 left-11 right-0 z-20 bg-scrim/70 coarse:left-14" />
        ) : null}

        {!compact && controls.folded ? <Rail fold={controls} label="Show controls" controls="editor-controls" side="right" hidden={preview} /> : null}
        {/* STORY 5.22 — below 1280 Controls is an OVERLAY anchored right at its own 280px (`D8:33`, `:298`, recorded against
            the drawings' 320 and 288), with D8's shadow. This wrapper is the overlay's opaque paper, so B5a's 55% dim on
            the panel still reads over the page rather than through to it; at full width it draws no box at all. */}
        <div hidden={compact && !controlsShown} className={compact ? 'absolute inset-y-0 right-0 z-30 flex bg-paper shadow-panel-overlay' : 'contents'}>
        {/* STORY 5.17 — B5a: THE SETTINGS SIDEBAR DIMS TO 55% and the canvas stays fully legible. The controls stay
            VISIBLE and announced so the reader can see what is set — never `inert` and never `hidden`, either of
            which would take them out of the accessibility tree and leave a screen-reader user unable to read their
            own site. Since R-192 (the owner, 2026-09-24) every EDITING control inside is DISABLED through the Kit's
            `ReadOnly` fieldset — greyed, unresponsive and out of the Tab order, read as unavailable — while the
            view controls (the fold, a group's header, a list item's opener) stay live. `commit()`'s one early
            return is still the guard underneath. The panel still SCROLLS, which is what `pointer-events-none` would have cost.
            Layers is untouched — the frame dims this one aside and no other.
            WHY IT IS DESCRIBED AND NOT `aria-disabled`: `aria-disabled` is not a global ARIA attribute, so on a
            `complementary` landmark it is `aria-allowed-attr` — a WCAG 4.1.2 violation axe reports. `describedby`
            points at B5a's own sentence, which is the honest answer to "why does nothing here respond". */}
        <aside
          id="editor-controls"
          aria-label={surface ? `${PAYWALL_WORDS.panel} settings` : chosen ? 'Section settings' : packList ? 'Style Pack' : 'Page settings'}
          hidden={!controlsShown}
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
              {/* Story 5.19 — D5c's panel head (:334-335): the main feed's name with its chip beside it */}
              <span className="flex min-w-0 items-center gap-2">
                {/* Story 5.20 — on the Paywall canvas the head is C3a's :1477: "Paywall", with "n / m" once a design is
                    chosen (the pill's own arithmetic, `pillPosition`). Story 6.2 — at rest with the roster open it is
                    S7a's: the back chevron and "Style Pack" */}
                {resting && packList ? (
                  <StylePackHead backRef={packBack} onBack={() => showPacks(false)} />
                ) : (
                  <PanelLabel id="editor-panel-name">{surface ? PAYWALL_WORDS.panel : chosen ? chosen.layerName : 'Page'}</PanelLabel>
                )}
                {surface && paywallAt >= 0 ? (
                  <span id="editor-panel-position" className="font-mono text-[11.5px] text-ink-soft">{pillPosition(paywallAt, paywalls.length)}</span>
                ) : null}
                {chosen?.isMainFeed === true ? <MainFeedChip id="editor-panel-main-feed" /> : null}
              </span>
              {chosen && entry && !surface ? <span id="editor-panel-category" className="truncate text-[11.5px] text-ink-soft">{entry.categoryTitle}</span> : null}
            </span>
            {/* below 1280 it is the overlay's close, D8's X (`:128`, `:224`) */}
            {compact ? (
              <IconButton ref={controls.hide} label="Close controls" title="Close controls" onClick={() => closeSheet()}>
                <X size={15} />
              </IconButton>
            ) : (
              <IconButton ref={controls.hide} label="Collapse controls" title="Collapse controls" aria-expanded aria-controls="editor-controls" onClick={() => controls.toggle(true)}>
                <Panel size={15} className="-scale-x-100" />
              </IconButton>
            )}
          </div>
          {pausedHere ? <p className="sr-only" data-paused-said>{PAUSED_SAID}</p> : null}
          {/* STORY 5.20, R-216 (Story 5.24e) — a placed section whose design asks a visitor to join, on a site whose record
              stops that ask: the Sites screen's own sentence for each fact that does (5.20's line for members off), at the
              panel head in 5.18's note shape — never for a synthesized instance (FR-H6). `askLine` reads the one list the
              Sites notice reads (`lib/paywall.ts`'s `FACTS`) */}
          {chosen && entry && !surface && site !== null
            ? ((line) =>
                line === null ? null : (
                  <p data-member-ask className="flex items-start gap-2 rounded-sm bg-paper-sunk p-[9px_10px] text-[11.5px] leading-[1.5] text-ink-soft">
                    <InfoCircle size={13} className="mt-px shrink-0 text-ink-soft" />
                    {line}
                  </p>
                ))(askLine(members, siteName, entry, chosen))
            : null}
          {surface && paywallAt < 0 ? (
            // STORY 5.20 — THE UNTOUCHED PAYWALL (R-197): Ghost's own box is on the canvas, and the panel says so; where
            // the editor holds paywall designs their ring is here to choose from, and absent while there are none (UX-DR3)
            <>
              <p id="paywall-untouched" className="text-[12px] leading-[1.5] text-ink-soft">{PAYWALL_WORDS.untouched}</p>
              {paywalls.length > 0 ? (
                <ReadOnly on={!lock.holder}>
                  <DesignPicker
                    ring={paywalls}
                    at={-1}
                    target={CANVASES[key].file}
                    rows={designRows}
                    pool={pool}
                    icons={icons.current}
                    mode={mode}
                    src={src}
                    subject={null}
                    member={viewAs}
                    live={cardLive}
                    onDesign={on.choosePaywall}
                    onStep={on.stepPaywall}
                  />
                </ReadOnly>
              ) : null}
            </>
          ) : chosen && entry ? (
            <>
            {/* B1a — the Design block, ABOVE the settings groups and inside none of them (FR-F3: the design
                picker is not a setting). With one design in the ring it is the counter, the name and one
                sentence; with more it grows its arrows and its strip (the key chips and the Try-a-design card were built and
                removed at the owner's test of 2026-09-20, findings 3 and 4)
                on its own, because every count in it is derived (R-158). */}
            {/* Story 5.20 — R-192 on the Paywall canvas: its design choice is an edit, greyed while reading along (the
                fieldset draws only when on, so every other canvas keeps exactly the DOM it had) */}
            <ReadOnly on={surface && !lock.holder}>
            <DesignPicker
              ring={chosenRing}
              at={chosenAt}
              target={chosen.target}
              rows={designRows}
              pool={pool}
              icons={icons.current}
              mode={mode}
              src={src}
              subject={previewing.subject}
              // Story 5.14 — a tile previews the page as the visitor View as is previewing, through the same door
              member={viewAs}
              // Story 5.18 — and with the canvas's own content, one source per tile
              live={cardLive}
              onDesign={on.designChosen}
              onStep={on.stepChosen}
            />
            </ReadOnly>
            {/* R-113's panel, mounted and not redrawn, fed what `/pilots` feeds it */}
            <Sidebar
              readOnly={!lock.holder}
              // Story 5.16: keyed ACROSS THE PAGE SWITCH — page 2's copy of a section is that section — so the panel stays
              // mounted, its open groups stay open, and focus stays on D5d's row when the row was pressed
              key={acrossPages(chosen)}
              entry={panelEntry ?? entry}
              state={chosen}
              // R-210: a press on this panel while it is still drawn for a replaced design or section is dropped
              onChange={on.change}
              // Story 5.6 — the mode's own swatch values, so the Background-role dots are the colours the canvas
              // is actually painting; the mode itself scopes every resolution, write and reset in the panel
              swatches={swatches}
              mode={mode}
              // R-135: absent on a Light-only project — `sidebar.tsx` draws no row at all without this
              onClearDark={darkEnabled ? on.clearDarkChosen : undefined}
              // Story 5.16 — D5d's row, on the main feed of a page that has a page 2 (R-176): a plain callback, never an edit
              page={pageRow}
              // Story 5.16a — WHERE THE PANEL IS, which is all R-186 and R-187 need before a field offers
              // `{page_number}`: the page on screen (the same `page` the pill and the address read, threaded rather
              // than derived a second way, because the panel is keyed ACROSS the switch) and whether this section is
              // the site's own — the instance's own stamp, which `stackOf` sets (R-187: a header is on every page).
              shownPage={page}
              siteWide={chosen.doc === SITE.key}
              timezone={zoneNow}
              links={linksNow}
              // STORY 5.18 — the panel's note where a list the section shows is not full on the site's content (P0:488-490
              // puts the zero note here, not on the canvas), and R-194's door beside it: the pill's own Sample content
              // row, which then takes the focus. OUTSIDE the panel's `ReadOnly`: a source is a view (R-192).
              note={shortfallNote}
              assets={assets}
              sourceRows={chosenRows}
              // Story 5.19 — what P0·5's tag, writer and post pickers offer: the source in force's own rows
              lists={dataLists}
              // R-124: the FIRST ROW of Section Settings, for a section whose category carries it — never in Layers.
              // The value is the instance's own and reaches both emitters as `RenderInput.visibility`, so there is no
              // design control to declare (DW-186); `carriesMemberVisibility` reads R-113's register (DW-185).
              // Story 5.14: R-124's caption follows View as — R-168's "left out, and the panel says for whom"
              visibility={visibilityRow}
            />
            </>
          ) : packList ? (
            // Story 6.2 — S7a's roster, looking only: no cell is a button until Story 6.3 makes one switch
            <StylePackRoster stylePack={stylePack} />
          ) : (
            <>
              {/* Story 6.2 — S4a's rest panel: "Page", the project's Style Pack card, then the sidebar's empty state */}
              <StylePackCard stylePack={stylePack} changeRef={packChange} onChange={() => showPacks(true)} />
              <EmptyPanel title="Nothing selected" instruction="Click any section on the canvas — its controls appear here." />
            </>
          )}
        </aside>
        </div>
      </div>

      {/* STORY 5.15 — B3b's floating bar (`B Missing Surfaces.dc.html:700-710`), the one piece of chrome Preview keeps:
          the way back and the three devices, the current one lit. Its devices are the top bar's own control and
          handler (`pickDevice`, R-141), so a device chosen here is the device you come back to. */}
      {preview ? <PreviewBar device={device} onDevice={on.pickDevice} onBack={on.leavePreview} back={backButton} /> : null}

      {/* A completed move, announced politely in `moveSection`'s own words — from here, so a drop on either grip
          (a Layers row's or the canvas pill's) reads out through one live region (UX-DR12) */}
      <p id="editor-said" aria-live="polite" className="sr-only">
        {/* DW-205: a new node per sentence, so a repeat is heard again (`useSaid`) */}
        <span key={said.n}>{said.words}</span>
      </p>

      {/* STORY 5.17 — UX-DR12'S SECOND REGION, AND IT IS ASSERTIVE: the edit-lock request and the take-over notice
          are the only two things in this editor that interrupt, because one is a request waiting on this person and
          the other is work that is already gone. `#editor-said` above STAYS POLITE — widening it would make every
          design-ring announcement, every Shuffle and every completed move shout. Nothing else writes here. */}
      <p id="editor-announced" aria-live="assertive" className="sr-only">
        <span key={announced.n}>{announced.words}</span>
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
          // a SECOND request from the same tab is a new card with a new countdown, not the old one's clock
          key={lock.row?.request ?? ''}
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
          rows={designRows}
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
          // Story 5.18 — and with the canvas's own content: the site's where it shows, one source per card
          live={cardLive}
          refusal={pickerRefusal}
          // DW-207 (Story 5.24e): browsing on lets the last refusal go — it was about a press no longer in front of you
          onBrowse={() => setPickerRefusal(null)}
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
