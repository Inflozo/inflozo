'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useId, useOptimistic, useRef, useState, useTransition, type ReactNode } from 'react'
import {
  DATE_UNITS, filterNql, filterProblem, holderOf, isChannel, isDefaultRouting, PATH_RE, pathsUsing, RESERVED_SEGMENTS, templateName, validateRoutes, VISIBILITIES,
  withoutTemplate,
  type Channel, type Collection, type Cond, type DateOp, type DateUnit, type Filter, type Route, type RouteProblem, type RoutesConfig,
  type Visibility,
} from '@inflozo/section-runtime/routes'
import { Banner } from '@/components/kit/banner'
import { Button } from '@/components/kit/button'
import { ConditionRow } from '@/components/kit/condition-row'
import { closeOnBackdrop, openOnCancel, routeSheet, sheet, title as confirmTitle, wideTitle } from '@/components/kit/dialog'
import { ring } from '@/components/kit/greyed'
import { DragGrip } from '@/components/kit/grip'
import { Check, ChevronDown, ChevronLeft, Copy, InfoCircle, X } from '@/components/kit/icons'
import { TextInput } from '@/components/kit/input'
import { HelperCaption } from '@/components/kit/labels'
import { RadioCard } from '@/components/kit/radio-card'
import { choices, radioKeys } from '@/components/kit/segmented'
import { Menu, openPopover, Select, SelectThumb } from '@/components/kit/select'
import { StepperBox } from '@/components/kit/stepper'
import { Submit } from '@/components/kit/submit'
import { Toast } from '@/components/kit/toast'
import { Toggle } from '@/components/kit/toggle'
import { canvasPath, routeCanvasOf, settingsPath, type RouteCanvas } from '@/lib/editor'
import { isApp } from '@/routing'
import { addressOf, LISTS } from '@/lib/live-content'
import { arrowKeys, openMenu } from '@/lib/menu'
import { captureLayout, landingAt, shift, slotTop, type Drag, type Layout } from '@/lib/reorder'
import {
  cardName, EXACT_OPS, EXACT_WORDS, FIELDS, filterWords, freshCondition, localToday, PAGE_SIZE, ROUTES_WORDS as W, UNIT_WORDS, VISIBILITY_WORDS, type Template,
} from '@/lib/routes'
import { createTemplate, deleteTemplate, restoreTemplate, saveRoutes, type RoutesResult } from './actions'

/* S9 · THE ROUTES MANAGER (`S9 Routes.dc.html`), as `EXPERIENCE.md:177-179, :353, :747` re-specify it. Every token is the
   Kit's (never the frame's inline hex), every sentence `ROUTES_WORDS` (R-170).

   S9a — the 56px bar (back to the editor, "Routes & Templates", the site chip), then two panes: on the left Collections
   (cards as drawn, each with R-247's drag handle — pointer, ⌥↑/⌥↓, the screen-reader hint, `lib/reorder.ts`'s ONE drag),
   Custom routes, R-247's Templates list (Custom routes' rows) and Taxonomies (editable, R-247); on the right the pane: the
   banner, the file's header with Copy and Download, and the numbered lines. ONE behaviour differs from the drawing: its
   YAML lists `/` first and this lists it last, with the inverse filter (the runtime's facts, standing rule 1).
   S9b — any `validateRoutes` problem: the red banner names each line and its reason, the pane's pill counts them and each
   line is marked. Its "Deploys are blocked…" line waits for Story 7.18's Ship button (routine call 11).
   S9c / S9e — the sheets (`dialog.ts`'s `routeSheet`, S9c's 480), sharing one path block, one condition block, one
   template-and-page-size block and one naming block (R-247: the Path box with its two grey lines under it).
   S9d — Ghost's default routing and no template: the signpost, its two lines, "+ New collection", and R-247's quiet links.

   NO PAGE SAVE (routine call 9): each sheet's primary button, each drop and each taxonomy save writes through a server
   action at once, so the pane is always the saved state. A drop and a delete show at once (`useOptimistic`) and stand only
   if the write does. Each delete comes back with Undo, in the Kit's toast, until the next change (routine call 16). */

type Props = {
  projectId: string
  projectName: string
  /** the linked site's name for the bar's chip, or null — the chip then names the project */
  siteName: string | null
  /** the linked site's Content API where it is readable — the sheets suggest its tags and writers */
  content: { origin: string; key: string } | null
  postsPerPage: number
  /** the stored config, parsed; null when it does not parse (S9b's line 1) */
  config: RoutesConfig | null
  yaml: string | null
  problems: readonly RouteProblem[]
  templates: readonly Template[]
  deployed: readonly string[]
  designed: readonly string[]
  /** Story 7.16b — opened from the Template menu's "New template" (`?new=template`): the sheet is up on arrival */
  fromMenu?: boolean
}

/** `entry` — Story 7.16b: the New template sheet the Template menu opened, whose Create opens the new canvas */
type Sheet = { kind: 'collection'; at: number | null } | { kind: 'route'; at: number | null } | { kind: 'template'; entry?: true }
type Undo = { words: string; run: () => Promise<RoutesResult> }

const NEW = '\u0000new'
const SECTION = 'text-ui-dense font-semibold uppercase tracking-[0.04em] text-ink-soft'
const DASHED = `h-8 self-start rounded-sm border border-dashed border-line-strong px-[14px] text-control-label font-medium text-ink-soft transition-colors hover:border-coral hover:text-coral-deep ${ring}`
const PILL = 'rounded-pill border border-line bg-paper px-[9px] py-[2px] text-control-label text-ink-soft'
const MORE = `inline-flex h-6 shrink-0 items-center justify-center rounded-[6px] px-1 font-semibold tracking-[2px] text-ink-soft transition-colors hover:text-ink ${ring}`

const formOf = (fields: Record<string, string>) => {
  const fd = new FormData()
  for (const [k, v] of Object.entries(fields)) fd.set(k, v)
  return fd
}

/** The site's tag and writer slugs, for the sheets' suggestions — two reads of its Content API, once, where readable. */
function useSuggestions(content: Props['content']) {
  const [found, setFound] = useState<{ tag: string[]; author: string[] }>({ tag: [], author: [] })
  // the two strings, not the object: `page.tsx` builds a fresh one on every render, and every write revalidates the page
  const origin = content?.origin ?? null
  const key = content?.key ?? null
  useEffect(() => {
    if (origin === null || key === null) return
    const stop = new AbortController()
    const slugs = async (kind: 'tag' | 'author', plural: 'tags' | 'authors') => {
      try {
        const answer = await fetch(addressOf(origin, LISTS[kind], key), { signal: stop.signal })
        const rows = answer.ok ? ((await answer.json()) as Record<string, { slug?: unknown }[]>)[plural] ?? [] : []
        return rows.map((r) => r.slug).filter((s): s is string => typeof s === 'string')
      } catch {
        return []
      }
    }
    void Promise.all([slugs('tag', 'tags'), slugs('author', 'authors')]).then(([tag, author]) => {
      if (!stop.signal.aborted) setFound({ tag, author })
    })
    return () => stop.abort()
  }, [origin, key])
  return found
}

