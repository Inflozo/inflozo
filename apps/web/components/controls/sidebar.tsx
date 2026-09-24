'use client'

import { useId, useRef, useState, type ReactNode } from 'react'
import {
  darkOverridesInForce, editText, GROUP_LABELS, resetChanges, resetControl, resetSection, setContent, setControl,
  setData, sidebar,
} from '@inflozo/section-runtime'
import type { ControlEntry, ControlRow, ControlState, DataRow, MemberState, Mode, PropRow, PropValue, SidebarGroupModel } from '@inflozo/section-runtime'
import { placeholdersOffered } from '@inflozo/library'
import { Accordion } from '@/components/kit/accordion'
import { Button } from '@/components/kit/button'
import { closeOnBackdrop, openOnCancel, sheet, title } from '@/components/kit/dialog'
import { ReadOnly, ring, type Greyed } from '@/components/kit/greyed'
import { Image, InfoCircle, Undo } from '@/components/kit/icons'
import { TextInput } from '@/components/kit/input'
import { HelperCaption } from '@/components/kit/labels'
import { MoonBadge } from '@/components/kit/moon-badge'
import { Segmented } from '@/components/kit/segmented'
import { Select } from '@/components/kit/select'
import { Stepper } from '@/components/kit/stepper'
import { SwatchRow } from '@/components/kit/swatch-row'
import { Toggle } from '@/components/kit/toggle'
import { IconPicker } from './icon-picker'
import { ImagePicker, type Asset } from './image-picker'
import { GhostList, ItemList } from './item-list'
import { LinkPicker, type LinkResources } from './link-picker'
import { PlaceholderMenu } from './placeholder-menu'
import { RichField } from './rich-field'
import { limitSentence } from '@/lib/inline'
import { LATER_PAGES, PREVIEW_PAGE, type Page } from '@/lib/page-two'
import { PREVIEWING, type Visitor } from '@/lib/view-as'

/* THE CONTROLS PANEL — what Epic 5 mounts beside its canvas (Story 4.5).

   It draws `sidebar()`'s model and nothing else: every row, value, grey, moon and "changed" flag is the
   engine's, from the one declaration both emitters read (FR-F7), so the panel cannot offer what a render
   would not stamp. Every edit goes through the engine too, and the NEXT STATE is handed up with its kind:
   `control` changes only the section root's attributes, `content` needs a re-render. A refused edit
   comes back as the engine's sentence and changes nothing.

   Built from the Kit (R-74): the accordions (`Editor Sidebar Kit.dc.html:44`), and nothing else. WHERE A RULING
   OVERRIDES A FRAME: every control sits in the accordion its role names — Section Settings, Content, Layout, Style,
   Data, in that order — and S4c's pinned Quick Controls card is gone (R-113, the owner's test of Story 4.10); a
   group's absent note sits after its own rows and before its universal controls (P0-0: where the control would
   have been), so the trio closes Style; a changed control carries a reset beside its label — the Kit's Undo glyph,
   named "Reset <label>" (Story 4.5's owner finding 1) — and "Reset this design" at the panel foot carries the same
   glyph and asks first (R-115): S14c's confirm, in the app's one dialog vocabulary (`kit/dialog.ts`), naming the
   count and the changed rows, with the fear answered in the second sentence and focus on Cancel. Nothing changed,
   it says so under the button instead — R-12's rule for a control at its floor, which stays live and explains
   itself. The moon badge carries its words as its NAME and its hover title, never printed beside it (R-136).

   R-124 (owner, 2026-09-18, Story 5.4's Q1) ADDS ONE ROW THE ENGINE DOES NOT DECLARE: "who can see this section" is
   the FIRST ROW of Section Settings and Layers draws nothing about it — where `A4-13 Latest Post.dc.html`:256 and
   `A22-1 Inline Row.dc.html`:69 both draw it, and where R-113 already filed it. It is NOT a design control: the value
   lives on the INSTANCE (`memberVisibility`) and reaches both emitters as `RenderInput.visibility`, and a declared
   control would stamp a second, inert copy of it on the root through `stampControls` (DW-186). So it is drawn here,
   above `sidebar()`'s own rows, and Section Settings is drawn for it alone where a design declares nothing else for
   that group. A NAMED SELECT, not a pill row: run over these four values R-114's own rule refuses them ("Logged out"
   is 66px against a 58.3px pill), which is why `A22-1`'s drawn select wins over `A4-13`'s pre-R-114 pills.

   STORY 5.6 THREADS THE MODE THROUGH, AND CHANGES NOTHING IT DRAWS. `mode` is handed to `sidebar()`, `setControl`
   and `resetControl`, so in dark the value MARKED is the value in force in dark, a mode-scoped control's change
   lands in `darkOverrides` and its reset empties the same map — all three decided in the engine, which is the one
   place that knows what a mode means (`storedFor`). The panel's own dark-mode job is ONE ROW: R-133's "Clear dark
   overrides" directly under "Reset this design", in the same shape, ALWAYS PRESENT, saying there is nothing to clear
   when there is nothing rather than asking (R-12). The CONFIRM is not here — it lives in `editor.tsx`, because the
   Layers `⋯` menu opens the same one, exactly as Delete's and Hide's two paths already share one.

   STORY 5.16 — D5d's "Preview page" row (`D5 Canvas Markers and Template Switcher.dc.html:429`), drawn only on the
   canvas's main feed while its page has a page 2 (R-176), between the groups and the foot: the groups start closed
   (R-113), so a row inside one would be hidden behind a press. It is the Kit's segmented control in its inline layout,
   and its choice is A CANVAS STATE, NEVER AN EDIT — a plain callback, like `onClearDark`'s, so nothing reaches the
   engine, the journal or `⌘Z`. With no `page` there is no row. */

