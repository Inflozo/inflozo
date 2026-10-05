'use client'

import { useRef, type KeyboardEvent, type Ref } from 'react'
import { gridKeys } from '@/components/controls/icon-picker'
import { Button, IconButton } from '@/components/kit/button'
import { ReadOnly, ring } from '@/components/kit/greyed'
import { ChevronLeft } from '@/components/kit/icons'
import { CustomName, NewPackCell, PackCell, PackPencil } from '@/components/kit/pack-cell'
import { Segmented } from '@/components/kit/segmented'
import { FontRow, Menu, openPopover } from '@/components/kit/select'
import { StepperBox } from '@/components/kit/stepper'
import { arrowKeys } from '@/lib/menu'
import { isCustom, PACK_EDIT_WORDS, PILL_STEPS, pillStep, type PairingChoice, type ScaleRow } from '@/lib/pack-edit'
import { PACK_WORDS, type PackChoice } from '@/lib/pack-switch'
import { BRAND_COPY } from '@/lib/probe-rule'

/* STORY 6.2 — THE PROJECT'S STYLE PACK; STORY 6.3 — AND CHOOSING IT; STORY 6.4 — AND EDITING IT.

   THE CARD is S4a's rest panel (`S4 Editor.dc.html:110-120`): "Ag" in the pack's heading face, its name, the two families
   ("Fraunces · Inter"), its dots and a Change button. Five dots are the pack's — background, surface, accent, text and the
   engine's `--plate` (S4a's fifth is Paper's band tint, a step off the computed plate) — and STORY 6.6 DRAWS S4a'S SIXTH:
   the linked site's colour, the one S7d reads "From your site", after the five. With no site colour the card keeps five.

   THE LIST is S7a's panel (`S7 Style Packs.dc.html:116-122`): the Current card, then every pack in a three-column grid in
   Appendix D §D.d's order, each `PackCell` with "Ag" in its own heading face, its name and four dots — background, accent,
   text, plate — the current one ringed and named "Current". With R-231's names, never S7a's placeholders. The back chevron
   and "Style Pack" are the panel head, drawn by the editor in place of "Page" (`StylePackHead`).

   STORY 6.3 — A CELL SWITCHES (R-118's Change, now with somewhere to go). The list is the design ring's pattern
   (`components/editor/design-picker.tsx`): a LISTBOX of option buttons, ONE tab stop — the current pack — with the Kit's
   `gridKeys` moving focus across the three columns and never writing an edit (an arrow that switched would journal one
   edit per press); Enter or a press switches. The Current card follows the press at once, as S7b draws it, while the canvas
   catches up. Reading along (R-192) the list still opens — it is a view — and every cell is greyed and unclickable inside
   the Kit's `ReadOnly`; `commit`'s guard is the wall underneath. A press, never a hover (S7a draws Tangerine hovered over an
   unchanged Paper canvas; FR-E2 says switching).

   STORY 6.4 — EDITING (FR-E3, DW-310), BUILT FROM THE DRAWINGS THAT EXIST (R-236). The roster lists the twelve presets —
   each as this project's own record where it has one — then the packs it made, by number, each S7a's "Maya's Warm" cell.
   EVERY EDIT PACK DOOR IS A BUTTON OUTSIDE THE LISTBOX, because an option may hold nothing interactive (axe's
   `nested-interactive`; a listbox owns options only): the listbox is `display: contents`, so its options are cells of the
   one grid below, and each preset's corner pencil, each custom pack's dashed name-and-pencil and the dashed "+ New pack"
   are later cells of that SAME grid, placed over their cell exactly where S7a draws them (explicit `grid-row`/`grid-column`
   on every cell, so nothing flows around them). Keyboard order is the list (one stop), each Edit pack button, "+ New pack",
   then the rows (the spec's Design Notes).

   THE ROWS are the pack in force's, under a rule, in the spec's order with Appendix C's words (R-170): S7a's two font rows —
   Heading font and Body font, each opening the ONE pairing menu, because a pack's fonts are one pairing from the pool —
   then S7a's segmented rows through the Kit's `Segmented` in S7a's dense geometry, and Pill radius on the Kit's stepper.
   Each press is one edit to the pack in force's record; the editor journals it and restyles the canvas.

   STORY 6.6 — "FROM YOUR SITE", THE FIRST ROW, ABOVE HEADING FONT (FR-E5's "re-runnable from the Style panel"). Built from
   the nearest drawings exactly, no Claude Design pass (R-242, the spec's "Built from" table): S7a's row name (Pill radius's
   11.5px medium ink-soft, 4px above its control), S4a's 16px dot with the Kit's hairline in the site's colour, and the Kit's
   32px secondary button in S4a's Change weight, 7px after the dot (S7d's spacing of its own "From your site" row). Its Use
   your brand is one edit like the other rows (`brandSeed` into the pack in force, through the editor's `editInForce`); it
   sits inside `ReadOnly`, so reading along it is greyed and no tab stop (R-192). No site colour, no row.

   Every colour and face arrives as data (`PackChoice`, `PairingChoice`, derived on the server or by the pool-free engine):
   this module imports nothing of the library or the pool (DW-323). */