export function RoutesManager(props: Props) {
  const { projectId, projectName, siteName, postsPerPage, problems, deployed, designed } = props
  const [shown, setShown] = useOptimistic(props.config)
  const [templates, setGone] = useOptimistic(props.templates, (list: readonly Template[], id: string) => list.filter((t) => t.id !== id))
  const [, start] = useTransition()
  const [undoing, startUndo] = useTransition()
  const [undo, setUndo] = useState<Undo | null>(null)
  const [failed, setFailed] = useState<string | null>(null)
  const [open, setOpen] = useState<Sheet | null>(props.fromMenu === true ? { kind: 'template', entry: true } : null)
  const [confirm, setConfirm] = useState<Template | null>(null)
  const suggestions = useSuggestions(props.content)
  const known = templates.map((t) => t.file)

  /** The whole next config, written. A delete passes its Undo; any other change clears the last one (routine call 16). */
  const save = (next: RoutesConfig, then?: Undo) =>
    start(async () => {
      const was = undo
      setShown(next)
      setUndo(null)
      const result = await saveRoutes(null, formOf({ project: projectId, config: JSON.stringify(next) }))
      if ('error' in result) {
        setFailed(result.error)
        // a refused change is not a change: the last delete's Undo stands (routine call 16)
        setUndo(was)
      } else {
        setFailed(null)
        if (then) setUndo(then)
      }
    })
  const undoNow = () => {
    if (undo === null) return
    startUndo(async () => {
      const result = await undo.run()
      if ('error' in result) setFailed(result.error)
      else {
        setFailed(null)
        setUndo(null)
      }
    })
  }

  const config = shown
  const removeAt = (which: 'collections' | 'routes', n: number) => {
    if (config === null) return
    const item = config[which][n]
    if (item === undefined) return
    const next = { ...config, [which]: config[which].filter((_, i) => i !== n) }
    save(next, { words: W.deleted(item.path), run: () => saveRoutes(null, formOf({ project: projectId, config: JSON.stringify(config) })) })
  }
  /** A template's delete — the row leaves the list at once and stands gone only if the write does (its routes and, since
   *  Story 7.16b, its canvas's design leave with it, server side: config, then doc, then row). Awaited, so the confirm's
   *  Delete can say "Deleting…" until it is done (R-98). */
  const dropTemplate = async (t: Template) => {
    if (config === null) return
    const previous = config
    const routed = pathsUsing(config, t.file).length > 0
    setGone(t.id)
    setShown(withoutTemplate(config, t.file))
    setUndo(null)
    const result = await deleteTemplate(null, formOf({ project: projectId, template: t.id }))
    if ('error' in result) setFailed(result.error)
    else {
      setFailed(null)
      setUndo({
        words: W.deleted(t.name),
        // the config only when the delete took routes with it — one that took none wrote none, so its Undo writes none —
        // and the doc only when it took one (Story 7.16b): row, then doc, then config, server side
        run: () => restoreTemplate(null, formOf({
          project: projectId,
          template: JSON.stringify(t),
          ...(result.doc === undefined ? {} : { doc: JSON.stringify(result.doc) }),
          ...(routed ? { config: JSON.stringify(previous) } : {}),
        })),
      })
    }
  }

  const empty = config !== null && isDefaultRouting(config) && templates.length === 0 && problems.length === 0
  const chip = siteName ?? projectName

  return (
    <div className="flex h-dvh flex-col bg-paper">
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-line px-5">
        <Link
          href={canvasPath(projectId)}
          aria-label={W.back(projectName)}
          title={W.back(projectName)}
          className={`inline-flex size-7 items-center justify-center rounded-sm text-ink-soft transition-colors hover:bg-ink-wash ${ring}`}
        >
          <ChevronLeft size={15} />
        </Link>
        <h1 className="font-display text-[17px] font-bold tracking-[-0.01em] text-ink">{W.title}</h1>
        <span className="inline-flex min-w-0 items-center gap-[7px] rounded-pill border border-line bg-surface px-[11px] py-1 text-control-label font-medium">
          <span aria-hidden className="inline-flex size-[14px] shrink-0 items-center justify-center rounded-[4px] bg-ink-deep text-[8px] font-semibold text-ink-deep-text">
            {chip.trim().charAt(0).toUpperCase()}
          </span>
          <span className="truncate">{chip}</span>
        </span>
      </header>

      {empty ? (
        <>
          {/* a refused Undo can land here, after the last item went (review, 2026-10-17) */}
          {failed !== null ? <div data-failed className="px-6 pt-6"><Banner kind="error">{failed}</Banner></div> : null}
          <EmptyState onCollection={() => setOpen({ kind: 'collection', at: null })} onRoute={() => setOpen({ kind: 'route', at: null })} onTemplate={() => setOpen({ kind: 'template' })} />
        </>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto tablet:flex-row tablet:overflow-hidden">
          <div className="flex flex-[1.1] flex-col gap-[18px] border-line p-[22px_24px] tablet:overflow-y-auto tablet:border-r">
            {/* a write the server refused, in its own sentence — the walk's `data-failed` */}
            {failed !== null ? <div data-failed><Banner kind="error">{failed}</Banner></div> : null}
            {config === null ? null : (
              <>
                <Collections
                  config={config}
                  templates={templates}
                  onMove={(from, to) => {
                    const list = [...config.collections]
                    const [moved] = list.splice(from, 1)
                    if (moved === undefined) return
                    list.splice(to, 0, moved)
                    save({ ...config, collections: list })
                  }}
                  onEdit={(at) => setOpen({ kind: 'collection', at })}
                  onDelete={(at) => removeAt('collections', at)}
                  onNew={() => setOpen({ kind: 'collection', at: null })}
                />
                <CustomRoutes config={config} templates={templates} onEdit={(at) => setOpen({ kind: 'route', at })} onDelete={(at) => removeAt('routes', at)} onNew={() => setOpen({ kind: 'route', at: null })} />
                <Templates
                  config={config}
                  templates={templates}
                  onNew={() => setOpen({ kind: 'template' })}
                  onDelete={(t) => (pathsUsing(config, t.file).length > 0 || designed.includes(t.file) ? setConfirm(t) : start(() => dropTemplate(t)))}
                />
                <Taxonomies key={`${config.taxonomies.tag}/${config.taxonomies.author}`} projectId={projectId} config={config} known={known} onSaved={() => { setUndo(null); setFailed(null) }} />
              </>
            )}
          </div>
          <YamlPane yaml={props.yaml} problems={problems} unreadable={config === null} />
        </div>
      )}

      {open !== null && config !== null ? (
        <SheetDialog
          key={JSON.stringify(open)}
          open={open}
          projectId={projectId}
          config={config}
          templates={templates}
          deployed={deployed}
          postsPerPage={postsPerPage}
          suggestions={suggestions}
          onClose={() => {
            setOpen(null)
            // Story 7.16b's review — the Template menu's `?new=template` is spent once its sheet closes, so a reload or Back
            // never opens it again; `replaceState`, as `email-card.tsx` drops its key: nothing navigates
            if (props.fromMenu === true && new URL(window.location.href).searchParams.has('new')) window.history.replaceState(null, '', window.location.pathname)
          }}
          onSaved={() => {
            setOpen(null)
            setUndo(null)
            setFailed(null)
          }}
        />
      ) : null}
      {confirm !== null && config !== null ? (
        <DeleteTemplate
          template={confirm}
          paths={pathsUsing(config, confirm.file)}
          designed={designed.includes(confirm.file)}
          onCancel={() => setConfirm(null)}
          onDelete={() => dropTemplate(confirm)}
        />
      ) : null}
      {undo !== null ? (
        <div className="pointer-events-none fixed inset-x-0 bottom-6 flex justify-center px-4">
          <div className="pointer-events-auto">
            <Toast action={W.undo} onAction={undoNow} pending={undoing} busy={W.restoring}>{undo.words}</Toast>
          </div>
        </div>
      ) : null}
    </div>
  )
}

/* ───────────────────────────── S9d ───────────────────────────── */