export type Edit = 'control' | 'content'

/** Story 5.16 — D5d's row: the page the canvas shows, and where to send a choice. */
export type PageRow = { value: Page; onChange: (to: Page) => void }

/** R-124's row: the instance's own audience, the visitor the canvas previews, and where to send a change.
 *  Absent — the whole prop left out — for a section whose category carries no Member visibility row (DW-185: the
 *  control register decides, not the PRD's list, while the two disagree). */
export type VisibilityRow = {
  value: MemberState
  /** the visitor the canvas is drawing for — View as's, since Story 5.14 — so the control can say why the section is
   *  not there (R-168: left out of the page, and the panel says for whom) */
  previews: Visitor
  onChange: (value: MemberState) => void
}

export type SidebarProps = {
  entry: ControlEntry
  state: ControlState
  onChange: (next: ControlState, kind: Edit) => void
  visibility?: VisibilityRow
  /** Background role's colours, by role — the site's own (the review hands it the reference tokens) */
  swatches: Readonly<Record<string, string>>
  /** the site's time zone name, printed under a date (the value itself is never converted) */
  timezone: string
  links: LinkResources
  assets: readonly Asset[]
  /** each Ghost-sourced query's rows as the canvas shows them, for the read-only preview */
  sourceRows: Readonly<Record<string, readonly unknown[]>>
  /** Story 5.6 — the mode the canvas is SHOWING. Every resolution, write and reset below is scoped to it. */
  mode?: Mode
  /** Story 5.6, R-133 — open the editor's ONE "Clear dark overrides" confirm for this section. The row is drawn only
   *  where there is a doc to clear, so `/controls` and `/pilots` (in-memory state, no instance) draw none. */
  onClearDark?: () => void
  /** Story 5.16 — D5d's "Preview page" row, on the main feed of a page that has a page 2. Absent, no row. */
  page?: PageRow
  /** Story 5.16a — WHERE THE PANEL IS, which is the whole of what R-186 and R-187 need to know before a field
   *  offers `{page_number}`: the page the canvas is showing, and whether this section is the site's (a header or
   *  footer, compiled into `default.hbs`). The page is threaded from `paint()`'s own `now.page` rather than
   *  derived a second way — the panel is keyed ACROSS the switch (`acrossPages`), so it must be told. Left out
   *  — `/pilots` and `/controls`, which have no pages — nothing offers a page number, which is page 1's answer. */
  shownPage?: Page
  siteWide?: boolean
  /** Story 5.17 — a session reading along (FR-D18): every control is disabled, and the group headers still open so
   *  what is set can be read (R-192). */
  readOnly?: boolean
}

const slug = (s: string) => s.replace(/[^a-zA-Z0-9]+/g, '-')

const textOf = (v: unknown) =>
  typeof v === 'string' ? v : typeof v === 'object' && v !== null && typeof (v as { text?: unknown }).text === 'string' ? (v as { text: string }).text : ''

