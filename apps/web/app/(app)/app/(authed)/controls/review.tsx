'use client'

import { useEffect, useRef, useState } from 'react'
import type { IconLookup, SectionRegistryEntry } from '@inflozo/library'
import { defaultContent, renderCanvas, stampControls, withData } from '@inflozo/section-runtime'
import type { ControlState, RuntimeDocument, RuntimeElement } from '@inflozo/section-runtime'
import { loadIcons } from '@/components/controls/icon-picker'
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
   is on the iframe as `data-render-ms` for the review harness (NFR-1's 100 ms). */

type Rows = Readonly<Record<string, { newest: readonly unknown[]; oldest: readonly unknown[] }>>

export function Review({
  entry,
  swatches,
  rows,
  links,
  pool,
  timezone,
}: {
  entry: SectionRegistryEntry
  swatches: Readonly<Record<string, string>>
  rows: Rows
  links: LinkResources
  pool: readonly { id: string; bytes: number }[]
  timezone: string
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
        return [key, (list ?? []).slice(0, binding.limit)]
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
    const ready = () => {
      const c = canvas()
      if (!c || !el) return
      paint(current.current)
      // the iframe is as tall as the section, so the page scrolls once rather than twice
      const fit = () => {
        el.style.height = `${c.mount.offsetHeight}px`
      }
      const View = c.doc.defaultView?.ResizeObserver
      if (View) new View(fit).observe(c.mount)
      fit()
    }
    void loadIcons().then((m) => {
      if (!alive) return
      icons.current = m.iconDrawing
      paint(current.current)
    })
    if (el?.contentDocument?.readyState === 'complete') ready()
    el?.addEventListener('load', ready)
    return () => {
      alive = false
      el?.removeEventListener('load', ready)
    }
    // mount only: the handlers read the latest state through `current`
  }, [])

  return (
    <div className="flex flex-col gap-6 tablet:flex-row tablet:items-start">
      <iframe
        ref={frame}
        src="controls/frame"
        title="The controls sample section"
        className="block min-h-[480px] w-full min-w-0 flex-1 rounded border border-line bg-surface"
      />
      <aside
        aria-label="Section controls"
        className="w-full shrink-0 rounded border border-line bg-paper p-4 shadow-sm tablet:sticky tablet:top-4 tablet:max-h-[calc(100dvh-2rem)] tablet:w-[300px] tablet:overflow-y-auto"
      >
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
    </div>
  )
}
