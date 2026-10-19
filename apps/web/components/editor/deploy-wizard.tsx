'use client'

import Link from 'next/link'
import { useActionState, useEffect, useRef, useState, type ReactNode } from 'react'
import { nodeOf, unlistedPosts, type ListedPost, type RoutesConfig } from '@inflozo/section-runtime/routes'
import type { Finding } from '@inflozo/theme-compiler/gate'
import { verifyRoutesAction } from '@/app/(app)/app/(authed)/sites/actions'
import { ResultChip, VersionChip } from '@/components/kit/badge'
import { Button, SplitButton } from '@/components/kit/button'
import { closeOnBackdrop, wideTitle } from '@/components/kit/dialog'
import { greyedProps, ring } from '@/components/kit/greyed'
import { AlertCircle, AlertTriangle, Bolt, ChevronDown, ChevronRight, ChevronUp, ExternalLink, InfoCircle, Refresh, Upload, X } from '@/components/kit/icons'
import { RadioCard } from '@/components/kit/radio-card'
import { Menu, type MenuItem } from '@/components/kit/select'
import { BusyLabel, Submit } from '@/components/kit/submit'
import { RoutesFallback } from '@/components/routes-fallback'
import {
  CANCELLABLE, CHECK_FAILED, checkRows, DEPLOY_WORDS as W, endingOf, isMoving, seconds, STAGE_NAMES, stepNumber, stepOf, STEPS, themeSize, UNSTOPPABLE, uploadOnlyBlock,
  versionNumber, type DeployRequest, type DeployView, type Mode, type ShipState, type Stage, type Step,
} from '@/lib/deploy'
import { deployPath, type Canvas } from '@/lib/editor'
import { KEYMAP } from '@/lib/keymap'
import type { Row } from '@/lib/live-content'
import { LOCK_COPY } from '@/lib/lock'
import { PREVIEW_COPY } from '@/lib/probe-rule'
import { useSaid } from '@/lib/renders'
import { resetRoutingPath } from '@/lib/routes'
import { downloadHref, ROUTES_FALLBACK_WORDS as RW } from '@/lib/routes-upload'

/* ───────── STORY 7.18a — SHIP IT AND THE DEPLOY WIZARD (FR-J8, AD-20's F-075), from the export (R-74):
 *
 *   - the bar's split button and its ▾ menu: `S4 Editor.dc.html:157-160` and S4d `:366-395`, D8a/D8b at narrow widths;
 *   - the wizard: `S8 Deploy.dc.html` S8a (Destination), S8b (Pre-flight), S8c (Shipping), S8d (Live) and S8d′ (a failure
 *     while shipping), and `D2 Deploy History Completed.dc.html` D2e/D2f — the theme on the site but not live;
 *   - B16 (`components/routes-fallback.tsx`) at the Live ending, as Story 7.17 built it.
 *
 * EXTRAPOLATED FROM THE NEAREST FRAME, in the same tokens and components: the running stages (S8c's row and its static ring
 * — never turning, so never a spinner, and no byte bar: no real byte count exists, routine call 8), a blocking Pre-flight
 * (S8b's rows with S8d′'s failed mark, Ship it greyed with its reason under it as P0-0 draws a greyed control — S8c's greyed
 * Cancel is the drawn instance), the no-site and Preview-only Destination (S8a's site card; B15's sky panel and words), and
 * R-260's row (S8b's top-level row; D2e's disc in the warning hue).
 *
 * EVERY STRING IS `DEPLOY_WORDS`' (R-170), the lock's are `LOCK_COPY`'s and B15's `PREVIEW_COPY`'s. A row whose label and meta
 * the frame draws apart but the list keeps as one sentence ("Uploaded to Ghost · 2.4 MB · 31s") is split at its first " · "
 * (`apart`), so one sentence stays one list entry.
 *
 * THE WORK IS THE SERVER'S (`projects/[id]/deploy/route.ts`): a POST answers the job id at once and the wizard reads the row
 * once a second while it moves (`isMoving`), and once more after each press until the row has moved past where the press
 * found it. Every field of AD-24's envelope is drawn as TEXT; a `compile_failed` detail is ours and is never drawn. */

/** what the editor asked the wizard to open on — the ▾ menu's row or Ship it's own press (Deploy & activate) */
export type ShipRequest = { mode: Mode; n: number }

/** the frame draws a row's label and its meta apart; the list keeps the pair as one sentence */
const apart = (sentence: string): [string, string] => {
  const at = sentence.indexOf(' · ')
  return at < 0 ? [sentence, ''] : [sentence.slice(0, at), sentence.slice(at + 3)]
}

/** an in-app address as the browser asks for it (`/app` on localhost, `syncUrl()`'s rule); Ghost's own pages as they are */
const hrefOn = (prefix: string, href: string) => (href.startsWith('/') ? `${prefix}${href}` : href)

/** S4d's two glyphs the Kit's icon file does not carry, drawn as the frame draws them (`S4 Editor.dc.html:384`, `:387`) */
const glyph = 'size-[15px] shrink-0 fill-none stroke-current stroke-[1.5] [stroke-linecap:round] [stroke-linejoin:round]'
const ArrowUpGlyph = () => (
  <svg aria-hidden viewBox="0 0 24 24" className={`${glyph} text-ink-soft`}>
    <path d="M12 19V5" />
    <polyline points="5 12 12 5 19 12" />
  </svg>
)
const FileGlyph = () => (
  <svg aria-hidden viewBox="0 0 24 24" className={`${glyph} text-ink-soft`}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
)

/** a ▾ row's two lines (S4d: 13px/500, then 11px ink-soft) */
const twoLines = (title: string, caption?: string) => (
  <span className="flex min-w-0 flex-1 flex-col gap-px">
    <span className="text-ui-dense font-medium text-ink">{title}</span>
    {caption === undefined ? null : <span className="text-helper-caption font-normal text-ink-soft">{caption}</span>}
  </span>
)

/** the routes file, saved as Ghost names it — the same `data:` bytes B16's download carries (routine call 10) */
function saveRoutes(file: string) {
  const a = document.createElement('a')
  a.href = downloadHref(file)
  a.download = RW.file
  a.click()
}

/* ─────────────────────────────────────────────── the bar's control ─────────────────────────────────────────────── */

/** S4's Ship it with S4d's ▾ menu: Deploy & activate (⌘⏎), Deploy only, and Download routes.yaml while the project has
 *  routing. Download theme and History are ABSENT until their stories (7.26, 7.23 — UX-DR3). R-264 (a): Deploy only is
 *  GREYED while this project's theme is the one live on the site (`uploadOnlyBlock`), its reason in the row's caption slot,
 *  and a press on it opens nothing. */
