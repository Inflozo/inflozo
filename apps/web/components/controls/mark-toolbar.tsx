'use client'

import { useEffect, useImperativeHandle, useLayoutEffect, useRef, useState, type ReactNode, type Ref } from 'react'
import { createPortal } from 'react-dom'
import type { Link as LinkRecord } from '@inflozo/library'
import { ring } from '@/components/kit/greyed'
import { InfoCircle, Link, LinkOff, Lock } from '@/components/kit/icons'
import { openPopover } from '@/components/kit/select'
import type { Inline, InlineSelection } from '@/lib/inline'
import { LinkPanel, type LinkResources } from './link-picker'

/* P0-1 · INLINE TEXT TOOLBAR (Story 5.3) — `P0-1 Inline Text Toolbar.dc.html`, the bar over body text (:28-46) and over a
   headline with a mark pressed (:48-64), and the plain-text-locked pill (:138-147).

   The bar is editor chrome, not canvas content: a white surface, the editor's hairline, the 10px thumb radius, the `md`
   shadow (the spec's word, P0 spec :158 — the frame's heavier alpha has no token), 3px padding and 30px targets at a 7px
   radius. B, I and U are Georgia letterforms at 15px, as P0-1 draws them — the one place a serif styles app chrome
   (DESIGN.md's exception, the export wins); Link and Remove link are the Kit's `Link` and `LinkOff`, mounted rather than
   redrawn, behind a hairline. Only the marks the field permits render, in P0-1's order (UX-DR19: absent, not greyed); a
   field with none shows no bar. Remove link stays in its slot at 35% while nothing selected is linked.

   It is a fixed element portalled into the editor document's body — never a `popover`, so the editor's Esc guard never
   takes it for one — centred 8px above the selection, or below it when the selection's top is within 48px of the
   canvas's top edge, and kept inside the window. Every button's `mousedown` is prevented, so the text keeps focus and
   its selection. Link opens Story 4.5's `LinkPanel` anchored to its button, with the bar laid out but hidden so the
   anchor keeps its rect. ABSENT (R-87): P0-1's docked bar at 390. */

export type ScreenSelection = Omit<InlineSelection, 'rect'> & {
  rect: { left: number; top: number; width: number; height: number }
  /** the top edge, on screen, of the view the selection sits in — the canvas's top, or the window's */
  edge: number
}

const MARK_BUTTONS: readonly { mark: string; label: string; glyph: ReactNode }[] = [
  { mark: 'strong', label: 'Bold', glyph: <span className="font-[Georgia,serif] text-[15px] font-bold leading-none">B</span> },
  { mark: 'em', label: 'Italic', glyph: <span className="font-[Georgia,serif] text-[15px] italic leading-none">I</span> },
  { mark: 'u', label: 'Underline', glyph: <span className="font-[Georgia,serif] text-[15px] leading-none underline underline-offset-2">U</span> },
]

const slot = `inline-flex size-[30px] items-center justify-center rounded-[7px] ${ring}`

function MarkToolbar({
  allowed,
  selection,
  hidden,
  barRef,
  linkRef,
  onMark,
  onLink,
  onUnlink,
  onEscape,
  onLeave,
}: {
  allowed: readonly string[]
  selection: ScreenSelection
  hidden: boolean
  barRef: Ref<HTMLDivElement>
  linkRef: Ref<HTMLButtonElement>
  onMark: (mark: string) => void
  onLink: () => void
  onUnlink: () => void
  onEscape: () => void
  onLeave: (to: EventTarget | null) => void
}) {
  const bar = useRef<HTMLDivElement | null>(null)
  useImperativeHandle(barRef, () => bar.current as HTMLDivElement)
  // placed from the selection's rect after every render, so a pressed mark that re-wraps the words re-centres it
  useLayoutEffect(() => {
    const el = bar.current
    if (!el) return
    const { rect, edge } = selection
    const [w, h] = [el.offsetWidth, el.offsetHeight]
    const left = Math.max(8, Math.min(rect.left + rect.width / 2 - w / 2, window.innerWidth - w - 8))
    const top = Math.max(8, Math.min(rect.top - edge < 48 ? rect.top + rect.height + 8 : rect.top - 8 - h, window.innerHeight - h - 8))
    el.style.left = `${left}px`
    el.style.top = `${top}px`
  })
  const marks = MARK_BUTTONS.filter((b) => allowed.includes(b.mark))
  const link = allowed.includes('a')
  const keep = (event: { preventDefault: () => void }) => event.preventDefault()
  return createPortal(
    <div
      ref={bar}
      role="toolbar"
      aria-label="Text formatting"
      data-inline-toolbar=""
      onKeyDown={(event) => {
        const buttons = [...event.currentTarget.querySelectorAll('button')]
        const at = buttons.indexOf(document.activeElement as HTMLButtonElement)
        if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
          event.preventDefault()
          buttons[(at + (event.key === 'ArrowRight' ? 1 : buttons.length - 1)) % buttons.length]?.focus()
        } else if (event.key === 'Escape') {
          event.preventDefault()
          event.stopPropagation()
          onEscape()
        }
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) onLeave(event.relatedTarget)
      }}
      style={{ visibility: hidden ? 'hidden' : 'visible' }}
      className="fixed z-50 flex items-center gap-px rounded-thumb border border-line bg-surface p-[3px] text-ink shadow-md"
    >
      {marks.map((b, i) => {
        const pressed = selection.marks.includes(b.mark)
        return (
          <button
            key={b.mark}
            type="button"
            aria-label={b.label}
            aria-pressed={pressed}
            tabIndex={i === 0 ? 0 : -1}
            onMouseDown={keep}
            onClick={() => onMark(b.mark)}
            className={`${slot} ${pressed ? 'bg-coral-tint text-coral-text' : 'hover:bg-paper'}`}
          >
            {b.glyph}
          </button>
        )
      })}
      {marks.length > 0 && link ? <span aria-hidden className="mx-[3px] h-4 w-px bg-line" /> : null}
      {link ? (
        <>
          <button ref={linkRef} type="button" aria-label="Link" aria-haspopup="dialog" tabIndex={marks.length === 0 ? 0 : -1} onMouseDown={keep} onClick={onLink} className={`${slot} hover:bg-paper`}>
            <Link size={15} />
          </button>
          <button
            type="button"
            aria-label="Remove link"
            aria-disabled={!selection.linked}
            tabIndex={-1}
            onMouseDown={keep}
            onClick={() => {
              if (selection.linked) onUnlink()
            }}
            className={`${slot} ${selection.linked ? 'hover:bg-paper' : 'opacity-35'}`}
          >
            <LinkOff size={15} />
          </button>
        </>
      ) : null}
    </div>,
    document.body,
  )
}