function EmptyState({ onCollection, onRoute, onTemplate }: { onCollection: () => void; onRoute: () => void; onTemplate: () => void }) {
  const quiet = `rounded-sm font-medium text-ink-soft underline-offset-2 hover:text-ink hover:underline ${ring}`
  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <div className="flex flex-col items-center gap-[18px] text-center">
        {/* S9d's signpost (`S9 Routes.dc.html:286-292`), its strokes and fills in the Kit's tokens */}
        <svg aria-hidden width="120" height="84" viewBox="0 0 120 84" fill="none">
          <line x1="60" y1="14" x2="60" y2="72" className="stroke-ink" strokeWidth="1.5" />
          <rect x="20" y="18" width="44" height="14" rx="3" className="fill-surface stroke-ink" strokeWidth="1.5" />
          <rect x="56" y="40" width="44" height="14" rx="3" className="fill-surface stroke-ink" strokeWidth="1.5" />
          <path d="M98 14l1.8 4.8 4.8 1.8-4.8 1.8-1.8 4.8-1.8-4.8-4.8-1.8 4.8-1.8z" className="fill-coral" />
          <ellipse cx="60" cy="76" rx="16" ry="3" className="fill-line" />
        </svg>
        <div className="flex flex-col gap-[6px]">
          <h2 className="font-display text-[24px] font-bold tracking-[-0.01em] text-ink">{W.emptyTitle}</h2>
          <p className="text-ui text-ink-soft">{W.emptyLead}</p>
        </div>
        {/* S9d's button (`:297`): white on the hairline, 38 high at radius 12, 13/500 */}
        <button type="button" onClick={onCollection} className={`h-[38px] rounded border border-line bg-surface px-[18px] text-ui-dense font-medium text-ink transition-colors hover:bg-paper ${ring}`}>{W.newCollection}</button>
        {/* R-247's two quiet links, under the drawn button */}
        <p className="text-control-label text-ink-soft">
          {W.orAdd}{' '}
          <button type="button" className={quiet} onClick={onRoute}>{W.aRoute}</button>
          {' · '}
          <button type="button" className={quiet} onClick={onTemplate}>{W.aTemplate}</button>
        </p>
      </div>
    </div>
  )
}

/* ───────────────────────────── S9a's lists ───────────────────────────── */

const templateNameOf = (templates: readonly Template[], file: string) => templates.find((t) => t.file === file)?.name ?? file

/** A row's ⋯: its own popover with the Kit's `Menu` — Edit and Delete (R-247). */
function RowMenu({ id, what, items }: { id: string; what: string; items: { label: string; danger?: boolean; onSelect: () => void }[] }) {
  return (
    <>
      <button
        type="button"
        aria-label={W.more(what)}
        popoverTarget={id}
        onClick={(event) => {
          const el = document.getElementById(id)
          if (el) openMenu(el, event.currentTarget, { side: 'down', align: 'right' })
        }}
        className={MORE}
      >
        ⋯
      </button>
      <div id={id} popover="auto" onKeyDown={arrowKeys} className="border-0 bg-transparent p-0">
        <Menu label={what} width="w-[160px]" items={items} />
      </div>
    </>
  )
}

function Collections({ config, templates, onMove, onEdit, onDelete, onNew }: {
  config: RoutesConfig
  templates: readonly Template[]
  onMove: (from: number, to: number) => void
  onEdit: (at: number) => void
  onDelete: (at: number) => void
  onNew: () => void
}) {
  const [drag, setDrag] = useState<Drag | null>(null)
  const layout = useRef<Layout>({ tops: [], heights: [], gap: 0 })
  const start = useRef(0)
  const rows = useRef<HTMLUListElement>(null)
  /** the moved row, by path and where it lands — focus follows it once the list has re-drawn in its new order */
  const [focusAt, setFocusAt] = useState<{ path: string; to: number } | null>(null)
  const [said, setSaid] = useState('')
  const items = config.collections
  useEffect(() => {
    if (focusAt === null) return
    const row = rows.current?.querySelectorAll<HTMLElement>('[data-row]')[focusAt.to]
    if (row?.dataset.collection !== focusAt.path) return
    row.querySelector<HTMLElement>('[data-handle]')?.focus()
    setFocusAt(null)
  }, [focusAt, items])
  const move = (from: number, to: number) => {
    const path = items[from]?.path ?? ''
    setSaid(W.moved(path, to + 1, items.length))
    onMove(from, to)
  }
  return (
    <section aria-labelledby="routes-collections" className="flex flex-col gap-[10px]">
      <h2 id="routes-collections" className={SECTION}>{W.collections}</h2>
      <p className="-mt-1 text-control-label leading-[1.5] text-ink-soft">{W.collectionsHelp}</p>
      <ul ref={rows} aria-labelledby="routes-collections" className="relative flex list-none flex-col gap-[10px]">
        {drag !== null ? (
          <li
            aria-hidden
            data-drop-slot
            style={{ top: slotTop(drag, layout.current), height: layout.current.heights[drag.from] ?? 0 }}
            className="pointer-events-none absolute inset-x-0 rounded border border-dashed border-line-strong bg-paper-sunk"
          />
        ) : null}
        {items.map((col, i) => {
          const lifted = drag?.from === i
          const nql = filterNql(col.filter)
          return (
            <li
              key={col.path}
              data-row={i}
              data-collection={col.path}
              style={lifted ? { translate: `0 ${drag.dy}px` } : drag !== null ? { translate: `0 ${shift(drag, i, layout.current)}px` } : undefined}
              className={`relative flex items-center gap-3 rounded border border-line bg-surface p-[14px_16px] shadow-sm transition-shadow hover:shadow-md ${lifted ? 'z-10 shadow-lg motion-safe:rotate-1' : drag !== null ? 'motion-safe:transition-[translate] motion-safe:duration-150' : ''}`}
            >
              <button
                type="button"
                data-handle={i}
                aria-label={W.move(col.path)}
                aria-describedby="routes-move-how"
                onKeyDown={(event) => {
                  if (!event.altKey || (event.key !== 'ArrowUp' && event.key !== 'ArrowDown')) return
                  event.preventDefault()
                  const to = i + (event.key === 'ArrowUp' ? -1 : 1)
                  if (to < 0 || to >= items.length) return
                  move(i, to)
                  setFocusAt({ path: col.path, to })
                }}
                onPointerDown={(event) => {
                  if (event.button !== 0 || drag !== null) return
                  event.currentTarget.setPointerCapture(event.pointerId)
                  start.current = event.clientY
                  layout.current = captureLayout([...(rows.current?.querySelectorAll<HTMLElement>('[data-row]') ?? [])])
                  setDrag({ from: i, to: i, dy: 0 })
                }}
                onPointerMove={(event) => {
                  if (drag === null || drag.from !== i) return
                  setDrag({ from: i, to: landingAt(layout.current, i, event.clientY, start.current), dy: event.clientY - start.current })
                }}
                onPointerUp={() => {
                  if (drag === null) return
                  const { from, to } = drag
                  setDrag(null)
                  if (to !== from) move(from, to)
                }}
                onPointerCancel={() => setDrag(null)}
                className={`-ml-1 flex h-[22px] w-4 shrink-0 cursor-grab touch-none items-center justify-center rounded-[4px] ${ring}`}
              >
                <DragGrip />
              </button>
              <span className="shrink-0 rounded-sm border border-line bg-paper px-[10px] py-1 font-mono text-ui-dense font-medium text-ink">{col.path}</span>
              <span className="flex min-w-0 flex-1 flex-col gap-[3px]">
                <span className="truncate text-ui-dense font-semibold text-ink">{cardName(col.path)}</span>
                <span className="truncate text-control-label text-ink-soft">{filterWords(col.filter)}</span>
              </span>
              {nql === '' ? null : <span className="max-w-[30%] shrink truncate rounded-pill border border-line px-[9px] py-[2px] font-mono text-[11px] text-ink-soft">{nql}</span>}
              {/* a long name (60 characters, or a stored file S9b names) truncates rather than crushing the card's own name */}
              <span className={`min-w-0 max-w-[30%] shrink truncate ${PILL}`}>{templateNameOf(templates, col.template)}</span>
              {col.limit === undefined ? null : <span className="shrink-0 text-control-label text-ink-soft">{W.perPage(col.limit)}</span>}
              <RowMenu
                id={`routes-collection-menu-${i}`}
                what={col.path}
                items={[{ label: W.edit, onSelect: () => onEdit(i) }, { label: W.delete, danger: true, onSelect: () => onDelete(i) }]}
              />
            </li>
          )
        })}
      </ul>
      <p id="routes-move-how" className="sr-only">{W.moveHow}</p>
      <p aria-live="polite" className="sr-only">{said}</p>
      <button type="button" className={DASHED} onClick={onNew}>{W.newCollection}</button>
    </section>
  )
}

/** The arrow S9a draws between a route's path and what it shows (`:78`), in the Kit's `line-strong`. */
const RouteArrow = () => (
  <svg aria-hidden width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="shrink-0 text-line-strong">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
)