export function ShipButton({ ship, routes, busy, onShip }: { ship: ShipState | undefined; routes: string | null; busy: boolean; onShip: (mode: Mode) => void }) {
  const n = ship?.n ?? 1
  const prev = ship?.prev ?? null
  const blocked = uploadOnlyBlock(ship)
  const items: MenuItem[] = [
    {
      label: W.activate,
      icon: <Bolt size={15} className="shrink-0 text-coral-deep" />,
      contents: twoLines(W.activate, W.activateCaption(n)),
      keys: KEYMAP.find((b) => b.gesture === 'ship')?.chips,
      onSelect: () => onShip('activate'),
    },
    blocked === null
      ? { label: W.uploadOnly, icon: <ArrowUpGlyph />, contents: twoLines(W.uploadOnly, W.uploadOnlyCaption(n, prev)), onSelect: () => onShip('upload') }
      : { label: W.uploadOnly, icon: <ArrowUpGlyph />, greyed: blocked },
    ...(routes === null ? [] : [{ label: W.downloadRoutes, icon: <FileGlyph />, contents: twoLines(W.downloadRoutes), onSelect: () => saveRoutes(routes) }]),
  ]
  return (
    <SplitButton id="editor-ship" menuLabel={W.options} busy={busy} onPress={() => onShip('activate')} menu={<Menu label={W.options} items={items} width="w-[270px]" />}>
      <BusyLabel pending={busy} busy={W.opening}>
        {ship?.shipped === true ? W.shipUpdate : W.ship}
      </BusyLabel>
    </SplitButton>
  )
}

/* ─────────────────────────────────────────────── the marks ─────────────────────────────────────────────── */

type Tone = 'done' | 'running' | 'pending' | 'failed' | 'info' | 'warning'

/** S8's 20px row marks, as drawn: a tinted disc with its mark (`S8 Deploy.dc.html:92`, `:228`; D2e's info disc `:322`),
 *  S8c's ring with its quarter arc, STILL (`:150`), and the hollow circle of a stage not yet reached (`:157`) */
function Mark({ tone }: { tone: Tone }) {
  if (tone === 'pending') return <span aria-hidden className="size-5 shrink-0 rounded-full border-[1.5px] border-line-strong" />
  const svg = (children: ReactNode) => (
    <svg aria-hidden width="20" height="20" viewBox="0 0 24 24" fill="none" className="shrink-0" strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  )
  if (tone === 'running') return svg(<><circle cx="12" cy="12" r="9" className="stroke-coral-tint-strong" strokeWidth="2.5" /><path d="M12 3a9 9 0 0 1 9 9" className="stroke-coral" strokeWidth="2.5" /></>)
  if (tone === 'done') return svg(<><circle cx="12" cy="12" r="10" className="fill-mint-tint" /><polyline points="8 12.5 11 15.5 16 9.5" className="stroke-mint" strokeWidth="2" /></>)
  if (tone === 'failed') return svg(<><circle cx="12" cy="12" r="10" className="fill-danger-tint" /><line x1="8.5" y1="8.5" x2="15.5" y2="15.5" className="stroke-danger" strokeWidth="2" /><line x1="15.5" y1="8.5" x2="8.5" y2="15.5" className="stroke-danger" strokeWidth="2" /></>)
  // whole class names, so Tailwind's scan finds them
  const [disc, stroke, dot] = tone === 'info' ? ['fill-sky-tint', 'stroke-sky-text', 'fill-sky-text'] : ['fill-marigold-tint', 'stroke-marigold-text', 'fill-marigold-text']
  return svg(<><circle cx="12" cy="12" r="10" className={disc} /><line x1="12" y1="8" x2="12" y2="12.5" className={stroke} strokeWidth="2" /><circle cx="12" cy="16" r="1" className={dot} /></>)
}

/** one of S8's stage rows: the mark, the words (600 while it runs, as S8c draws it), and the mono meta at the right */
function StageRow({ tone, label, meta, chip, id }: { tone: Tone; label: ReactNode; meta?: string; chip?: ReactNode; id?: string }) {
  return (
    <div id={id} className={`flex items-center gap-[11px] ${tone === 'pending' ? 'opacity-45' : ''}`}>
      <Mark tone={tone} />
      <span className={`text-ui-dense ${tone === 'running' || tone === 'failed' ? 'font-semibold' : 'font-medium'} ${tone === 'failed' ? 'text-danger-text' : 'text-ink'}`}>{label}</span>
      {meta ? <span className="ml-auto font-mono text-helper-caption text-ink-soft [font-variant-ligatures:none]">{meta}</span> : null}
      {chip === undefined ? null : <span className="ml-auto">{chip}</span>}
    </div>
  )
}

/** the rail, numbered from `STEPS` (a list 7.19 and 7.20 add to): done steps mint-ticked, the current one coral — or red
 *  where it failed, green once Live — and the rest dimmed; D2e/D2f's Live is not reached (`waiting`) */