/** A row of the pack's own colours. A light dot carries the Kit's hairline so it reads on the card's white. */
function Dots({ colours, size }: { colours: readonly string[]; size: number }) {
  return (
    <span aria-hidden className="flex" style={{ gap: size > 12 ? 6 : 4 }}>
      {colours.map((c, i) => (
        <span key={i} style={{ background: c, width: size, height: size }} className="rounded-full shadow-hairline-inset" />
      ))}
    </span>
  )
}

/** S4a's card, at rest: the project's pack, the site's colour as the sixth dot, and a Change button that opens the list. */
export function StylePackCard({
  pack: p,
  siteAccent,
  onChange,
  changeRef,
}: {
  pack: PackChoice
  /** Story 6.6 — the linked site's stored brand accent, S4a's sixth dot; null draws the pack's five */
  siteAccent: string | null
  onChange: () => void
  changeRef: Ref<HTMLButtonElement>
}) {
  return (
    <div data-style-pack-card className="flex flex-col gap-3 rounded border border-line bg-surface p-[14px]">
      <div className="flex items-center gap-3">
        {/* the text dot's colour: the card's dots are background, surface, accent, TEXT, plate */}
        <span aria-hidden style={{ fontFamily: p.glyphFamily, fontSynthesis: 'none', color: p.cardDots[3] }} className="text-[26px] leading-none">
          Ag
        </span>
        <span className="flex flex-col gap-px">
          <span className="text-ui-dense font-semibold text-ink">{p.name}</span>
          <span className="text-helper-caption text-ink-soft">{`${p.heading} · ${p.body}`}</span>
        </span>
      </div>
      <Dots size={16} colours={siteAccent === null ? p.cardDots : [...p.cardDots, siteAccent]} />
      <button
        ref={changeRef}
        type="button"
        id="style-pack-change"
        aria-label={`Change ${PACK_WORDS.name}, ${p.name}`}
        onClick={onChange}
        className={`h-8 rounded-sm border border-line bg-surface text-ui-dense font-medium text-ink transition-colors hover:bg-paper ${ring}`}
      >
        Change
      </button>
    </div>
  )
}

/** S7a's head, in place of "Page" while the list is open: the back chevron and the panel's name. */
export function StylePackHead({ onBack, backRef }: { onBack: () => void; backRef: Ref<HTMLButtonElement> }) {
  return (
    <span className="flex items-center gap-2">
      <IconButton ref={backRef} id="style-pack-back" label="Back to Page" title="Back to Page" onClick={onBack} className="-ml-[6px]">
        <ChevronLeft size={14} />
      </IconButton>
      <span id="editor-panel-name" className="text-panel-label font-semibold uppercase tracking-[0.04em] text-ink-soft">
        {PACK_WORDS.name}
      </span>
    </span>
  )
}

/** A cell's place in S7a's three-column grid — every cell placed, so a door laid over one never moves another */
const cellAt = (n: number) => ({ gridRow: Math.floor(n / 3) + 1, gridColumn: (n % 3) + 1 })

/** Where a custom cell's name line sits inside it: the cell's 1px border and 6px padding, the 14px "Ag" at the app's 1.5
 *  line height, and the 3px gap — so the name button lies exactly over the option's own name line (`PackCell`'s `custom`). */
const NAME_LINE = { top: 1 + 6 + 14 * 1.5 + 3, left: 1 + 6 }

/** How the editor opens Edit pack: the pack, where focus starts, and the door it was opened from (focus returns there). */
export type EditDoor = (id: string, focus: 'swatch' | 'name') => void

/** S7a's list: the Current card, every pack a pressable option with its Edit pack door laid over it, "+ New pack", and
 *  the pack in force's rows. */