function CustomRoutes({ config, templates, onEdit, onDelete, onNew }: {
  config: RoutesConfig
  templates: readonly Template[]
  onEdit: (at: number) => void
  onDelete: (at: number) => void
  onNew: () => void
}) {
  return (
    <section aria-labelledby="routes-custom" className="flex flex-col gap-[10px]">
      <h2 id="routes-custom" className={SECTION}>{W.customRoutes}</h2>
      {config.routes.length === 0 ? null : (
        <ul className="flex list-none flex-col overflow-hidden rounded border border-line bg-surface">
          {config.routes.map((r, i) => (
            <li key={r.path} data-route={r.path} className="flex items-center gap-3 border-line p-[12px_16px] [&:not(:last-child)]:border-b">
              <span className="font-mono text-control-label font-medium text-ink">{r.path}</span>
              <RouteArrow />
              {isChannel(r) && filterNql(r.channel) !== '' ? <span className="truncate rounded-pill border border-line px-[9px] py-[2px] font-mono text-[11px] text-ink-soft">{filterNql(r.channel)}</span> : null}
              <span className={PILL}>{templateNameOf(templates, r.template)}</span>
              {isChannel(r) && r.limit !== undefined ? <span className="text-control-label text-ink-soft">{W.perPage(r.limit)}</span> : null}
              <span className="ml-auto">
                <RowMenu id={`routes-route-menu-${i}`} what={r.path} items={[{ label: W.edit, onSelect: () => onEdit(i) }, { label: W.delete, danger: true, onSelect: () => onDelete(i) }]} />
              </span>
            </li>
          ))}
        </ul>
      )}
      <button type="button" className={DASHED} onClick={onNew}>{W.customRoute}</button>
    </section>
  )
}

/** R-247's Templates list — Custom routes' rows: the name over its file, what uses it, its ⋯ (Delete; there is no rename). */
function Templates({ config, templates, onNew, onDelete }: { config: RoutesConfig; templates: readonly Template[]; onNew: () => void; onDelete: (t: Template) => void }) {
  return (
    <section aria-labelledby="routes-templates" className="flex flex-col gap-[10px]">
      <h2 id="routes-templates" className={SECTION}>{W.templates}</h2>
      {templates.length === 0 ? null : (
        <ul className="flex list-none flex-col overflow-hidden rounded border border-line bg-surface">
          {templates.map((t, i) => {
            const used = pathsUsing(config, t.file)
            return (
              <li key={t.id} data-template={t.file} className="flex items-center gap-3 border-line p-[12px_16px] [&:not(:last-child)]:border-b">
                <span className="flex min-w-0 flex-col gap-px">
                  <span className="truncate text-control-label font-semibold text-ink">{t.name}</span>
                  <span className="truncate font-mono text-[11px] text-ink-soft">{t.file}</span>
                </span>
                {used.length === 0 ? null : <span className="truncate text-control-label text-ink-soft">{W.usedBy(used)}</span>}
                <span className="ml-auto">
                  <RowMenu id={`routes-template-menu-${i}`} what={t.name} items={[{ label: W.delete, danger: true, onSelect: () => onDelete(t) }]} />
                </span>
              </li>
            )
          })}
        </ul>
      )}
      <button type="button" className={DASHED} onClick={onNew}>{W.newTemplate}</button>
    </section>
  )
}

/** S9a's Taxonomies card, editable (R-247): each row's first segment is a field inside its own address, and one Save. */
function Taxonomies({ projectId, config, known, onSaved }: { projectId: string; config: RoutesConfig; known: readonly string[]; onSaved: () => void }) {
  const [tag, setTag] = useState(config.taxonomies.tag)
  const [author, setAuthor] = useState(config.taxonomies.author)
  const [error, setError] = useState<string | null>(null)
  const dirty = tag !== config.taxonomies.tag || author !== config.taxonomies.author
  const row = (id: string, label: string, value: string, set: (v: string) => void, pill: string, last: boolean) => (
    <div className={`flex items-center gap-3 p-[12px_16px] ${last ? '' : 'border-b border-line'}`}>
      <label htmlFor={id} className="w-14 shrink-0 text-control-label font-semibold text-ink">{label}</label>
      <span className="flex min-w-0 items-center font-mono text-control-label text-ink-soft">
        /
        <input
          id={id}
          value={value}
          onChange={(event) => set(event.target.value.trim().toLowerCase())}
          size={Math.max(value.length, 3)}
          // as wide as its word, so the address reads `/topic/{slug}/` as S9a draws it; `size` is the fallback where
          // `field-sizing` is not supported (review side-by-side, 2026-10-17)
          className={`min-w-[3ch] [field-sizing:content] rounded-[4px] border border-transparent bg-transparent px-[2px] font-mono text-control-label text-ink caret-coral hover:border-line focus-visible:border-coral-text ${ring}`}
        />
        {'/{slug}/'}
      </span>
      <span className={`ml-auto shrink-0 ${PILL}`}>{pill}</span>
    </div>
  )
  return (
    <section aria-labelledby="routes-taxonomies" className="flex flex-col gap-[10px]">
      <h2 id="routes-taxonomies" className={SECTION}>{W.taxonomies}</h2>
      <form
        className="flex flex-col gap-[10px]"
        action={async () => {
          const next = { ...config, taxonomies: { tag, author } }
          const problem = validateRoutes(next, { templates: known }).find((p) => p.at.startsWith('taxonomies'))
          if (problem) return setError(problem.message)
          const result = await saveRoutes(null, formOf({ project: projectId, config: JSON.stringify(next) }))
          if ('error' in result) setError(result.error)
          else {
            setError(null)
            onSaved()
          }
        }}
      >
        <div className="flex flex-col overflow-hidden rounded border border-line bg-surface">
          {row('routes-tag', W.tags, tag, setTag, W.tagTemplate, false)}
          {row('routes-author', W.authors, author, setAuthor, W.authorTemplate, true)}
        </div>
        {error === null ? null : <p role="alert" className="text-helper-caption leading-[1.5] text-danger-text">{error}</p>}
        {dirty ? <Submit busy={W.saving} size={32} className="self-start">{W.save}</Submit> : null}
      </form>
    </section>
  )
}

/* ───────────────────────────── S9a's pane / S9b ───────────────────────────── */

/** One line of the file, coloured as S9a draws it: a path key in ink, other keys in sky, a value in mint, the colon soft. */
function YamlText({ text, wrong }: { text: string; wrong: boolean }) {
  const m = /^(\s*)([^:]+?):(?: (.*))?$/.exec(text)
  if (m === null) return <span className="whitespace-pre">{text}</span>
  const [, indent, key, value] = m
  const isPath = (key as string).startsWith('/')
  return (
    <span className="whitespace-pre">
      {indent}
      <span className={isPath ? 'text-ink' : 'text-sky-text'}>{key}</span>
      <span className="text-ink-soft">:</span>
      {value === undefined ? null : (
        <>
          {' '}
          <span className={wrong ? 'text-danger-text-hover underline decoration-danger decoration-wavy decoration-1 underline-offset-[3px]' : 'text-mint-text'}>{value}</span>
        </>
      )}
    </span>
  )
}

