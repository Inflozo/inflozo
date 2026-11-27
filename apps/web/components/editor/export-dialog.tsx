'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import type { Finding } from '@inflozo/theme-compiler/gate'
import { StageRow } from '@/components/editor/deploy-wizard'
import { ResultChip } from '@/components/kit/badge'
import { Button } from '@/components/kit/button'
import { closeOnBackdrop, wideTitle } from '@/components/kit/dialog'
import { ring } from '@/components/kit/greyed'
import { X } from '@/components/kit/icons'
import { SignedDownload } from '@/components/signed-download'
import { DEPLOY_WORDS as W, EXPORT_WORDS as E, exportDownloadPath, exportHref, isMoving, STAGE_NAMES, type DeployError, type ExportView, type Stage } from '@/lib/deploy'
import { LOCK_COPY } from '@/lib/lock'
import { useSaid } from '@/lib/renders'

/* ───────── STORY 7.26 — THE EXPORT WINDOW (FR-J12). Undrawn: extrapolated from S8's 520px modal and S8b's rows
 * (`S8 Deploy.dc.html:89-99`), in the wizard's own components and tokens — `StageRow`, `ResultChip`, S8d′'s failed row and panel,
 * and `SignedDownload` (R-74: no second vocabulary).
 *
 * IT STARTS ON ITS OWN, once mounted (the editor mounts it from `openExport`, for a session holding the lock): the editor's flush
 * first — work it cannot send is work the compile would not see, so an unsent edit says its sentence and nothing starts — then the
 * POST (`projects/[id]/export`), then the row read once a second while it moves. Each stage is said politely as it starts (UX-DR12).
 *   - done: the zip is followed at once through `followSigned` (the window's Download again, pressed for the customer), then the
 *     ready line, and Download again stays;
 *   - failed: S8d′'s row with the envelope's `message` (a `compile_failed` detail is ours and never drawn) and its `action`/`href`
 *     as a link when it has one;
 *   - refused before any work: the sentence of a 429 (the budget's, the envelope's own), a 423 (the lock's) or anything else (ours).
 * There is no Cancel (the spec's Never), and closing the window never stops the work. Every field is drawn as TEXT. */

/** a finding (the gates') or AD-24's envelope */
const isFinding = (e: unknown): e is Finding => e !== null && typeof e === 'object' && 'level' in e

