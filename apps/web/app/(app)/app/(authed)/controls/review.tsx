'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { orbitWeekly } from '@inflozo/library'
import type { IconLookup, SectionRegistryEntry } from '@inflozo/library'
import { defaultContent, renderCanvas, stampControls, withData } from '@inflozo/section-runtime'
import type { ControlState, RuntimeDocument, RuntimeElement } from '@inflozo/section-runtime'
import { loadIcons } from '@/components/controls/icon-picker'
import { ring, slimScrollbar } from '@/components/kit/greyed'
import { Panel } from '@/components/kit/icons'
import type { LinkResources } from '@/components/controls/link-picker'
import { Sidebar, type Edit } from '@/components/controls/sidebar'

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

   THE PANEL IS DOCKED, as S4c draws the editor's Controls sidebar (`S4 Editor.dc.html:337`): 280 wide, flush
   to the right edge, a hairline on its left, paper, no radius, the section's name over it (the owner's
   finding 3, 2026-09-13; it was a rounded card 48px in from the edge). It COLLAPSES to a 44px rail with one "Show
   controls" button, D8's Layers rail mirrored (`D8 Editor Below 1440.dc.html:194`) — no frame draws a
   collapse at full width, so the editor's own is Story 5.1's to settle (DW-114). Below `tablet` the panel
   stacks under the canvas and does not collapse. */

type Rows = Readonly<Record<string, { newest: readonly unknown[]; oldest: readonly unknown[] }>>

export function Review({
  entry,
  swatches,
  rows,
  links,
  pool,
  timezone,
  children,
}: {
  entry: SectionRegistryEntry
  swatches: Readonly<Record<string, string>>
  rows: Rows
  links: LinkResources
  pool: readonly { id: string; bytes: number }[]
  timezone: string
  /** the page's heading, drawn above the canvas in the scrolling column */
  children?: ReactNode
}) {
  const [state, setState] = useState<ControlState>(() => ({
    content: defaultContent(entry.contentSchema),
    controls: {},
    data: {},
    darkOverrides: { bg: 'contrast' },
  }))
  const current = useRef(state)
  const frame = useRef<HTMLIFrameElement>(null)
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

  /** Each query's rows as the canvas shows them: the stored Order picks the list, the Count slices it. */
  const shown = (s: ControlState) =>
    Object.fromEntries(
      Object.entries(withData(entry.dataBindings, s.data)).map(([key, binding]) => {
        const both = rows[key]
        const list = binding.order === 'published_at asc' ? both?.oldest : both?.newest
        // review: a query with no declared limit and no stored Count shows Ghost's default, as the panel says — not every row
        const fallback: unknown = orbitWeekly.DEFAULT_LIMIT[binding.source as keyof typeof orbitWeekly.DEFAULT_LIMIT]
        return [key, (list ?? []).slice(0, binding.limit ?? (typeof fallback === 'number' ? fallback : 100))]
      }),
    )

  const canvas = () => {
    const doc = frame.current?.contentDocument
    const mount = doc?.getElementById('canvas')
    return doc && mount ? { doc, mount } : null
  }

  /** AD-3 through the one door both emitters use: `stampControls` writes `resolveControls`' values and nothing else. */
  const stamp = (s: ControlState) => {
    const root = canvas()?.mount.firstElementChild
    if (!root) return
    stampControls(root as unknown as RuntimeElement, { controlSchema: entry.controlSchema, universals: entry.universals, controls: s.controls })
  }

  const paint = (s: ControlState) => {
    const c = canvas()
    const lookup = icons.current
    if (!c || !lookup || !frame.current) return
    const started = performance.now()
    c.mount.innerHTML = renderCanvas(c.doc as unknown as RuntimeDocument, entry.html, {
      content: s.content,
      schema: entry.contentSchema,
      controlSchema: entry.controlSchema,
      universals: entry.universals,
      controls: s.controls,
      data: s.data,
      dataBindings: entry.dataBindings,
      getRows: shown(s),
      assets: canvasAssets,
      icons: lookup,
    })
    frame.current.dataset.renderMs = (performance.now() - started).toFixed(1)
  }

  const onChange = (next: ControlState, kind: Edit) => {
    current.current = next
    if (kind === 'control') stamp(next)
    else paint(next)
    setState(next)
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

  return (
    <div className="flex flex-1 flex-col tablet:h-dvh tablet:flex-none tablet:flex-row tablet:overflow-hidden">
      <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-4 px-4 py-6 tablet:px-8">
        {children}
        <iframe
          ref={frame}
          src="controls/frame"
          title="The controls sample section"
          className="block h-[70dvh] w-full rounded border border-line bg-surface tablet:h-auto tablet:min-h-0 tablet:flex-1"
        />
      </div>
      <aside
        id="section-controls"
        aria-label="Section controls"
        className={`flex flex-col gap-3 border-t border-line bg-paper p-4 ${slimScrollbar} tablet:h-full tablet:w-[280px] tablet:shrink-0 tablet:overflow-y-auto tablet:border-l tablet:border-t-0 ${collapsed ? 'tablet:hidden' : ''}`}
      >
        <div className="flex items-center justify-between gap-2">
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
