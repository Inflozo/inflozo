'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { IconLookup, SectionRegistryEntry } from '@inflozo/library'
import type { DocInstance } from '@inflozo/section-runtime'
import { loadIcons } from '@/components/controls/icon-picker'
import { IconButton } from '@/components/kit/button'
import { ring, slimScrollbar } from '@/components/kit/greyed'
import { ChevronLeft, Panel } from '@/components/kit/icons'
import { PanelLabel } from '@/components/kit/labels'
import { LayersRow } from '@/components/kit/layers-row'
import { canvasAssets, canvasSrc, mountSections, renderSection } from '@/lib/canvas'
import { CANVASES, canvasOfPath, canvasStack, SITE } from '@/lib/editor'
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
   rest: the chrome stylesheet inside is keyed on `data-inflozo-*`, and nothing here sets one.

   EXTRAPOLATED, NOT DRAWN AT 1440 (R-74): the Layers header is D8e's (`D8 Editor Below 1440.dc.html:372-373`) with
   the mono line under the title rather than beside it, because "THIS PAGE · AUTHOR ARCHIVE" does not fit beside it
   in 240; both folds are D8's "Show layers" rail (:193-194), the Controls one mirrored, as `/controls` does (DW-114).

   ABSENT, NOT GREYED (UX-DR3), each until its story: "Saved" and Undo/Redo (5.8), the Template pill (5.5), View as
   (5.14), the sun (5.6), the device switch (5.7), Ship it (7.18), the name's rename underline (no story yet), Layers'
   grip and eye (5.4), "+ Add section" (5.10), the rail's thumbnails (5.2, 5.4), the Style Pack card (6.3) and Dark
   mode (5.6). S4a's posts-per-page note is never built (FR-Q1). */

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

export function Editor({
  project,
  docs,
  entries,
  rows,
  pool,
}: EditorData & { project: { id: string; name: string } }) {
  const pathname = usePathname()
  // the layout 404s every segment that is not a canvas, so a null here is never drawn
  const key = canvasOfPath(stripApp(pathname)) ?? 'home'
  const canvas = CANVASES[key]
  const stack = canvasStack(
    (docs[SITE.key]?.instances ?? []).map((i) => ({ ...i, target: SITE.file as string })),
    (docs[key]?.instances ?? []).map((i) => ({ ...i, target: canvas.file as string })),
  )

  const layers = useFold()
  const controls = useFold()
  const frame = useRef<HTMLIFrameElement>(null)
  const card = useRef<HTMLDivElement>(null)
  const icons = useRef<IconLookup | null>(null)
  const [size, setSize] = useState({ width: DESKTOP, height: 0 })
  // A section that will not draw is a broken doc or design, not a canvas to show around it: thrown in render, so the
  // app's error boundary shows it (the spec's "never a partly drawn canvas").
  const [failure, setFailure] = useState<Error | null>(null)
  const latest = useRef({ key, stack })
  latest.current = { key, stack }

  const paint = () => {
    const doc = frame.current?.contentDocument
    const mount = doc?.getElementById('canvas')
    const lookup = icons.current
    if (!doc || !mount || !lookup || !frame.current) return
    const now = latest.current
    try {
      const assets = canvasAssets(pool)
      mountSections(mount, now.stack.map((i: DocInstance & { target: string }) => {
        const entry: SectionRegistryEntry | undefined = entries[i.designId]
        if (!entry) throw new Error(`${i.designId} was not read for this project`)
        return renderSection(doc, entry, i, { target: i.target, rows: rows[i.designId], feed: 'first', member: 'anonymous', visibility: 'everyone', assets, icons: lookup })
      }).join(''))
      frame.current.dataset.painted = now.key
    } catch (error) {
      setFailure(error instanceof Error ? error : new Error(String(error)))
    }
  }

  // a change of canvas is a soft navigation: the iframe keeps its document and is repainted
  useEffect(() => {
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
    return () => {
      alive = false
      el?.removeEventListener('load', ready)
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
  const scale = Math.min(1, size.width / DESKTOP)

  if (failure) throw failure

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
              <LayersRow key={`${i.target}:${i.instanceId}`} name={i.layerName} interactive={false} />
            ))}
          </div>
        </aside>
        {layers.folded ? <Rail fold={layers} label="Show layers" controls="editor-layers" side="left" /> : null}

        <section aria-label="Canvas" className="flex min-w-0 flex-1 flex-col bg-canvas-ground px-7 pt-6">
          <div ref={card} className="mx-auto min-h-0 w-full max-w-[1440px] flex-1 overflow-hidden rounded-t-[6px] bg-paper-raised shadow-canvas-page">
            <iframe
              ref={frame}
              src={canvasSrc(isApp(pathname))}
              title={`${canvas.label} canvas`}
              data-width={DESKTOP}
              className="block origin-top-left border-0"
              style={{ width: DESKTOP, height: size.height / scale, transform: `scale(${scale})` }}
            />
          </div>
        </section>

        {controls.folded ? <Rail fold={controls} label="Show controls" controls="editor-controls" side="right" /> : null}
        <aside
          id="editor-controls"
          aria-label="Page settings"
          hidden={controls.folded}
          className={`flex w-[280px] shrink-0 flex-col gap-4 overflow-y-auto border-l border-line bg-paper p-4 ${slimScrollbar}`}
        >
          {/* -6px each way: the 28px toggle leaves the label where S4a draws it, 16px from the top */}
          <div className="-my-[6px] flex items-center justify-between gap-2">
            <PanelLabel>Page</PanelLabel>
            <IconButton ref={controls.hide} label="Collapse controls" title="Collapse controls" aria-expanded aria-controls="editor-controls" onClick={() => controls.toggle(true)}>
              <Panel size={15} className="-scale-x-100" />
            </IconButton>
          </div>
        </aside>
      </div>
    </div>
  )
}