function ControlField({
  id,
  row,
  swatches,
  onValue,
  onReset,
}: {
  id: string
  row: ControlRow
  swatches: Readonly<Record<string, string>>
  onValue: (value: string) => void
  onReset: () => void
}) {
  const greyed: Greyed | undefined = row.greyed === undefined ? undefined : row.value === null ? { reason: row.greyed, value: null } : { reason: row.greyed }
  const words = (v: string | null) => row.options.find((o) => o.value === v)?.label ?? ''
  const aside = (
    <>
      {/* R-136 (owner, 2026-09-19): THE MOON ALONE, and its words are its accessible name and its hover title.
          A row head holds the label, the value, this badge and the reset arrow, and the printed words pushed a long
          control label to wrap. UX-DR8 is met the way `DESIGN.md:534-536` provides for where the layout cannot hold
          a word — which two words beside a 12px chip in a 280px panel is. */}
      {row.moon ? <MoonBadge /> : null}
      {row.changed ? (
        <button
          type="button"
          aria-label={`Reset ${row.label}`}
          title={`Reset ${row.label}`}
          onClick={onReset}
          className={`-my-1 inline-flex size-5 items-center justify-center rounded-sm text-ink-soft hover:bg-paper-sunk hover:text-ink ${ring}`}
        >
          <Undo size={12} />
        </button>
      ) : null}
    </>
  )
  switch (row.type) {
    case 'stepper': {
      const at = row.options.findIndex((o) => o.value === row.value)
      const first = row.options[0]?.value
      const last = row.options[row.options.length - 1]?.value
      return (
        <Stepper
          id={id}
          label={row.label}
          value={row.value ?? ''}
          greyed={greyed}
          min={Number(first)}
          max={Number(last)}
          aside={aside}
          onStep={(step) => {
            const to = row.options[at + step]
            if (to) onValue(to.value)
          }}
        />
      )
    }
    case 'toggle':
      return <Toggle id={id} label={row.label} checked={row.value === 'on'} greyed={greyed} aside={aside} onToggle={(on) => onValue(on ? 'on' : 'off')} />
    case 'named-select':
      return (
        <Select
          id={id}
          label={row.label}
          value={words(row.value)}
          greyed={greyed}
          aside={aside}
          options={row.options.map((o) => ({ value: o.value, label: o.label, active: o.value === row.value }))}
          onSelect={onValue}
        />
      )
    case 'swatch-row':
      return (
        <SwatchRow
          id={id}
          label={row.label}
          active={row.value}
          greyed={greyed}
          aside={aside}
          onChange={onValue}
          swatches={row.options.map((o) => {
            const color = swatches[o.value]
            // a role with no colour of its own — Image — is drawn with the Kit's image glyph
            return { role: o.value, label: o.label, ...(color === undefined ? { glyph: <Image size={13} /> } : { color }), ...(o.greyed === undefined ? {} : { greyed: o.greyed }) }
          })}
        />
      )
    default:
      return <Segmented id={id} label={row.label} options={row.options} active={row.value} greyed={greyed} aside={aside} onChange={onValue} />
  }
}

/** P0-0's never-offered note: no row, one sentence where the control would have been. */
const Absent = ({ note }: { note: string }) => (
  <div className="flex items-start gap-2 rounded-sm bg-paper-sunk p-[9px_10px]">
    <InfoCircle size={13} className="mt-px shrink-0 text-ink-soft" />
    <span className="text-[11.5px] leading-[1.5] text-ink-soft">{note}</span>
  </div>
)

/** "Per row, Meta and Tag" — the changed rows, in the panel's order. */
const inWords = (words: readonly string[]) =>
  words.length < 2 ? words.join('') : `${words.slice(0, -1).join(', ')} and ${words[words.length - 1]}`

/** `A22 Newsletter - Spec.md`:291's four values, in its order, with its own words. */
const AUDIENCE: readonly { value: MemberState; label: string }[] = [
  { value: 'everyone', label: 'Everyone' },
  { value: 'anonymous', label: 'Logged out' },
  { value: 'free', label: 'Free members' },
  { value: 'paid', label: 'Paid members' },
]

// What the canvas is previewing, in words, is `lib/view-as.ts`'s `PREVIEWING` since Story 5.14: this caption and the
// live region that announces a View-as choice read ONE list.

