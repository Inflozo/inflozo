'use client'

import { useEffect, useRef, useState } from 'react'
import { LINK_RELS, PORTAL_ACTIONS } from '@inflozo/library'
import type { Link as LinkRecord } from '@inflozo/library'
import { Button } from '@/components/kit/button'
import { ring, slimScrollbar } from '@/components/kit/greyed'
import { ChevronDown, Globe, Link, LinkOff, PageGlyph, Person, PostGlyph, Search, TagGlyph } from '@/components/kit/icons'
import { SearchInput } from '@/components/kit/input'
import { openPopover } from '@/components/kit/select'

/* The Link Picker (FR-F6), as `P0-1 Inline Text Toolbar.dc.html:66-135` draws its popover: one search
   field, the live groups Pages · Posts · Tags · Authors (each omitted when nothing matches), the four
   Portal actions as chips — always all four, always last — the Ghost search chip under SITE, and one
   "Link to …" row for a pasted URL or a typed email. Choosing fills the popover's filled state: the
   target, Open in new tab and the three Rel toggles — offered ONLY where they can act (an address or an
   internal page, never Portal, search or email: R-68) — then Remove link and Done. Done commits, and
   Escape or a click outside commits nothing.

   ONE PLACE THIS DEPARTS FROM THE FRAME, and why. P0-1 draws the search state and the filled state as
   two panels; the owner's test (steps 11 and 12) re-opens a set link and presses a Portal chip, and on
   another pass presses Remove link, straight away. So the popover keeps the search state on top and
   draws the filled state beneath it once a destination is chosen — the same parts, in P0-1's order, in
   one panel. The closed field is extrapolated from the Kit's closed select: the destination's words,
   and under them the value it compiles to (`account/plans`, never `upgrade`).

   STORY 5.3 SPLITS THE POPOVER OUT as `LinkPanel`, so the inline toolbar opens the same one at a selection (B4b's place,
   P0-1's white popover): `LinkPicker` is its button and a `LinkPanel`, with the markup, the ids and the behaviour as they
   were. The panel opens filled with the record it is handed, or empty, and reports Done with the draft or Remove link
   with `null`; Escape and a click outside report nothing. */

export type LinkResource = { id: string; title: string; url: string; meta: string }
/** Story 5.18 — `capped` is the one honest limit of a client-side search (DW-248): where the connected site holds more
 *  posts than the rows in hand, the line that says so and how to link an older one. Absent on the sample. */
export type LinkResources = Readonly<Record<'pages' | 'posts' | 'tags' | 'authors', readonly LinkResource[]>> & { readonly capped?: string }

const GROUPS = [
  { key: 'pages', kind: 'page', label: 'Pages', icon: <PageGlyph size={14} className="shrink-0 text-ink-soft" /> },
  { key: 'posts', kind: 'post', label: 'Posts', icon: <PostGlyph size={14} className="shrink-0 text-ink-soft" /> },
  { key: 'tags', kind: 'tag', label: 'Tags', icon: <TagGlyph size={14} className="shrink-0 text-ink-soft" /> },
  { key: 'authors', kind: 'author', label: 'Authors', icon: <Person size={14} className="shrink-0 text-ink-soft" /> },
] as const

/** A stored value as a record: a bare string is `{ href }`, anything empty is no link. */
const recordOf = (v: unknown): LinkRecord | null =>
  typeof v === 'string' ? (v.trim() === '' ? null : { href: v }) : typeof v === 'object' && v !== null ? (v as LinkRecord) : null

const isWeb = (href: string) => /^https?:\/\//i.test(href)
const isMail = (href: string) => /^(mailto|tel):/i.test(href)

/** A typed query that bypasses search: an address, or an email that becomes `mailto:`. */
function outside(q: string): string | null {
  if (/^(https?:\/\/|mailto:|tel:)\S+$/i.test(q)) return q
  if (/^[^\s@/]+@[^\s@/]+\.[^\s@/]+$/.test(q)) return `mailto:${q}`
  return null
}