export function ExportDialog({ projectId, prefix, session, flush, onClose }: {
  projectId: string
  /** `/app` where the page itself is under it (localhost), else '' */
  prefix: string
  /** this tab's edit-lock session (`lib/lock-client.ts`) */
  session: () => string
  /** the editor's flush (Run checks' own): null when nothing is left unsent, else the sentence that says why */
  flush: () => Promise<string | null>
  onClose: () => void
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [job, setJob] = useState<string | null>(null)
  const [view, setView] = useState<ExportView | null>(null)
  const [refused, setRefused] = useState<string | null>(null)
  /** the zip was followed and is on its way: the ready line */
  const [ready, setReady] = useState(false)
  const [tick, setTick] = useState(0)
  const [said, say] = useSaid()
  const heard = useRef(new Set<string>())
  const alive = useRef(true)
  /** one start per window, whatever mounts it twice (React's development double effect included) */
  const started = useRef(false)
  /** the zip followed once, at done */
  const followed = useRef(false)
  const route = `${prefix}${exportHref(projectId)}`

  const refuse = (words: string) => {
    setRefused(words)
    say(words)
  }

  const start = async () => {
    const unsent = await flush()
    if (!alive.current) return
    if (unsent !== null) return refuse(unsent)
    const answer = await fetch(route, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ session: session() }), signal: AbortSignal.timeout(15_000) }).catch(() => null)
    if (!alive.current) return
    if (answer?.status === 202) {
      const { job: id } = ((await answer.json().catch(() => null)) ?? {}) as { job?: unknown }
      if (typeof id === 'string') return setJob(id)
    }
    if (answer?.status === 429) {
      // the budget's sentence, the envelope's own — and only OUR code's: a 429 from anything in front of the route is never said
      const body = (await answer.json().catch(() => null)) as { code?: unknown; message?: unknown } | null
      return refuse(body?.code === 'compile_budget' && typeof body.message === 'string' && body.message !== '' ? body.message : E.infrastructure)
    }
    refuse(answer?.status === 423 ? LOCK_COPY.reading : E.infrastructure)
  }

  useEffect(() => {
    alive.current = true
    const el = dialog.current
    if (el && !el.open) {
      el.showModal()
      el.querySelector<HTMLElement>('button, a[href]')?.focus()
    }
    if (!started.current) {
      started.current = true
      void start()
    }
    return () => {
      alive.current = false
    }
  }, [])

  // THE READ: at once, then once a second while the row moves (the wizard's own rule)
  useEffect(() => {
    if (job === null || (view !== null && !isMoving(view.job.stage))) return
    const timer = setTimeout(async () => {
      try {
        const answer = await fetch(`${route}?job=${encodeURIComponent(job)}`, { signal: AbortSignal.timeout(10_000) })
        if (!alive.current) return
        if (answer.ok) return setView((await answer.json()) as ExportView)
        if (answer.status === 404) return refuse(E.infrastructure)
      } catch {
        // not reached: asked again on the next turn
      }
      if (alive.current) setTick((n) => n + 1)
    }, view === null ? 0 : 1000)
    return () => clearTimeout(timer)
  }, [job, view, tick])

  const stage: Stage | null = view?.job.stage ?? (job === null ? null : 'queued')
  const timings = view?.job.timings ?? {}
  const error = view?.job.error ?? null
  const failedAt = timings.checking !== undefined ? 'checking' : 'compiling'

  // the zip, followed once the export is done — Download again pressed for the customer, so its "Preparing…" and its sentence are
  // the one Download's
  useEffect(() => {
    if (stage !== 'done' || followed.current) return
    followed.current = true
    document.getElementById('export-download')?.click()
  }, [stage])

  /* ONE POLITE REGION: each stage as it starts, then how it ended */
  const startsKey = `${timings.compiling?.at ?? ''}|${timings.checking?.at ?? ''}`
  useEffect(() => {
    const fresh: string[] = []
    for (const [st, words] of [['compiling', E.sayCompiling], ['checking', E.sayChecking]] as const) {
      const at = timings[st]?.at
      if (at === undefined || heard.current.has(`${st}:${at}`)) continue
      heard.current.add(`${st}:${at}`)
      fresh.push(words)
    }
    if (stage === 'failed' && !heard.current.has('failed')) {
      heard.current.add('failed')
      fresh.push(W.stageFailed(STAGE_NAMES[failedAt]), (error as DeployError | Finding | null)?.message ?? E.infrastructure)
    }
    if (fresh.length > 0) say(fresh.join(' '))
  }, [startsKey, stage])

  const compileRow =
    timings.compiling?.ms !== undefined && timings.compiling.bytes !== undefined ? (
      <StageRow tone="done" label={E.compiled} meta={E.compiledMeta(timings.compiling.ms, timings.compiling.bytes)} />
    ) : stage === 'failed' && failedAt === 'compiling' ? (
      <StageRow tone="failed" label={W.stageFailed(STAGE_NAMES.compiling)} />
    ) : refused !== null ? null : (
      // the flush and the start are the compile's beginning, as the customer sees it
      <StageRow tone="running" label={E.compilingRow} />
    )
  const warnings = timings.checking?.warnings ?? 0
  const checkRow =
    stage === 'done' ? (
      <StageRow tone="done" label={E.checked} chip={<ResultChip tone={warnings > 0 ? 'warned' : 'clean'}>{E.checkedMeta(warnings)}</ResultChip>} />
    ) : stage === 'failed' && failedAt === 'checking' ? (
      <StageRow tone="failed" label={W.stageFailed(STAGE_NAMES.checking)} />
    ) : stage === 'failed' || refused !== null ? null : (
      <StageRow tone={stage === 'checking' ? 'running' : 'pending'} label={E.checkingRow} />
    )
  const failure = stage === 'failed' ? (error ?? { code: 'deploy_infrastructure', message: E.infrastructure }) : null
  const link = failure !== null && !isFinding(failure) && failure.action !== undefined && failure.href !== undefined ? { words: failure.action, href: failure.href } : null
  const close = () => dialog.current?.close()

  return (
    <dialog
      ref={dialog}
      id="export-window"
      data-export-window={refused !== null ? 'refused' : (stage ?? 'starting')}
      aria-labelledby="export-title"
      onClick={closeOnBackdrop}
      onClose={(event) => {
        if (event.target !== event.currentTarget || dialog.current?.open) return
        onClose()
      }}
      className="relative m-auto box-content max-h-[calc(100dvh-72px)] w-[520px] max-w-[calc(100vw-72px)] flex-col overflow-y-auto overflow-x-hidden rounded-lg bg-surface p-[26px] shadow-modal backdrop:bg-scrim open:flex"
    >
      <div className="flex flex-col gap-[18px]">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h2 id="export-title" className={`m-0 ${wideTitle}`}>{E.title}</h2>
            <p className="text-ui-dense text-ink-soft">{E.body}</p>
          </div>
          <button type="button" aria-label={W.close} onClick={close} className={`mt-1 rounded-sm text-ink-soft transition-colors hover:text-ink ${ring}`}>
            <X size={16} />
          </button>
        </div>
        <div className="flex flex-col gap-3 empty:hidden">
          {compileRow}
          {checkRow}
        </div>
        {failure === null ? null : (
          // S8d′'s panel: the envelope's message, its detail where it is the customer's (never a `compile_failed` one)
          <div data-export-failed className="flex flex-col gap-1 rounded-thumb bg-danger-tint p-[14px_16px]">
            <span className="text-ui font-semibold text-ink">{failure.message}</span>
            {failure.detail !== undefined && failure.code !== 'compile_failed' ? <span className="text-control-label leading-[1.5] text-ink-soft">{failure.detail}</span> : null}
          </div>
        )}
        {stage === 'done' ? (
          <div className="flex flex-col gap-3">
            {ready ? <p data-export-ready className="text-ui-dense leading-[1.5] text-ink [text-wrap:pretty]">{E.ready}</p> : null}
            <SignedDownload
              id="export-download"
              href={`${prefix}${exportDownloadPath(projectId)}`}
              label={E.again}
              onFollowed={(words) => {
                if (!alive.current) return
                setReady(words === null)
                if (words === null) say(E.ready)
              }}
            />
          </div>
        ) : null}
        {refused === null ? null : <p id="export-refused" className="text-ui-dense leading-[1.5] text-ink [text-wrap:pretty]">{refused}</p>}
        <div className="flex items-center justify-end gap-3">
          <Button id="export-close" variant="ghost" size={40} weight="font-medium" className="text-ui-dense" onClick={close}>
            {E.close}
          </Button>
          {link === null ? null : link.href.startsWith('/') ? (
            <Link href={`${prefix}${link.href}`} onClick={close} className={`inline-flex h-10 items-center gap-2 rounded bg-coral-text px-[22px] text-ui-dense font-semibold text-surface transition-colors hover:bg-coral-text-hover ${ring}`}>
              {link.words}
            </Link>
          ) : (
            <a href={link.href} target="_blank" rel="noreferrer" className={`inline-flex h-10 items-center gap-2 rounded bg-coral-text px-[22px] text-ui-dense font-semibold text-surface transition-colors hover:bg-coral-text-hover ${ring}`}>
              {link.words}
              <span className="sr-only"> {W.newTab}</span>
            </a>
          )}
        </div>
      </div>
      <p data-export-said aria-live="polite" className="sr-only">
        <span key={said.n}>{said.words}</span>
      </p>
    </dialog>
  )
}
