'use client'

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { ringFor } from '@inflozo/library'
import type { IconLookup, SectionRegistryEntry } from '@inflozo/library'
import { defaultContent, renderCanvas, stampControls, switchControls, withData } from '@inflozo/section-runtime'
import type { ControlState, RuntimeDocument, RuntimeElement } from '@inflozo/section-runtime'
import { loadIcons } from '@/components/controls/icon-picker'
import { SectionPill, type PillBox } from '@/components/controls/section-pill'
import { DesignPicker } from '@/components/editor/design-picker'
import { RemixDice, type RemixHandle } from '@/components/editor/remix-dice'
import { ring, slimScrollbar } from '@/components/kit/greyed'
import { Panel } from '@/components/kit/icons'
import type { LinkResources } from '@/components/controls/link-picker'
import { Sidebar, type Edit } from '@/components/controls/sidebar'
import { sampleRows, shownRows, wheelToFrame } from '@/lib/canvas'
import { holdsCaret, shortcutFor, singleKeyOwned } from '@/lib/keymap'
import { remixPicks, remixable } from '@/lib/remix'
import { announce, pillPosition, shuffleTo, step } from '@/lib/ring'

/* THE INSTANCE, THE CANVAS AND THE PANEL — Story 4.5's review, the way Epic 5's editor will wire them.

   The state is one `ControlState`, and nothing on this page is saved: a reload brings back the sample.
   It starts with the authored content, no stored control, no Count or Order, and ONE stored dark override
   — on Background role, none on Card tint — so the moon's two cases are both on the panel (FR-F5).

   The canvas is a same-origin iframe whose document the frame route serves with no script, so this file
   writes into it. A CONTROL change writes the engine's resolved values onto the section root inside the
   input's own handler — before React re-renders anything — because AD-3 makes a control one attribute;
   a CONTENT, item or data change re-renders the section with `renderCanvas`, timed, and the last duration
   is on the iframe as `data-render-ms` for the review harness (NFR-1's 100 ms).

   THE PAGE IS A WORKSPACE THE HEIGHT OF THE WINDOW, as S4 draws the editor (`S4 Editor.dc.html:28`, `:62-63`):
   the window never scrolls; the canvas fills its pane and scrolls INSIDE ITSELF, and the panel scrolls on its
   own — one scroller under the wheel wherever it is, and never two scrollbars side by side. Both bars are
   the Kit's `slimScrollbar` (`components/kit/greyed.ts`); the canvas document carries the same rule in CSS.
   This replaced a canvas sized to its section inside a scrolling page (the owner's findings 5 and 6,
   2026-09-13): with the window's scrollbar beside the panel's it "looks really bad", and because the section
   grows taller as it widens, collapsing the panel locked the sized iframe into a scrollbar with nothing to
   scroll — 15px of arrows at a 0px range, measured with real scrollbars on production.

   STORY 5.11 — THE ONLY RING IN THE REPOSITORY RIDES HERE (R-158). `packages/library/designs/` holds one design
   per category, so the editor's own arrows have nowhere to go; this page is handed all three fixture designs and
   mounts B1a's Design block over them, plus S4b + S6's quick-action pill, which since the owner's test of
   2026-09-20 carries Shuffle's one seat. `[` and `]` are bound here too (his finding 1), through the editor's own
   `shortcutFor` and its WCAG 2.1.4 guard rather than a second key table. A swap is the
   pure `switchControls` — the very function `switchDesign` calls in the editor — over this page's own
   `ControlState`, `parkedControls` included, so the carry / park / default rule the owner tests here is the rule
   the product runs. Nothing is saved, as nothing on this page ever was.

   THE PILL DRAWS ITS RING GROUP ALONE (`sectionControls={false}`): there is one sample and no doc, so Duplicate,
   Delete and the drag grip have nothing to act on and are absent rather than dead (UX-DR3).

   THE PANEL IS DOCKED, as S4c draws the editor's Controls sidebar (`S4 Editor.dc.html:337`): 280 wide, flush
   to the right edge, a hairline on its left, paper, no radius, the section's name over it (the owner's
   finding 3, 2026-09-13; it was a rounded card 48px in from the edge). It COLLAPSES to a 44px rail with one "Show
   controls" button, D8's Layers rail mirrored (`D8 Editor Below 1440.dc.html:194`) — no frame draws a
   collapse at full width, so the editor's own is Story 5.1's to settle (DW-114). Below `tablet` the panel
   stacks under the canvas and does not collapse. */