/** The words a record reads as, and the value under them. */
function describe(link: LinkRecord | null, resources: LinkResources): { title: string; meta: string; kind: string } {
  if (link === null) return { title: 'No link yet', meta: '', kind: 'none' }
  if (typeof link.portal === 'string') {
    return { title: `Portal · ${PORTAL_ACTIONS[link.portal] ?? link.portal}`, meta: link.portal, kind: 'portal' }
  }
  if (link.search === true) return { title: 'Ghost search', meta: '', kind: 'search' }
  const href = typeof link.href === 'string' ? link.href : ''
  if (link.ref) {
    const group = GROUPS.find((g) => g.kind === link.ref?.kind)
    const found = group ? resources[group.key].find((r) => r.id === link.ref?.id) : undefined
    if (found && group) {
      let path = found.url
      try {
        path = new URL(found.url).pathname
      } catch {
        /* a relative URL is its own path */
      }
      return { title: found.title, meta: `${group.kind.toUpperCase()} · ${path}`, kind: 'internal' }
    }
  }
  if (isMail(href)) return { title: href.replace(/^(mailto|tel):/i, ''), meta: href.split(':')[0]?.toLowerCase() ?? '', kind: 'email' }
  return { title: href, meta: 'URL', kind: 'url' }
}

/** The title with the matched run in bold, as P0-1 marks it. */
function matched(title: string, q: string) {
  const at = title.toLowerCase().indexOf(q.toLowerCase())
  if (at < 0 || q === '') return title
  return (
    <>
      {title.slice(0, at)}
      <mark className="bg-transparent font-bold text-inherit">{title.slice(at, at + q.length)}</mark>
      {title.slice(at + q.length)}
    </>
  )
}

const chip = (pressed: boolean) =>
  `inline-flex h-[26px] items-center gap-[6px] rounded-pill border px-[10px] text-[12px] font-medium ${ring} ${
    pressed ? 'border-coral bg-coral-tint text-ink' : 'border-line text-ink hover:border-line-strong'
  }`

export function LinkPicker({
  id,
  label,
  value,
  resources,
  onChange,
}: {
  id: string
  label: string
  value: unknown
  resources: LinkResources
  /** the committed record, or `null` for Remove link */
  onChange: (link: LinkRecord | null) => void
}) {
  const stored = recordOf(value)
  const shown = describe(stored, resources)
  const pop = `${id}-link`

  return (
    <div className="flex flex-col gap-[5px]">
      <span id={`${id}-label`} className="text-control-label font-medium text-ink-soft">
        {label}
      </span>
      <button
        type="button"
        id={id}
        aria-labelledby={`${id}-label ${id}`}
        popoverTarget={pop}
        onClick={(event) => {
          const el = document.getElementById(pop)
          if (el) openPopover(el, event.currentTarget, { side: 'down', align: 'left' }, document.getElementById(`${id}-q`))
        }}
        className={`flex min-h-[38px] items-center gap-[9px] rounded-sm border border-line bg-surface px-[11px] py-[6px] text-left hover:border-line-strong ${ring}`}
      >
        <Link size={13} className="shrink-0 text-ink-soft" />
        <span className="flex min-w-0 flex-1 flex-col">
          <span className={`truncate text-[12.5px] font-medium ${stored === null ? 'text-ink-soft' : 'text-ink'}`}>{shown.title}</span>
          {shown.meta ? <span className="truncate font-mono text-[10px] text-ink-soft">{shown.meta}</span> : null}
        </span>
        <ChevronDown size={12} className="shrink-0 text-ink-soft" />
      </button>
      <LinkPanel id={id} label={label} record={stored} resources={resources} onCommit={onChange} />
    </div>
  )
}

/** P0-1's link popover, `popover="auto"` with the id `${id}-link` and its search `${id}-q`. Opened by the caller through
 *  `openPopover`; each opening starts from `record` with an empty search. */