export function StylePackRoster({
  packs,
  current: now,
  pairings,
  readOnly,
  siteAccent,
  onChoose,
  onEdit,
  onNew,
  onRow,
  onPill,
  onPairing,
  onBrand,
}: {
  packs: readonly PackChoice[]
  /** the pack in force — the Current card, the ringed cell, the list's one tab stop, and the record the rows edit */
  current: PackChoice
  pairings: readonly PairingChoice[]
  /** R-192: a window reading along sees every cell, door and row greyed and unclickable */
  readOnly: boolean
  /** Story 6.6 — the linked site's stored brand accent ("From your site"); null draws no row */
  siteAccent: string | null
  onChoose: (preset: string) => void
  onEdit: EditDoor
  onNew: () => void
  onRow: (row: ScaleRow, step: string) => void
  onPill: (value: string) => void
  onPairing: (pairing: string) => void
  /** Story 6.6 — Use your brand: the site's accent seeded into the pack in force, one edit */
  onBrand: () => void
}) {
  const record = now.record
  const pairing = pairings.find((p) => p.id === record.pairing)
  const menu = useRef<HTMLDivElement>(null)
  /** the pairing menu, under the font row that opened it and as wide, focus on the pairing in force */
  const openPairings = (trigger: HTMLElement) => {
    const pop = menu.current
    if (!pop) return
    pop.style.width = `${trigger.getBoundingClientRect().width}px`
    openPopover(pop, trigger, { side: 'down', align: 'left' }, pop.querySelector<HTMLElement>('[aria-current="true"]'))
  }
  const W = PACK_EDIT_WORDS
  return (
    <div data-style-pack-roster className="flex flex-col gap-[9px]">
      <div data-style-pack-current className="flex items-center gap-[11px] rounded border border-line bg-surface p-[9px_12px]">
        <span aria-hidden style={{ fontFamily: now.glyphFamily, fontSynthesis: 'none' }} className="text-[24px] leading-none">
          Ag
        </span>
        <span className="flex flex-1 flex-col gap-[2px]">
          <span className="text-ui-dense font-semibold text-ink">{now.name}</span>
          <Dots size={11} colours={now.cellDots} />
        </span>
        <span className="rounded-pill bg-coral-tint px-2 py-[2px] text-[10px] font-semibold text-coral-text">Current</span>
      </div>
      <ReadOnly on={readOnly}>
        {/* rows of one height, as S7a draws its grid: "+ New pack" alone in a row is a cell's height, not its words' */}
        <div data-style-pack-grid className="grid auto-rows-fr grid-cols-3 gap-[6px]">
          <div
            role="listbox"
            aria-label={`${PACK_WORDS.name}s`}
            onKeyDown={(event: KeyboardEvent<HTMLDivElement>) => gridKeys(event, { right: 1, down: 3 })}
            className="contents"
          >
            {packs.map((p, n) => {
              const on = p.id === now.id
              return (
                <button
                  key={p.id}
                  type="button"
                  role="option"
                  data-cell
                  data-style-pack={p.id}
                  aria-selected={on}
                  // ONE tab stop, on the pack in force; the arrows move between cells (`gridKeys`) and never switch
                  tabIndex={on ? 0 : -1}
                  onClick={() => onChoose(p.id)}
                  style={cellAt(n)}
                  // a column, its cell filling it: a button centres its contents when the grid stretches it, and a custom
                  // cell's name line must sit where its laid-over name button sits (`NAME_LINE`)
                  className={`flex flex-col rounded-sm text-left transition-shadow hover:shadow-md disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:shadow-none ${ring}`}
                >
                  <PackCell name={p.name} glyphFamily={p.glyphFamily} palette={p.cellDots} active={on} custom={isCustom(p.id)} className="flex-1" />
                </button>
              )
            })}
          </div>
          {/* THE DOORS, after the listbox and outside it, each laid over its own cell (the Design Notes' "pencil's place") */}
          {packs.map((p, n) =>
            isCustom(p.id) ? (
              <button
                key={p.id}
                type="button"
                data-edit-pack={p.id}
                aria-label={W.edit(p.name)}
                // the whole name on hover, where the cell's 280-wide panel ends a long one in an ellipsis
                title={p.name}
                onClick={() => onEdit(p.id, 'name')}
                style={{ ...cellAt(n), marginTop: NAME_LINE.top, marginLeft: NAME_LINE.left }}
                // `relative`: the cell under it is positioned, and a positioned box paints over one that is not
                // as wide as the cell's own name line at most (its border and padding either side), so the two truncate alike
                // `items-start`: on a touch screen the 44px rule makes it taller, and its words stay on the name line
                className={`relative flex max-w-[calc(100%-14px)] items-start self-start justify-self-start rounded-[2px] text-left text-ink disabled:cursor-not-allowed disabled:opacity-35 ${ring}`}
              >
                <CustomName name={p.name} />
              </button>
            ) : (
              <PackPencil
                key={p.id}
                data-edit-pack={p.id}
                label={W.edit(p.name)}
                title={W.editTitle}
                onClick={() => onEdit(p.id, 'swatch')}
                style={cellAt(n)}
                // on a touch screen the target is the finger's 44, CENTRED on the circle's drawn place (4 + 17/2 − 44/2 =
                // −9.5), so the middle of a pack still chooses it: grown from the circle's corner it covered the middle
                className="relative mt-1 mr-1 self-start justify-self-end coarse:in-[[data-editor]]:-mt-[9.5px] coarse:in-[[data-editor]]:-mr-[9.5px]"
              />
            ),
          )}
          <NewPackCell id="style-pack-new" label={W.newPack} onClick={onNew} style={cellAt(packs.length)} />
        </div>
        {/* S7a's rows block: a rule above, 7px under it, rows 6px apart */}
        <div data-style-pack-rows className="flex flex-col gap-[6px] border-t border-line pt-[7px]">
          {/* Story 6.6 — "From your site" (R-242's "Built from"): S7a's row name 4px above, then the site's 16px dot and
              the Kit's 32px secondary button 7px after it. The button is described by the name and the hex together, as
              the picker's dot is named ("From your site, #…"); `relative`, so that sentence (sr-only, absolute) is placed
              inside this row and never grows the panel's scroll */}
          {siteAccent === null ? null : (
            <div data-style-pack-brand className="relative flex flex-col items-start gap-1">
              <span id="style-pack-brand-label" aria-hidden className="text-[11.5px] leading-[normal] font-medium text-ink-soft">
                {W.fromSite}
              </span>
              <span id="style-pack-brand-said" className="sr-only">{`${W.fromSite}, ${siteAccent}`}</span>
              <span className="flex items-center gap-[7px]">
                <span aria-hidden data-site-dot className="size-4 shrink-0 rounded-full shadow-hairline-inset" style={{ background: siteAccent }} />
                <Button id="style-pack-brand" size={32} weight="font-medium" aria-describedby="style-pack-brand-said" onClick={onBrand}>
                  {BRAND_COPY.use}
                </Button>
              </span>
            </div>
          )}
          {pairing === undefined ? null : (
            <>
              <FontRow id="style-pack-heading-font" label={W.headingFont} family={pairing.heading} glyph={pairing.glyphFamily} popoverTarget="style-pack-pairings" onClick={(e) => openPairings(e.currentTarget)} />
              <FontRow id="style-pack-body-font" label={W.bodyFont} family={pairing.body} glyph={pairing.bodyGlyphFamily} popoverTarget="style-pack-pairings" onClick={(e) => openPairings(e.currentTarget)} />
            </>
          )}
          {W.rows.map((row) => (
            <Segmented
              key={row.key}
              id={`style-pack-${row.key}`}
              label={row.title}
              dense
              options={Object.entries(row.steps).map(([value, label]) => ({ value, label: label as string }))}
              active={record[row.key]}
              onChange={(step) => onRow(row.key, step)}
            />
          ))}
          {/* Pill radius: a row of the segmented rows' shape — its name 4px above — holding the Kit's stepper */}
          <div className="flex flex-col items-start gap-1">
            <span id="style-pack-pill-label" className="text-[11.5px] leading-[normal] font-medium text-ink-soft">
              {W.pillRadius}
            </span>
            <StepperBox
              id="style-pack-pill"
              label={W.pillRadius}
              value={W.pillValue(record.pillRadius)}
              at={PILL_STEPS.indexOf(record.pillRadius)}
              min={0}
              max={PILL_STEPS.length - 1}
              onStep={(by) => onPill(pillStep(record.pillRadius, by))}
            />
          </div>
        </div>
      </ReadOnly>
      {/* THE PAIRING MENU — the Kit's dropdown, as wide as its font row, scrolling inside itself; the pairing in force
          checked. `overflow-visible` so the popover's own UA overflow never clips the card's shadow */}
      <div ref={menu} id="style-pack-pairings" popover="auto" onKeyDown={arrowKeys} className="overflow-visible border-0 bg-transparent p-0">
        <Menu
          label={W.pairings}
          width="w-full"
          items={pairings.map((p) => ({
            label: `${p.heading} · ${p.body}`,
            active: p.id === record.pairing,
            onSelect: () => onPairing(p.id),
            // R-192: reading along no row of the menu acts — the font rows that open it are disabled too
            readOnly,
            contents: (
              <span className="flex min-w-0 flex-1 items-center gap-[9px]">
                <span aria-hidden style={{ fontFamily: p.glyphFamily, fontSynthesis: 'none' }} className="w-5 shrink-0 text-ui font-normal leading-[normal]">
                  Ag
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className="truncate text-control-label font-semibold leading-[normal] text-ink">{p.heading}</span>
                  <span className="truncate text-[10px] font-normal leading-[normal] text-ink-soft">{p.body}</span>
                </span>
              </span>
            ),
          }))}
        />
      </div>
    </div>
  )
}