export function Review({
  designs,
  swatches,
  links,
  pool,
  timezone,
  children,
}: {
  /** Story 5.11 — the fixture RING, in `{n}` order; the page opens on the first */
  designs: readonly SectionRegistryEntry[]
  swatches: Readonly<Record<string, string>>
  links: LinkResources
  pool: readonly { id: string; bytes: number }[]
  timezone: string
  /** the page's heading, drawn above the canvas in the scrolling column */
  children?: ReactNode
}) {
  const first = designs[0]!
  const [designId, setDesignId] = useState(first.id)
  const entry = designs.find((e) => e.id === designId) ?? first
  const [state, setState] = useState<ControlState>(() => ({
    content: defaultContent(first.contentSchema),
    controls: {},
    data: {},
    darkOverrides: { bg: 'contrast' },
    parkedControls: {},
  }))
  const [said, setSaid] = useState('')
  /** the sample has been drawn at least once, so the pill has a rect to anchor to and the strip has its icons */
  const [painted, setPainted] = useState(false)
  const current = useRef(state)
  const design = useRef(entry)
  design.current = entry
  const frame = useRef<HTMLIFrameElement>(null)
  const pill = useRef<HTMLDivElement | null>(null)
  const icons = useRef<IconLookup | null>(null)
  const [collapsed, setCollapsed] = useState(false)
  const toggled = useRef(false)
  const hide = useRef<HTMLButtonElement>(null)
  const show = useRef<HTMLButtonElement>(null)
  // The pressed toggle leaves with the state it changed, so focus moves to the one that replaced it.
  useEffect(() => {
    if (toggled.current) (collapsed ? show : hide).current?.focus()
  }, [collapsed])
  const toggle = (next: boolean) => {
    toggled.current = true
    setCollapsed(next)
  }

  // An asset id resolves only through this map (AD-27(b)). Relative, so each document resolves it
  // against its own address: the panel sits at /controls, the canvas at /controls/frame.
  const canvasAssets = Object.fromEntries(pool.map((a) => [a.id, `frame?image=${a.id}`]))
  const panelAssets = pool.map((a) => ({ id: a.id, src: `controls/frame?image=${a.id}`, meta: `${Math.max(1, Math.round(a.bytes / 1024))} KB · SVG` }))

  /** Each query's rows as the canvas shows them. STORY 5.19 — resolved PER STATE through the editor's own two
   *  functions: `sampleRows` over the instance's FOLDED queries (a Source, a tag, a writer or picks the server cannot know
   *  per design) and `shownRows` to slice them — never a second copy of either. Two of the three samples declare no query
   *  at all, which is itself part of the proof that a `{{#get}}` coming and going across a swap costs the section nothing. */
  const shown = (s: ControlState, e: SectionRegistryEntry = entry) => shownRows(e, s, sampleRows(withData(e.dataBindings, s.data)))
  /** the ring's tiles preview each DESIGN as it always did: its declared queries, resolved */
  const designRows = useMemo(() => Object.fromEntries(designs.map((e) => [e.id, sampleRows(e.dataBindings)])), [designs])

  const canvas = () => {
    const doc = frame.current?.contentDocument
    const mount = doc?.getElementById('canvas')
    return doc && mount ? { doc, mount } : null
  }

  /** AD-3 through the one door both emitters use: `stampControls` writes `resolveControls`' values and nothing else. */
  const stamp = (s: ControlState, e: SectionRegistryEntry = design.current) => {
    const root = canvas()?.mount.firstElementChild
    if (!root) return
    stampControls(root as unknown as RuntimeElement, { controlSchema: e.controlSchema, universals: e.universals, controls: s.controls })
  }

  const paint = (s: ControlState, e: SectionRegistryEntry = design.current) => {
    const c = canvas()
    const lookup = icons.current
    if (!c || !lookup || !frame.current) return
    const started = performance.now()
    c.mount.innerHTML = renderCanvas(c.doc as unknown as RuntimeDocument, e.html, {
      content: s.content,
      schema: e.contentSchema,
      controlSchema: e.controlSchema,
      universals: e.universals,
      controls: s.controls,
      data: s.data,
      dataBindings: e.dataBindings,
      getRows: shown(s, e),
      assets: canvasAssets,
      icons: lookup,
    })
    frame.current.dataset.renderMs = (performance.now() - started).toFixed(1)
    setPainted(true)
  }

  const onChange = (next: ControlState, kind: Edit) => {
    current.current = next
    if (kind === 'control') stamp(next)
    else paint(next)
    setState(next)
  }

  /* ─── Story 5.11 — the ring, over this page's own state (R-158) ───────────────────────────────────────────── */

  const designRing = ringFor(designs, entry)
  const at = designRing.findIndex((e) => e.id === entry.id)
  /** ONE PURE FUNCTION decides what carries, what parks and what defaults — the same `switchControls` the
   *  editor's `switchDesign` calls, so what the owner tests here is what the product does. Content, items and
   *  `data` are untouched: they stay in `state` byte for byte across the swap (FR-G3, FR-D19). */
  const onDesign = (to: string) => {
    const arriving = designRing.find((e) => e.id === to)
    if (!arriving || to === entry.id) return
    const next: ControlState = { ...current.current, ...switchControls(entry, arriving, current.current) }
    current.current = next
    design.current = arriving
    setState(next)
    setDesignId(to)
    paint(next, arriving)
    setSaid(announce(designRing.findIndex((e) => e.id === to), designRing.length, arriving.name))
  }
  const onStep = (by: number) => {
    if (designRing.length < 2) return
    onDesign(designRing[step(at, designRing.length, by)]!.id)
  }
  /** The pill's one Shuffle seat (the owner's test of the deployed page, 2026-09-20: the panel's card is gone).
   *  The random is drawn AT the press, because nothing names the destination before it any more. */
  const onShuffle = () => {
    const to = shuffleTo(designRing.length, at, Math.random)
    if (to !== null && designRing[to]) onDesign(designRing[to]!.id)
  }

  /* ─── Story 5.12 — SITE REMIX'S DICE, HERE TOO (R-162, the owner's Question 2) ──────────────────────────────
     The shipped library holds one design per category, so in his own editor the dice has nothing to roll to and
     the confirm says so honestly. This page carries the only ring in the repository, so this is where he watches
     a section really change design — and where `run-verify-controls.cjs` proves the re-roll on production (R-82).

     IT IS THE EDITOR'S OWN PICKER, not a second one: `remixPicks` over this page's one sample, landing through
     the same `onDesign` the arrows and Shuffle use. There is ONE section here, so Remix and Shuffle do the same
     thing — which is the honest answer rather than a second mechanism. Nothing is saved on this page, so there is
     no undo to promise (`undoable` is left off): the ring's own arrows are the way back. */
  const remixDice = useRef<RemixHandle | null>(null)
  const remixPlaced = [{ instanceId: 'controls-sample', designId: entry.id }]
  const remixRing = () => designRing
  const onRemix = () => {
    const pick = remixPicks(remixPlaced, remixRing, Math.random)[0]
    if (pick) onDesign(pick.to)
  }

  /** S4b's pill, placed from the section's rect through the frame's rect. Nothing is scaled on this page, so
   *  there is no fit to divide by — the editor's own `pillBox` is the same arithmetic with one. */
  const pillBox = (): PillBox | null => {
    const f = frame.current
    const root = canvas()?.mount.firstElementChild
    if (!f || !root) return null
    const fr = f.getBoundingClientRect()
    const r = root.getBoundingClientRect()
    return {
      rect: { left: fr.left + r.left, top: fr.top + r.top, right: fr.left + r.right, bottom: fr.top + r.bottom },
      bounds: { left: fr.left, top: fr.top, right: fr.right, bottom: fr.bottom },
      badgeLeft: null,
    }
  }

  useEffect(() => {
    let alive = true
    const el = frame.current
    const ready = () => paint(current.current)
    void loadIcons().then(
      (m) => {
        if (!alive) return
        icons.current = m.iconDrawing
        paint(current.current)
      },
      () => {
        // review: a failed chunk used to leave the canvas blank with no sentence (unhandled rejection)
        const c = canvas()
        if (alive && c) c.mount.textContent = 'The icons could not be loaded, so the section cannot be drawn. Reload the page to try again.'
      },
    )
    if (el?.contentDocument?.readyState === 'complete') ready()
    el?.addEventListener('load', ready)
    return () => {
      alive = false
      el?.removeEventListener('load', ready)
    }
    // mount only: the handlers read the latest state through `current`
  }, [])

  /* `[` AND `]` WORK HERE TOO (the owner's test of the deployed page, 2026-09-20, finding 1). This page is where
     the only ring in the repository can be cycled, so the keys the panel and the `?` card advertise have to reach
     it — the editor's own binding is `editor.tsx`'s and does not exist on this route.

     THROUGH `shortcutFor`, `holdsCaret` AND `singleKeyOwned`, never a second key table (R-145, standing rule 3):
     the same match and the same WCAG 2.1.4 guard the editor uses, so `[` typed into a panel field is a bracket here
     exactly as it is there, and `]` under an open picker or a held key is the picker's or one press (the review of
     2026-09-20 found the caret half here and not the overlay half). Bound on BOTH documents, because a press with
     the pointer in the sample is delivered to the frame's — and the overlay is looked for in both, because the
     picker is the page's while the press may be the frame's. */
  const ringStep = useRef(onStep)
  ringStep.current = onStep
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      const doc = target?.ownerDocument ?? document
      const active = doc.activeElement as HTMLElement | null
      const gesture = shortcutFor(e, holdsCaret(target) || holdsCaret(active))
      // Story 5.12 — `⇧R` joins the same effect, never a second key table (standing rule 3): the same match, the
      // same caret guard and the same overlay guard the ring's two keys already go through
      if (gesture !== 'prev' && gesture !== 'next' && gesture !== 'remix') return
      if (singleKeyOwned(e, [target, active], [document, doc])) return
      e.preventDefault()
      if (gesture === 'remix') return void remixDice.current?.press()
      ringStep.current(gesture === 'prev' ? -1 : 1)
    }
    document.addEventListener('keydown', onKey)
    const inner = frame.current?.contentDocument
    inner?.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      inner?.removeEventListener('keydown', onKey)
    }
    // re-bound when the frame's document changes; `ringStep` keeps the handler on the latest ring
  }, [painted])

  return (
    <div className="flex flex-1 flex-col tablet:h-dvh tablet:flex-none tablet:flex-row tablet:overflow-hidden">
      <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-4 px-4 py-6 tablet:px-8">
        {/* R-162: the dice sits beside this page's heading, where the editor's sits beside the sun */}
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">{children}</div>
          <RemixDice
            canvas="the sample"
            count={remixable(remixPlaced, remixRing)}
            onRemix={onRemix}
            handle={remixDice}
          />
        </div>
        <iframe
          ref={frame}
          src="controls/frame"
          title="The controls sample section"
          className="block h-[70dvh] w-full rounded border border-line bg-surface tablet:h-auto tablet:min-h-0 tablet:flex-1"
        />
        {/* S4b + S6's quick-action pill, carrying the ring's counter and — since the owner's test of 2026-09-20
            removed the panel's card — Shuffle's ONE seat. It is drawn whenever the sample is drawn rather than on
            hover: there is one section on this page and reviewing it is the page's whole job, so there is no
            second section for a hover to choose between. */}
        <SectionPill
          shown={designRing.length > 1 && painted}
          hidden={false}
          boxOf={pillBox}
          sectionControls={false}
          canAdd={false}
          canDuplicate={false}
          name={entry.name}
          pillRef={pill}
          ringCount={designRing.length > 1 ? pillPosition(at, designRing.length) : null}
          onPrevDesign={() => onStep(-1)}
          onNextDesign={() => onStep(1)}
          onShuffle={onShuffle}
          onDuplicate={() => {}}
          onDelete={() => {}}
          onAdd={() => {}}
          gripProps={{}}
          onPointerLeave={() => {}}
          // DW-209: a wheel over the pill would otherwise stall the sample, exactly as it did on the editor
          onWheel={(dx, dy, mode) => wheelToFrame(frame.current?.contentWindow, dx, dy, mode)}
        />
      </div>
      <aside
        id="section-controls"
        aria-label="Section controls"
        className={`flex flex-col gap-3 border-t border-line bg-paper p-4 ${slimScrollbar} tablet:h-full tablet:w-[280px] tablet:shrink-0 tablet:overflow-y-auto tablet:border-l tablet:border-t-0 ${collapsed ? 'tablet:hidden' : ''}`}
      >
        <div className="flex items-center justify-between gap-2">
          {/* the ACTIVE design's name, which now changes with the ring — this page has no layer name for the
              editor's own head to print, so the design is what names the panel here */}
          <span className="text-[13px] font-semibold uppercase tracking-[0.04em] text-ink-soft">{entry.name}</span>
          <button
            ref={hide}
            type="button"
            aria-label="Collapse controls"
            title="Collapse controls"
            aria-expanded
            aria-controls="section-controls"
            onClick={() => toggle(true)}
            className={`hidden size-7 items-center justify-center rounded-[8px] text-ink-soft hover:bg-paper-sunk tablet:inline-flex ${ring}`}
          >
            <Panel size={15} className="-scale-x-100" />
          </button>
        </div>
        {/* B1a — the Design block, above the settings groups and inside none of them (FR-F3) */}
        <DesignPicker
          ring={designRing}
          at={at}
          target={entry.compileTarget[0] ?? 'home.hbs'}
          rows={designRows}
          pool={pool}
          icons={icons.current}
          mode="light"
          src="controls/frame"
          assets={canvasAssets}
          onDesign={onDesign}
          onStep={onStep}
        />
        <Sidebar
          entry={entry}
          state={state}
          onChange={onChange}
          swatches={swatches}
          timezone={timezone}
          links={links}
          assets={panelAssets}
          sourceRows={shown(state)}
        />
      </aside>
      {/* UX-DR12 — a design change is announced politely, from the one place the arrows, the strip and both
          Shuffle seats all reach (the editor's `#editor-said` has the same job) */}
      <p id="controls-said" aria-live="polite" className="sr-only">{said}</p>
      {collapsed ? (
        <div className="hidden w-11 shrink-0 flex-col items-center border-l border-line bg-paper py-[6px] tablet:flex tablet:h-full">
          <button
            ref={show}
            type="button"
            aria-label="Show controls"
            title="Show controls"
            aria-expanded={false}
            aria-controls="section-controls"
            onClick={() => toggle(false)}
            className={`inline-flex size-8 items-center justify-center rounded-[8px] text-ink-soft hover:bg-paper-sunk ${ring}`}
          >
            <Panel size={15} className="-scale-x-100" />
          </button>
        </div>
      ) : null}
    </div>
  )
}