export function LinkPanel({
  id,
  label,
  record,
  resources,
  onCommit,
}: {
  id: string
  label: string
  /** the link the panel opens filled with, or null for an empty one */
  record: LinkRecord | null
  resources: LinkResources
  /** Done with the draft, or Remove link with `null` — never called for Escape or a click outside */
  onCommit: (link: LinkRecord | null) => void
}) {
  const [query, setQuery] = useState('')
  const [draft, setDraft] = useState<LinkRecord | null>(null)
  const pop = `${id}-link`
  const panel = useRef<HTMLDivElement>(null)
  const opening = useRef(record)
  opening.current = record
  useEffect(() => {
    const el = panel.current
    if (!el) return
    const reset = (event: Event) => {
      if ((event as ToggleEvent).newState !== 'open') return
      setDraft(opening.current)
      setQuery('')
    }
    el.addEventListener('beforetoggle', reset)
    return () => el.removeEventListener('beforetoggle', reset)
  }, [])

  const q = query.trim()
  const address = outside(q)
  const groups =
    q === '' || address !== null
      ? []
      : GROUPS.map((g) => ({ ...g, rows: resources[g.key].filter((r) => r.title.toLowerCase().includes(q.toLowerCase())) })).filter((g) => g.rows.length > 0)

  const d = describe(draft, resources)
  // R-68: new tab and rel act only on an address or an internal page
  const options = draft !== null && typeof draft.href === 'string' && !isMail(draft.href) && draft.portal === undefined && draft.search === undefined
  const close = () => document.getElementById(pop)?.hidePopover()
  const choose = (next: LinkRecord) => {
    setDraft(next)
    setQuery('')
  }
  const rels = new Set(draft?.rel ?? [])

  return (
    <div
      ref={panel}
      id={pop}
      popover="auto"
      role="dialog"
      aria-label={`${label} — choose a destination`}
      className="max-h-[min(640px,85vh)] w-[340px] max-w-[calc(100vw-16px)] flex-col gap-2 overflow-hidden rounded border border-line bg-surface p-[10px] shadow-lg open:flex"
    >
      {/* The search stays at the top and the chosen destination with Done at the foot; only the results
          between them scroll (the owner's finding 7 on Story 4.5: a search for "e" lists dozens of rows). */}
      <SearchInput
        id={`${id}-q`}
        label="Search pages, posts — or paste a URL"
        labelHidden
        placeholder="Search pages, posts — or paste a URL"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && address !== null) {
            event.preventDefault()
            choose({ href: address, ...(isWeb(address) ? { newTab: true } : {}) })
          }
        }}
      />
      {resources.capped === undefined ? null : (
        <p data-link-capped className="px-[2px] text-[11.5px] leading-[1.5] text-ink-soft">
          {resources.capped}
        </p>
      )}

      <div className={`-mx-[10px] flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-[10px] ${slimScrollbar}`}>
        {groups.map((g) => (
          <div key={g.key} role="group" aria-labelledby={`${id}-${g.key}`} className="flex flex-col gap-px">
            <span id={`${id}-${g.key}`} className="px-2 pb-[3px] pt-[6px] text-[10.5px] font-semibold uppercase tracking-[0.05em] text-ink-soft">
              {g.label}
            </span>
            {g.rows.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => choose({ href: r.url, ref: { kind: g.kind, id: r.id } })}
                className={`flex items-center gap-[9px] rounded-sm px-2 py-[7px] text-left hover:bg-paper ${ring}`}
              >
                {g.icon}
                <span className="min-w-0 flex-1 truncate text-ui-dense font-medium text-ink">{matched(r.title, q)}</span>
                <span className="shrink-0 text-[10.5px] text-ink-soft">{r.meta}</span>
              </button>
            ))}
          </div>
        ))}

        {address !== null ? (
          <button
            type="button"
            onClick={() => choose({ href: address, ...(isWeb(address) ? { newTab: true } : {}) })}
            className={`flex items-center gap-[9px] rounded-sm px-2 py-[7px] text-left hover:bg-paper ${ring}`}
          >
            <Globe size={14} className="shrink-0 text-ink-soft" />
            <span className="min-w-0 flex-1 truncate text-ui-dense font-medium text-ink">Link to {q}</span>
          </button>
        ) : null}

        {groups.length > 0 || address !== null ? <div aria-hidden className="mx-1 my-[2px] h-px bg-line" /> : null}

        <div role="group" aria-labelledby={`${id}-portal`} className="flex flex-col gap-px">
          <span id={`${id}-portal`} className="px-2 pb-[3px] pt-[6px] text-[10.5px] font-semibold uppercase tracking-[0.05em] text-ink-soft">
            Portal actions
          </span>
          <div className="flex flex-wrap gap-[6px] px-2 pb-[6px] pt-[2px]">
            {Object.entries(PORTAL_ACTIONS).map(([action, words]) => (
              <button key={action} type="button" aria-pressed={draft?.portal === action} onClick={() => choose({ portal: action })} className={chip(draft?.portal === action)}>
                {words}
              </button>
            ))}
          </div>
          <span id={`${id}-site`} className="px-2 pt-[2px] font-mono text-[10.5px] tracking-[0.06em] text-ink-soft">
            SITE
          </span>
          <div role="group" aria-labelledby={`${id}-site`} className="flex flex-wrap gap-[6px] px-2 pb-[2px] pt-[4px]">
            <button type="button" aria-pressed={draft?.search === true} onClick={() => choose({ search: true })} className={chip(draft?.search === true)}>
              <Search size={12} className="text-ink-soft" />
              Ghost search
            </button>
          </div>
        </div>

        <p className="flex items-center gap-[7px] px-2 pb-[2px] pt-1 text-[11.5px] text-ink-soft">
          <Globe size={13} className="shrink-0" />
          Paste a URL or type an email address to link outside the site
        </p>
      </div>

      {draft !== null ? (
        <div className="flex shrink-0 flex-col gap-[10px] border-t border-line pt-[10px]">
          <div className="flex items-center gap-[9px] rounded-sm border border-line bg-paper px-[10px] py-[9px]">
            {d.kind === 'internal' ? <PostGlyph /> : <Link size={14} className="shrink-0 text-ink-soft" />}
            <span className="flex min-w-0 flex-1 flex-col gap-px">
              <span className="truncate text-ui-dense font-medium text-ink">{d.title}</span>
              {d.meta ? <span className="truncate font-mono text-[10px] text-ink-soft">{d.meta}</span> : null}
            </span>
          </div>
          {options ? (
            <>
              <label className="flex cursor-pointer items-center gap-[9px] px-[2px] text-ui-dense font-medium text-ink">
                <input
                  type="checkbox"
                  checked={draft.newTab === true}
                  onChange={(event) => setDraft({ ...draft, newTab: event.target.checked })}
                  className={`size-4 accent-coral-text ${ring}`}
                />
                Open in new tab
              </label>
              <div role="group" aria-labelledby={`${id}-rel`} className="flex flex-col gap-[6px] px-[2px]">
                <span id={`${id}-rel`} className="text-[11px] font-semibold uppercase tracking-[0.05em] text-ink-soft">
                  Rel
                </span>
                <div className="flex flex-wrap gap-[6px]">
                  {LINK_RELS.map((rel) => {
                    const on = rels.has(rel)
                    return (
                      <button
                        key={rel}
                        type="button"
                        aria-pressed={on}
                        onClick={() => {
                          const next = new Set(rels)
                          if (on) next.delete(rel)
                          else next.add(rel)
                          setDraft({ ...draft, rel: LINK_RELS.filter((r) => next.has(r)) })
                        }}
                        className={`inline-flex h-[26px] items-center rounded-pill px-[10px] font-mono text-[11px] ${ring} ${
                          on ? 'bg-coral-tint font-medium text-coral-text' : 'border border-line text-ink-soft'
                        }`}
                      >
                        {rel}
                      </button>
                    )
                  })}
                </div>
              </div>
            </>
          ) : null}
          <div className="flex items-center justify-between border-t border-line px-[2px] pt-[10px]">
            <button
              type="button"
              onClick={() => {
                close()
                onCommit(null)
              }}
              className={`inline-flex items-center gap-[6px] text-[12.5px] font-medium text-coral-text ${ring}`}
            >
              <LinkOff size={13} />
              Remove link
            </button>
            <Button
              variant="coral"
              size={32}
              onClick={() => {
                close()
                onCommit(draft)
              }}
            >
              Done
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
