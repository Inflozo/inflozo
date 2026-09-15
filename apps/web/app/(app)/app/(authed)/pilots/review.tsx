'use client'

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { orbitWeekly } from '@inflozo/library'
import type { IconLookup, SectionRegistryEntry } from '@inflozo/library'
import { defaultContent, renderCanvas, stampControls, withData } from '@inflozo/section-runtime'
import type { ControlState, MemberState, RuntimeDocument, RuntimeElement } from '@inflozo/section-runtime'
import { loadIcons } from '@/components/controls/icon-picker'
import type { LinkResources } from '@/components/controls/link-picker'
import { Sidebar, type Edit } from '@/components/controls/sidebar'
import { slimScrollbar } from '@/components/kit/greyed'
import { Segmented } from '@/components/kit/segmented'

/* THE PILOTS WORKSPACE — `/controls`' review (Story 4.5), fed the five pilot sections (Story 4.10).

   The same page shape as `controls/review.tsx`, and read that file for the why of each part: a workspace the height
   of the window, the canvas a same-origin iframe with no script that this file writes into, a CONTROL change stamped
   onto the root inside its own handler, any other change re-rendered with `renderCanvas` and timed onto the iframe as
   `data-render-ms`, and the docked panel on the right.

   What is new is THE SWITCHER, in the canvas chrome and never in the panel (`P0-6 Editor State Switcher.dc.html:24-44`;
   the member state is `S4 Editor.dc.html:370`, S4d): the pilot; Light · Dark, as `data-mode` on the canvas `<html>`;
   Desktop 1440 · Tablet 834 · Phone 390, the iframe AT that width — so the design's own media queries read it — and
   scaled down to fit the pane; View as Signed out · Free · Paid, the `member` a render is handed; Page, on a design
   that paginates; and Show to on the two whose frames draw it. Orbit Weekly feeds every render through
   `templateContext`, the same context `tools/check-snapshots.mjs` renders against. Every module mount gets
   `js-enabled` and no script — the state `core` leaves it in on a live page (Story 4.7). Nothing is saved. */

type Rows = Readonly<Record<string, Readonly<Record<string, readonly unknown[]>>>>
type Mode = 'light' | 'dark'
type Feed = orbitWeekly.FeedState
type Visitor = Exclude<MemberState, 'everyone'>

const WIDTHS = [
  { value: '1440', label: 'Desktop' },
  { value: '834', label: 'Tablet' },
  { value: '390', label: 'Phone' },
]
const VISITORS = [
  { value: 'anonymous', label: 'Signed out' },
  { value: 'free', label: 'Free' },
  { value: 'paid', label: 'Paid' },
]
const FEEDS = [
  { value: 'first', label: 'First' },
  { value: 'middle', label: 'Middle' },
  { value: 'last', label: 'Last' },
  { value: 'empty', label: 'Empty' },
]
const SHOW_TO = [
  { value: 'everyone', label: 'Everyone' },
  { value: 'anonymous', label: 'Signed out' },
  { value: 'free', label: 'Free members' },
  { value: 'paid', label: 'Paid members' },
]
/** The pilots whose frames draw a Show to state (A22-1's states, A4-13's panel). Layers' control itself is Story 5.4's. */
const DRAWS_SHOW_TO: readonly string[] = ['a22/1', 'a4/13']

/** Orbit Weekly's pictures, pointed at the frame route beside the page — relative, so the canvas document resolves
 *  it against its own address (/app/pilots/frame). The one place the reserved origin is mapped on this page. */
const withImages = (html: string) =>
  html.replace(new RegExp(`${orbitWeekly.ORBIT_WEEKLY_ORIGIN.replace(/[.]/g, '\\.')}/images/([a-z0-9-]+)\\.svg`, 'g'), 'frame?image=$1')