function YamlPane({ yaml, problems, unreadable }: { yaml: string | null; problems: readonly RouteProblem[]; unreadable: boolean }) {
  const [copied, setCopied] = useState(false)
  const lines = yaml === null ? [] : yaml.replace(/\n$/, '').split('\n')
  const wrong = new Set(problems.map((p) => p.line))
  const valid = problems.length === 0
  const icon = `inline-flex size-[26px] items-center justify-center rounded-[6px] text-ink-soft transition-colors hover:bg-paper ${ring}`
  useEffect(() => setCopied(false), [yaml])
  return (
    <section aria-label={W.file} className="flex min-h-[420px] min-w-0 flex-1 flex-col gap-3 bg-paper p-[22px_24px] tablet:min-h-0">
      {valid ? (
        <div className="flex items-center gap-[10px] rounded-thumb border border-mint-line bg-mint-tint p-[10px_14px]">
          <svg aria-hidden width="16" height="16" viewBox="0 0 24 24" fill="none" className="shrink-0">
            <circle cx="12" cy="12" r="10" className="fill-mint" />
            <polyline points="8 12.5 11 15.5 16 9.5" className="stroke-surface" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span data-valid className="text-ui-dense font-medium text-mint-text">{W.valid}</span>
          <span className="ml-auto rounded-pill bg-surface px-2 py-[2px] font-mono text-[10px] font-medium text-mint-text">{W.pass}</span>
        </div>
      ) : (
        <div role="alert" className="flex items-start gap-[10px] rounded-thumb border border-danger-line bg-danger-tint p-[10px_14px]">
          <svg aria-hidden width="16" height="16" viewBox="0 0 24 24" fill="none" className="mt-px shrink-0">
            <circle cx="12" cy="12" r="10" className="fill-danger" />
            <line x1="8.5" y1="8.5" x2="15.5" y2="15.5" className="stroke-surface" strokeWidth="2" strokeLinecap="round" />
            <line x1="15.5" y1="8.5" x2="8.5" y2="15.5" className="stroke-surface" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span className="flex flex-col gap-1">
            {problems.map((p, n) => (
              <span key={n} data-problem={p.line} className="text-ui-dense font-medium text-danger-text-hover">{W.line(p.line, p.message)}</span>
            ))}
          </span>
        </div>
      )}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded border border-line bg-surface">
        <div className="flex items-center gap-2 border-b border-line p-[10px_16px]">
          <span className="font-mono text-control-label font-medium text-ink">{W.file}</span>
          {valid ? <span className="text-helper-caption text-ink-soft">{W.fileNote}</span> : null}
          <span className="ml-auto flex items-center gap-[2px]">
            {valid ? null : <span className="mr-1 rounded-pill bg-danger-tint px-2 py-[2px] font-mono text-[10px] font-medium text-danger-text-hover">{W.errors(problems.length)}</span>}
            {yaml === null ? null : (
              <>
                <button
                  type="button"
                  title={copied ? W.copied : W.copy}
                  aria-label={copied ? W.copied : W.copy}
                  className={icon}
                  onClick={() => void navigator.clipboard.writeText(yaml).then(() => setCopied(true), () => setCopied(false))}
                >
                  {copied ? <Check size={13} /> : <Copy size={13} />}
                </button>
                <button
                  type="button"
                  title={W.download}
                  aria-label={W.download}
                  className={icon}
                  onClick={() => {
                    const url = URL.createObjectURL(new Blob([yaml], { type: 'text/yaml' }))
                    const a = Object.assign(document.createElement('a'), { href: url, download: W.file })
                    // in the document for the click, and the address kept a while: a detached anchor, or an address revoked
                    // at once, can lose the download in some browsers (review, 2026-10-17)
                    document.body.append(a)
                    a.click()
                    a.remove()
                    setTimeout(() => URL.revokeObjectURL(url), 10_000)
                  }}
                >
                  <svg aria-hidden width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                </button>
              </>
            )}
            <span role="status" className="sr-only">{copied ? W.copied : ''}</span>
          </span>
        </div>
        <pre data-yaml className="m-0 flex-1 overflow-auto py-4 font-mono text-[12.5px] leading-[1.85]">
          {lines.length === 0 ? (
            <span className="block px-4 text-ink-soft">{unreadable ? '' : W.emptyTitle}</span>
          ) : (
            lines.map((text, n) => {
              const bad = wrong.has(n + 1)
              return (
                <span key={n} data-line={n + 1} className={`flex gap-4 px-4 ${bad ? 'bg-danger-tint' : ''}`}>
                  <span aria-hidden className={`w-5 shrink-0 select-none text-right ${bad ? 'font-medium text-danger-text-hover' : 'text-ink-soft-aa'}`}>{n + 1}</span>
                  <YamlText text={text} wrong={bad} />
                  {'\n'}
                </span>
              )
            })
          )}
        </pre>
      </div>
    </section>
  )
}

/* ───────────────────────────── the sheets: S9c, S9e and New template ───────────────────────────── */

type Draft = {
  path: string
  /** S9e's choice; a collection is always 'collection' */
  show: 'template' | 'channel' | 'collection'
  filter: Filter
  template: string
  name: string
  own: boolean
  limit: number
}

function draftOf(open: Sheet, config: RoutesConfig, postsPerPage: number): Draft {
  const blank: Draft = { path: '', show: open.kind === 'route' ? 'template' : 'collection', filter: { match: 'all', conditions: [] }, template: '', name: '', own: false, limit: postsPerPage }
  if (open.kind === 'collection' && open.at !== null) {
    const c = config.collections[open.at] as Collection
    return { ...blank, path: c.path, filter: c.filter, template: c.template, own: c.limit !== undefined, limit: c.limit ?? postsPerPage }
  }
  if (open.kind === 'route' && open.at !== null) {
    const r = config.routes[open.at] as Route
    return isChannel(r)
      ? { ...blank, path: r.path, show: 'channel', filter: r.channel, template: r.template, own: r.limit !== undefined, limit: r.limit ?? postsPerPage }
      : { ...blank, path: r.path, show: 'template', template: r.template }
  }
  return blank
}

/** The draft as the config it would save — and the new template's file, when the sheet names one. */
function nextOf(open: Sheet, d: Draft, config: RoutesConfig): { next: RoutesConfig; file: string | null; named: string | null } {
  const named = d.template === NEW ? templateName(d.name) : null
  const file = named === null ? d.template : 'file' in named ? named.file : ''
  const size = d.own ? { limit: d.limit } : {}
  if (open.kind === 'collection') {
    const item: Collection = { path: d.path, filter: d.filter, template: file, ...size }
    const collections = open.at === null ? [...config.collections, item] : config.collections.map((c, i) => (i === open.at ? item : c))
    return { next: { ...config, collections }, file: named === null ? null : file, named: named !== null && 'error' in named ? named.error : null }
  }
  const item: Route = d.show === 'channel' ? ({ path: d.path, channel: d.filter, template: file, ...size } satisfies Channel) : { path: d.path, template: file }
  const at = open.kind === 'route' ? open.at : null
  const routes = at === null ? [...config.routes, item] : config.routes.map((r, i) => (i === at ? item : r))
  return { next: { ...config, routes }, file: named === null ? null : file, named: named !== null && 'error' in named ? named.error : null }
}

