'use client'

import { useRef, useState } from 'react'
import { Book, Check, ChevronDown, ChevronUp, Image as ImageGlyph, Search } from '@/components/kit/icons'
import { ring } from '@/components/kit/greyed'
import { arrowKeys, openMenu } from '@/lib/menu'
import {
  GONE, SEARCH_WORDS, SOURCE_WORDS, SUBJECT_HEADING, SUBJECT_HELP, filterSubjects, subjectLabel,
  type Subject, type SubjectRow,
} from '@/lib/preview-subject'

/* B9's CONTENT-SOURCE PILL and D5e's PREVIEW SUBJECT PICKER (Story 5.13, FR-D15, FR-D22).
 *
 * TWO FRAMES, AND THEY DISAGREE ABOUT THE PILL — `epics.md`'s own acceptance criterion rules it: *"the pill matches
 * B9 and the picker matches D5e"*. B9 draws the pill light — `paper-raised` on a dashed hairline at a 24px radius, the
 * state carried by solid-vs-dashed rather than by a colour alone); D5e draws it as a 30px item inside an ink bar,
 * which it inherited from the D5 prompt's blanket "THE PILL SPEC IS SHARED" line — a rule B9 had explicitly scoped
 * to the two ink pills beside it. So: B9's pill, D5e's menu.
 *
 * R-166 (owner, 2026-09-20) IS THE ONE DEPARTURE FROM B9, AND IT IS A MEASUREMENT. The pill lives in the stage's
 * own ground, which R-139 fixed at 32px (`py-8`); B9's drawn `padding:5px 12px` over 12.5px type measures about
 * 27px and D5e states 30px, so at `ViewportChip`'s 4px inset a drawn pill lands between one pixel clear of the page
 * card's bottom edge and two pixels over it on any height-bound device — R-138's measured failure with no margin.
 * The pill is therefore built at **24px**, `py-8` does not move and no card loses a pixel at any size. 24px is
 * above WCAG 2.5.8's target floor, and it is the same trade `ViewportChip` already makes in the opposite corner.
 * Everything else here is B9's: the dashed border, the grey dot, the words, the radius and the type.
 *
 * WHAT IS ABSENT, AND WHY IT IS NOT A PLACEHOLDER (R-118, UX-DR3). There is no SOURCE group and no connected state:
 * until Story 5.18 reads a linked site, every canvas in the product renders the bundled publication, so
 * "Sample content" is the TRUE state of every project — including one whose `linked_site_id` Story 3.4 already
 * set. The pill describes the canvas and never the paperwork. Nothing is greyed and nothing is captioned.
 *
 * NO COLOUR LITERAL, AND ONE ROUNDING NAMED HERE as `device-switch.tsx` names its own, because `tokens.test.ts`
 * forbids a colour anywhere under `apps/web`: B9's dashed border is drawn in a value that is in NO token set and in
 * no other frame, and `line-strong` — one step darker, and already the dot's own colour — is the nearest. The fill
 * is exactly `paper-raised`, the radius exactly `radius-pill` and the type exactly the frame's 12.5px.
 */

/** D5e's row, and the Kit's menu-row shape under it. */
const ROW = 'flex w-full items-center gap-[9px] rounded-sm px-[10px] py-2 text-left transition-colors'