export function Sidebar({ entry, state, onChange, visibility, swatches, timezone, links, assets, sourceRows, mode = 'light', onClearDark, page, shownPage, siteWide, readOnly = false }: SidebarProps) {
  const base = useId()
  const [open, setOpen] = useState<Readonly<Record<string, boolean>>>({})
  const [floor, setFloor] = useState<{ path: string; sentence: string } | null>(null)
  const [nothingToReset, setNothingToReset] = useState(false)
  const [nothingToClear, setNothingToClear] = useState(false)
  // the Text Field whose token chip was refused for not fitting whole: its hint says so until its next edit (review, 2026-09-18)
  const [refusedToken, setRefusedToken] = useState<string | null>(null)
  const confirm = useRef<HTMLDialogElement>(null)
  const model = sidebar(entry, state, mode)
  const changes = resetChanges(entry, state)
  /** R-133's count, and the engine's ONE definition of "carries an override" — the same one the moon reads */
  const overridden = darkOverridesInForce(entry, state)
  if (nothingToClear && overridden.length > 0) setNothingToClear(false)
  // a change from anywhere — an edit, the canvas, an undo, one landing before the next frame — takes the line with it
  // for good, so undoing back to nothing changed never announces it again unasked
  if (nothingToReset && changes.length > 0) setNothingToReset(false)
  // a stored dark override is not reset (FR-F4), so both sentences say it stays rather than let "default" imply it goes
  const darkKept = model.groups.some((g) => g.rows.some((r) => r.kind === 'control' && r.moon))

  /** Every edit ends here: a refusal is the engine's sentence and changes nothing; anything else is the
   *  next state, and it clears the floor sentence and the nothing-to-reset line (P0-3: "it clears on the next edit"). */
  const commit = (next: ControlState | string, kind: Edit): string | null => {
    if (typeof next === 'string') return next
    setFloor(null)
    setNothingToReset(false)
    onChange(next, kind)
    return null
  }

  const control = (row: ControlRow) => (
    <ControlField
      key={`control-${row.name}`}
      // a kind in every id: A22's Blurb setting and its Blurb text field share one name, and now one accordion
      id={`${base}-control-${row.name}`}
      row={row}
      swatches={swatches}
      onValue={(value) => commit(setControl(entry, state, row.name, value, mode), 'control')}
      onReset={() => commit(resetControl(entry, state, row.name, mode), 'control')}
    />
  )

  /** One content editor, by the prop's type. Items reuse it, so an item edits the way the section does.
   *
   *  R-185 — ONE PLACE DECIDES THE `{}` BUTTON, for both kinds of text field: `placeholdersOffered` is the
   *  library's single answer to "which placeholders does this field offer, HERE", so R-186's page-2 rule and
   *  R-187's site-wide rule have one implementation rather than one per field kind. A field with nothing to
   *  offer gets no button at all, which is every field on page 1 but the Newsletter's, every field of the
   *  header and footer on every page, and every field that is not typed into. */
  const field = (prop: PropRow, value: unknown, onValue: (value: unknown) => void, id: string): ReactNode => {
    const placeholders = placeholdersOffered(prop.def, { page: shownPage, siteWide })
    switch (prop.type) {
      case 'richtext':
        // Story 5.3: the same value the canvas edits, with the same marks and the same toolbar
        return <RichField key={id} id={id} label={prop.label} def={prop.def} value={value} onValue={onValue} links={links} placeholders={placeholders} readOnly={readOnly} />
      case 'date':
        return (
          <div key={id} className="flex flex-col gap-[5px]">
            <TextInput id={id} label={prop.label} type="date" value={typeof value === 'string' ? value : ''} onChange={(e) => onValue(e.target.value)} />
            <HelperCaption>Site time zone: {timezone}</HelperCaption>
          </div>
        )
      case 'image':
        return <ImagePicker key={id} id={id} label={prop.label} value={value} assets={assets} onChange={onValue} />
      case 'url':
        return <LinkPicker key={id} id={id} label={prop.label} value={value} resources={links} onChange={onValue} />
      case 'icon':
        return <IconPicker key={id} id={id} label={prop.label} value={value} onChange={onValue} />
      default: {
        // a Text Field is one line, and its limit is the input's own — at the limit its hint says why, so the refusal is
        // never silent (Story 5.3)
        const text = textOf(value)
        const max = prop.def.maxChars
        // R-185's Insert keeps the insert-at-selection P0-1's withdrawn chip row carried: an <input> REMEMBERS its selection
        // across the focus the menu takes, so the token still lands where the cursor was rather than at the end
        const insert = (token: string) => {
          const input = document.getElementById(id) as HTMLInputElement | null
          const [start, end] = [input?.selectionStart ?? text.length, input?.selectionEnd ?? text.length]
          const next = text.slice(0, start) + token + text.slice(end)
          // whole or nothing, and never silent: a cut token prints literally (R-27)
          if (max !== undefined && next.length > max) return setRefusedToken(id)
          setRefusedToken(null)
          onValue(editText(value as PropValue, next))
          requestAnimationFrame(() => input?.setSelectionRange(start + token.length, start + token.length))
        }
        return (
          <TextInput
            key={id}
            id={id}
            label={prop.label}
            value={text}
            maxLength={max}
            aside={<PlaceholderMenu id={id} label={prop.label} offered={placeholders} onInsert={insert} />}
            hint={max !== undefined && (text.length >= max || refusedToken === id) ? limitSentence(prop.label, max) : null}
            onChange={(e) => {
              setRefusedToken(null)
              onValue(editText(value as PropValue, e.target.value))
            }}
          />
        )
      }
    }
  }

  const content = (row: PropRow) => {
    const id = `${base}-prop-${slug(row.path)}`
    if (row.list !== undefined) {
      return (
        <ItemList
          key={`prop-${row.path}`}
          id={id}
          row={row}
          entry={entry}
          state={state}
          commit={(next) => commit(next, 'content')}
          floor={floor?.path === row.path ? floor.sentence : null}
          onFloor={(sentence) => setFloor({ path: row.path, sentence })}
          field={field}
          readOnly={readOnly}
        />
      )
    }
    return field(row, row.value, (value) => commit(setContent(entry, state, row.path, value), 'content'), id)
  }

  const data = (rows: readonly DataRow[]) => {
    const keys = [...new Set(rows.map((r) => r.key))]
    return keys.map((key) => {
      const own = rows.filter((r) => r.key === key)
      const titles = (sourceRows[key] ?? []).map((r) => String((r as { title?: unknown }).title ?? ''))
      return (
        <GhostList
          key={key}
          id={`${base}-data-${slug(key)}`}
          source={own[0]?.source ?? key}
          rows={own}
          titles={titles}
          onData={(which, value) => commit(setData(entry, state, key, which, value), 'content')}
        />
      )
    })
  }

  /* R-124's row, drawn where every drawing puts it: the head of Section Settings. `A4-13`'s own hint is the first
     line; the second appears only when the chosen audience is not the one the canvas previews, so the section's
     absence from the canvas is never silent. */
  const audience = visibility === undefined ? null : (
    <div key="member-visibility" className="flex flex-col gap-[5px]">
      <Select
        id={`${base}-member-visibility`}
        label="Member visibility"
        value={AUDIENCE.find((o) => o.value === visibility.value)?.label ?? 'Everyone'}
        options={AUDIENCE.map((o) => ({ value: o.value, label: o.label, active: o.value === visibility.value }))}
        onSelect={(value) => visibility.onChange(value as MemberState)}
      />
      <HelperCaption>Who sees the whole section.</HelperCaption>
      {/* only when the canvas is NOT drawing this audience: `gateMembers` draws a section whose audience is the
          previewed visitor, so "Logged out" on an anonymous preview is drawn and says nothing (review, 2026-09-18) */}
      {visibility.value !== 'everyone' && visibility.value !== visibility.previews ? (
        <HelperCaption>
          The canvas is previewing {PREVIEWING[visibility.previews]}, so this section is not drawn here.
        </HelperCaption>
      ) : null}
    </div>
  )

  // Section Settings is drawn for that one row even where the design declares nothing else for it, first, as
  // `SIDEBAR_GROUPS` orders the panel (R-113)
  const groups: SidebarGroupModel[] =
    audience === null || model.groups.some((g) => g.id === 'settings')
      ? model.groups
      : [{ id: 'settings', label: GROUP_LABELS.settings, rows: [], absent: [] }, ...model.groups]

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col">
        {groups.map((group) => {
          // in the engine's order (R-113), which ends with the universal controls: the absent notes go just above them
          const at = group.rows.findIndex((r) => r.kind === 'control' && r.universal)
          const [rows, foot] = at === -1 ? [group.rows, []] : [group.rows.slice(0, at), group.rows.slice(at)]
          // R-192: each row guards itself, so an item list can keep its items OPENABLE — reading is not editing
          const draw = (r: (typeof rows)[number]) =>
            r.kind === 'prop' ? (r.list !== undefined ? content(r) : <ReadOnly key={`read-${r.path}`} on={readOnly}>{content(r)}</ReadOnly>)
            : r.kind === 'control' ? <ReadOnly key={`read-${r.name}`} on={readOnly}>{control(r)}</ReadOnly>
            : null
          return (
            <Accordion
              key={group.id}
              id={`${base}-group-${group.id}`}
              title={group.label}
              open={open[group.id] === true}
              onToggle={() => setOpen({ ...open, [group.id]: open[group.id] !== true })}
            >
              <div className="flex flex-col gap-3 pb-3 pt-1">
                {group.id === 'settings' ? <ReadOnly on={readOnly}>{audience}</ReadOnly> : null}
                {rows.map(draw)}
                {/* a query's rows are only ever Data's, drawn as one list per query */}
                <ReadOnly on={readOnly}>{data(rows.filter((r): r is DataRow => r.kind === 'data'))}</ReadOnly>
                {group.absent.map((note) => <Absent key={note} note={note} />)}
                {foot.map(draw)}
              </div>
            </Accordion>
          )
        })}
      </div>

      {/* Story 5.16 — D5d's row, always visible between the groups and the foot, on the main feed alone */}
      {page === undefined ? null : (
        <div data-page-row>
          <Segmented
            id={`${base}-page`}
            label={PREVIEW_PAGE}
            options={['1', '2']}
            active={String(page.value)}
            layout="inline"
            // R-181 (the owner, 2026-09-22): page 2 stands for every later page, and the row says so
            note={LATER_PAGES}
            onChange={(value) => page.onChange(value === '2' ? 2 : 1)}
          />
        </div>
      )}

      <ReadOnly on={readOnly}>
      <div className="flex flex-col items-start gap-2 border-t border-line pt-3">
        <button
          type="button"
          onClick={() => {
            if (changes.length > 0) return openOnCancel(confirm.current)
            // off, then on in the next frame, so a second press is announced again rather than changing nothing
            setNothingToReset(false)
            requestAnimationFrame(() => setNothingToReset(true))
          }}
          className={`inline-flex items-center gap-[6px] text-[12px] text-ink-soft hover:text-ink ${ring}`}
        >
          <Undo size={13} />
          Reset this design
        </button>
        <div role="status">
          {nothingToReset ? (
            <HelperCaption>
              Nothing to reset: every setting is already this design&apos;s default.{darkKept ? ' Dark overrides stay as they are.' : ''}
            </HelperCaption>
          ) : null}
        </div>

        {/* R-133's FIRST entry point (owner, 2026-09-18) — the two acts are neighbours in meaning, so they read as a
            pair and it needs no new pattern. ALWAYS PRESENT, never greyed: with nothing stored it says so under
            itself instead of asking, which is R-12's rule and the shape "Reset this design" above it already uses.
            The confirm is `editor.tsx`'s, because the Layers `⋯` menu opens the same one. */}
        {onClearDark === undefined ? null : (
          <>
            <button
              type="button"
              onClick={() => {
                if (overridden.length > 0) return onClearDark()
                setNothingToClear(false)
                requestAnimationFrame(() => setNothingToClear(true))
              }}
              className={`inline-flex items-center gap-[6px] text-[12px] text-ink-soft hover:text-ink ${ring}`}
            >
              <MoonBadge label="" />
              Clear dark overrides
            </button>
            <div role="status">
              {nothingToClear ? (
                <HelperCaption>
                  Nothing to clear: this section&apos;s dark version already follows its light one.
                </HelperCaption>
              ) : null}
            </div>
          </>
        )}
      </div>
      </ReadOnly>

      <dialog
        ref={confirm}
        onClick={closeOnBackdrop}
        aria-labelledby={`${base}-reset-title`}
        aria-describedby={`${base}-reset-body`}
        className={`${sheet} gap-[18px]`}
      >
        <div className="flex flex-col gap-[6px]">
          <h2 id={`${base}-reset-title`} className={title}>
            Reset this design?
          </h2>
          <p id={`${base}-reset-body`} className="text-ui-dense leading-[1.55] text-ink-soft">
            Removes your {changes.length} {changes.length === 1 ? 'change' : 'changes'} — {inWords(changes)} — from
            this design. {darkKept ? 'Your words, pictures and dark overrides stay.' : 'Your words and pictures stay.'}
          </p>
        </div>
        <div className="flex justify-end gap-[10px]">
          <Button type="button" variant="secondary" size={36} data-cancel onClick={() => confirm.current?.close()}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="coral"
            size={36}
            onClick={() => {
              confirm.current?.close()
              commit(resetSection(entry, state), 'content')
            }}
          >
            Reset design
          </Button>
        </div>
      </dialog>
    </div>
  )
}