export function Review({
  entries,
  rows,
  swatches,
  links,
  pool,
  timezone,
  children,
}: {
  entries: SectionRegistryEntry[]
  rows: Rows
  swatches: Readonly<Record<string, string>>
  links: LinkResources
  pool: readonly { id: string; bytes: number }[]
  timezone: string
  children?: ReactNode
}) {
  const [id, setId] = useState(entries[0]?.id ?? '')
  const entry = entries.find((e) => e.id === id) ?? entries[0]
  const [states, setStates] = useState<Record<string, ControlState>>(() =>
    Object.fromEntries(entries.map((e) => [e.id, { content: defaultContent(e.contentSchema), controls: {}, data: {}, darkOverrides: {} }])),
  )
  const [mode, setMode] = useState<Mode>('light')
  const [width, setWidth] = useState(1440)
  const [member, setMember] = useState<Visitor>('anonymous')
  const [feed, setFeed] = useState<Feed>('first')
  const [visibility, setVisibility] = useState<MemberState>('everyone')
  const [height, setHeight] = useState(600)
  const [pane, setPane] = useState(1000)
  const frame = useRef<HTMLIFrameElement>(null)
  const box = useRef<HTMLDivElement>(null)
  const icons = useRef<IconLookup | null>(null)
  // the handlers read the latest values through here, as controls/review.tsx does
  const latest = useRef({ id, states, mode, member, feed, visibility })
  latest.current = { id, states, mode, member, feed, visibility }

  const paginates = entry !== undefined && /\bdata-pagination=/.test(entry.html)
  const showsTo = entry !== undefined && DRAWS_SHOW_TO.includes(entry.id)

  const canvas = () => {
    const doc = frame.current?.contentDocument
    const mount = doc?.getElementById('canvas')
    return doc && mount ? { doc, mount } : null
  }

  /** Each query's rows as the canvas shows them: the fixed or stored limit slices Orbit Weekly's newest-first rows. */
  const shown = (e: SectionRegistryEntry, s: ControlState) =>
    Object.fromEntries(Object.entries(withData(e.dataBindings, s.data)).map(([key, binding]) => [key, (rows[e.id]?.[key] ?? []).slice(0, binding.limit ?? 100)]))

  const paint = () => {
    const c = canvas()
    const lookup = icons.current
    const now = latest.current
    const e = entries.find((x) => x.id === now.id)
    if (!c || !lookup || !frame.current || !e) return
    const s = now.states[e.id] ?? {}
    const target = e.compileTarget[0] as string
    const ctx = orbitWeekly.templateContext(target, now.feed)
    c.doc.documentElement.setAttribute('data-mode', now.mode)
    const started = performance.now()
    try {
      c.mount.innerHTML = withImages(renderCanvas(c.doc as unknown as RuntimeDocument, e.html, {
        target,
        content: s.content,
        schema: e.contentSchema,
        controlSchema: e.controlSchema,
        universals: e.universals,
        controls: s.controls,
        data: s.data,
        dataBindings: e.dataBindings,
        getRows: shown(e, s),
        ghost: ctx.ghost,
        site: ctx.site,
        member: now.member,
        visibility: DRAWS_SHOW_TO.includes(e.id) ? now.visibility : 'everyone',
        icons: lookup,
      }))
    } catch (error) {
      // loudly: a pilot that will not render is a broken story, and the sentence is the finding
      c.mount.textContent = `${e.id} could not be drawn: ${(error as Error).message}`
    }
    // the state core leaves a mount in on the live page (Story 4.7) — the class, and no script
    for (const el of c.mount.querySelectorAll('[data-module]')) el.classList.add('js-enabled')
    frame.current.dataset.renderMs = (performance.now() - started).toFixed(1)
    frame.current.dataset.pilot = e.id
    measure()
  }

  const measure = () => {
    const c = canvas()
    // the SECTION's height, not the document's: a document is never shorter than its iframe, so it could only grow
    if (c) setHeight(Math.max(240, Math.ceil(c.mount.getBoundingClientRect().height)))
  }

  const onChange = (next: ControlState, kind: Edit) => {
    const all = { ...latest.current.states, [id]: next }
    latest.current = { ...latest.current, states: all }
    setStates(all)
    if (kind === 'control' && entry) {
      const root = canvas()?.mount.firstElementChild
      if (root) stampControls(root as unknown as RuntimeElement, { controlSchema: entry.controlSchema, universals: entry.universals, controls: next.controls })
      measure()
    } else paint()
  }

  // every chrome switch re-renders; the iframe keeps its document
  useEffect(() => {
    paint()
    // paint reads the latest values through `latest`
  }, [id, mode, member, feed, visibility])

  // the iframe is laid out at the chosen width, so its height follows the section's at that width
  useLayoutEffect(() => {
    requestAnimationFrame(measure)
  }, [width])

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
      () => {
        const c = canvas()
        if (alive && c) c.mount.textContent = 'The icons could not be loaded, so the section cannot be drawn. Reload the page to try again.'
      },
    )
    if (el?.contentDocument?.readyState === 'complete') ready()
    el?.addEventListener('load', ready)
    const watch = new ResizeObserver(([row]) => setPane(row?.contentRect.width ?? 1000))
    if (box.current) watch.observe(box.current)
    return () => {
      alive = false
      el?.removeEventListener('load', ready)
      watch.disconnect()
    }
    // mount only
  }, [])

  const scale = Math.min(1, pane / width)
  const panelAssets = pool.map((a) => ({ id: a.id, src: `controls/frame?image=${a.id}`, meta: `${Math.max(1, Math.round(a.bytes / 1024))} KB · SVG` }))
  const state = entry ? (states[entry.id] ?? {}) : {}

  return (
    <div className="flex flex-1 flex-col tablet:h-dvh tablet:flex-none tablet:flex-row tablet:overflow-hidden">
      <div className={`flex min-h-0 min-w-0 flex-1 flex-col gap-4 px-4 py-6 tablet:overflow-y-auto tablet:px-8 ${slimScrollbar}`}>
        {children}
        <div role="toolbar" aria-label="Canvas state" className="flex flex-wrap items-end gap-x-5 gap-y-3 rounded border border-line bg-paper p-3">
          <div className="min-w-[320px] flex-[2]">
            <Segmented id="pilot" label="Pilot" options={entries.map((e) => ({ value: e.id, label: e.name }))} active={id} onChange={setId} />
          </div>
          <div className="min-w-[140px]">
            <Segmented id="mode" label="Mode" options={[{ value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' }]} active={mode} onChange={(v) => setMode(v as Mode)} />
          </div>
          <div className="min-w-[220px]">
            <Segmented id="width" label="Width" options={WIDTHS} active={String(width)} onChange={(v) => setWidth(Number(v))} />
          </div>
          <div className="min-w-[220px]">
            <Segmented id="member" label="View as" options={VISITORS} active={member} onChange={(v) => setMember(v as Visitor)} />
          </div>
          {paginates ? (
            <div className="min-w-[240px]">
              <Segmented id="feed" label="Page" options={FEEDS} active={feed} onChange={(v) => setFeed(v as Feed)} />
            </div>
          ) : null}
          {showsTo ? (
            <div className="min-w-[320px]">
              <Segmented id="show-to" label="Show to" options={SHOW_TO} active={visibility} onChange={(v) => setVisibility(v as MemberState)} />
            </div>
          ) : null}
        </div>
        <div ref={box} className="w-full" style={{ height: height * scale }}>
          <iframe
            ref={frame}
            src="pilots/frame"
            title={`${entry?.name ?? 'The pilot'} at ${width} pixels wide`}
            data-width={width}
            data-mode={mode}
            className="block origin-top-left rounded border border-line bg-surface"
            style={{ width, height, transform: `scale(${scale})` }}
          />
        </div>
      </div>
      <aside
        id="section-controls"
        aria-label="Section controls"
        className={`flex flex-col gap-3 border-t border-line bg-paper p-4 ${slimScrollbar} tablet:h-full tablet:w-[280px] tablet:shrink-0 tablet:overflow-y-auto tablet:border-l tablet:border-t-0`}
      >
        <span className="text-[13px] font-semibold uppercase tracking-[0.04em] text-ink-soft">{entry?.name}</span>
        {entry ? (
          <Sidebar
            key={entry.id}
            entry={entry}
            state={state}
            onChange={onChange}
            swatches={swatches}
            timezone={timezone}
            links={links}
            assets={panelAssets}
            sourceRows={shown(entry, state)}
          />
        ) : null}
      </aside>
    </div>
  )
}
