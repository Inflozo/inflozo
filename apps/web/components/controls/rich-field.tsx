'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { PropDef } from '@inflozo/library'
import { replaceRange, serializeMarks } from '@inflozo/section-runtime'
import type { PropValue } from '@inflozo/section-runtime'
import { fieldTone, ring } from '@/components/kit/greyed'
import { limitSentence, startInline, type Inline } from '@/lib/inline'
import type { LinkResources } from './link-picker'
import { InlineTools, type InlineToolsHandle, type ScreenSelection } from './mark-toolbar'
import { PlaceholderMenu } from './placeholder-menu'

/* THE PANEL'S TEXT AREA, RICH (Story 5.3). The canvas and the panel edit the same value: a `richtext` prop's field is a
   `contenteditable` holding `serializeMarks`' markup, run by the same controller as the canvas (`lib/inline.ts`) with its
   own P0-1 toolbar and link panel, so a word made italic here is italic on the canvas and the reverse. It keeps the Kit's
   `Multiline` look — label, hairline, the one focus ring (`Editor Sidebar Kit.dc.html:53`). A value changed elsewhere
   redraws it only while it does not hold focus, so a canvas edit never moves a caret someone is typing at. */

const textOf = (v: unknown) =>
  typeof v === 'string' ? v : typeof v === 'object' && v !== null && typeof (v as { text?: unknown }).text === 'string' ? (v as { text: string }).text : ''

/** The limit's sentence, under the field, while the words are at it or when a token was refused for not fitting whole
 *  — the same slot and tone a Text Field's hint takes. */
export const LimitCaption = ({ id, label, max, text, refused = false }: { id: string; label: string; max: number | undefined; text: string; refused?: boolean }) =>
  max !== undefined && (refused || text.length >= max) ? (
    <p id={`${id}-limit`} role="status" className="text-helper-caption leading-[1.5] text-marigold-text">
      {limitSentence(label, max)}
    </p>
  ) : null

export function RichField({
  id,
  label,
  def,
  value,
  onValue,
  links,
  placeholders = [],
}: {
  id: string
  label: string
  def: PropDef
  value: unknown
  onValue: (value: unknown) => void
  links: LinkResources
  /** R-185 — the placeholders this field offers HERE, from `placeholdersOffered`. Empty, and no `{}` button
   *  is drawn at all: the panel never greys one (UX-DR3). */
  placeholders?: readonly string[]
}) {
  const box = useRef<HTMLDivElement>(null)
  const tools = useRef<InlineToolsHandle>(null)
  const [session, setSession] = useState<Inline | null>(null)
  const [selection, setSelection] = useState<ScreenSelection | null>(null)
  // a token chip refused for not fitting whole says so under the field until the next edit (review, 2026-09-18)
  const [refused, setRefused] = useState(false)
  const latest = useRef(value)
  latest.current = value
  const change = useRef(onValue)
  change.current = onValue
  useEffect(() => setRefused(false), [value])
  // the aside scrolls under a fixed toolbar: the selection's rect is reported again so the bar follows its words, as the
  // canvas's does after a scroll (review, 2026-09-18)
  useEffect(() => {
    if (!session) return
    const follow = () => session.report()
    document.addEventListener('scroll', follow, { capture: true, passive: true })
    return () => document.removeEventListener('scroll', follow, { capture: true })
  }, [session])

  // the serializer's markup, whenever the value changes and the field is not being typed in
  useLayoutEffect(() => {
    const el = box.current
    if (!el || (session && !session.ended) || document.activeElement === el) return
    const html = serializeMarks(value as PropValue, def)
    if (el.innerHTML !== html) el.innerHTML = html
  }, [value, session])

  const start = () => {
    const el = box.current
    if (!el || (session && !session.ended)) return
    const inline = startInline(el, {
      def,
      label,
      value: latest.current as PropValue,
      keep: true,
      onValue: (next) => change.current(next),
      // the caption under the field says it while the words are at the limit, and when a token was refused whole
      onRefused: () => setRefused(true),
      onSelection: (s) => setSelection(s && { ...s, rect: s.rect, edge: 0 }),
      onLinkKey: () => tools.current?.openLink(),
      onToolbarKey: () => tools.current?.focusBar(),
      onEnd: () => setSession(null),
    })
    setSession(inline)
  }

  const text = textOf(value)
  /** R-185's Insert — the behaviour P0-1's withdrawn chip row carried, unchanged: whole or nothing against `maxChars`, at the
   *  caret while the field is still being typed in and at the end when it is not (opening the menu moves focus,
   *  which ends the session, so the second arm is the ordinary one here). Never silent: a cut token would print
   *  literally, so it is refused and the limit sentence says why (R-27). */
  const insert = (token: string) => {
    if (session && !session.ended) return session.insert(token)
    const r = replaceRange(latest.current as PropValue, text.length, text.length, token, { max: def.maxChars })
    if (r.refused > 0) return setRefused(true)
    change.current(r.value)
  }
  return (
    <div className="flex flex-col gap-[5px]">
      <span className="flex items-center gap-[6px] text-control-label font-medium text-ink-soft">
        <span id={`${id}-label`}>{label}</span>
        {/* R-185: BESIDE THE LABEL, and nowhere else. P0-1's chip row under the field is withdrawn. */}
        <PlaceholderMenu id={id} label={label} offered={placeholders} onInsert={insert} />
      </span>
      <div
        ref={box}
        id={id}
        role="textbox"
        aria-multiline="true"
        aria-labelledby={`${id}-label`}
        aria-describedby={def.maxChars !== undefined && (refused || text.length >= def.maxChars) ? `${id}-limit` : undefined}
        contentEditable
        suppressContentEditableWarning
        onFocus={start}
        // a link inside the field is words to edit, never somewhere to go — by any button, with any modifier
        onClick={(event) => event.preventDefault()}
        onAuxClick={(event) => event.preventDefault()}
        className={`min-h-16 whitespace-pre-wrap break-words rounded-sm border px-[11px] py-[9px] text-[12.5px] leading-[1.5] text-ink caret-coral ${fieldTone(undefined)} ${ring} focus-visible:border-coral-text`}
      />
      <LimitCaption id={id} label={label} max={def.maxChars} text={text} refused={refused} />
      <InlineTools id={`${id}-inline`} session={session} selection={selection} resources={links} handle={tools} />
    </div>
  )
}
