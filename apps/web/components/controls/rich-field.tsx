'use client'

import { useLayoutEffect, useRef, useState } from 'react'
import type { PropDef } from '@inflozo/library'
import { replaceRange, serializeMarks } from '@inflozo/section-runtime'
import type { PropValue } from '@inflozo/section-runtime'
import { fieldTone, ring } from '@/components/kit/greyed'
import { InfoCircle } from '@/components/kit/icons'
import { limitSentence, startInline, type Inline } from '@/lib/inline'
import type { LinkResources } from './link-picker'
import { InlineTools, type InlineToolsHandle, type ScreenSelection } from './mark-toolbar'

/* THE PANEL'S TEXT AREA, RICH (Story 5.3). The canvas and the panel edit the same value: a `richtext` prop's field is a
   `contenteditable` holding `serializeMarks`' markup, run by the same controller as the canvas (`lib/inline.ts`) with its
   own P0-1 toolbar and link panel, so a word made italic here is italic on the canvas and the reverse. It keeps the Kit's
   `Multiline` look — label, hairline, the one focus ring (`Editor Sidebar Kit.dc.html:53`). A value changed elsewhere
   redraws it only while it does not hold focus, so a canvas edit never moves a caret someone is typing at. */

const textOf = (v: unknown) =>
  typeof v === 'string' ? v : typeof v === 'object' && v !== null && typeof (v as { text?: unknown }).text === 'string' ? (v as { text: string }).text : ''

/** The limit's sentence, under the field, while the words are at it — the same slot and tone a Text Field's hint takes. */
export const LimitCaption = ({ id, label, max, text }: { id: string; label: string; max: number | undefined; text: string }) =>
  max !== undefined && text.length >= max ? (
    <p id={`${id}-limit`} role="status" className="text-helper-caption leading-[1.5] text-marigold-text">
      {limitSentence(label, max)}
    </p>
  ) : null

/** P0-1's typed tokens (:174-204): the field's own list, each chip inserting `{token}` at the cursor. A token the field
 *  already holds is drawn pressed, as the frame draws it. No row for a prop without tokens; no "On the site" line until the
 *  connected site's values arrive (Story 5.18). */
export function TokenRow({ tokens, text, onInsert }: { tokens: readonly string[] | undefined; text: string; onInsert: (token: string) => void }) {
  if (!tokens || tokens.length === 0) return null
  return (
    <div className="flex flex-col gap-[6px]">
      <span className="font-mono text-[10px] text-ink-soft">TOKENS THIS FIELD ACCEPTS</span>
      <div className="flex flex-wrap gap-[5px]">
        {tokens.map((t) => {
          const used = text.includes(`{${t}}`)
          return (
            <button
              key={t}
              type="button"
              // the field keeps focus and its cursor
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => onInsert(`{${t}}`)}
              className={`inline-flex h-6 items-center rounded-[6px] px-2 font-mono text-[11px] ${ring} ${used ? 'bg-coral-tint text-coral-text' : 'border border-line text-ink-soft hover:border-line-strong'}`}
            >
              {`{${t}}`}
            </button>
          )
        })}
      </div>
      <div className="flex items-start gap-2 rounded-sm bg-paper-sunk p-[9px_10px]">
        <InfoCircle size={13} className="mt-px shrink-0 text-ink-soft" />
        <span className="text-[11.5px] leading-[1.5] text-ink-soft">Anything else in braces prints exactly as you typed it — {'{this}'} stays {'{this}'} on the page.</span>
      </div>
    </div>
  )
}

export function RichField({
  id,
  label,
  def,
  value,
  onValue,
  links,
}: {
  id: string
  label: string
  def: PropDef
  value: unknown
  onValue: (value: unknown) => void
  links: LinkResources
}) {
  const box = useRef<HTMLDivElement>(null)
  const tools = useRef<InlineToolsHandle>(null)
  const [session, setSession] = useState<Inline | null>(null)
  const [selection, setSelection] = useState<ScreenSelection | null>(null)
  const latest = useRef(value)
  latest.current = value
  const change = useRef(onValue)
  change.current = onValue

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
      // the caption under the field says it while the words are at the limit
      onRefused: () => undefined,
      onSelection: (s) => setSelection(s && { ...s, rect: s.rect, edge: 0 }),
      onLinkKey: () => tools.current?.openLink(),
      onToolbarKey: () => tools.current?.focusBar(),
      onEnd: () => setSession(null),
    })
    setSession(inline)
  }

  const text = textOf(value)
  return (
    <div className="flex flex-col gap-[5px]">
      <span id={`${id}-label`} className="text-control-label font-medium text-ink-soft">
        {label}
      </span>
      <div
        ref={box}
        id={id}
        role="textbox"
        aria-multiline="true"
        aria-labelledby={`${id}-label`}
        aria-describedby={def.maxChars !== undefined && text.length >= def.maxChars ? `${id}-limit` : undefined}
        contentEditable
        suppressContentEditableWarning
        onFocus={start}
        onClick={(event) => {
          // a link inside the field is words to edit, never somewhere to go
          if ((event.target as HTMLElement).closest('a')) event.preventDefault()
        }}
        className={`min-h-16 whitespace-pre-wrap break-words rounded-sm border px-[11px] py-[9px] text-[12.5px] leading-[1.5] text-ink caret-coral ${fieldTone(undefined)} ${ring} focus-visible:border-coral-text`}
      />
      <LimitCaption id={id} label={label} max={def.maxChars} text={text} />
      <TokenRow
        tokens={def.tokens}
        text={text}
        onInsert={(token) => {
          if (session && !session.ended) return session.insert(token)
          change.current(replaceRange(latest.current as PropValue, text.length, text.length, token, { max: def.maxChars }).value)
        }}
      />
      <InlineTools id={`${id}-inline`} session={session} selection={selection} resources={links} handle={tools} />
    </div>
  )
}