function SheetDialog({ open, projectId, config, templates, deployed, postsPerPage, suggestions, onClose, onSaved }: {
  open: Sheet
  projectId: string
  config: RoutesConfig
  templates: readonly Template[]
  deployed: readonly string[]
  postsPerPage: number
  suggestions: { tag: string[]; author: string[] }
  onClose: () => void
  onSaved: () => void
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [d, setD] = useState<Draft>(() => draftOf(open, config, postsPerPage))
  const [error, setError] = useState<string | null>(null)
  const known = templates.map((t) => t.file)
  const taken = { project: known, deployed }
  const router = useRouter()
  const prefix = isApp(usePathname()) ? '/app' : ''
  /** Story 7.16b — the new canvas opening after the Template menu's Create: the button keeps saying "Creating…" while the
   *  push runs (R-98), and the editor's own skeleton follows */
  const [pending, startOpening] = useTransition()
  // `replace`, so Back from the new canvas returns to where the menu was pressed, never to this sheet again (review, 2026-10-17)
  const openCanvas = (canvas: RouteCanvas) => startOpening(() => router.replace(`${prefix}${canvasPath(projectId, canvas)}`))
  useEffect(() => {
    const el = dialog.current
    if (!el || el.open) return
    el.showModal()
    // Story 7.16b — a New template sheet opens with focus in Name, its one field (the Template menu's entry lands here)
    if (open.kind === 'template') document.getElementById('routes-new-template')?.focus()
  }, [])
  const set = (patch: Partial<Draft>) => setD((was) => ({ ...was, ...patch }))
  const editing = open.kind !== 'template' && open.at !== null
  const where = d.show === 'channel' ? 'channel' : 'collection'

  /** Everything the sheet can say before it writes, first problem first; null when the draft may be saved. */
  const refusal = (): string | null => {
    if (open.kind === 'template') {
      const named = templateName(d.name, taken)
      return 'error' in named ? named.error : null
    }
    if (!PATH_RE.test(d.path)) return W.refused.path
    // what is ALREADY on this path, by name — the validator names whichever claims first, and a collection claims before a
    // route; a reserved segment is the validator's own sentence (review, 2026-10-17)
    if (!Object.hasOwn(RESERVED_SEGMENTS, d.path.slice(1, -1))) {
      const held = holderOf(config, d.path, open.at === null ? undefined : `${open.kind === 'collection' ? 'collections' : 'routes'}.${open.at}.path`)
      if (held !== null) return W.refused.taken(d.path, held)
    }
    if (d.show !== 'template') {
      const wrong = filterProblem(d.filter, where)
      if (wrong !== null) return wrong
    }
    if (d.template === '') return W.refused.template
    if (d.template === NEW) {
      const named = templateName(d.name, taken)
      if ('error' in named) return named.error
    }
    const { next, file } = nextOf(open, d, config)
    const problem = validateRoutes(next, { templates: file === null ? known : [...known, file] })[0]
    return problem?.message ?? null
  }

  const heading = open.kind === 'template' ? W.newTemplateTitle
    : open.kind === 'collection' ? (editing ? W.editCollectionTitle : W.newCollectionTitle)
      : editing ? W.editRouteTitle : W.newRouteTitle
  const lead = open.kind === 'template' ? W.newTemplateLead : open.kind === 'collection' ? W.newCollectionLead : W.newRouteLead
  const primary = open.kind === 'template' ? W.createTemplate : editing ? W.save : open.kind === 'collection' ? W.createCollection : W.createRoute
  const busy = editing ? W.saving : W.creating

  return (
    <dialog
      ref={dialog}
      aria-labelledby="routes-sheet-title"
      className={routeSheet}
      onClose={onClose}
      onClick={closeOnBackdrop}
    >
      <form
        className="flex flex-col gap-[18px]"
        action={async () => {
          const refused = refusal()
          if (refused !== null) return setError(refused)
          let result: RoutesResult
          if (open.kind === 'template') result = await createTemplate(null, formOf({ project: projectId, name: d.name }))
          else {
            const { next, file } = nextOf(open, d, config)
            result = await saveRoutes(null, formOf({
              project: projectId,
              config: JSON.stringify(next),
              ...(file === null ? {} : { template_name: d.name, template_file: file }),
            }))
          }
          if ('error' in result) return setError(result.error)
          setError(null)
          // Story 7.16b — the Template menu's entry opens the new canvas; the sheet stays up, saying "Creating…", until it does
          const made = open.kind === 'template' && open.entry === true && result.file !== undefined ? routeCanvasOf(result.file) : null
          if (made !== null) return openCanvas(made)
          dialog.current?.close()
          onSaved()
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <h2 id="routes-sheet-title" className={wideTitle}>{heading}</h2>
            <p className="text-ui-dense text-ink-soft">{lead}</p>
          </div>
          <button type="button" aria-label={W.cancel} onClick={() => dialog.current?.close()} className={`mt-1 shrink-0 rounded-sm text-ink-soft ${ring}`}>
            <X size={16} />
          </button>
        </div>

        {open.kind === 'template' ? (
          <Naming id="routes-new-template" value={d.name} taken={taken} onChange={(name) => set({ name })} />
        ) : (
          <>
            <TextInput id="routes-path" label={W.path} size={40} mono value={d.path} placeholder="/tutorials/" onChange={(e) => set({ path: e.target.value.trim().toLowerCase() })} />
            {open.kind === 'route' ? (
              <fieldset className="flex flex-col gap-[10px]">
                <legend className="mb-[10px] text-control-label font-medium text-ink-soft">{W.show}</legend>
                <RadioCard name="routes-show" value="template" checked={d.show === 'template'} title={W.oneTemplate} consequence={W.oneTemplateHelp} onChange={() => set({ show: 'template' })}>
                  <TemplateField id="routes-route-template" d={d} templates={templates} set={set} labelHidden />
                </RadioCard>
                <RadioCard name="routes-show" value="channel" checked={d.show === 'channel'} title={W.channel} consequence={W.channelHelp} onChange={() => set({ show: 'channel' })} />
              </fieldset>
            ) : null}
            {d.show === 'template' ? null : (
              <>
                <Conditions where={where} filter={d.filter} suggestions={suggestions} onChange={(filter) => set({ filter })} />
                <div className="flex flex-col gap-3 tablet:flex-row">
                  <div className="min-w-0 flex-1"><TemplateField id="routes-template" d={d} templates={templates} set={set} /></div>
                  <div className="flex items-start gap-2 rounded-sm bg-paper p-[9px_11px] tablet:max-w-[220px]">
                    <InfoCircle size={13} className="mt-px shrink-0 text-ink-soft" />
                    <span className="text-control-label leading-[1.5] text-ink-soft">
                      {W.postsBefore}
                      <Link href={settingsPath(projectId)} className={`font-semibold text-ink hover:underline ${ring}`}>{W.postsLink}</Link>
                      <PostsCount n={postsPerPage} kind={where} />
                    </span>
                  </div>
                </div>
                <PageSize d={d} set={set} />
              </>
            )}
            {d.template === NEW ? <Naming id="routes-sheet-template" value={d.name} taken={taken} onChange={(name) => set({ name })} /> : null}
          </>
        )}

        {error === null ? null : <p role="alert" className="text-helper-caption leading-[1.5] text-danger-text">{error}</p>}
        <div className="mt-[2px] flex justify-end gap-[10px]">
          {/* S9c's quiet Cancel (`:226`), as S7c's is drawn in `pack-editor.tsx` */}
          <button type="button" data-cancel onClick={() => dialog.current?.close()} className={`h-[38px] rounded-thumb px-[14px] text-ui-dense font-medium text-ink-soft transition-colors hover:bg-ink-wash ${ring}`}>{W.cancel}</button>
          <Submit variant="primary" size={38} busy={busy} pending={pending}>{primary}</Submit>
        </div>
      </form>
    </dialog>
  )
}

/** The naming block (R-247): S9c's Path box for the name, and its two grey lines — the file and Ghost's label — then the
 *  permanent sentence (`EXPERIENCE.md:272`). A refusal shows as soon as there is a name to refuse. */
function Naming({ id, value, taken, onChange }: { id: string; value: string; taken: { project: readonly string[]; deployed: readonly string[] }; onChange: (v: string) => void }) {
  const named = value.trim() === '' ? null : templateName(value, taken)
  return (
    <div className="flex flex-col gap-[6px]">
      <TextInput id={id} label={W.name} size={40} value={value} maxLength={80} error={named !== null && 'error' in named ? named.error : null} onChange={(e) => onChange(e.target.value)} />
      {named !== null && 'file' in named ? (
        <>
          <span data-file className="font-mono text-[11px] text-ink-soft">{named.file}</span>
          <span data-label className="text-helper-caption text-ink-soft">{W.ghostWillShow(named.label)}</span>
        </>
      ) : null}
      <HelperCaption>{W.permanent}</HelperCaption>
    </div>
  )
}

function TemplateField({ id, d, templates, set, labelHidden = false }: { id: string; d: Draft; templates: readonly Template[]; set: (p: Partial<Draft>) => void; labelHidden?: boolean }) {
  const value = d.template === NEW ? W.newTemplateOption : d.template === '' ? W.choose : templates.find((t) => t.file === d.template)?.name ?? d.template
  return (
    <div className={labelHidden ? '[&>div>span:first-child]:sr-only' : ''}>
      <Select
        id={id}
        label={W.template}
        value={value}
        thumb={<SelectThumb />}
        options={[
          ...templates.map((t) => ({ value: t.file, label: t.name, active: t.file === d.template })),
          { value: NEW, label: W.newTemplateOption, active: d.template === NEW },
        ]}
        onSelect={(template) => set({ template })}
      />
    </div>
  )
}

/** The page size (R-247): Theme settings' Posts per page box, unchanged, behind "Its own page size". */
function PageSize({ d, set }: { d: Draft; set: (p: Partial<Draft>) => void }) {
  return (
    <div className="flex flex-col gap-2">
      <Toggle id="routes-own-size" label={W.ownPageSize} checked={d.own} onToggle={(own) => set({ own })} />
      {/* the box's name, as Theme settings names Posts per page's (`kit/stepper.tsx` labels the group by `{id}-label`);
          heard, not printed — the switch above is its visible line */}
      <span id="routes-page-size-label" className="sr-only">{W.pageSize}</span>
      {d.own ? (
        <StepperBox id="routes-page-size" label={W.pageSize} value={d.limit} min={PAGE_SIZE.min} max={PAGE_SIZE.max} large onStep={(step) => set({ limit: Math.min(PAGE_SIZE.max, Math.max(PAGE_SIZE.min, d.limit + step)) })} />
      ) : null}
    </div>
  )
}

/* ───────────────────────────── the condition block (S9c's rows) ───────────────────────────── */

const fieldLabel = (field: Cond['field']) => FIELDS.find((f) => f.field === field)?.label ?? field
const VALUE_BOX = 'flex min-h-9 min-w-0 flex-1 flex-wrap items-center gap-[5px] rounded-sm border border-line bg-surface px-2 py-[3px]'

function Conditions({ where, filter, suggestions, onChange }: { where: 'collection' | 'channel'; filter: Filter; suggestions: { tag: string[]; author: string[] }; onChange: (f: Filter) => void }) {
  const base = useId().replace(/:/g, '')
  const today = localToday()
  const put = (n: number, c: Cond) => onChange({ ...filter, conditions: filter.conditions.map((x, i) => (i === n ? c : x)) })
  const fieldItems = (active?: Cond['field']) => FIELDS.map((f) => ({
    value: f.field,
    label: f.label,
    active: f.field === active,
    contents: (
      <span className="flex flex-1 items-center gap-[9px]">
        <span className="flex-1 text-[12.5px] font-medium">{f.label}</span>
        <span className="font-mono text-[10px] text-ink-soft-aa">{f.key}</span>
      </span>
    ),
  }))
  return (
    <div className="flex flex-col gap-2">
      <MatchSwitch id={`${base}-join`} match={filter.match} onChange={(match) => onChange({ ...filter, match })} />
      {filter.conditions.map((c, n) => (
        <ConditionRow
          key={n}
          id={`${base}-c${n}`}
          wide
          field={FIELDS.find((f) => f.field === c.field)?.row ?? fieldLabel(c.field)}
          fields={fieldItems(c.field)}
          fieldMenuWidth="w-[250px]"
          onField={(field) => put(n, freshCondition(field as Cond['field'], where, today))}
          {...operatorOf(c, where, (next) => put(n, next))}
          values={'values' in c ? c.values : []}
          value={<ValueOf id={`${base}-c${n}`} c={c} where={where} suggestions={suggestions} onChange={(next) => put(n, next)} />}
          onRemove={() => onChange({ ...filter, conditions: filter.conditions.filter((_, i) => i !== n) })}
        />
      ))}
      <AddCondition id={`${base}-add`} items={fieldItems()} onPick={(field) => onChange({ ...filter, conditions: [...filter.conditions, freshCondition(field as Cond['field'], where, today)] })} />
      <span className="text-helper-caption leading-[1.5] text-ink-soft">{where === 'collection' ? W.first : null}</span>
      <span className="text-helper-caption leading-[1.5] text-ink-soft">{where === 'collection' ? W.exactDate : <Rolling />}</span>
    </div>
  )
}

/** The rest of S9c's page-size sentence, its number in mono as drawn (`:222`) — naming the sheet's own kind (Story 7.16c). */
const PostsCount = ({ n, kind }: { n: number; kind: 'collection' | 'channel' }) => {
  const words = W.postsAfter(n, kind)
  const at = words.indexOf(String(n))
  return <>{words.slice(0, at)}<span className="font-mono text-[11px]">{n}</span>{words.slice(at + String(n).length)}</>
}

/** S9c's rolling-date sentence with its term in mono, as drawn (`:209`). */
const Rolling = () => {
  const [before, after] = W.rollingDate.split('now-30d')
  return <>{before}<span className="font-mono text-[10px]">now-30d</span>{after}</>
}

/** S9c's "Show posts that match" row (`:186-189`): its label left and the two-option track right, as drawn — the Kit's
 *  segmented track at S9c's own 2/10 padding and 11px, keyed by the Kit's `radioKeys` (one Tab stop, the arrows move). */
function MatchSwitch({ id, match, onChange }: { id: string; match: Filter['match']; onChange: (m: Filter['match']) => void }) {
  const list = choices([{ value: 'all', label: W.all }, { value: 'any', label: W.any }])
  return (
    <div className="flex items-center gap-[10px]">
      <span id={`${id}-label`} className="text-control-label font-medium text-ink-soft">{W.match}</span>
      <div id={id} role="radiogroup" aria-labelledby={`${id}-label`} onKeyDown={(event) => radioKeys(event, list, (v) => onChange(v as Filter['match']))} className="ml-auto flex rounded-pill bg-paper-sunk p-[2px]">
        {list.map((o) => {
          const on = o.value === match
          return (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={on}
              tabIndex={on ? 0 : -1}
              onClick={() => onChange(o.value as Filter['match'])}
              className={`rounded-[20px] px-[10px] py-[2px] text-center text-[11px] ${ring} ${on ? 'bg-surface font-semibold text-ink shadow-sm' : 'font-medium text-ink-soft'}`}
            >
              {o.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/** S9c's last row: "Choose…" opening the field picker (`:194-207`), which adds a condition. */
function AddCondition({ id, items, onPick }: { id: string; items: { value: string; label: string; contents: ReactNode }[]; onPick: (v: string) => void }) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        popoverTarget={`${id}-menu`}
        onClick={(event) => {
          const pop = document.getElementById(`${id}-menu`)
          if (pop) openPopover(pop, event.currentTarget, { side: 'down', align: 'left' })
        }}
        className={`flex h-9 w-[104px] shrink-0 items-center gap-[6px] rounded-sm border border-line bg-surface px-[10px] hover:border-line-strong ${ring}`}
      >
        <span className="flex-1 text-left text-[12.5px] text-ink-soft-aa">{W.choose}</span>
        <ChevronDown size={11} className="text-ink-soft" />
      </button>
      <div id={`${id}-menu`} popover="auto" onKeyDown={arrowKeys} className="border-0 bg-transparent p-0">
        <Menu label={W.match} width="w-[250px]" items={items.map((o) => ({ label: o.label, contents: o.contents, onSelect: () => onPick(o.value) }))} />
      </div>
    </div>
  )
}

/** A condition's operator: its words and, where there is a choice, the menu of them. */
function operatorOf(c: Cond, where: 'collection' | 'channel', set: (c: Cond) => void): { operator: string; operators?: { value: string; label: string; active?: boolean }[]; onOperator?: (v: string) => void } {
  if ('is' in c) return { operator: W.is }
  if ('values' in c) {
    const [yes, no] = c.field === 'visibility' ? [W.is, W.isNot] : [W.isAnyOf, W.isNoneOf]
    return {
      operator: c.op === 'any' ? yes : no,
      operators: [{ value: 'any', label: yes, active: c.op === 'any' }, { value: 'none', label: no, active: c.op === 'none' }],
      onOperator: (op) => set({ ...c, op: op as 'any' | 'none' } as Cond),
    }
  }
  const rolling = 'ago' in c.at
  const words = rolling ? (c.op === '>' || c.op === '>=' ? W.within : W.moreThan) : EXACT_WORDS[c.op]
  const relative = where === 'channel' ? [{ value: 'r>', label: W.within }, { value: 'r<', label: W.moreThan }] : []
  return {
    operator: words,
    operators: [...relative, ...EXACT_OPS.map((op) => ({ value: op, label: EXACT_WORDS[op] }))].map((o) => ({
      ...o,
      active: rolling ? o.value === (c.op === '>' || c.op === '>=' ? 'r>' : 'r<') : o.value === c.op,
    })),
    onOperator: (v) => {
      const today = localToday()
      if (v === 'r>' || v === 'r<') set({ field: 'published_at', op: v === 'r>' ? '>' : '<', at: 'ago' in c.at ? c.at : { ago: 30, unit: 'd' } })
      else set({ field: 'published_at', op: v as DateOp, at: 'date' in c.at ? c.at : { date: today } })
    },
  }
}

/** A condition's value: the chips with their × and "add…" for a tag or writer, a menu of named values, a date, or a
 *  number and its unit with the mono term S9c draws beside it. */
function ValueOf({ id, c, where, suggestions, onChange }: { id: string; c: Cond; where: 'collection' | 'channel'; suggestions: { tag: string[]; author: string[] }; onChange: (c: Cond) => void }) {
  const [typed, setTyped] = useState('')
  if ('values' in c && c.field !== 'visibility') {
    const list = c.field === 'tag' || c.field === 'primary_tag' ? suggestions.tag : suggestions.author
    const add = () => {
      const slug = typed.trim().toLowerCase().replace(/\s+/g, '-')
      setTyped('')
      if (slug !== '' && !c.values.includes(slug)) onChange({ ...c, values: [...c.values, slug] })
    }
    return (
      <div className={VALUE_BOX}>
        {c.values.map((v) => (
          <span key={v} className="inline-flex items-center gap-[5px] rounded-pill border border-line bg-paper px-2 py-[2px] text-[11.5px] font-medium text-ink">
            {v}
            <button type="button" aria-label={W.removeValue(v)} onClick={() => onChange({ ...c, values: c.values.filter((x) => x !== v) })} className={`text-ink-soft ${ring}`}>
              <X size={9} />
            </button>
          </span>
        ))}
        <label htmlFor={`${id}-add`} className="sr-only">{`${fieldLabel(c.field)} — ${W.add}`}</label>
        <input
          id={`${id}-add`}
          list={list.length > 0 ? `${id}-list` : undefined}
          value={typed}
          placeholder={W.add}
          onChange={(e) => setTyped(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ',') {
              e.preventDefault()
              add()
            } else if (e.key === 'Backspace' && typed === '' && c.values.length > 0) onChange({ ...c, values: c.values.slice(0, -1) })
          }}
          onBlur={add}
          className="min-w-[60px] flex-1 bg-transparent text-[11.5px] text-ink caret-coral outline-none placeholder:text-ink-soft-aa"
        />
        {list.length > 0 ? <datalist id={`${id}-list`}>{list.map((s) => <option key={s} value={s} />)}</datalist> : null}
      </div>
    )
  }
  const menuBox = (label: string, items: { value: string; label: string; active: boolean }[], pick: (v: string) => void) => (
    <>
      <button
        type="button"
        aria-label={label}
        popoverTarget={`${id}-value-menu`}
        onClick={(event) => {
          const pop = document.getElementById(`${id}-value-menu`)
          if (pop) openPopover(pop, event.currentTarget, { side: 'down', align: 'left' }, pop.querySelector<HTMLElement>('[aria-current="true"]'))
        }}
        className={`flex h-9 min-w-0 flex-1 items-center gap-[6px] rounded-sm border border-line bg-surface px-[10px] hover:border-line-strong ${ring}`}
      >
        <span className="flex-1 truncate text-left text-[12.5px] font-medium text-ink">{items.find((i) => i.active)?.label}</span>
        <ChevronDown size={11} className="text-ink-soft" />
      </button>
      <div id={`${id}-value-menu`} popover="auto" onKeyDown={arrowKeys} className="border-0 bg-transparent p-0">
        <Menu label={label} items={items.map((i) => ({ label: i.label, active: i.active, onSelect: () => pick(i.value) }))} />
      </div>
    </>
  )
  if ('values' in c) {
    return menuBox(fieldLabel(c.field), VISIBILITIES.map((v) => ({ value: v, label: VISIBILITY_WORDS[v], active: c.values[0] === v })), (v) => onChange({ ...c, values: [v as Visibility] }))
  }
  if ('is' in c) {
    return menuBox(fieldLabel(c.field), [{ value: 'yes', label: W.yes, active: c.is }, { value: 'no', label: W.no, active: !c.is }], (v) => onChange({ ...c, is: v === 'yes' }))
  }
  const at = c.at
  if ('date' in at) {
    return (
      <div className="min-w-0 flex-1">
        <label htmlFor={`${id}-date`} className="sr-only">{fieldLabel(c.field)}</label>
        <input id={`${id}-date`} type="date" value={at.date} onChange={(e) => onChange({ ...c, at: { date: e.target.value } })} className={`h-9 w-full rounded-sm border border-line bg-surface px-[10px] text-[12.5px] font-medium text-ink ${ring} focus-visible:border-coral-text`} />
      </div>
    )
  }
  if (where === 'collection') return null
  return (
    <div className={`${VALUE_BOX} gap-2 px-[10px]`}>
      {c.op === '>' || c.op === '>=' ? <span className="text-[12.5px] font-medium text-ink">{W.lastWord}</span> : null}
      <label htmlFor={`${id}-ago`} className="sr-only">{`${fieldLabel(c.field)} — ${W.howFar}`}</label>
      <input
        id={`${id}-ago`}
        type="number"
        inputMode="numeric"
        min={1}
        value={at.ago}
        onChange={(e) => onChange({ ...c, at: { ...at, ago: Number(e.target.value) } })}
        className="w-12 bg-transparent text-[12.5px] font-medium text-ink caret-coral outline-none"
      />
      <label htmlFor={`${id}-unit`} className="sr-only">{`${fieldLabel(c.field)} — ${W.unit}`}</label>
      <select id={`${id}-unit`} value={at.unit} onChange={(e) => onChange({ ...c, at: { ...at, unit: e.target.value as DateUnit } })} className={`rounded-[4px] bg-transparent text-[12.5px] font-medium text-ink ${ring}`}>
        {DATE_UNITS.map((u) => <option key={u} value={u}>{c.op === '<' || c.op === '<=' ? W.unitAgo(u) : UNIT_WORDS[u]}</option>)}
      </select>
      <span className="ml-auto font-mono text-[10px] text-ink-soft-aa">{`now-${at.ago}${at.unit}`}</span>
    </div>
  )
}

/* ───────────────────────────── the template delete's confirm ───────────────────────────── */

/** S12c's confirm (`dialog.ts`'s `sheet`), extrapolated (R-247): it lists every route the delete removes and opens on Cancel
 *  (EXPERIENCE § Destructive confirms). Story 7.16b — and it says the design goes too, where the canvas holds one; Undo
 *  brings all of it back. */
function DeleteTemplate({ template, paths, designed, onCancel, onDelete }: { template: Template; paths: readonly string[]; designed: boolean; onCancel: () => void; onDelete: () => Promise<void> }) {
  const dialog = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    if (dialog.current && !dialog.current.open) openOnCancel(dialog.current)
  }, [])
  return (
    <dialog ref={dialog} aria-labelledby="routes-delete-title" className={sheet} onClose={onCancel} onClick={closeOnBackdrop}>
      <form
        className="flex flex-col"
        action={async () => {
          await onDelete()
          dialog.current?.close()
        }}
      >
        <h2 id="routes-delete-title" className={confirmTitle}>{W.deleteTitle(template.name)}</h2>
        <p className="mt-2 text-ui-dense leading-[1.5] text-ink-soft">
          {designed ? (paths.length > 0 ? W.alsoRemovesDesign(paths) : W.designGoes) : W.alsoRemoves(paths)}
        </p>
        <div className="mt-6 flex justify-end gap-[10px]">
          <Button variant="secondary" data-cancel onClick={() => dialog.current?.close()}>{W.cancel}</Button>
          <Submit variant="danger" busy={W.deleting}>{W.delete}</Submit>
        </div>
      </form>
    </dialog>
  )
}