function Rail({ at, state }: { at: Step; state: 'current' | 'failed' | 'live' | 'waiting' }) {
  const c = stepNumber(at) - 1
  const tick = (stroke: string) => (
    <svg aria-hidden width="10" height="10" viewBox="0 0 24 24" fill="none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={stroke}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
  return (
    <ol className="m-0 flex list-none items-center gap-2 p-0">
      {STEPS.map((s, i) => {
        const done = i < c || (i === c && state === 'live')
        const now = i === c && state !== 'waiting'
        const round = 'inline-flex size-[18px] shrink-0 items-center justify-center rounded-full text-[10px] font-semibold leading-none'
        const disc =
          i === c && state === 'failed' ? <span aria-hidden className={`${round} bg-danger-text text-surface`}><X size={9} strokeWidth={3} /></span>
          : i === c && state === 'live' ? <span aria-hidden className={`${round} bg-mint-text`}>{tick('stroke-surface')}</span>
          : done ? <span aria-hidden className={`${round} bg-mint-tint`}>{tick('stroke-mint')}</span>
          : now ? <span aria-hidden className={`${round} bg-coral-text text-surface`}>{i + 1}</span>
          : <span aria-hidden className={`${round} border border-line-strong text-ink-soft`}>{i + 1}</span>
        const words = now
          ? `font-semibold ${state === 'failed' ? 'text-danger-text' : state === 'live' ? 'text-mint-text' : 'text-ink'}`
          : 'font-medium text-ink-soft'
        return (
          <li key={s.id} aria-current={i === c ? 'step' : undefined} className={`flex items-center gap-2 ${i < STEPS.length - 1 ? 'flex-1' : ''}`}>
            <span className={`inline-flex shrink-0 items-center gap-[6px] ${!done && !now ? 'opacity-55' : ''}`}>
              {disc}
              <span className={`text-[11px] leading-none ${words}`}>{s.label}</span>
            </span>
            {i < STEPS.length - 1 ? <span aria-hidden className={`h-px flex-1 ${i < c ? 'bg-mint/40' : 'bg-line'}`} /> : null}
          </li>
        )
      })}
    </ol>
  )
}

/** S8d's confetti, in the frame's own pieces and places (`S8 Deploy.dc.html:188-198`). It falls in ONCE, on the frame it
 *  mounts (UX-DR15: the product's one confetti moment), through the Web Animations API — and under
 *  `prefers-reduced-motion: reduce` it is simply drawn where it lands, still. */
const PIECES: readonly { rect?: [number, number, number]; circle?: [number, number, number]; fill: 'coral' | 'marigold' }[] = [
  { rect: [40, 30, -24], fill: 'coral' }, { rect: [74, 14, 18], fill: 'marigold' }, { rect: [118, 8, -10], fill: 'coral' },
  { rect: [160, 16, 28], fill: 'marigold' }, { rect: [196, 34, -32], fill: 'coral' }, { circle: [58, 52, 2.4], fill: 'marigold' },
  { circle: [98, 34, 2], fill: 'coral' }, { circle: [142, 30, 2.4], fill: 'marigold' }, { circle: [182, 48, 2], fill: 'coral' },
]
function Confetti() {
  const drawn = useRef<SVGSVGElement>(null)
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    drawn.current?.querySelectorAll('[data-piece]').forEach((piece, i) =>
      piece.animate([{ transform: 'translateY(-36px)', opacity: 0 }, { transform: 'translateY(0)', opacity: 1 }], { duration: 700, delay: i * 40, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)', fill: 'backwards' }))
  }, [])
  return (
    <svg ref={drawn} data-confetti aria-hidden width="240" height="100" viewBox="0 0 240 100" className="pointer-events-none absolute left-1/2 top-[44px] -translate-x-1/2">
      {PIECES.map((p, i) => (
        <g key={i} data-piece>
          {p.rect ? (
            <rect x={p.rect[0]} y={p.rect[1]} width="7" height="3" rx="1.5" className={p.fill === 'coral' ? 'fill-coral' : 'fill-marigold'} transform={`rotate(${p.rect[2]} ${p.rect[0] + 3} ${p.rect[1] + 1})`} />
          ) : p.circle ? (
            <circle cx={p.circle[0]} cy={p.circle[1]} r={p.circle[2]} className={p.fill === 'coral' ? 'fill-coral' : 'fill-marigold'} />
          ) : null}
        </g>
      ))}
    </svg>
  )
}

/* ─────────────────────────────────────────────── the wizard ─────────────────────────────────────────────── */

type Answer = { ok: true; job: string } | { ok: false; status: number }
/** R-260's row: still reading, read (the posts no page lists), or the site's posts could not be read */
type PostsCheck = { kind: 'reading' } | { kind: 'read'; unlisted: readonly { title: string }[] } | { kind: 'unread' } | null
type Pressed = 'start' | 'ship' | 'cancel' | 'activate' | null

/** where the row stands, to wait past after a press: its stage and every stage edge it has recorded */
const standing = (v: DeployView) => `${v.job.stage}:${JSON.stringify(v.job.timings)}`

/** a blocked Pre-flight stores the gate's first blocking finding; every other failure is AD-24's envelope */
const isFinding = (e: DeployView['job']['error']): e is Finding => e !== null && 'level' in e

export function DeployWizard({
  request,
  projectId,
  ship,
  siteTitle,
  routes,
  routesFile,
  names,
  prefix,
  session,
  flush,
  readPosts,
  canvasHref,
  onClose,
}: {
  request: ShipRequest
  projectId: string
  ship: ShipState | undefined
  /** the linked site's name as the editor reads it (`EditorSite.title`), else its host */
  siteTitle: string | null
  /** the stored routing, parsed (`EditorData.routes`) — R-260's check reads it */
  routes: RoutesConfig | null
  /** `routesYaml(routes)`: the project's routing file, or null while it has none (Ghost's default, or unreadable) */
  routesFile: string | null
  /** the Routes Manager templates' names, by canvas (`namesOf`) — a finding's place */
  names: Readonly<Record<string, string>>
  /** `/app` where the page itself is under it (localhost), else '' */
  prefix: string
  /** this tab's edit-lock session (`lib/lock-client.ts`) */
  session: () => string
  /** the editor's flush, awaited; true when nothing is left unsent */
  flush: () => Promise<boolean>
  /** the linked site's published posts through the canvas's own Content API reader, or null where they cannot be read */
  readPosts: () => Promise<readonly Row[] | null>
  /** where a canvas lives — "Fix in editor" goes there */
  canvasHref: (canvas: Canvas) => string
  /** the wizard closed; `shipped` when a job reached its ending, so the bar re-reads its label and versions */
  onClose: (shipped: boolean) => void
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  const body = useRef<HTMLDivElement>(null)
  /** R-264 (a): Deploy only greyed while this project's theme is live on the site — and a wizard asked to open on it (a
   *  restored D8g ask) opens on Deploy & activate instead */
  const uploadBlocked = uploadOnlyBlock(ship)
  const [mode, setMode] = useState<Mode>(request.mode === 'upload' && uploadBlocked !== null ? 'activate' : request.mode)
  const [job, setJob] = useState<string | null>(null)
  const [view, setView] = useState<DeployView | null>(null)
  const [pressed, setPressed] = useState<Pressed>(null)
  /** a press refused before any work started: unsent edits, the lock gone, the route not reached */
  const [refused, setRefused] = useState<string | null>(null)
  const [posts, setPosts] = useState<PostsCheck>(null)
  const [tick, setTick] = useState(0)
  const [said, say] = useSaid()
  /** the row's standing when a press was sent — it is read until it has moved past it */
  const waitFor = useRef<string | null>(null)
  /** the last stage and sentence the polite region said */
  const lastSaid = useRef('')
  const alive = useRef(true)
  const route = `${prefix}${deployPath(projectId)}`
  const site = ship?.site ?? null
  const host = site?.host ?? ''

  useEffect(() => {
    alive.current = true
    const el = dialog.current
    if (el && !el.open) {
      el.showModal()
      // focus moves IN: onto the choice in force, else the first control
      ;(el.querySelector<HTMLElement>('input[type="radio"]:checked') ?? el.querySelector<HTMLElement>('button, a[href]'))?.focus()
    }
    return () => {
      alive.current = false
    }
  }, [])

  // A STEP THAT REPLACES THE CONTROL HOLDING FOCUS (Run checks, Cancel, Ship it) must not drop focus out of the modal: the
  // step itself takes it, and the polite region says what changed
  useEffect(() => {
    const el = dialog.current
    if (el?.open && !el.contains(document.activeElement)) body.current?.focus()
  })

  const post = async (call: DeployRequest): Promise<Answer> => {
    try {
      const answer = await fetch(route, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(call), signal: AbortSignal.timeout(15_000) })
      if (!answer.ok) return { ok: false, status: answer.status }
      const { job: id } = (await answer.json()) as { job?: unknown }
      return typeof id === 'string' ? { ok: true, job: id } : { ok: false, status: 0 }
    } catch {
      return { ok: false, status: 0 }
    }
  }
  const back = () => {
    waitFor.current = null
    lastSaid.current = ''
    setJob(null)
    setView(null)
    setPressed(null)
    setPosts(null)
  }

  // THE READ: once a second while the row moves, or until it has moved past where a press found it.
  // ponytail: a route that never answers is asked again each second for as long as the wizard is open; add a ceiling if
  // that ever costs more than one request a second
  useEffect(() => {
    if (job === null) return
    if (view !== null && waitFor.current !== null && standing(view) !== waitFor.current) {
      waitFor.current = null
      setPressed((was) => (was === 'cancel' && CANCELLABLE.includes(view.job.stage) ? was : null))
    }
    if (view !== null && !isMoving(view.job.stage) && waitFor.current === null) return
    const timer = setTimeout(async () => {
      try {
        const answer = await fetch(`${route}?job=${encodeURIComponent(job)}`, { signal: AbortSignal.timeout(10_000) })
        if (!alive.current) return
        if (answer.status === 404) return back()
        if (answer.ok) return setView((await answer.json()) as DeployView)
      } catch {
        // not reached: asked again on the next turn
      }
      if (alive.current) setTick((n) => n + 1)
    }, view === null ? 0 : 1000)
    return () => clearTimeout(timer)
  }, [job, view, tick])

  const stage: Stage | null = view === null ? (job === null ? null : 'queued') : view.job.stage
  const timings = view?.job.timings ?? {}
  const at: Step = stage === null ? 'destination' : stepOf(stage, timings)
  const ending = view === null ? null : endingOf(view.job.stage, view.deploy, timings)
  /** the version this job ships, else the next one */
  const n = view?.deploy ? versionNumber(view.deploy.version) || (ship?.n ?? 1) : (ship?.n ?? 1)
  const prev = view === null ? (ship?.prev ?? null) : view.previous
  const major = view?.deploy?.gscan?.major ?? (Number(site?.version?.split('.')[0]) || 6)
  const checked = checkRows({ gscan: view?.deploy?.gscan ?? null, quality: view?.deploy?.quality ?? null }, major, ship?.required ?? [], names)
  // the checks FINISHED when their verdicts are stored — a Checking that ended on a failure stored none (the review, 2026-10-19)
  const checksDone = stage === 'awaiting_ship' || (timings.checking?.ms !== undefined && view?.deploy?.gscan != null)
  const filtered = routes !== null && routes.collections.some((c) => nodeOf(c.filter) !== null)
  const error = view?.job.error ?? null

  // a cancelled job is back at Destination, with nothing left of it
  useEffect(() => {
    if (stage === 'cancelled') back()
  }, [stage])

  /** THE REASON SHIP IT IS GREYED, when Pre-flight blocked: the gate's count, S9b's routing line, the way out of an unreadable
   *  routing, or a refusal's plain words and its link — never a `compile_failed` detail */
  const block: { reason: string; link?: { words: string; href: string } } | null = (() => {
    if (stage !== 'failed' || at !== 'check') return null
    if (isFinding(error) && error.code === CHECK_FAILED) return { reason: error.action ?? W.infrastructure }
    if (isFinding(error) || (error === null && checked.blocked)) return { reason: W.fixErrors(Math.max(1, checked.errors)) }
    if (error === null) return { reason: W.infrastructure }
    if (error.code === 'routes_invalid') return { reason: `${error.message} ${W.routesBlocked}` }
    if (error.code === 'routes_unreadable') return { reason: W.routesUnreadable, link: { words: W.routesStartAgain, href: `${prefix}${resetRoutingPath(projectId)}` } }
    if (error.code === 'compile_failed') return { reason: W.ourFault }
    return { reason: error.message, ...(error.action !== undefined && error.href !== undefined ? { link: { words: error.action, href: hrefOn(prefix, error.href) } } : {}) }
  })()
  const failedAt: 'compiling' | 'checking' | 'uploading' | 'activating' =
    timings.activating !== undefined ? 'activating' : timings.uploading !== undefined ? 'uploading' : timings.checking !== undefined ? 'checking' : 'compiling'

  /* ONE POLITE REGION: each stage as it starts, and the outcome once (its heading). Keyed on the stage and the sentence, so
     a stale artefact's second Compiling is said again and a poll that changes nothing says nothing. */
  const sentence: string | null =
    stage === 'compiling' ? W.sayCompiling
    : stage === 'checking' ? W.sayChecking
    : stage === 'awaiting_ship' ? W.sayChecked(checked.errors, checked.warnings)
    : stage === 'uploading' ? W.sayUploading
    : stage === 'activating' ? W.sayActivating(n)
    : stage === 'done' ? (ending === 'live' ? W.liveTitle : ending === 'notLive' ? W.notLiveTitle : W.uploadOnlyTitle)
    : stage === 'failed' ? (at === 'ship' ? W.stageFailed(STAGE_NAMES[failedAt]) : checksDone ? W.sayChecked(checked.errors, checked.warnings) : block?.reason ?? null)
    : null
  useEffect(() => {
    const key = `${stage}:${sentence}`
    if (sentence === null || key === lastSaid.current) return
    lastSaid.current = key
    say(sentence)
  }, [stage, sentence])

  /** Run checks: the editor's flush first — work it cannot send is work the compile would not see */
  const runChecks = async () => {
    if (pressed !== null || site === null) return
    setPressed('start')
    setRefused(null)
    const sent = await flush()
    if (!alive.current) return
    const answer = sent ? await post({ intent: 'preflight', session: session(), mode }) : null
    if (!alive.current) return
    if (answer === null || !answer.ok) {
      const why = answer === null ? W.editsUnsent : answer.status === 423 ? LOCK_COPY.reading : answer.status === 409 ? W.noSite : W.infrastructure
      setPressed(null)
      setRefused(why)
      say(why)
      return
    }
    setPressed(null)
    setView(null)
    setJob(answer.job)
    // R-260 — read in the browser while the server checks run, through the canvas's own reader (routine call 23)
    if (filtered) {
      setPosts({ kind: 'reading' })
      void readPosts().then((rows) => {
        if (!alive.current) return
        setPosts(rows === null ? { kind: 'unread' } : { kind: 'read', unlisted: unlistedPosts(routes, rows as readonly ListedPost[], new Date().toISOString()) })
      })
    }
  }

  /** a press on a job that is already there (Ship it, Cancel, Re-activate): sent, then the row is read until it moves */
  const press = async (intent: 'ship' | 'cancel' | 'activate') => {
    if (pressed !== null || job === null || view === null) return
    setPressed(intent)
    setRefused(null)
    waitFor.current = standing(view)
    const answer = await post(intent === 'ship' ? { intent, session: session(), job, mode } : { intent, session: session(), job })
    if (!alive.current) return
    if (!answer.ok) {
      waitFor.current = null
      setPressed(null)
      // 409: the row has moved on from where this press found it — read it again rather than say anything. 422: the route
      // refused a Deploy only because its record says this project's theme is live (R-264 (a)) — the caption's own sentence,
      // the server's record taken over this page's older one
      if (answer.status !== 409) {
        const why = answer.status === 423 ? LOCK_COPY.reading : answer.status === 422 ? (uploadOnlyBlock(ship === undefined ? undefined : { ...ship, liveHere: true }) ?? W.infrastructure) : W.infrastructure
        setRefused(why)
        say(why)
      }
    }
    setTick((t) => t + 1)
  }

  /** once it starts, it finishes: Esc and the backdrop do nothing while uploading or activating, or once Ship it is sent */
  const unstoppable = (stage !== null && UNSTOPPABLE.includes(stage)) || pressed === 'ship' || pressed === 'activate'
  const close = () => dialog.current?.close()

  const footerCaption = (id: string, text: string, link?: { words: string; href: string }) => (
    <p id={id} className="text-right text-[11.5px] leading-[1.5] text-ink-soft">
      {text}
      {link === undefined ? null : (
        <>
          {' '}
          <Link href={link.href} onClick={close} className={`font-semibold text-coral-text ${ring}`}>
            {link.words}
          </Link>
        </>
      )}
    </p>
  )

  /* ── S8a · Destination ── */
  const destination = (
    <div className="flex flex-col gap-5">
      <div className="flex items-start justify-between">
        <h2 id="deploy-title" className={`m-0 ${wideTitle}`}>{W.header}</h2>
        <button type="button" aria-label={W.close} onClick={close} className={`mt-1 rounded-sm text-ink-soft transition-colors hover:text-ink ${ring}`}>
          <X size={16} />
        </button>
      </div>
      <Rail at="destination" state="current" />
      {site === null ? (
        // no connected linked site: said, with the way to one — no Run checks (the matrix's row)
        <div className="flex flex-col items-start gap-3 rounded-thumb border border-line p-[13px]">
          <p className="text-ui-dense leading-[1.5] text-ink">{W.noSite}</p>
          <Link href={`${prefix}/sites`} onClick={close} className={`inline-flex h-9 items-center rounded-thumb border border-line bg-surface px-4 text-ui-dense font-semibold text-ink transition-colors hover:bg-paper ${ring}`}>
            {W.goToSites}
          </Link>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-[11px] rounded-thumb border border-line p-[11px_13px]">
            <span aria-hidden className="flex size-[34px] shrink-0 items-center justify-center rounded-sm bg-ink font-display text-[16px] font-bold text-paper">
              {(siteTitle ?? host).slice(0, 1).toUpperCase()}
            </span>
            <span className="flex min-w-0 flex-col gap-px">
              <span className="truncate text-ui-dense font-semibold text-ink">{siteTitle ?? host}</span>
              <span className="truncate font-mono text-helper-caption text-ink-soft [font-variant-ligatures:none]">{host}</span>
            </span>
            {site.capability === 'preview_only' ? (
              <span className="ml-auto inline-flex shrink-0 items-center gap-[6px] rounded-pill bg-marigold-tint px-[10px] py-[3px] text-helper-caption font-semibold text-marigold-text">
                <InfoCircle size={11} />
                {PREVIEW_COPY.chip}
              </span>
            ) : (
              <span className="ml-auto inline-flex shrink-0 items-center gap-[5px] text-control-label font-medium text-mint-text">
                <span aria-hidden className="size-[6px] rounded-full bg-mint" />
                {W.connected}
              </span>
            )}
          </div>
          {site.capability === 'preview_only' ? (
            // B15's own words, in its sky panel — a plan that takes no custom theme has nothing to check (the matrix's row)
            <div className="flex gap-[11px] rounded-thumb bg-sky-tint p-[13px_15px] text-sky-text">
              <InfoCircle size={15} className="mt-[2px] shrink-0" />
              <div className="flex flex-col gap-[6px]">
                <h3 className="m-0 text-ui-dense font-semibold">{PREVIEW_COPY.title}</h3>
                <p className="text-[12.5px] leading-[1.55]">{PREVIEW_COPY.body}</p>
              </div>
            </div>
          ) : (
            <>
              {/* the theme that will be created, in mono (FR-J10; EXPERIENCE's "plus one row under the destination card") */}
              <div className="flex items-center gap-[10px] rounded-thumb border border-line p-[11px_13px]">
                <span className="text-control-label text-ink-soft">{W.theme}</span>
                <span data-theme-name className="ml-auto truncate font-mono text-[12.5px] font-medium text-ink [font-variant-ligatures:none]">{ship?.themeName}</span>
              </div>
              <fieldset className="m-0 flex flex-col gap-[10px] border-0 p-0">
                <legend className="sr-only">{W.header}</legend>
                <RadioCard name="deploy-mode" value="activate" checked={mode === 'activate'} title={W.activate} consequence={W.activateCard(n)} onChange={() => setMode('activate')} />
                <RadioCard
                  name="deploy-mode"
                  value="upload"
                  checked={mode === 'upload'}
                  title={W.uploadOnly}
                  consequence={W.uploadOnlyCard(n, prev)}
                  onChange={() => setMode('upload')}
                  {...(uploadBlocked === null ? {} : { greyed: { reason: uploadBlocked } })}
                />
              </fieldset>
              <div className="flex flex-col gap-[6px]">
                <div className="flex items-center">
                  <VersionChip>{W.chip(n, prev)}</VersionChip>
                  <Button
                    id="deploy-run"
                    variant="primary"
                    size={40}
                    className="ml-auto"
                    aria-disabled={pressed === 'start' || undefined}
                    aria-busy={pressed === 'start' || undefined}
                    aria-describedby={refused === null ? undefined : 'deploy-refused'}
                    onClick={() => void runChecks()}
                  >
                    <BusyLabel pending={pressed === 'start'} busy={W.starting}>
                      {W.runChecks}
                      <ChevronRight size={13} strokeWidth={1.8} />
                    </BusyLabel>
                  </Button>
                </div>
                {refused === null ? null : footerCaption('deploy-refused', refused)}
              </div>
            </>
          )}
        </>
      )}
    </div>
  )

  /* ── S8b · Pre-flight ── */
  const compileRow =
    timings.compiling?.ms !== undefined && timings.compiling.bytes !== undefined ? (
      <StageRow tone="done" label={W.compiled} meta={W.compiledMeta(timings.compiling.ms, timings.compiling.bytes)} />
    ) : stage === 'failed' && timings.compiling !== undefined ? (
      <StageRow tone="failed" label={W.stageFailed(STAGE_NAMES.compiling)} />
    ) : stage === 'failed' ? null : (
      <StageRow tone={stage === 'compiling' ? 'running' : 'pending'} label={W.compilingRow} />
    )
  const checkRow = checksDone ? (
    <StageRow
      tone={checked.errors > 0 ? 'failed' : 'done'}
      label={W.checked}
      chip={<ResultChip tone={checked.errors > 0 ? 'failed' : checked.warnings > 0 ? 'warned' : 'clean'}>{W.checkedMeta(checked.errors, checked.warnings)}</ResultChip>}
    />
  ) : stage === 'failed' && timings.checking !== undefined ? (
    <StageRow tone="failed" label={W.stageFailed(STAGE_NAMES.checking)} />
  ) : stage === 'failed' ? null : (
    <StageRow tone={stage === 'checking' ? 'running' : 'pending'} label={W.checkingRow} />
  )
  const canShip = stage === 'awaiting_ship'
  const preflight = (
    <div className="flex flex-col gap-[18px]">
      <Rail at="check" state={stage === 'failed' ? 'failed' : 'current'} />
      <div className="flex flex-col gap-1">
        <h2 id="deploy-title" className={`m-0 ${wideTitle}`}>{W.preflightTitle}</h2>
        <p className="text-ui-dense text-ink-soft">{W.preflightBody}</p>
      </div>
      <div className="flex flex-col gap-3 empty:hidden">
        {compileRow}
        {checkRow}
        {checksDone && (checked.passes.length > 0 || checked.rows.length > 0) ? (
          <div data-check-rows className="ml-[31px] overflow-hidden rounded-thumb border border-line">
            {checked.passes.map((p) => (
              <div key={p} className="flex items-center gap-[9px] border-b border-line px-[13px] py-[9px] last:border-b-0">
                <svg aria-hidden width="13" height="13" viewBox="0 0 24 24" fill="none" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 stroke-mint">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span className="flex-1 text-[12.5px] font-medium text-ink">{p}</span>
                <ResultChip tone="clean">{W.pass}</ResultChip>
              </div>
            ))}
            {checked.rows.map((row, i) => (
              <FindingRow key={`${i}:${row.code}`} row={row} n={i} href={row.canvas === null ? null : canvasHref(row.canvas)} onFix={close} />
            ))}
          </div>
        ) : null}
        {checksDone && routesFile !== null ? <StageRow tone="done" label={W.routesValid} chip={<ResultChip tone="clean">{W.pass}</ResultChip>} /> : null}
        {checksDone && filtered && posts !== null && posts.kind !== 'reading' ? (
          posts.kind === 'read' && posts.unlisted.length === 0 ? (
            <StageRow tone="done" label={W.everyPostListed} chip={<ResultChip tone="clean">{W.pass}</ResultChip>} />
          ) : (
            <div data-unlisted className="flex items-start gap-[11px]">
              <Mark tone="warning" />
              <p className="text-ui-dense leading-[1.5] text-ink">
                {posts.kind === 'unread'
                  ? W.unlistedUnread(host)
                  : posts.unlisted.length === 1
                    ? W.unlistedOne(posts.unlisted[0]?.title ?? '')
                    : W.unlistedMany(posts.unlisted.map((p) => p.title))}
              </p>
            </div>
          )
        ) : null}
      </div>
      <div className="flex flex-col gap-[6px]">
        <div className="flex items-center gap-[10px]">
          {canShip ? <span className="text-control-label text-ink-soft">{W.warningsOnly}</span> : null}
          {stage !== null && CANCELLABLE.includes(stage) ? (
            <Button
              id="deploy-cancel"
              variant="ghost"
              size={38}
              weight="font-medium"
              className="ml-auto"
              aria-disabled={pressed === 'cancel' || undefined}
              aria-busy={pressed === 'cancel' || undefined}
              onClick={() => void press('cancel')}
            >
              <BusyLabel pending={pressed === 'cancel'} busy={W.cancelling}>{W.cancel}</BusyLabel>
            </Button>
          ) : (
            <Button id="deploy-back" variant="ghost" size={38} weight="font-medium" className="ml-auto" onClick={back}>
              {W.back}
            </Button>
          )}
          <Button
            id="deploy-ship"
            variant="coral"
            size={40}
            className={block !== null ? 'cursor-not-allowed opacity-35' : ''}
            {...(block !== null
              ? greyedProps('deploy-ship', { reason: block.reason })
              : { 'aria-disabled': !canShip || pressed !== null || undefined, 'aria-busy': (stage !== null && isMoving(stage)) || pressed === 'ship' || undefined })}
            aria-describedby={block !== null ? 'deploy-ship-reason' : refused !== null ? 'deploy-refused' : undefined}
            onClick={canShip && block === null ? () => void press('ship') : undefined}
          >
            <BusyLabel pending={pressed === 'ship'} busy={W.shipping}>
              <Bolt size={14} strokeWidth={1.8} />
              {W.ship}
            </BusyLabel>
          </Button>
        </div>
        {block !== null ? footerCaption('deploy-ship-reason', block.reason, block.link) : refused !== null ? footerCaption('deploy-refused', refused) : null}
      </div>
    </div>
  )

  /* ── S8c · Shipping, and S8d′ · a failure while shipping ── */
  const bytes = view?.deploy?.bytes ?? timings.compiling?.bytes
  const shipping = (
    <div className="flex flex-col gap-[18px]">
      <Rail at="ship" state="current" />
      <div className="flex flex-col gap-1">
        <h2 id="deploy-title" className={`m-0 ${wideTitle}`}>{W.shippingTitle(n)}</h2>
        <p className="text-ui-dense text-ink-soft">{W.shippingBody}</p>
      </div>
      <div className="flex flex-col gap-[14px]">
        <StageRow tone={stage === 'uploading' ? 'running' : 'done'} label={W.uploadingRow} {...(bytes === undefined ? {} : { meta: themeSize(bytes) })} />
        {mode === 'activate' || timings.activating !== undefined ? <StageRow tone={stage === 'activating' ? 'running' : 'pending'} label={W.activatingRow(n)} /> : null}
      </div>
      <div className="flex items-center">
        <ResultChip tone="clean">{W.checksPassed(checked.errors)}</ResultChip>
        <span className="ml-auto flex items-center gap-[10px]">
          <span id="deploy-cancel-reason" className="text-[11.5px] text-ink-soft">{W.cannotCancel}</span>
          <button type="button" id="deploy-cancel" aria-disabled aria-describedby="deploy-cancel-reason" className={`h-9 cursor-not-allowed rounded-thumb px-[14px] text-ui-dense font-medium text-ink-soft opacity-35 ${ring}`}>
            {W.cancel}
          </button>
        </span>
      </div>
    </div>
  )
  const failure = error === null || isFinding(error) ? null : error
  const failedShip = (
    <div className="flex flex-col gap-[18px]">
      <Rail at="ship" state="failed" />
      <StageRow tone="failed" label={<span id="deploy-title">{W.stageFailed(STAGE_NAMES[failedAt])}</span>} />
      <div className="flex flex-col gap-1 rounded-thumb bg-danger-tint p-[14px_16px]">
        <span className="text-ui font-semibold text-ink">{failure?.message ?? W.infrastructure}</span>
        {failure?.detail !== undefined && failure.code !== 'compile_failed' ? <span className="text-control-label leading-[1.5] text-ink-soft">{failure.detail}</span> : null}
      </div>
      <div className="flex items-center justify-end gap-3">
        <Button variant="ghost" size={40} weight="font-medium" className="text-ui-dense" onClick={close}>
          {W.close}
        </Button>
        {failure?.action !== undefined && failure.href !== undefined ? (
          failure.href.startsWith('/') ? (
            <Link href={hrefOn(prefix, failure.href)} onClick={close} className={`inline-flex h-10 items-center gap-2 rounded bg-coral-text px-[22px] text-ui-dense font-semibold text-surface transition-colors hover:bg-coral-text-hover ${ring}`}>
              {failure.action === W.reconnect ? <Refresh size={13} strokeWidth={1.8} /> : null}
              {failure.action}
            </Link>
          ) : (
            <a href={failure.href} target="_blank" rel="noreferrer" className={`inline-flex h-10 items-center gap-2 rounded bg-coral-text px-[22px] text-ui-dense font-semibold text-surface transition-colors hover:bg-coral-text-hover ${ring}`}>
              {failure.action}
              <span className="sr-only"> {W.newTab}</span>
            </a>
          )
        ) : null}
      </div>
    </div>
  )

  /* ── S8d · Live, with the routing's ending ── */
  const total = (['compiling', 'checking', 'uploading', 'activating'] as const).reduce((ms, s) => ms + (timings[s]?.ms ?? 0), 0)
  const routing = timings.routes
  const live = (
    <div className="flex flex-col gap-[18px]">
      <Confetti />
      <Rail at="live" state="live" />
      <div className="flex flex-col items-center gap-[14px] pt-[6px] text-center">
        <svg aria-hidden width="56" height="56" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="11.2" className="stroke-mint-line" strokeWidth="0.7" />
          <circle cx="12" cy="12" r="10" className="fill-mint-tint" />
          <polyline points="7.5 12.5 10.8 15.8 16.5 9" className="stroke-mint" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <div className="flex flex-col gap-[6px]">
          <h2 id="deploy-title" className="m-0 font-display text-[24px] font-bold tracking-[-0.01em] text-ink">{W.liveTitle}</h2>
          <div className="flex items-center justify-center gap-2">
            {(([v, counts, time]) => (
              <>
                <VersionChip>{v}</VersionChip>
                <ResultChip tone={checked.errors > 0 ? 'failed' : checked.warnings > 0 ? 'warned' : 'clean'}>{counts}</ResultChip>
                <span className="font-mono text-helper-caption text-ink-soft [font-variant-ligatures:none]">{time}</span>
              </>
            ))(W.liveChips(n, checked.errors, checked.warnings, total))}
          </div>
        </div>
        {routing === undefined || routing.kind === 'none' ? null : routing.kind === 'live' ? (
          <p data-routes-ending="live" className="text-ui-dense text-ink">{W.routesLive(host)}</p>
        ) : routing.kind === 'failed' ? (
          <p data-routes-ending="failed" className="text-ui-dense leading-[1.5] text-ink">{W.routesFailed(routing.reason)}</p>
        ) : routing.kind === 'unverified' ? (
          site === null ? null : <VerifyRouting siteId={site.id} />
        ) : site !== null && view?.routesFile ? (
          <div className="w-full text-left">
            <RoutesFallback siteId={site.id} cause={routing.cause} file={view.routesFile} heading="h3" />
          </div>
        ) : null}
        <div className="flex items-center gap-3">
          {site === null ? null : (
            <a href={site.url} target="_blank" rel="noreferrer" className={`inline-flex h-[42px] items-center gap-2 rounded bg-coral-text px-6 text-ui font-semibold text-surface transition-colors hover:bg-coral-text-hover ${ring}`}>
              {W.viewSite.replace(/ ↗$/, '')}
              <ExternalLink size={13} strokeWidth={1.8} />
              <span className="sr-only"> {W.newTab}</span>
            </a>
          )}
          <Button variant="ghost" size={42} weight="font-medium" className="px-[18px]" onClick={close}>
            {W.done}
          </Button>
        </div>
      </div>
    </div>
  )

  /* ── D2e · D2f · on the site, not live ── */
  const [uploadedLabel, uploadedMeta] = apart(W.uploadedRow(bytes ?? 0, timings.uploading?.ms ?? 0))
  const [activatingLabel, activatingMeta] = apart(ending === 'notLive' ? W.activatingDidnt(n) : W.activatingNotRequested(n))
  const liveChip = W.liveChip(prev)
  const notLive = (
    <div className="flex flex-col gap-[18px]">
      <Rail at="live" state="waiting" />
      <div className="flex items-start gap-[13px]">
        <span aria-hidden className="flex size-11 shrink-0 items-center justify-center rounded-full bg-sky-tint text-sky-text">
          <Upload size={22} strokeWidth={1.8} />
        </span>
        <div className="flex flex-1 flex-col gap-[7px]">
          <h2 id="deploy-title" className="m-0 font-display text-[22px] font-bold leading-[1.2] tracking-[-0.01em] text-ink [text-wrap:pretty]">
            {ending === 'notLive' ? W.notLiveTitle : W.uploadOnlyTitle}
          </h2>
          <p className="text-[13.5px] leading-[1.6] text-ink [text-wrap:pretty]">{ending === 'notLive' ? W.notLiveBody(n, prev, host) : W.uploadOnlyBody(n, prev, host)}</p>
        </div>
      </div>
      <div className="flex flex-col gap-[11px]">
        <StageRow tone="done" label={uploadedLabel} meta={uploadedMeta} />
        <StageRow
          tone="info"
          label={activatingLabel}
          chip={<span className="rounded-pill border border-sky-line bg-sky-tint px-2 py-[2px] text-[10px] font-semibold text-sky-text">{activatingMeta}</span>}
        />
      </div>
      <div className="flex flex-col gap-[6px]">
        <div className="flex items-center gap-[10px]">
          {liveChip === null ? null : <VersionChip>{liveChip}</VersionChip>}
          <Button
            id="deploy-reactivate"
            variant="coral"
            size={42}
            className="ml-auto"
            aria-disabled={pressed === 'activate' || undefined}
            aria-busy={pressed === 'activate' || undefined}
            onClick={() => void press('activate')}
          >
            <BusyLabel pending={pressed === 'activate'} busy={W.activating}>
              <Bolt size={13} strokeWidth={1.8} />
              {W.reactivate(n)}
            </BusyLabel>
          </Button>
          <Button variant="secondary" size={42} className="px-5" onClick={close}>
            {W.leave}
          </Button>
        </div>
        {refused === null ? null : footerCaption('deploy-refused', refused)}
      </div>
    </div>
  )

  const step =
    at === 'destination' ? destination
    : at === 'check' ? preflight
    : at === 'ship' ? (stage === 'failed' ? failedShip : shipping)
    : ending === 'live' ? live
    : notLive

  return (
    <dialog
      ref={dialog}
      data-deploy-wizard={at}
      data-unstoppable={unstoppable || undefined}
      aria-labelledby="deploy-title"
      onClick={(event) => (unstoppable ? undefined : closeOnBackdrop(event))}
      // Esc closes at every step but these: the cancel is refused, and so is the keydown that would ask for it — a second
      // Esc after a refused cancel would otherwise close it anyway
      onCancel={(event) => (unstoppable ? event.preventDefault() : undefined)}
      onKeyDown={(event) => (event.key === 'Escape' && unstoppable ? event.preventDefault() : undefined)}
      onClose={() => {
        if (dialog.current?.open) return
        onClose(stage === 'done' || timings.uploading !== undefined)
      }}
      className="relative m-auto box-content max-h-[calc(100dvh-72px)] w-[520px] max-w-[calc(100vw-72px)] flex-col overflow-y-auto overflow-x-hidden rounded-lg bg-surface p-[26px] shadow-modal backdrop:bg-scrim open:flex"
    >
      <div ref={body} tabIndex={-1} className="outline-none">
        {step}
      </div>
      <p data-deploy-said aria-live="polite" className="sr-only">
        <span key={said.n}>{said.words}</span>
      </p>
    </dialog>
  )
}

/** S8b's finding row, collapsible (`S8 Deploy.dc.html:103-116`): its mark, its message, and "Fix in editor" where its file is a
 *  canvas's; opened, the message at 600 over its `detail`, `action` and place, every field as text. The whole row is the
 *  toggle — a button laid under it — so "Fix in editor" can sit before the chevron, as drawn. Errors open first. */
function FindingRow({ row, n, href, onFix }: { row: ReturnType<typeof checkRows>['rows'][number]; n: number; href: string | null; onFix: () => void }) {
  const [open, setOpen] = useState(row.level === 'error')
  const id = `deploy-finding-${n}`
  const error = row.level === 'error'
  return (
    <div
      data-finding={row.level}
      className={`relative flex gap-[9px] border-t border-line px-[13px] first:border-t-0 ${open ? `items-start py-[11px] ${error ? 'bg-danger-tint' : 'bg-marigold-tint-soft'}` : 'items-center py-[10px]'}`}
    >
      <button type="button" aria-expanded={open} aria-labelledby={id} onClick={() => setOpen(!open)} className={`absolute inset-0 ${ring}`} />
      {error ? <AlertCircle size={14} className="pointer-events-none relative mt-px shrink-0 text-danger-text" /> : <AlertTriangle size={14} strokeWidth={1.8} className="pointer-events-none relative mt-px shrink-0 text-marigold-text" />}
      <div className="pointer-events-none relative flex min-w-0 flex-1 flex-col gap-[3px]">
        <span id={id} className={`text-[12.5px] text-ink ${open ? 'font-semibold' : 'font-medium'}`}>{row.message}</span>
        {open ? (
          <>
            {row.detail === undefined ? null : <span className="text-control-label leading-[1.5] text-ink-soft">{row.detail}</span>}
            {row.action === undefined ? null : <span className="text-control-label leading-[1.5] text-ink-soft">{row.action}</span>}
            {row.place === null ? null : <span className="font-mono text-helper-caption text-ink-soft [font-variant-ligatures:none]">{row.place}</span>}
          </>
        ) : null}
      </div>
      {href === null ? null : (
        <Link href={href} onClick={onFix} className={`relative shrink-0 text-control-label font-medium text-coral-text ${ring}`}>
          {W.fixInEditor}
        </Link>
      )}
      {open ? <ChevronUp size={13} className="pointer-events-none relative mt-[2px] shrink-0 text-ink-soft" /> : <ChevronDown size={13} className="pointer-events-none relative shrink-0 text-ink-soft" />}
    </div>
  )
}

/** the unverified ending: its line and B16's own Verify upload (the Kit's `Submit`, `verifyRoutesAction`), with B16's answers */
function VerifyRouting({ siteId }: { siteId: string }) {
  const [said, verify] = useActionState(verifyRoutesAction, null)
  return (
    <div data-routes-ending="unverified" className="flex flex-col items-center gap-[10px]">
      <p className="text-ui-dense leading-[1.5] text-ink">{said?.kind === 'verified' ? RW.verified : W.routesUnverified}</p>
      {said?.kind === 'verified' ? null : (
        <form action={verify}>
          <input type="hidden" name="site_id" value={siteId} />
          <Submit variant="secondary" size={36} busy={RW.verifying}>{RW.verify}</Submit>
        </form>
      )}
      {said === null || said.kind === 'verified' ? null : <p role="status" className="text-[12.5px] leading-[1.55] text-ink-mid">{said.kind === 'notYet' ? RW.notYet : RW.unreachable}</p>}
    </div>
  )
}