export function SourcePill({
  subject,
  rows,
  fellBack,
  refusal,
  onChoose,
}: {
  /** The subject this canvas is ACTUALLY rendering (`resolveSubject`'s answer), or NULL where the canvas renders no
   *  single resource — which is `hasSubject(file)` already answered, derived from `placement.ts`'s own table. */
  subject: Subject | null
  /** D5e's rows for this canvas's kind, already shaped by `subjectOptions` */
  rows: readonly SubjectRow[]
  /** the stored subject had gone, so the fixture is what is rendering and the menu says so (FR-D22) */
  fellBack: boolean
  /** the save was refused: the choice stands for this session and the menu says it will not survive a reload */
  refusal: string | null
  onChoose: (next: Subject) => void
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const menu = useRef<HTMLDivElement>(null)
  const field = useRef<HTMLInputElement>(null)

  const kind = subject?.kind
  const label = subject === null ? null : subjectLabel(subject, rows)
  const shown = filterSubjects(rows, query)

  const words = (
    <>
      {/* B9's dot: grey, because nothing on this canvas is the customer's own writing yet */}
      <span aria-hidden data-dot="sample" className="size-1.5 shrink-0 rounded-full bg-line-strong" />
      <span className="text-[12.5px] leading-none text-ink-soft">{SOURCE_WORDS.lead}</span>
      <span data-source className="text-[12.5px] font-semibold leading-none">{SOURCE_WORDS.sample}</span>
      {label === null ? null : (
        <>
          <span aria-hidden className="text-[12.5px] leading-none text-ink-soft">·</span>
          <span data-subject className="max-w-[220px] truncate text-[12.5px] leading-none">{label}</span>
        </>
      )}
    </>
  )

  // B9's not-connected pill, at R-166's 24px. `bottom-1` is `ViewportChip`'s own 4px inset in the opposite corner,
  // so the pill's top edge sits 28px above the ground's bottom and the card — which the 32px padding holds clear —
  // can never reach it on any device.
  const skin =
    'absolute bottom-1 left-1/2 flex h-6 -translate-x-1/2 items-center gap-[7px] whitespace-nowrap rounded-pill border border-dashed border-line-strong bg-paper-raised px-3'

  // NOTHING TO OPEN where the canvas renders no single resource (Home, 404, the membership canvases): the pill
  // states the source and carries no chevron and no menu — absent, never a control that opens an empty list.
  if (subject === null || kind === undefined) {
    return (
      // `pointer-events-none` for `ViewportChip`'s own reason: this variant is NOT pressable, so a press on it must
      // land on the ground `<section>` itself and R-123's deselect must still read `e.target === e.currentTarget`.
      // The pressable variant below is a control and does not want that; a span that swallowed presses would be a
      // fourth ground nobody declared.
      <span id="editor-source" data-source-pill data-has-subject="false" className={`${skin} pointer-events-none`}>
        {words}
      </span>
    )
  }

  const choose = (row: SubjectRow) => {
    menu.current?.hidePopover()
    // `fellBack`: the row in force is the fixture the canvas FELL BACK to, and the stored value is still the one
    // that has gone — so pressing it is a real choice, the only one that clears the notice (review, 2026-09-21)
    if (fellBack || row.slug !== subject.slug) onChoose({ kind, slug: row.slug })
  }

  return (
    <>
      <button
        type="button"
        id="editor-source"
        data-source-pill
        data-has-subject="true"
        /* NO `aria-label`. The button's name is its OWN words plus the line below, so the accessible name always
           CONTAINS the visible one — WCAG 2.5.3, which axe checks as `label-content-name-mismatch` and which a
           hand-written label over visible text fails the moment the two are punctuated differently. */
        aria-expanded={open}
        popoverTarget="editor-source-menu"
        onClick={(event) => {
          if (menu.current) openMenu(menu.current, event.currentTarget, { side: 'up', align: 'left' })
        }}
        className={`${skin} ${ring} transition-colors hover:bg-paper`}
      >
        {words}
        <span className="sr-only">— change what this canvas is previewing</span>
        {open ? <ChevronUp size={11} className="shrink-0 text-ink-soft" /> : <ChevronDown size={11} className="shrink-0 text-ink-soft" />}
      </button>
      <div
        ref={menu}
        id="editor-source-menu"
        popover="auto"
        onToggle={(event) => {
          const opening = (event as unknown as ToggleEvent).newState === 'open'
          setOpen(opening)
          // the search is emptied with the menu, so it never opens already narrowed
          if (!opening) setQuery('')
          // and it takes the focus `openMenu` puts on the first row: a searchable list is typed into. `openMenu`'s
          // own focus runs in a frame scheduled from the press, which is this one or an earlier one, so this wins.
          else requestAnimationFrame(() => field.current?.focus({ preventScroll: true }))
        }}
        onKeyDown={(event) => {
          // Home and End belong to the CARET while the search field has it — ↑ ↓ still step out into the rows,
          // which is how a searchable list is walked
          if (event.target === field.current && (event.key === 'Home' || event.key === 'End')) return
          arrowKeys(event)
        }}
        className="border-0 bg-transparent p-0"
      >
        {/* D5e's card: 6px padding, radius 12, `shadow-lg` — the very shadow the frame draws it with. A plain
            labelled list, as every menu in the app is (`kit/select.tsx`'s `Menu`): the popover is the focus trap,
            `arrowKeys` the movement, `aria-current` the row in force. */}
        <div className="flex w-[min(400px,calc(100vw-16px))] flex-col rounded border border-line bg-surface p-[6px] shadow-lg">
          {/* R-118: NO SOURCE GROUP. There is no live content to switch to until Story 5.18, so the group is
              absent rather than a one-row list that explains itself. */}
          <p id="editor-source-heading" className="px-[10px] pb-[5px] pt-2 text-[10px] font-semibold tracking-[0.04em] text-ink-soft">
            {SUBJECT_HEADING(kind)}
          </p>
          <div className="mx-[6px] mb-[7px] flex h-[34px] items-center gap-2 rounded-sm border border-line bg-paper-raised px-[11px] focus-within:border-line-strong">
            <Search size={13} aria-hidden className="shrink-0 text-ink-soft" />
            <input
              ref={field}
              id="editor-source-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={SEARCH_WORDS(kind)}
              aria-label={SEARCH_WORDS(kind)}
              // the rows are already in hand, so the filter is pure and instant — nothing is fetched
              className="min-w-0 flex-1 bg-transparent text-[12.5px] text-ink outline-none placeholder:text-ink-soft"
            />
          </div>
          {fellBack ? (
            <p data-subject-gone className="mx-[6px] mb-[7px] rounded-sm bg-paper-raised px-[10px] py-2 text-helper-caption leading-[1.5] text-ink-soft-aa">
              {GONE(subject)}
            </p>
          ) : null}
          {refusal ? (
            <p data-subject-refusal role="status" className="mx-[6px] mb-[7px] rounded-sm bg-paper-raised px-[10px] py-2 text-helper-caption leading-[1.5] text-ink-soft-aa">
              {refusal}
            </p>
          ) : null}
          <ul aria-labelledby="editor-source-heading" className="flex max-h-[min(300px,40vh)] list-none flex-col gap-px overflow-y-auto">
            {shown.length === 0 ? (
              <li className="px-[10px] py-2 text-ui-dense text-ink-soft">Nothing matches that.</li>
            ) : (
              shown.map((row) => {
                const on = row.slug === subject.slug
                return (
                  <li key={row.slug} className="flex flex-col">
                    <button
                      type="button"
                      data-subject-row={row.slug}
                      data-has-image={row.hasImage ? 'true' : undefined}
                      aria-current={on ? 'true' : undefined}
                      onClick={() => choose(row)}
                      className={`${ROW} ${ring} ${on ? 'bg-coral-tint' : 'hover:bg-paper'}`}
                    >
                      {/* D5e gives the style-guide entry its own glyph; every other row leads with its words */}
                      {row.caption === null ? null : <Book size={13} aria-hidden className="shrink-0 text-ink-soft-aa" />}
                      <span className="flex min-w-0 flex-1 flex-col gap-[2px]">
                        <span data-name className={`truncate text-ui-dense ${on ? 'font-semibold' : 'font-medium'}`}>{row.title}</span>
                        {row.caption !== null ? (
                          <span className="text-helper-caption leading-[1.45] text-ink-soft-aa">{row.caption}</span>
                        ) : row.meta !== null ? (
                          <span data-meta className="text-helper-caption text-ink-soft-aa">{row.meta}</span>
                        ) : null}
                      </span>
                      {/* D5e's own caption on this mark: "the marker never travels alone — `has image` is the
                          WORDS, and the glyph is decoration beside them". So the words are real text in the row
                          and the glyph is `aria-hidden`. */}
                      {row.hasImage && row.caption === null ? (
                        <span className="flex shrink-0 items-center gap-[5px] rounded-pill bg-paper-sunk px-2 py-[2px] text-[10.5px] text-ink-soft-aa">
                          <ImageGlyph size={10} aria-hidden />
                          has image
                        </span>
                      ) : null}
                      {on ? <Check size={13} className="shrink-0 text-coral-deep" /> : null}
                    </button>
                  </li>
                )
              })
            )}
          </ul>
          <p className="mx-[6px] mb-1 mt-[7px] border-t border-line pt-[9px] text-helper-caption leading-[1.55] text-ink-soft-aa">
            {SUBJECT_HELP(kind)}
          </p>
        </div>
      </div>
    </>
  )
}