export type InlineToolsHandle = { openLink: () => void; focusBar: () => void; closeLink: () => void }

/** The toolbar and its link panel for one inline editing session, wherever the text is: the canvas or the panel. */
export function InlineTools({
  id,
  session,
  selection,
  hidden = false,
  resources,
  handle,
}: {
  id: string
  session: Inline | null
  selection: ScreenSelection | null
  /** the canvas is scrolling: the bar hides, laid out, and returns when the host reports the selection again */
  hidden?: boolean
  resources: LinkResources
  handle: Ref<InlineToolsHandle>
}) {
  const bar = useRef<HTMLDivElement | null>(null)
  const linkButton = useRef<HTMLButtonElement | null>(null)
  const [linking, setLinking] = useState<{ record: LinkRecord | null } | null>(null)
  // while the link panel is open, the bar keeps the selection it was opened from
  const kept = useRef<ScreenSelection | null>(null)
  if (selection) kept.current = selection
  if (!session) kept.current = null
  const shown = selection ?? (linking ? kept.current : null)
  const pop = `${id}-link`

  const openLink = () => {
    if (!session || session.ended || !kept.current || !session.allowed.includes('a')) return
    session.alive(true)
    setLinking({ record: kept.current.link })
  }
  useImperativeHandle(handle, () => ({
    openLink,
    focusBar: () => {
      if (!session || !bar.current) return
      session.alive(true)
      bar.current.querySelector<HTMLButtonElement>('button[tabindex="0"]')?.focus()
    },
    closeLink: () => {
      const el = document.getElementById(pop)
      if (el?.matches(':popover-open')) el.hidePopover()
    },
  }))

  // opened after the render that handed the panel its record; every close puts focus back in the text with its selection,
  // after `openPopover` has handed focus to the hidden trigger
  useEffect(() => {
    const el = document.getElementById(pop)
    if (!linking || !el || !linkButton.current) return
    const closed = (event: Event) => {
      if ((event as ToggleEvent).newState !== 'closed') return
      el.removeEventListener('toggle', closed)
      setLinking(null)
      setTimeout(() => {
        if (!session || session.ended) return
        session.refocus()
        session.alive(false)
      }, 0)
    }
    openPopover(el, linkButton.current, { side: 'down', align: 'left' }, document.getElementById(`${id}-q`))
    el.addEventListener('toggle', closed)
    return () => el.removeEventListener('toggle', closed)
    // `linking` alone opens it; the session is read as it is now
  }, [linking])

  if (!session || session.allowed.length === 0) return null
  return (
    <>
      {shown ? (
        <MarkToolbar
          allowed={session.allowed}
          selection={shown}
          hidden={hidden || linking !== null}
          barRef={bar}
          linkRef={linkButton}
          onMark={(mark) => session.toggle(mark)}
          onLink={openLink}
          onUnlink={() => session.link(null)}
          onEscape={() => {
            session.refocus()
            session.alive(false)
          }}
          onLeave={(to) => {
            if (linking || (to instanceof Node && document.getElementById(pop)?.contains(to))) return
            // focus left the bar for somewhere that is not the text: that is the end of editing
            setTimeout(() => {
              if (session.ended) return
              // back in the text (a press into it): the session is no longer held alive by the bar, and the bar follows
              // the selection again — leaving it alive would keep editing open after focus left for the panel (review)
              session.alive(false)
              if (session.focused()) return session.report()
              session.end()
            }, 0)
          }}
        />
      ) : null}
      {session.allowed.includes('a') ? (
        <LinkPanel id={id} label="Link" record={linking?.record ?? null} resources={resources} onCommit={(record) => session.link(record)} />
      ) : null}
    </>
  )
}

/** P0-1's pill (:138-147): never pressable, chrome in the canvas's own layer beside its words. A lock naming Ghost's own
 *  words (R-122), or the limit's sentence when a character was refused. */
export function CanvasNote({ kind, words, ref }: { kind: 'lock' | 'limit'; words: string; ref?: Ref<HTMLDivElement> }) {
  return (
    <div
      ref={ref}
      role="status"
      data-chrome="note"
      style={{ visibility: 'hidden' }}
      className="pointer-events-none absolute inline-flex h-6 w-max items-center gap-[6px] whitespace-nowrap rounded-pill border border-line bg-surface px-[9px] text-ink-soft shadow-md"
    >
      {kind === 'lock' ? <Lock size={11} /> : <InfoCircle size={11} />}
      <span className="text-[11px] font-medium">{words}</span>
    </div>
  )
}
