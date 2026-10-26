'use client'

import Link from 'next/link'
import { useActionState, useEffect, useRef, useState, type ReactNode } from 'react'
import { preload } from 'react-dom'
import { nodeOf, unlistedPosts, type ListedPost, type RoutesConfig } from '@inflozo/section-runtime/routes'
import type { Finding } from '@inflozo/theme-compiler/gate'
import { verifyRoutesAction } from '@/app/(app)/app/(authed)/sites/actions'
import { ResultChip, VersionChip } from '@/components/kit/badge'
import { Button, SplitButton } from '@/components/kit/button'
import { closeOnBackdrop, openOnCancel, wideTitle } from '@/components/kit/dialog'
import { greyedProps, ring } from '@/components/kit/greyed'
import { AlertCircle, AlertTriangle, Bolt, Check, ChevronDown, ChevronRight, ChevronUp, Copy, Download, ExternalLink, Eye, InfoCircle, Refresh, Upload, X } from '@/components/kit/icons'
import { TextInput } from '@/components/kit/input'
import { RadioCard } from '@/components/kit/radio-card'
import { Menu, type MenuItem } from '@/components/kit/select'
import { BusyLabel, Submit } from '@/components/kit/submit'
import { RoutesFallback } from '@/components/routes-fallback'
import {
  afterSafety, BACKUP_WORDS as BW, backupOwed, CANCELLABLE, CHECK_FAILED, checkRows, DEPLOY_WORDS as W, endingOf, isMoving, isSnapshotError, POSTS_CHECKED, SAFETY_PICTURE, SAFETY_WORDS as SN,
  safetyOffered, SNAPSHOT_WORDS as SNAP, STAGE_NAMES, stepNumber, stepOf, stepsFor, themeSize, UNSTOPPABLE, uploadOnlyBlock, versionNumber, type DeployRequest, type DeployView, type Mode,
  type RailStep, type ShipState, type Stage, type Step, type Timings,
} from '@/lib/deploy'
import {
  confirmAvailable, GATE_ROWS, HELP, NO_TICKS, reasonOf, snapshotDownloadPath, subLineOf, toggleConfirm, toggleRow, type GateTicks, type RowId,
} from '@/lib/backup-gate'
import { adminAt } from '@/lib/paywall'
import { CONNECT_MAX } from '@/lib/connect-rule'
import { deployPath, type Canvas } from '@/lib/editor'
import { preflightWarnings, rowCanvas, type PreflightInput, type PreflightRow } from '@/lib/preflight'
import { confirmedOf, SWITCH_WORDS as SW, switchPlan, type Confirmed, type SwitchAnswer, type SwitchPlan, type SwitchSite } from '@/lib/site-switch'
import { ownName, TRANSLATION_WORDS } from '@/lib/translations'
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
 * STORY 7.18b — CHOOSING THE SITE AND PRE-FLIGHT'S WARNINGS: S8a's Switch (`S8 Deploy.dc.html:54`) and Choose a site open a site
 * picker inside the wizard (undrawn: S8a's card per row, D4d's radio list and coral wash `D4 Dashboard Sheets and Blocks.dc.html:
 * 177-226`, S11's chips), its confirm S8e's dialog (`:337-345`) on Cancel — one plan, `lib/site-switch.ts`' `switchPlan`, for the
 * picker, the confirm and the server. Pre-flight's warning rows are S8b's own (`:103-116`), derived by `lib/preflight.ts` from the
 * compile's facts and the editor's state; the one blocking row is the server's RTL verdict. R-270's line sits under B15's panel.
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

/** STORY 7.20a — the Theme Download's address followed as a link would be: Story 2.5's route answers a 303 to Storage's signed URL,
 *  which serves the zip as an attachment, so the page stays where it is */
function follow(href: string) {
  const a = document.createElement('a')
  a.href = href
  a.click()
}

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

/** the rail, numbered from the steps that show (`stepsFor` — Story 7.19's Safety net on a first deploy that offers it, Story
 *  7.20a's Backup where it is owed): done steps mint-ticked, the current one coral — or red where it failed, green once Live — and
 *  the rest dimmed; D2e/D2f's Live is not reached (`waiting`). An ANSWERED Safety net and a CONFIRMED Backup stay ticked, back on
 *  Destination too (`answered`) */
function Rail({ at, state, steps, answered = {} }: { at: Step; state: 'current' | 'failed' | 'live' | 'waiting'; steps: readonly RailStep[]; answered?: { safety?: boolean; backup?: boolean } }) {
  const c = stepNumber(at, steps) - 1
  const long = steps.length > stepsFor({ safety: false, backup: false }).length
  const tick = (stroke: string) => (
    <svg aria-hidden width="10" height="10" viewBox="0 0 24 24" fill="none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={stroke}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
  return (
    <ol className="m-0 flex list-none items-center gap-2 p-0">
      {steps.map((s, i) => {
        const done = i < c || (i === c && state === 'live') || (((s.id === 'safety' && answered.safety) || (s.id === 'backup' && answered.backup)) === true && i !== c)
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
          <li key={s.id} aria-current={i === c ? 'step' : undefined} className={`flex items-center gap-2 ${i < steps.length - 1 ? 'flex-1' : ''}`}>
            <span className={`inline-flex shrink-0 items-center gap-[6px] ${!done && !now ? 'opacity-55' : ''}`}>
              {disc}
              {/* STORY 7.19 (extrapolated — no frame draws the longer rail narrow): below `tablet` a rail longer than an
                  ordinary deploy's names its current step alone, the others their discs, so the five never run off the card */}
              <span className={`whitespace-nowrap text-[11px] leading-none ${words} ${long && i !== c ? 'max-tablet:sr-only' : ''}`}>{s.label}</span>
            </span>
            {i < steps.length - 1 ? <span aria-hidden className={`h-px flex-1 ${long ? 'min-w-[10px]' : ''} ${i < c ? 'bg-mint/40' : 'bg-line'}`} /> : null}
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
      // ONCE (DW-378: the count is the journey's to read, so it is written, not left to the default)
      piece.animate([{ transform: 'translateY(-36px)', opacity: 0 }, { transform: 'translateY(0)', opacity: 1 }], { duration: 700, delay: i * 40, iterations: 1, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)', fill: 'backwards' }))
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
type PostsCheck = { kind: 'reading' } | { kind: 'read'; unlisted: readonly { title: string }[]; capped: boolean } | { kind: 'unread' } | null
/** Story 7.20a: `without` is B12b's Deploy without a snapshot — a Ship it, busy on its own button */
type Pressed = 'start' | 'ship' | 'without' | 'cancel' | 'activate' | null

/** where the row stands, to wait past after a press: its stage and every stage edge it has recorded */
const standing = (v: DeployView) => `${v.job.stage}:${JSON.stringify(v.job.timings)}`

/** DW-378 — the stages the row has recorded entering, in the order they started (`at`, then the stage table's own order):
 *  each the wizard says once, whether or not a read ever saw the row standing in it */
const SAID_STAGES = ['compiling', 'checking', 'snapshotting', 'uploading', 'activating'] as const
const entered = (timings: Timings): [(typeof SAID_STAGES)[number], string][] =>
  SAID_STAGES.flatMap((st) => {
    // Story 7.20a: a skipped capture (Deploy without a snapshot) entered no stage, so it has no `at` and is never said
    const at = (timings[st] as { at?: string } | undefined)?.at
    return at === undefined ? [] : [[st, at] as [(typeof SAID_STAGES)[number], string]]
  })
    .sort((a, b) => (a[1] < b[1] ? -1 : a[1] > b[1] ? 1 : SAID_STAGES.indexOf(a[0]) - SAID_STAGES.indexOf(b[0])))

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
  client,
  onSwitch,
  onRelink,
  relinking,
  answered,
  onAnswered,
  addToken,
  decline,
  confirmed,
  onConfirmed,
  confirmBackup,
  downloadTheme,
  downloadRoutes,
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
  /** the editor's flush, awaited; null when nothing is left unsent, else the sentence that says why — Can't sync's own when the
   *  save was refused for good (R-275, Story 7.18c), R-274's when the edits are merely not sent yet */
  flush: () => Promise<string | null>
  /** R-260's read (R-271): the linked site's NEWEST published posts, up to `POSTS_CHECKED`, through a reader of their own —
   *  never the canvas's — with the site's total; null where they cannot be read */
  readPosts: () => Promise<{ rows: readonly Row[]; total: number } | null>
  /** where a canvas lives — "Fix in editor" goes there */
  canvasHref: (canvas: Canvas) => string
  /** Story 7.18b — the editor's own state Pre-flight's warning rows read beside the compile's facts, after Run checks' flush */
  client: Pick<PreflightInput, 'docs' | 'library' | 'viewed' | 'members' | 'postsPerPage' | 'listed'>
  /** Story 7.18b — choosing a site: the editor flushes, then asks `switchSite` (a confirm owed comes back as one) */
  onSwitch: (siteId: string, confirmed: Confirmed) => Promise<SwitchAnswer>
  /** Story 7.18b — the project's link changed (a switch landed, or Ship it found it changed): the editor re-reads the page, so
   *  the canvas, the members record and Ship it follow the new site, and the wizard opens again on Destination */
  onRelink: (mode: Mode) => void
  /** the editor's re-read after `onRelink` is in flight — a switch's press stays busy until it lands (R-98) */
  relinking: boolean
  /** STORY 7.19 — the site this page has already answered the Safety net for (Add token or Not now), else null: a reopen in
   *  the same page never asks again, before the next read of the stored state does the same */
  answered: string | null
  /** …and the answer, told to the editor */
  onAnswered: (siteId: string) => void
  /** STORY 7.19 — Add token (`addSafetyToken`): ok, or the one sentence for why the token was not kept (R-280). The site is
   *  the one D1b names: the action refuses should the project's link have moved since (Story 7.19's review) */
  addToken: (siteId: string, token: string) => Promise<{ ok: true } | { refused: string }>
  /** STORY 7.19 — Not now (`declineSafetyNet`): recorded on the site D1b named, never awaited by the deploy */
  decline: (siteId: string) => Promise<{ ok: boolean }>
  /** STORY 7.20a — the site this page already confirmed the Backup step for, else null: a reopen in the same page skips it, before
   *  the next read of the stored state (`backup_confirmed_at`) does the same */
  confirmed: string | null
  /** …and the confirmation, told to the editor */
  onConfirmed: (siteId: string) => void
  /** STORY 7.20a — Run checks on Backup (`confirmBackup`): recorded on the site, never awaited by the deploy */
  confirmBackup: (siteId: string) => Promise<{ ok: boolean }>
  /** STORY 7.20a — the Theme row's Download (`downloadLiveTheme`): the snapshot row's id to follow, or a sentence */
  downloadTheme: (siteId: string) => Promise<{ ok: true; id: string } | { said: string }>
  /** STORY 7.20a — the `routes.yaml` row's Download (`downloadRoutes`, R-282): the live file, or a sentence */
  downloadRoutes: (siteId: string) => Promise<{ ok: true; file: string } | { said: string }>
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
  /** Story 7.18b — Destination's picker (S8a's Switch, or Choose a site): the row chosen, the confirm owed, and a refusal */
  const [picking, setPicking] = useState(false)
  const [chosen, setChosen] = useState<string | null>(null)
  const [owed, setOwed] = useState<{ site: SwitchSite; plan: SwitchPlan } | null>(null)
  const [switching, setSwitching] = useState<'use' | 'confirm' | null>(null)
  const [switchRefused, setSwitchRefused] = useState<string | null>(null)
  const confirmRef = useRef<HTMLDialogElement>(null)
  const pickerRef = useRef<HTMLDivElement>(null)
  const [tick, setTick] = useState(0)
  const [said, say] = useSaid()
  /** the row's standing when a press was sent — it is read until it has moved past it */
  const waitFor = useRef<string | null>(null)
  /** every stage start and ending the polite region has said for this job (DW-378: each stage `stage_timings` shows entered) */
  const heard = useRef(new Set<string>())
  const alive = useRef(true)
  const route = `${prefix}${deployPath(projectId)}`
  const site = ship?.site ?? null
  const host = site?.host ?? ''
  /** STORY 7.19 — the first deploy's Safety net (D1b/D1c), FIXED AT MOUNT: offered by the server's truth (`safetyOffered`) unless
   *  this page already answered it for the site — so a step answered in this mount stays on the rail, ticked, all session */
  const [safety] = useState(() => safetyOffered(ship) && (site === null || answered !== site.id))
  // …and D1b's picture asked for at once, so it is there when Next is pressed rather than arriving after (Story 7.19's review)
  if (safety) preload(SAFETY_PICTURE.src, { as: 'image' })
  /** …answered in this mount (Add token kept, or Not now): Destination then shows Run checks again (a cancelled job's way back
   *  included), and the rail keeps Safety net ticked */
  const [safeAnswered, setSafeAnswered] = useState(false)
  /** while no job exists: Destination, D1b's offer, D1c's decline, or Story 7.20a's Backup step */
  const [local, setLocal] = useState<'destination' | 'offer' | 'declined' | 'backup'>('destination')
  const [token, setToken] = useState('')
  const [tokenRefused, setTokenRefused] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  /** STORY 7.20a — the first deploy's Backup step (D1d, as R-283 cut it), FIXED AT MOUNT as the Safety net is: owed by the server's truth
   *  (`backupOwed`) unless this page already confirmed it for the site — so a step confirmed in this mount stays ticked */
  const [backup] = useState(() => backupOwed(ship) && (site === null || confirmed !== site.id))
  const steps = stepsFor({ safety, backup })
  /** …confirmed in this mount (Run checks on Backup): Destination then shows Run checks, and the rail keeps Backup ticked */
  const [backupDone, setBackupDone] = useState(false)
  /** the gate's ticks, kept while the wizard stays mounted (Back to Destination keeps them) */
  const [ticks, setTicks] = useState<GateTicks>(NO_TICKS)
  /** a token kept in this mount — the Safety net's Add token, or B12b's — so the Theme row offers its Download at once */
  const [tokenKept, setTokenKept] = useState(false)
  /** each Download's press in flight, and its sentence where it failed (or said the theme is Inflozo's own) */
  const [fetching, setFetching] = useState<'theme' | 'routes' | null>(null)
  const [fetched, setFetched] = useState<Partial<Record<'theme' | 'routes', string>>>({})
  /** STORY 7.20a — B12b's Add token: D1b's view over a job resting with a capture's answer, Back returning to B12b */
  const [retoken, setRetoken] = useState(false)

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
    heard.current = new Set()
    setJob(null)
    setView(null)
    setPressed(null)
    setPosts(null)
    setLocal('destination')
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
  const error = view?.job.error ?? null
  /** STORY 7.20a — a capture that did not finish rests the job back at `awaiting_ship` with its answer (B12b), at Ship */
  const captureFailed = stage === 'awaiting_ship' && isSnapshotError(error)
  const at: Step =
    stage === null ? (local === 'destination' ? 'destination' : local === 'backup' ? 'backup' : 'safety')
    : captureFailed ? 'ship'
    : stepOf(stage, timings)
  const ending_ = view === null ? null : endingOf(view.job.stage, view.deploy, timings)
  /** the version this job ships, else the next one */
  const n = view?.deploy ? versionNumber(view.deploy.version) || (ship?.n ?? 1) : (ship?.n ?? 1)
  const prev = view === null ? (ship?.prev ?? null) : view.previous
  const major = view?.deploy?.gscan?.major ?? (Number(site?.version?.split('.')[0]) || 6)
  const checked = checkRows({ gscan: view?.deploy?.gscan ?? null, quality: view?.deploy?.quality ?? null }, major, ship?.required ?? [], names)
  // the checks FINISHED when their verdicts are stored — a Checking that ended on a failure stored none (the review, 2026-10-19)
  const checksDone = stage === 'awaiting_ship' || (timings.checking?.ms !== undefined && view?.deploy?.gscan != null)
  const filtered = routes !== null && routes.collections.some((c) => nodeOf(c.filter) !== null)

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
  // a Re-activate DW-374 refused (the deploy still `uploaded`, the project's site changed) failed at activating, which it never
  // entered: nothing was sent
  const reactivateRefused = stage === 'failed' && error !== null && !isFinding(error) && (error.code === 'site_changed' || error.code === 'site_unlinked') && view?.deploy?.status === 'uploaded'
  const failedAt: 'compiling' | 'checking' | 'snapshotting' | 'uploading' | 'activating' =
    timings.activating !== undefined || reactivateRefused ? 'activating' : timings.uploading !== undefined ? 'uploading'
    : timings.snapshotting?.at !== undefined ? 'snapshotting' : timings.checking !== undefined ? 'checking' : 'compiling'

  /* ONE POLITE REGION: each stage as it starts, and the outcome once (its heading). DW-378 — EVERY STAGE `stage_timings` SHOWS
     ENTERED is said, in order, even one that began and ended between two of the wizard's one-second reads (Checking ran 0.9 s
     on production): the stages entered since the last read are said together, in the order they started. Each start is keyed
     on its own `at`, so a stale artefact's second Compiling is said again and a read that changes nothing says nothing. */
  // a refusal in AD-24's envelope after the checks finished (DW-374's two, Ship it's own) is said in its own words — the checks'
  // outcome was said already (the Review, 2026-10-19)
  const envelope = error !== null && !isFinding(error)
  const ending: string | null =
    stage === 'awaiting_ship' ? (captureFailed ? SNAP.failedTitle : W.sayChecked(checked.errors, checked.warnings))
    : stage === 'done' ? (ending_ === 'live' ? W.liveTitle : ending_ === 'notLive' ? W.notLiveTitle : W.uploadOnlyTitle)
    : stage === 'failed' ? (at === 'ship' ? W.stageFailed(STAGE_NAMES[failedAt]) : checksDone && !envelope ? W.sayChecked(checked.errors, checked.warnings) : block?.reason ?? null)
    : null
  const starts = entered(timings)
  const startsKey = starts.map(([st, t]) => `${st}@${t}`).join(',')
  /** an ending is keyed on the last stage it followed, so the same ending after a Re-activate is said again (the Review) */
  const endKey = `end:${stage}:${ending}:${starts.at(-1)?.[1] ?? ''}`
  useEffect(() => {
    const fresh: string[] = []
    for (const [st, t] of starts) {
      const key = `start:${st}:${t}`
      if (heard.current.has(key)) continue
      heard.current.add(key)
      fresh.push(st === 'compiling' ? W.sayCompiling : st === 'checking' ? W.sayChecking : st === 'snapshotting' ? SNAP.say : st === 'uploading' ? W.sayUploading : W.sayActivating(n))
    }
    if (ending !== null && !heard.current.has(endKey)) {
      heard.current.add(endKey)
      fresh.push(ending)
    }
    if (fresh.length > 0) say(fresh.join(' '))
  }, [startsKey, stage, ending, endKey])

  /** Run checks: the editor's flush first — work it cannot send is work the compile would not see */
  const runChecks = async (): Promise<boolean> => {
    if (pressed !== null || site === null) return false
    setPressed('start')
    setRefused(null)
    const unsent = await flush()
    if (!alive.current) return false
    const answer = unsent === null ? await post({ intent: 'preflight', session: session(), mode }) : null
    if (!alive.current) return false
    if (answer === null || !answer.ok) {
      // Pre-flight's own flush tells the truth (DW-304): the editor's sentence for what it could not send, word for word
      const why = answer === null ? (unsent ?? W.editsUnsent) : answer.status === 423 ? LOCK_COPY.reading : answer.status === 409 ? W.noSite : W.infrastructure
      setPressed(null)
      setRefused(why)
      say(why)
      return false
    }
    setPressed(null)
    setView(null)
    setJob(answer.job)
    // R-260 — read in the browser while the server checks run (routine call 23), the newest `POSTS_CHECKED` through a reader of
    // their own (R-271): the canvas's allowance is never touched, and Ship it never waits for it
    if (filtered) {
      setPosts({ kind: 'reading' })
      void readPosts().then((read) => {
        if (!alive.current) return
        setPosts(read === null ? { kind: 'unread' } : {
          kind: 'read',
          unlisted: unlistedPosts(routes, read.rows as readonly ListedPost[], new Date().toISOString()),
          capped: read.total > POSTS_CHECKED,
        })
      })
    }
    return true
  }

  /* ── STORY 7.19 — the Safety net's three presses (FR-C1, R-278, R-280) ── */
  /** Add token: Ghost is asked whose token it is (`addSafetyToken`) and only an Owner's or an Administrator's is kept; a kept
   *  token goes straight on to the checks ("Adding…", then "Starting…"). A refusal is its one sentence under the box, and no
   *  step changes. Should the checks then refuse to start (unsent edits, the lock), Destination says why — the token is kept */
  const addSafety = async () => {
    if (adding || pressed !== null || site === null) return
    setAdding(true)
    setTokenRefused(null)
    setRefused(null)
    const answer = await addToken(site.id, token).catch(() => ({ refused: W.infrastructure }))
    // a kept token is told to the editor even when the wizard closed meanwhile: a reopen in this page must not ask again
    if ('ok' in answer) onAnswered(site.id)
    if (!alive.current) return
    setAdding(false)
    if (!('ok' in answer)) {
      // said by the box's own alert (the Kit's error slot), so not again in the polite region
      setTokenRefused(answer.refused)
      return
    }
    setToken('')
    setTokenKept(true)
    // STORY 7.20a — B12b's Add token: the kept token ships again, now capturing (the Safety net was answered long ago)
    if (retoken) {
      setRetoken(false)
      return void press('ship')
    }
    setSafeAnswered(true)
    // STORY 7.20a — on to Backup while it is owed (`afterSafety`, one rule with D1c's Continue), else the checks at once
    if (afterSafety({ backup, confirmed: backupDone }) === 'backup') return setLocal('backup')
    if (!(await runChecks()) && alive.current) setLocal('destination')
  }
  /** D1c's Continue: on to Backup while it is owed, else the checks (`afterSafety`) */
  const continueSafety = () => {
    if (afterSafety({ backup, confirmed: backupDone }) === 'backup') return setLocal('backup')
    void runChecks()
  }
  /** Not now: D1c at once — the decline is the decision, D1c its acknowledgement — and the record is written WITHOUT WAITING;
   *  a failed write is logged by the action and the offer returns on a later page, while this deploy goes on (FR-J8, AD-10) */
  const notNow = () => {
    if (adding || pressed !== null || site === null) return
    setLocal('declined')
    setSafeAnswered(true)
    onAnswered(site.id)
    void decline(site.id).catch(() => undefined)
  }
  // focus as each view arrives: D1b on its token box, D1c on Continue, Backup on its first box, and Back's Destination on Next —
  // and each heading said in the polite region, since focus lands on a control and not on the words that changed (UX-DR12)
  const wasLocal = useRef(local)
  useEffect(() => {
    if (wasLocal.current === local) return
    const back = wasLocal.current === 'offer' || wasLocal.current === 'backup'
    const id = local === 'offer' ? 'deploy-token' : local === 'declined' ? 'deploy-continue' : local === 'backup' ? null
      : back ? ((safety && !safeAnswered) || (backup && !backupDone) ? 'deploy-next' : 'deploy-run') : null
    wasLocal.current = local
    if (local === 'backup') dialog.current?.querySelector<HTMLElement>('[data-backup-gate] input[type="checkbox"]')?.focus()
    if (id !== null) document.getElementById(id)?.focus()
    if (local !== 'destination') say(local === 'offer' ? SN.title : local === 'declined' ? SN.declinedTitle : BW.title)
  }, [local])
  // …and B12b's Add token on its token box, Back on B12b's own Add token
  const wasRetoken = useRef(false)
  useEffect(() => {
    if (retoken) document.getElementById('deploy-token')?.focus()
    else if (wasRetoken.current) document.getElementById('deploy-b12-token')?.focus()
    if (retoken) say(SN.title)
    wasRetoken.current = retoken
  }, [retoken])

  /* ── STORY 7.20a — the Backup step's presses (F7, D1d as R-283 cut it) ── */
  /** the host names the card's sub line alone (R-283: every host draws the same card) */
  const gateHost = site?.hosting ?? null
  const tokenHeld = site?.staff === true || tokenKept
  const available = confirmAvailable(ticks)
  // UX-DR12: the master confirm becoming available is said once, politely, as it turns live
  const wasAvailable = useRef(available)
  useEffect(() => {
    if (available && !wasAvailable.current && local === 'backup') say(BW.available)
    wasAvailable.current = available
  }, [available])
  /** Run checks on Backup: the confirmation recorded WITHOUT WAITING (a failed write is logged and the gate shows again on a later
   *  open), told to the editor, then the checks. Greyed until the master confirm is ticked: a press then does nothing (R-98) */
  const confirmGate = async () => {
    if (!ticks.confirmed || pressed !== null || site === null) return
    void confirmBackup(site.id).catch(() => undefined)
    onConfirmed(site.id)
    setBackupDone(true)
    if (!(await runChecks()) && alive.current) setLocal('destination')
  }
  /** a row's Download: "Preparing…" while it works (R-98); the theme is the ONE capture, its row then followed through Story
   *  2.5's signed-URL route (AD-13), and `routes.yaml` is saved as B16's file is. A failure leaves its sentence under the row */
  const fetchRow = async (which: 'theme' | 'routes') => {
    if (fetching !== null || site === null) return
    setFetching(which)
    setFetched((was) => ({ ...was, [which]: undefined }))
    const failed = { said: W.infrastructure }
    if (which === 'theme') {
      const answer = await downloadTheme(site.id).catch(() => failed)
      if (!alive.current) return
      if ('ok' in answer) follow(`${prefix}${snapshotDownloadPath(answer.id)}`)
      else setFetched((was) => ({ ...was, theme: answer.said }))
    } else {
      const answer = await downloadRoutes(site.id).catch(() => failed)
      if (!alive.current) return
      if ('ok' in answer) saveRoutes(answer.file)
      else setFetched((was) => ({ ...was, routes: answer.said }))
    }
    setFetching(null)
  }

  /** a press on a job that is already there (Ship it, Cancel, Re-activate): sent, then the row is read until it moves. Story
   *  7.20a: `without` is B12b's Deploy without a snapshot — a Ship it that skips the capture */
  const press = async (intent: 'ship' | 'cancel' | 'activate', without = false) => {
    if (pressed !== null || job === null || view === null) return
    setPressed(without ? 'without' : intent)
    setRefused(null)
    waitFor.current = standing(view)
    const answer = await post(intent === 'ship' ? { intent, session: session(), job, mode, ...(without ? { withoutSnapshot: true } : {}) } : { intent, session: session(), job })
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
  const unstoppable = (stage !== null && UNSTOPPABLE.includes(stage)) || pressed === 'ship' || pressed === 'without' || pressed === 'activate'
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

  /* ── STORY 7.18b — choosing the site (FR-B5, R-267): the picker inside the wizard, and its confirm ── */
  const planFor = (siteId: string): SwitchPlan | null =>
    ship === undefined || ship.sites === null ? null : switchPlan({ project: { id: projectId, language: ship.language, linkedSiteId: ship.linkedSiteId, overridden: ship.overridden }, site: siteId, sites: ship.sites })
  /** STORY 7.18c (DW-381, R-276): the connected sites could not be read — the picker says so in place of its list */
  const sitesUnread = ship !== undefined && ship.sites === null
  const openPicker = () => {
    setSwitchRefused(null)
    setChosen(site?.id ?? ship?.sites?.[0]?.id ?? null)
    setPicking(true)
    // said politely as it opens, as the list would be read — nothing else on the picker tells a screen reader why it is bare
    if (sitesUnread) say(SW.unread)
  }
  const closePicker = () => {
    setPicking(false)
    setOwed(null)
    setSwitchRefused(null)
  }
  // focus starts on the chosen row; back on Destination it returns to the control that opened the picker
  const wasPicking = useRef(false)
  useEffect(() => {
    // the CHOSEN row first: a selector list matches in document order, so the checked radio is asked for alone
    if (picking) (pickerRef.current?.querySelector<HTMLElement>('input[type="radio"]:checked') ?? pickerRef.current?.querySelector<HTMLElement>('input[type="radio"], a[href], button'))?.focus()
    else if (wasPicking.current) document.getElementById(site === null ? 'deploy-choose' : 'deploy-switch')?.focus()
    wasPicking.current = picking
  }, [picking])
  // the confirm opens on Cancel (UX-DR14)
  useEffect(() => {
    if (owed !== null && confirmRef.current !== null && !confirmRef.current.open) openOnCancel(confirmRef.current)
  }, [owed])
  /** the sentences a confirm owes, in its order (Question 1's, FR-Q6's) */
  const owedWords = (x: SwitchSite, plan: SwitchPlan): { held: string | null; language: string | null } => ({
    held: plan.heldBy === null ? null : SW.held(x.host, plan.heldBy.name),
    language: plan.warnLanguage && x.locale !== null ? SW.language(x.host, ownName(x.locale), ownName(plan.language)) : null,
  })
  /** a switch that landed, while the page re-reads: the press stays busy until the re-read has (R-98) */
  const landing = useRef<'pending' | 'reading' | null>(null)
  useEffect(() => {
    if (landing.current === null) return
    if (relinking) return void (landing.current = 'reading')
    if (landing.current !== 'reading') return
    // the re-read landed and this editor was not remounted on a new site (the harness's): back to Destination
    landing.current = null
    confirmRef.current?.close()
    setOwed(null)
    setSwitching(null)
    setPicking(false)
  }, [relinking])
  /** the editor flushes, then `switchSite` answers: linked (the page re-reads and the wizard opens again on Destination), a
   *  confirm owed (another tab moved things meanwhile), or a refusal in its sentence */
  const sendSwitch = async (target: SwitchSite, confirmed: Confirmed, how: 'use' | 'confirm') => {
    if (switching !== null) return
    setSwitching(how)
    setSwitchRefused(null)
    const answer = await onSwitch(target.id, confirmed).catch((): SwitchAnswer => ({ refused: W.infrastructure }))
    if (!alive.current) return
    if ('ok' in answer) {
      // R-98: "Switching…" until the re-read lands — the editor then mounts afresh on the new site, and Destination never
      // shows the old link in between (the Review, 2026-10-19)
      landing.current = 'pending'
      onRelink(mode)
      return
    }
    setSwitching(null)
    if ('confirm' in answer) {
      // owed afresh on the server (another tab moved things meanwhile): the confirm says it, and so does the region when the
      // confirm was already open and only its words changed
      setOwed({ site: target, plan: answer.confirm })
      const words = owedWords(target, answer.confirm)
      say([words.held, words.language].filter((w) => w !== null).join(' '))
      return
    }
    confirmRef.current?.close()
    setOwed(null)
    setSwitchRefused(answer.refused)
    say(answer.refused)
  }
  const useSite = () => {
    if (switching !== null || chosen === null || ship === undefined) return
    const target = ship.sites?.find((x) => x.id === chosen)
    const plan = planFor(chosen)
    if (target === undefined || plan === null) {
      setSwitchRefused(SW.gone)
      say(SW.gone)
      return
    }
    // the linked site again: nothing to write, back to Destination
    if (plan.same) return closePicker()
    if (plan.confirm) return setOwed({ site: target, plan })
    void sendSwitch(target, null, 'use')
  }

  /** S8a's chip: Connected's mint dot, or B15's Preview-only pill (S11's two states) */
  const chipOf = (capability: 'full' | 'preview_only') =>
    capability === 'preview_only' ? (
      <span className="ml-auto inline-flex shrink-0 items-center gap-[6px] rounded-pill bg-marigold-tint px-[10px] py-[3px] text-helper-caption font-semibold text-marigold-text">
        <InfoCircle size={11} />
        {PREVIEW_COPY.chip}
      </span>
    ) : (
      <span className="ml-auto inline-flex shrink-0 items-center gap-[5px] text-control-label font-medium text-mint-text">
        <span aria-hidden className="size-[6px] rounded-full bg-mint" />
        {W.connected}
      </span>
    )
  const tile = (name: string) => (
    <span aria-hidden className="flex size-[34px] shrink-0 items-center justify-center rounded-sm bg-ink font-display text-[16px] font-bold text-paper">
      {name.slice(0, 1).toUpperCase()}
    </span>
  )
  const sites = ship?.sites ?? []
  /** S8a's Switch (`S8 Deploy.dc.html:54`), after the chip behind its divider, muted until hover — on the Preview-only card too
   *  (routine call 4: that is the site a customer most needs to leave) */
  const switchLink = (
    <button
      type="button"
      id="deploy-switch"
      onClick={openPicker}
      className={`shrink-0 border-l border-line pl-[11px] text-control-label font-medium text-ink-soft transition-colors duration-160 hover:text-ink ${ring}`}
    >
      {W.switchSite}
    </button>
  )

  /* ── the picker (undrawn: S8a's card per row, D4d's radio and coral wash, S11's chips, inside S8's 520px modal) ── */
  const chosenPlan = chosen === null ? null : planFor(chosen)
  const picker = (
    <div ref={pickerRef} data-site-picker className="flex flex-col gap-[18px]">
      <div className="flex flex-col gap-[6px]">
        <h3 className="m-0 font-display text-[17px] font-bold tracking-[-0.01em] text-ink">{SW.title}</h3>
        <p className="text-ui-dense leading-[1.55] text-ink-soft">{SW.lead}</p>
        {/* R-276 (DW-381): a failed read said as the lead's next paragraph, set as the lead is — no list, no Use this site */}
        {sitesUnread ? <p data-sites-unread className="text-ui-dense leading-[1.55] text-ink-soft">{SW.unread}</p> : null}
      </div>
      {sites.length === 0 ? null : (
        <fieldset className="m-0 flex flex-col gap-2 border-0 p-0">
          <legend className="sr-only">{SW.title}</legend>
          {sites.map((x) => {
            const on = x.id === chosen
            // a first link that CHANGES the language says so — never "English, {host}'s language" for a site that stores none
            const first = on && chosenPlan?.firstLink === true && chosenPlan.language !== ship?.language
            return (
              <label
                key={x.id}
                data-site-row={x.id}
                className={`flex cursor-pointer items-center gap-[11px] rounded-thumb border p-[11px_13px] transition-colors duration-160 has-[input:focus-visible]:shadow-focus ${on ? 'border-coral bg-coral-tint' : 'border-line hover:border-line-strong'}`}
              >
                <input type="radio" name="deploy-site" value={x.id} checked={on} onChange={() => setChosen(x.id)} className="sr-only" />
                <span aria-hidden className={`inline-flex size-4 shrink-0 items-center justify-center rounded-full border-[1.5px] ${on ? 'border-coral' : 'border-line-strong'}`}>
                  {on ? <span className="size-2 rounded-full bg-coral" /> : null}
                </span>
                {tile(x.title || x.host)}
                <span className="flex min-w-0 flex-1 flex-col gap-px">
                  <span className="truncate text-ui-dense font-semibold text-ink">{x.title || x.host}</span>
                  <span className="truncate font-mono text-helper-caption text-ink-soft [font-variant-ligatures:none]">{x.host}</span>
                  {x.heldBy === null || x.heldBy.id === projectId ? null : <span data-held className="text-helper-caption text-ink-soft">{SW.linkedTo(x.heldBy.name)}</span>}
                  {first ? <span data-first-link className="text-helper-caption leading-[1.5] text-ink">{SW.firstLink(ownName(chosenPlan.language), x.host)}</span> : null}
                </span>
                {chipOf(x.capability)}
              </label>
            )
          })}
        </fieldset>
      )}
      <div className="flex flex-col gap-[6px]">
        <div className="flex items-center gap-[10px]">
          <Link href={`${prefix}/sites`} onClick={close} className={`text-control-label font-semibold text-coral-text ${ring}`}>
            {SW.goToSites}
          </Link>
          <Button id="deploy-pick-back" variant="ghost" size={38} weight="font-medium" className="ml-auto" onClick={closePicker}>
            {SW.back}
          </Button>
          {sites.length === 0 ? null : (
            <Button
              id="deploy-pick-use"
              variant="primary"
              size={40}
              aria-disabled={switching === 'use' || undefined}
              aria-busy={switching === 'use' || undefined}
              aria-describedby={switchRefused === null ? undefined : 'deploy-switch-refused'}
              onClick={useSite}
            >
              <BusyLabel pending={switching === 'use'} busy={SW.switching}>{SW.use}</BusyLabel>
            </Button>
          )}
        </div>
        {switchRefused === null ? null : footerCaption('deploy-switch-refused', switchRefused)}
      </div>
      {/* the confirm — S8e's dialog (`S8 Deploy.dc.html:337-345`), opened on Cancel (UX-DR14), each owed sentence in its body */}
      <dialog
        ref={confirmRef}
        data-switch-confirm
        aria-labelledby="deploy-switch-title"
        aria-describedby="deploy-switch-body"
        onClick={(event) => {
          // the wizard's own backdrop test must never see a click on this one
          event.stopPropagation()
          closeOnBackdrop(event)
        }}
        onClose={() => setOwed(null)}
        className="m-auto w-[410px] max-w-[calc(100vw-20px)] flex-col gap-4 rounded-lg bg-surface p-6 shadow-modal backdrop:bg-scrim open:flex"
      >
        {owed === null ? null : (
          <>
            <div className="flex flex-col gap-[5px]">
              <h3 id="deploy-switch-title" className="m-0 font-display text-[19px] font-bold tracking-[-0.01em] text-ink">{SW.confirmTitle(owed.site.host)}</h3>
              <div id="deploy-switch-body" className="flex flex-col gap-2 text-ui-dense leading-[1.5] text-ink-soft">
                {owedWords(owed.site, owed.plan).held === null ? null : <p data-owed="held">{owedWords(owed.site, owed.plan).held}</p>}
                {owedWords(owed.site, owed.plan).language === null ? null : <p data-owed="language">{owedWords(owed.site, owed.plan).language}</p>}
              </div>
            </div>
            <div className="flex justify-end gap-[10px]">
              <Button type="button" variant="ghost" size={38} weight="font-medium" data-cancel onClick={() => confirmRef.current?.close()}>
                {SW.cancel}
              </Button>
              <Button
                type="button"
                id="deploy-switch-confirm"
                variant="primary"
                size={38}
                aria-disabled={switching === 'confirm' || undefined}
                aria-busy={switching === 'confirm' || undefined}
                onClick={() => void sendSwitch(owed.site, confirmedOf(owed.plan), 'confirm')}
              >
                <BusyLabel pending={switching === 'confirm'} busy={SW.switching}>{SW.switch}</BusyLabel>
              </Button>
            </div>
          </>
        )}
      </dialog>
    </div>
  )

  /** R-270 (DW-375): a site a REFUSED UPLOAD marked Preview-only keeps Run checks — an upgraded plan is only ever learned from
   *  Ghost's own answer — and says so under B15's panel; a probe's Preview-only stays as 7.18a drew it */
  const refusedPlan = site?.capability === 'preview_only' && site.source === 'deploy_error'

  /* ── S8a · Destination ── */
  const destination = (
    <div className="flex flex-col gap-5">
      <div className="flex items-start justify-between">
        <h2 id="deploy-title" className={`m-0 ${wideTitle}`}>{W.header}</h2>
        <button type="button" aria-label={W.close} onClick={close} className={`mt-1 rounded-sm text-ink-soft transition-colors hover:text-ink ${ring}`}>
          <X size={16} />
        </button>
      </div>
      <Rail at="destination" state="current" steps={steps} answered={{ safety: safeAnswered, backup: backupDone }} />
      {picking ? picker : site === null ? (
        // no connected linked site: said, with the ways to one — no Run checks (the matrix's row)
        <div className="flex flex-col items-start gap-3 rounded-thumb border border-line p-[13px]">
          <p className="text-ui-dense leading-[1.5] text-ink">{W.noSite}</p>
          <div className="flex items-center gap-[10px]">
            {/* R-276: offered on a failed read too, so the picker's sentence is reachable from a project with no site */}
            {sites.length === 0 && !sitesUnread ? null : (
              <Button id="deploy-choose" variant="primary" size={36} onClick={openPicker}>
                {W.chooseSite}
              </Button>
            )}
            <Link href={`${prefix}/sites`} onClick={close} className={`inline-flex h-9 items-center rounded-thumb border border-line bg-surface px-4 text-ui-dense font-semibold text-ink transition-colors hover:bg-paper ${ring}`}>
              {W.goToSites}
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-[11px] rounded-thumb border border-line p-[11px_13px]">
            {tile(siteTitle ?? host)}
            <span className="flex min-w-0 flex-col gap-px">
              <span className="truncate text-ui-dense font-semibold text-ink">{siteTitle ?? host}</span>
              <span className="truncate font-mono text-helper-caption text-ink-soft [font-variant-ligatures:none]">{host}</span>
            </span>
            {chipOf(site.capability)}
            {switchLink}
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
          ) : null}
          {refusedPlan ? <p data-plan-refused className="-mt-2 text-[12px] leading-[1.55] text-ink-soft">{W.planRefused(host)}</p> : null}
          {site.capability === 'preview_only' && !refusedPlan ? null : (
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
                  {(safety && !safeAnswered) || (backup && !backupDone) ? (
                    // STORY 7.19 — D1a's Next (`D1 First-Deploy Gates.dc.html:89`): the Safety net comes first, and nothing starts;
                    // STORY 7.20a — so does the Backup step while it is owed
                    <Button id="deploy-next" variant="primary" size={40} className="ml-auto" onClick={() => setLocal(safety && !safeAnswered ? 'offer' : 'backup')}>
                      {W.next}
                      <ChevronRight size={13} strokeWidth={1.8} />
                    </Button>
                  ) : (
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
                  )}
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
  /** Story 7.18b — the one BLOCKING row of the warnings' kind: an unacknowledged right-to-left language, the server's verdict
   *  before any compile (`rtl_unacknowledged`) — its title B18's, its way out under the greyed Ship it */
  const rtlBlocked = stage === 'failed' && !isFinding(error) && error?.code === 'rtl_unacknowledged'
  const compileRow = rtlBlocked ? (
    <StageRow id="deploy-rtl-block" tone="failed" label={TRANSLATION_WORDS.rtlTitle} />
  ) :
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
  /** DW-374 (R-269): Ship it found the project linked elsewhere, or to nothing */
  const relinked = stage === 'failed' && !isFinding(error) && (error?.code === 'site_changed' || error?.code === 'site_unlinked')
  /** Story 7.18b — Pre-flight's warning rows: the compile's facts (this deploy's, and the last activated one's settings) and the
   *  editor's own state, through the one rule module; none until the checks finished */
  const warnings: PreflightRow[] =
    !checksDone || site === null || ship === undefined
      ? []
      : preflightWarnings({
          ...client,
          host,
          siteName: siteTitle ?? host,
          siteUrl: site.url,
          siteVersion: site.version,
          siteLocale: site.locale,
          language: ship.language,
          rtlAckAt: ship.rtlAckAt,
          facts: view?.deploy?.preflight ?? null,
          previousCustom: view?.previousCustom ?? null,
          names,
          projectId,
        })
  const preflight = (
    <div className="flex flex-col gap-[18px]">
      <Rail at="check" state={stage === 'failed' ? 'failed' : 'current'} steps={steps} />
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
        {checksDone && filtered && posts !== null ? (
          posts.kind === 'reading' ? (
            // R-271 (DW-377): the read in flight says so, and never holds Ship it
            <StageRow id="deploy-posts-reading" tone="running" label={W.postsReading} />
          ) : posts.kind === 'read' && posts.unlisted.length === 0 ? (
            <div data-posts-listed className="flex flex-col gap-1">
              <StageRow tone="done" label={W.everyPostListed} chip={<ResultChip tone="clean">{W.pass}</ResultChip>} />
              {posts.capped ? <p data-posts-capped className="ml-[31px] text-control-label text-ink-soft">{W.postsCapped}</p> : null}
            </div>
          ) : (
            <div data-unlisted className="flex items-start gap-[11px]">
              <Mark tone="warning" />
              <p className="text-ui-dense leading-[1.5] text-ink">
                {posts.kind === 'unread'
                  ? W.unlistedUnread(host)
                  : posts.unlisted.length === 1
                    ? W.unlistedOne(posts.unlisted[0]?.title ?? '')
                    : W.unlistedMany(posts.unlisted.map((p) => p.title))}
                {posts.kind === 'read' && posts.capped ? <span data-posts-capped> {W.postsCapped}</span> : null}
              </p>
            </div>
          )
        ) : null}
        {/* Story 7.18b — the warning rows, after R-260's, each S8b's row in Design Notes' order (`preflightWarnings`) */}
        {checksDone && warnings.length > 0 ? (
          <div data-preflight-rows className="ml-[31px] overflow-hidden rounded-thumb border border-line">
            {warnings.map((row, i) => (
              <WarningRow key={`${row.kind}:${i}`} row={row} n={i} canvasHref={canvasHref} onFix={close} />
            ))}
          </div>
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
            <Button
              id="deploy-back"
              variant="ghost"
              size={38}
              weight="font-medium"
              className="ml-auto"
              onClick={() => {
                back()
                // DW-374: the project's site changed under these checks — Destination must show the link as it stands now
                if (relinked) onRelink(mode)
              }}
            >
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
      <Rail at="ship" state="current" steps={steps} />
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
      <Rail at="ship" state="failed" steps={steps} />
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
      <Rail at="live" state="live" steps={steps} />
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
  const [activatingLabel, activatingMeta] = apart(ending_ === 'notLive' ? W.activatingDidnt(n) : W.activatingNotRequested(n))
  const liveChip = W.liveChip(prev)
  const notLive = (
    <div className="flex flex-col gap-[18px]">
      <Rail at="live" state="waiting" steps={steps} />
      <div className="flex items-start gap-[13px]">
        <span aria-hidden className="flex size-11 shrink-0 items-center justify-center rounded-full bg-sky-tint text-sky-text">
          <Upload size={22} strokeWidth={1.8} />
        </span>
        <div className="flex flex-1 flex-col gap-[7px]">
          <h2 id="deploy-title" className="m-0 font-display text-[22px] font-bold leading-[1.2] tracking-[-0.01em] text-ink [text-wrap:pretty]">
            {ending_ === 'notLive' ? W.notLiveTitle : W.uploadOnlyTitle}
          </h2>
          <p className="text-[13.5px] leading-[1.6] text-ink [text-wrap:pretty]">{ending_ === 'notLive' ? W.notLiveBody(n, prev, host) : W.uploadOnlyBody(n, prev, host)}</p>
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

  /* ── STORY 7.19 — D1b · the Safety net's offer, and D1c · its decline (`D1 First-Deploy Gates.dc.html:95-151`, `:153-206`),
     700 wide. No ✕ on either, as on S8b: Esc and the backdrop close the wizard as they always have. Below `tablet` the picture
     stacks under the field. Every word is `SAFETY_WORDS`' — the disclosure `KEYS.staff.full`, the action Manage keys' "Add
     token" (R-170) ── */
  const paragraph = 'text-[12.5px] leading-[1.65] text-ink-soft-aa [text-wrap:pretty]'
  const offer = (
    <div className="flex flex-col gap-5">
      {/* Story 7.20a: opened from B12b's Add token the deploy is at Ship, and that is where the rail says it is */}
      <Rail at={retoken ? 'ship' : 'safety'} state="current" steps={steps} />
      <div className="flex flex-col gap-[7px]">
        <h2 id="deploy-title" className={`m-0 ${wideTitle} [text-wrap:pretty]`}>{SN.title}</h2>
        <p className="max-w-[560px] text-[13.5px] leading-[1.6] text-ink [text-wrap:pretty]">{SN.lead}</p>
      </div>
      <div className="flex max-w-[600px] flex-col gap-[7px]">
        <p className={paragraph}>
          {SN.who} <span data-safety-full className="font-medium text-ink">{SN.full}</span>
        </p>
        <p className={paragraph}>{SN.uses}</p>
      </div>
      <div className="flex flex-col items-stretch gap-[18px] tablet:flex-row tablet:items-start">
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <TextInput
            id="deploy-token"
            label={SN.label}
            placeholder={SN.placeholder}
            value={token}
            onChange={(event) => setToken(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.metaKey && !event.ctrlKey) {
                event.preventDefault()
                void addSafety()
              }
            }}
            maxLength={CONNECT_MAX}
            autoComplete="off"
            mono
            size={44}
            error={tokenRefused}
          />
          <p className="text-helper-caption leading-[1.55] text-ink-soft">{SN.note(host)}</p>
        </div>
        {/* R-279: the owner's own screenshot, drawn from its bottom — the Staff access token box and the field above it. At most
            280 wide below `tablet` too, so the slot crops what D1b's does (wider, it showed the buttons alone) */}
        <img
          src={SAFETY_PICTURE.src}
          width={SAFETY_PICTURE.width}
          height={SAFETY_PICTURE.height}
          alt={SN.alt}
          className="h-[150px] w-full max-w-[280px] shrink-0 rounded-[10px] object-cover object-bottom tablet:w-[280px]"
        />
      </div>
      <div className="flex flex-col gap-[6px]">
        <div className="flex items-center gap-3">
          <Button
            id="deploy-safety-back"
            variant="ghost"
            size={38}
            weight="font-medium"
            className="px-[14px] text-[13px]"
            aria-disabled={adding || pressed === 'start' || undefined}
            onClick={() => {
              // Story 7.20a: from B12b's Add token, Back is B12b
              if (!adding && pressed === null) return retoken ? setRetoken(false) : setLocal('destination')
            }}
          >
            {SN.back}
          </Button>
          <div className="ml-auto flex gap-[10px]">
            <Button
              id="deploy-add-token"
              variant="primary"
              size={42}
              aria-disabled={adding || pressed === 'start' || undefined}
              aria-busy={adding || pressed === 'start' || undefined}
              onClick={() => void addSafety()}
            >
              <BusyLabel pending={adding || pressed === 'start'} busy={adding ? SN.adding : W.starting}>{SN.add}</BusyLabel>
            </Button>
            {/* Story 7.20a: over B12b, the way on without the token is B12b's own Deploy without a snapshot — so no Not now */}
            {retoken ? null : (
              <Button id="deploy-not-now" variant="secondary" size={42} aria-disabled={adding || pressed === 'start' || undefined} onClick={notNow}>
                {SN.notNow}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
  const lostGlyph = [Copy, Eye, Upload] as const
  const declined = (
    <div className="flex flex-col gap-5">
      <Rail at="safety" state="current" steps={steps} />
      <div className="flex flex-col gap-[7px]">
        <h2 id="deploy-title" className={`m-0 ${wideTitle} [text-wrap:pretty]`}>{SN.declinedTitle}</h2>
        <p className="max-w-[560px] text-[13.5px] leading-[1.6] text-ink [text-wrap:pretty]">{SN.declinedLead}</p>
      </div>
      <ul data-safety-lost className="m-0 flex list-none flex-col gap-[9px] p-0">
        {SN.lost.map((words, i) => {
          const Glyph = lostGlyph[i] ?? Upload
          return (
            <li key={words} className="flex items-center gap-[13px] rounded-[12px] border border-line p-[13px]">
              <span aria-hidden className="flex size-[34px] shrink-0 items-center justify-center rounded-[10px] bg-paper text-ink-soft">
                <Glyph size={16} strokeWidth={1.6} />
              </span>
              <span className="flex-1 text-[13.5px] leading-[1.5] text-ink">{words}</span>
            </li>
          )
        })}
      </ul>
      <p className="text-[13px] leading-[1.6] text-ink-soft-aa">
        {SN.footBefore}
        <span className="font-semibold text-ink">{SN.footKeys}</span>
        {SN.footAfter}
      </p>
      <div className="flex flex-col gap-[6px]">
        <div className="flex">
          <Button
            id="deploy-continue"
            variant="primary"
            size={42}
            className="ml-auto"
            aria-disabled={pressed === 'start' || undefined}
            aria-busy={pressed === 'start' || undefined}
            aria-describedby={refused === null ? undefined : 'deploy-refused'}
            onClick={continueSafety}
          >
            <BusyLabel pending={pressed === 'start'} busy={W.starting}>
              {SN.continue}
              <ChevronRight size={13} strokeWidth={1.8} />
            </BusyLabel>
          </Button>
        </div>
        {refused === null ? null : footerCaption('deploy-refused', refused)}
      </div>
    </div>
  )

  /* ── STORY 7.20a — D1d · the first deploy's Backup step (`D1 First-Deploy Gates.dc.html:208-358`), 780 wide and scrolling inside
     the wizard, AS R-283 CUT IT (owner, 2026-10-26): the frame's title, sub line and "What Inflozo writes" panel; the owner's
     optional advice in the shortcut panel's place, drawn in the panel's own vocabulary, with Ghost's help on exports; the lead-in;
     the Theme and `routes.yaml` rows; the rule, the reworded confirm and the footer. The same card on every host — the host names
     the sub line alone. Every word is `BACKUP_WORDS`', every row `GATE_ROWS`', every link Ghost's own help. No ✕, as on D1b. Each
     tick is a NATIVE checkbox in its own label, drawn as the frame's 18px box; the master confirm and Run checks are GREYED with
     the footer's reason, never `disabled` (R-98) ── */
  const reasonWords = reasonOf(ticks)
  const gateGreyed = !ticks.confirmed
  /** a row's Download, where the wizard can fetch its file: `routes.yaml` on every connected site (R-282), the theme only with a
   *  Staff Access Token held — without one it could never act, so it is ABSENT (DESIGN.md:582) */
  const downloadOn = (which: RowId) =>
    which === 'theme' && !tokenHeld ? null : (
      <Button
        id={`deploy-download-${which}`}
        variant="secondary"
        size={32}
        className="self-start"
        aria-disabled={fetching !== null || undefined}
        aria-busy={fetching === which || undefined}
        aria-describedby={fetched[which] === undefined ? undefined : `deploy-download-${which}-said`}
        onClick={() => void fetchRow(which)}
      >
        <BusyLabel pending={fetching === which} busy={BW.preparing}>
          <Download size={12} />
          {BW.download}
        </BusyLabel>
      </Button>
    )
  /** D1d's panel (`:243-246`): its eyebrow and its words — the "What Inflozo writes" panel, and R-283's advice in the same look */
  const panel = (mark: string, eyebrow: string, children: ReactNode) => (
    <div {...{ [mark]: '' }} className="flex flex-col gap-[7px] rounded-[12px] border border-line bg-paper-raised p-[14px_16px]">
      <span className="font-mono text-[10px] tracking-[0.06em] text-ink-soft-aa [font-variant-ligatures:none]">{eyebrow}</span>
      {children}
    </div>
  )
  const gate = site === null ? null : (
    <div data-backup-gate={gateHost ?? 'unknown'} className="flex flex-col gap-[18px]">
      <Rail at="backup" state="current" steps={steps} />
      <div className="flex flex-col gap-[6px]">
        <h2 id="deploy-title" className={`m-0 ${wideTitle} [text-wrap:pretty]`}>{BW.title}</h2>
        <p data-backup-sub className="text-[12px] text-ink-soft">{subLineOf(gateHost, host)}</p>
      </div>
      {panel('data-backup-writes', BW.writesEyebrow, <p className="text-[13.5px] leading-[1.6] text-ink [text-wrap:pretty]">{BW.writes}</p>)}
      {panel('data-backup-advice', BW.advice.eyebrow, (
        <>
          <p className="text-[13.5px] leading-[1.6] text-ink [text-wrap:pretty]">{BW.advice.body}</p>
          <a href={HELP.exports} target="_blank" rel="noreferrer" className={`self-start text-[11.5px] font-medium text-coral-text ${ring}`}>
            {BW.advice.help}
            <span className="sr-only"> {W.newTab}</span>
          </a>
        </>
      ))}
      <p data-backup-lead-in className="text-[13.5px] leading-[1.65] text-ink [text-wrap:pretty]">{BW.leadIn}</p>
      <div className="flex flex-col gap-[9px]">
        {GATE_ROWS.map((row) => {
          const box = `deploy-gate-${row.id}`
          const said = fetched[row.download]
          return (
            <div key={row.id} data-gate-row={row.id} className="flex flex-col gap-[10px] rounded-[12px] border border-line p-[12px_13px] tablet:flex-row tablet:items-start tablet:gap-3">
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <label className="flex cursor-pointer items-start gap-3">
                  <GateBox id={box} checked={ticks.rows[row.id] === true} labelledBy={`${box}-name`} describedBy={`${box}-body`} onChange={() => setTicks(toggleRow(ticks, row.id))} />
                  <span className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span id={`${box}-name`} className={row.mono ? 'font-mono text-[13px] font-medium text-ink [font-variant-ligatures:none]' : 'text-[13.5px] font-semibold text-ink'}>{row.name}</span>
                      <span className="rounded-pill bg-coral-tint px-2 py-[2px] font-mono text-[9.5px] font-medium text-coral-text [font-variant-ligatures:none]">{row.chip}</span>
                    </span>
                    <span id={`${box}-body`} className="text-[12.5px] leading-[1.55] text-ink-soft-aa">{row.body}</span>
                    {row.warn === null ? null : (
                      <span className="inline-flex items-start gap-[6px] text-[11.5px] leading-[1.5] text-marigold-text">
                        <AlertTriangle size={12} strokeWidth={1.9} className="mt-[2px] shrink-0" />
                        {row.warn}
                      </span>
                    )}
                  </span>
                </label>
                <a href={row.help.href} target="_blank" rel="noreferrer" className={`ml-[30px] self-start text-[11.5px] font-medium text-coral-text ${ring}`}>
                  {row.help.words}
                  <span className="sr-only"> {W.newTab}</span>
                </a>
                {said === undefined ? null : <p id={`deploy-download-${row.download}-said`} role="status" className="ml-[30px] text-[11.5px] leading-[1.5] text-ink-soft">{said}</p>}
              </div>
              {/* below `tablet` the Download stacks under its text, inside the wizard's own width */}
              <span className="ml-[30px] tablet:ml-0">{downloadOn(row.download)}</span>
            </div>
          )
        })}
      </div>
      <div aria-hidden className="h-px bg-line" />
      <label className={`flex items-start gap-3 ${available ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}>
        <GateBox
          id="deploy-gate-confirm"
          checked={ticks.confirmed}
          greyed={!available}
          labelledBy="deploy-gate-confirm-label"
          {...(available ? {} : { describedBy: 'deploy-backup-reason' })}
          onChange={() => setTicks(toggleConfirm(ticks))}
        />
        <span id="deploy-gate-confirm-label" className="flex-1 text-[13.5px] font-medium leading-[1.55] text-ink [text-wrap:pretty]">{BW.confirm}</span>
      </label>
      <div className="flex flex-col gap-[6px]">
        {/* below `tablet` the reason takes its own line above the buttons — beside them at 390 it squeezed Run checks onto two */}
        <div className="flex flex-wrap items-center gap-3">
          {reasonWords === null ? null : <span id="deploy-backup-reason" className="max-tablet:basis-full text-[12px] text-ink-soft">{reasonWords}</span>}
          <Button
            id="deploy-backup-back"
            variant="ghost"
            size={38}
            weight="font-medium"
            className="ml-auto px-[14px] text-[13px]"
            aria-disabled={pressed === 'start' || undefined}
            onClick={() => {
              if (pressed === null) setLocal('destination')
            }}
          >
            {BW.back}
          </Button>
          <Button
            id="deploy-backup-run"
            variant="primary"
            size={40}
            className={gateGreyed ? 'cursor-not-allowed opacity-35' : ''}
            {...(gateGreyed
              ? { ...greyedProps('deploy-backup-run', { reason: reasonWords ?? BW.oneLeft }), 'aria-describedby': 'deploy-backup-reason' }
              : { 'aria-disabled': pressed === 'start' || undefined, 'aria-busy': pressed === 'start' || undefined, 'aria-describedby': refused === null ? undefined : 'deploy-refused' })}
            onClick={gateGreyed ? undefined : () => void confirmGate()}
          >
            <BusyLabel pending={pressed === 'start'} busy={BW.starting}>
              {BW.runChecks}
              <ChevronRight size={13} strokeWidth={1.8} />
            </BusyLabel>
          </Button>
        </div>
        {refused === null ? null : footerCaption('deploy-refused', refused)}
      </div>
    </div>
  )

  /* ── STORY 7.20a — B12a · the archive running (`B Missing Surfaces.dc.html:1044-1078`), 600 wide, the rail at Ship: four named
     steps, the live theme's name and version as a mono chip, the snapshot's real size, and Cancel live until the upload begins.
     No coral bar: no real byte count exists while it works (DESIGN.md:518-522) — row 2 carries the size once it is known ── */
  const snap = timings.snapshotting ?? {}
  const readDone = snap.marked === true || snap.theme !== undefined
  const wroteDone = snap.marked === true || snap.bytes !== undefined
  const archiving = (
    <div data-archiving className="flex flex-col gap-[18px]">
      <Rail at="ship" state="current" steps={steps} />
      <div className="flex flex-col gap-[9px]">
        <h2 id="deploy-title" className="m-0 font-display text-[21px] font-bold tracking-[-0.02em] text-ink">{SNAP.title}</h2>
        <p className="text-[13.5px] leading-[1.6] text-ink-mid [text-wrap:pretty]">{SNAP.lead}</p>
      </div>
      <div className="flex flex-col gap-[11px]">
        <ArchiveRow tone={readDone ? 'done' : 'running'} label={SNAP.reading} {...(snap.theme === undefined ? {} : { meta: `${snap.theme}${snap.version ? ` ${snap.version}` : ''}` })} />
        <ArchiveRow tone={wroteDone ? 'done' : readDone ? 'running' : 'pending'} label={snap.marked ? SNAP.marked : SNAP.writing} {...(snap.bytes === undefined ? {} : { meta: themeSize(snap.bytes) })} />
        <ArchiveRow tone="pending" label={SNAP.uploading} />
        <ArchiveRow tone="pending" label={SNAP.checking} />
      </div>
      <div className="flex items-center gap-3">
        <span className="flex-1 text-[12px] text-ink-soft">{SNAP.foot}</span>
        <Button
          id="deploy-cancel"
          variant="secondary"
          size={36}
          aria-disabled={pressed === 'cancel' || undefined}
          aria-busy={pressed === 'cancel' || undefined}
          onClick={() => void press('cancel')}
        >
          <BusyLabel pending={pressed === 'cancel'} busy={W.cancelling}>{SNAP.cancel}</BusyLabel>
        </Button>
      </div>
      {refused === null ? null : footerCaption('deploy-refused', refused)}
    </div>
  )

  /* ── STORY 7.20a — B12b · the archive did not finish (`:1080-1102`), 600 wide: nothing was uploaded, and it says the request and
     Ghost's status, where Ghost keeps the previous theme (a description and a link to the site's own Design panel — E-5's rule,
     never "Settings → Design"), and the three ways on: Add token (D1b's view, Back returning here), Deploy without a snapshot,
     and Cancel ── */
  const capture = isSnapshotError(error) ? error : null
  const captureFailedView = capture === null || site === null ? null : (
    <div data-capture-failed={capture.code} className="flex flex-col gap-[18px]">
      <Rail at="ship" state="failed" steps={steps} />
      <div className="flex items-start gap-[14px]">
        <span aria-hidden className="flex size-9 shrink-0 items-center justify-center rounded-[11px] bg-danger-tint text-danger-text">
          <AlertTriangle size={17} strokeWidth={1.8} />
        </span>
        <div className="flex flex-1 flex-col gap-2">
          <h2 id="deploy-title" className="m-0 font-display text-[21px] font-bold tracking-[-0.02em] text-ink">{SNAP.failedTitle}</h2>
          <p className="text-[13.5px] leading-[1.6] text-ink-mid [text-wrap:pretty]">{capture.message}</p>
        </div>
      </div>
      <div className="flex flex-col gap-[7px] rounded-thumb border border-line bg-paper-raised p-[13px_15px]">
        {capture.request === undefined || capture.request === '' ? null : (
          <span data-capture-request className="font-mono text-[10.5px] text-ink-soft-aa [font-variant-ligatures:none]">{SNAP.request(capture.request, capture.status)}</span>
        )}
        <p className="text-[12.5px] leading-[1.5] text-ink-mid">
          {SNAP.placeBefore}
          <a data-capture-place href={adminAt(site.url, 'design')} target="_blank" rel="noreferrer" className={`font-semibold text-coral-text ${ring}`}>
            {SNAP.placeLink} ↗<span className="sr-only"> {W.newTab}</span>
          </a>
          {SNAP.placeAfter}
        </p>
      </div>
      <div className="flex flex-col gap-[6px]">
        <div className="flex items-center gap-[10px]">
          <Button id="deploy-b12-token" variant="primary" size={38} aria-disabled={pressed !== null || undefined} onClick={() => (pressed === null ? setRetoken(true) : undefined)}>
            {SNAP.addToken}
          </Button>
          <Button
            id="deploy-without"
            variant="secondary"
            size={38}
            aria-disabled={pressed !== null || undefined}
            aria-busy={pressed === 'without' || undefined}
            aria-describedby={refused === null ? undefined : 'deploy-refused'}
            onClick={() => void press('ship', true)}
          >
            <BusyLabel pending={pressed === 'without'} busy={W.starting}>{SNAP.without}</BusyLabel>
          </Button>
          <Button
            id="deploy-b12-cancel"
            variant="ghost"
            size={38}
            weight="font-medium"
            className="ml-auto"
            aria-disabled={pressed !== null || undefined}
            aria-busy={pressed === 'cancel' || undefined}
            onClick={() => void press('cancel')}
          >
            <BusyLabel pending={pressed === 'cancel'} busy={W.cancelling}>{SNAP.cancel}</BusyLabel>
          </Button>
        </div>
        {refused === null ? null : footerCaption('deploy-refused', refused)}
      </div>
    </div>
  )

  const step =
    at === 'destination' ? destination
    : at === 'safety' ? (local === 'declined' ? declined : offer)
    : at === 'backup' ? gate
    : at === 'check' ? preflight
    : at === 'ship' ? (retoken ? offer : captureFailed ? captureFailedView : stage === 'snapshotting' ? archiving : stage === 'failed' ? failedShip : shipping)
    : ending_ === 'live' ? live
    : notLive
  /** each view at its frame's width (R-74): D1b/D1c 700, Backup 780, B12a/B12b 600, every other step S8's 520 */
  const width = at === 'safety' || retoken ? 'w-[700px]' : at === 'backup' ? 'w-[780px]' : captureFailed || stage === 'snapshotting' ? 'w-[600px]' : 'w-[520px]'

  return (
    <dialog
      ref={dialog}
      data-deploy-wizard={at}
      data-unstoppable={unstoppable || undefined}
      aria-labelledby="deploy-title"
      onClick={(event) => (unstoppable ? undefined : closeOnBackdrop(event))}
      // Esc closes at every step but these: the cancel is refused, and so is the keydown that would ask for it — a second
      // Esc after a refused cancel would otherwise close it anyway
      onCancel={(event) => {
        // React carries a nested dialog's `cancel` up its own tree: the picker's confirm closing on Esc is its own business
        if (event.target !== event.currentTarget) return
        if (unstoppable) return event.preventDefault()
        // the picker is a view of Destination: Esc goes back to it, never past it (its confirm closes itself first)
        if (picking) {
          event.preventDefault()
          closePicker()
        }
      }}
      onKeyDown={(event) => {
        if (event.key !== 'Escape') return
        if (unstoppable) return event.preventDefault()
        // the picker is a view of Destination: Esc goes back to it, never past it — and only once its confirm is closed, which
        // takes its own Esc (a refused `cancel` alone would let a second Esc close the wizard, as the unstoppable case notes)
        if (picking && confirmRef.current?.open !== true) {
          event.preventDefault()
          closePicker()
        }
      }}
      onClose={(event) => {
        if (event.target !== event.currentTarget || dialog.current?.open) return
        onClose(stage === 'done' || timings.uploading !== undefined)
      }}
      // STORY 7.19: D1b and D1c are drawn 700 wide; STORY 7.20a: Backup 780, B12a and B12b 600; every other step keeps S8's 520 (R-74)
      className={`relative m-auto box-content max-h-[calc(100dvh-72px)] ${width} max-w-[calc(100vw-72px)] flex-col overflow-y-auto overflow-x-hidden rounded-lg bg-surface p-[26px] shadow-modal backdrop:bg-scrim open:flex`}
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

/** STORY 7.20a — D1d's 18px box: a NATIVE checkbox inside its label (`link-picker.tsx`'s precedent), drawn as the frame draws it —
 *  hollow, then filled ink under the white tick. Greyed is `aria-disabled` with the footer's reason, never `disabled` (R-98): a
 *  press changes nothing, because the rule's `toggleConfirm` answers the same ticks. The Kit gains no component: one surface needs
 *  this */
function GateBox({ id, checked, onChange, greyed = false, labelledBy, describedBy }: {
  id: string; checked: boolean; onChange: () => void; greyed?: boolean; labelledBy: string; describedBy?: string
}) {
  return (
    <span className="relative mt-[2px] inline-flex size-[18px] shrink-0">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        aria-labelledby={labelledBy}
        aria-describedby={describedBy}
        aria-disabled={greyed || undefined}
        className={`peer size-[18px] appearance-none rounded-[5px] border-[1.5px] ${greyed ? 'cursor-not-allowed border-grey-border bg-paper' : 'cursor-pointer border-line-strong bg-surface'} checked:border-ink checked:bg-ink ${ring}`}
      />
      <Check aria-hidden size={11} strokeWidth={3} className="pointer-events-none absolute inset-0 m-auto hidden text-surface peer-checked:block" />
    </span>
  )
}

/** STORY 7.20a — one of B12a's four rows: its 22px disc — done mint with the tick, running coral with its dot, waiting hollow —
 *  the words (500 while it runs) and the mono meta at the right */
function ArchiveRow({ tone, label, meta }: { tone: 'done' | 'running' | 'pending'; label: string; meta?: string }) {
  return (
    <div data-archive-row={tone} className={`flex items-center gap-[11px] ${tone === 'pending' ? 'opacity-50' : ''}`}>
      {tone === 'done' ? (
        <span aria-hidden className="flex size-[22px] shrink-0 items-center justify-center rounded-full bg-mint-tint"><Check size={11} strokeWidth={2.6} className="text-mint" /></span>
      ) : tone === 'running' ? (
        <span aria-hidden className="flex size-[22px] shrink-0 items-center justify-center rounded-full bg-coral-tint"><span className="size-2 rounded-full bg-coral" /></span>
      ) : (
        <span aria-hidden className="size-[22px] shrink-0 rounded-full border border-line" />
      )}
      <span className={`flex-1 text-[13px] text-ink ${tone === 'running' ? 'font-medium' : ''}`}>{label}</span>
      {meta === undefined ? null : <span className="font-mono text-[10.5px] text-ink-soft-aa [font-variant-ligatures:none]">{meta}</span>}
    </div>
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

/** STORY 7.18b — ONE OF PRE-FLIGHT'S WARNING ROWS, S8b's own (`S8 Deploy.dc.html:103-116`, `FindingRow`'s shape): collapsed to its
 *  title, with "Fix in editor" where it names one canvas; opened on the frame's warning wash, its body and its list — each item with its own
 *  "Fix in editor" where it has a canvas (extrapolated from the opened row) — and Ghost's own page, in a new tab, where it has
 *  one. Every field as text. Warnings open collapsed, and never block. */
function WarningRow({ row, n, canvasHref, onFix }: { row: PreflightRow; n: number; canvasHref: (canvas: Canvas) => string; onFix: () => void }) {
  const [open, setOpen] = useState(false)
  const id = `deploy-warning-${n}`
  const one = rowCanvas(row)
  const fix = (canvas: Canvas) => (
    <Link href={canvasHref(canvas)} onClick={onFix} className={`relative shrink-0 text-control-label font-medium text-coral-text ${ring}`}>
      {W.fixInEditor}
    </Link>
  )
  return (
    <div data-warning={row.kind} className={`relative flex gap-[9px] border-t border-line px-[13px] first:border-t-0 ${open ? 'items-start bg-marigold-tint-soft py-[11px]' : 'items-center py-[10px]'}`}>
      <button type="button" aria-expanded={open} aria-labelledby={id} onClick={() => setOpen(!open)} className={`absolute inset-0 ${ring}`} />
      <AlertTriangle size={14} strokeWidth={1.8} className="pointer-events-none relative mt-px shrink-0 text-marigold-text" />
      <div className="pointer-events-none relative flex min-w-0 flex-1 flex-col gap-[3px]">
        <span id={id} className={`text-[12.5px] text-ink ${open ? 'font-semibold' : 'font-medium'}`}>{row.title}</span>
        {open ? (
          <>
            {row.body === undefined ? null : <span className="text-control-label leading-[1.5] text-ink-soft">{row.body}</span>}
            {row.items.length === 0 ? null : (
              <ul className="m-0 flex list-none flex-col gap-1 p-0">
                {row.items.map((item, i) => (
                  <li key={`${i}:${item.text}`} className="flex items-start gap-2 text-control-label leading-[1.5] text-ink">
                    <span className="min-w-0 flex-1">{item.text}</span>
                    {item.canvas === undefined || one !== null ? null : <span className="pointer-events-auto">{fix(item.canvas)}</span>}
                  </li>
                ))}
              </ul>
            )}
            {row.link === undefined ? null : (
              <a href={row.link.href} target="_blank" rel="noreferrer" className={`pointer-events-auto relative self-start text-control-label font-semibold text-coral-text ${ring}`}>
                {row.link.words}
                <span className="sr-only">{TRANSLATION_WORDS.newTab}</span>
              </a>
            )}
          </>
        ) : null}
      </div>
      {one === null ? null : fix(one)}
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
