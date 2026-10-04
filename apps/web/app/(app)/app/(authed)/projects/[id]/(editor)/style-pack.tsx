'use client'

import type { KeyboardEvent, Ref } from 'react'
import { gridKeys } from '@/components/controls/icon-picker'
import { IconButton } from '@/components/kit/button'
import { ReadOnly, ring } from '@/components/kit/greyed'
import { ChevronLeft } from '@/components/kit/icons'
import { PackCell } from '@/components/kit/pack-cell'
import { PACK_WORDS, type PackChoice } from '@/lib/pack-switch'

/* STORY 6.2 — THE PROJECT'S STYLE PACK; STORY 6.3 — AND CHOOSING IT.

   THE CARD is S4a's rest panel (`S4 Editor.dc.html:110-115`): "Ag" in the pack's heading face, its name, the two families
   ("Fraunces · Inter"), its dots and a Change button. S4a draws six dots; the sixth is the site's brand colour, which S7d
   reads "From your site" and Story 6.6 seeds, so the card draws five — background, surface, accent, text and the engine's
   `--plate` (S4a's fifth is Paper's band tint, a step off the computed plate).

   THE LIST is S7a's panel (`S7 Style Packs.dc.html:116-122`): the Current card, then every preset in a three-column grid
   in Appendix D §D.d's order, each `PackCell` with "Ag" in its own heading face, its name and four dots — background,
   accent, text, plate — the current one ringed and named "Current". With R-231's names, never S7a's placeholders, and
   without its pencil, custom cell, "+ New pack" and pack-level rows (Story 6.4, DW-310). The back chevron and "Style Pack"
   are the panel head, drawn by the editor in place of "Page" (`StylePackHead`).

   STORY 6.3 — A CELL SWITCHES (R-118's Change, now with somewhere to go). The list is the design ring's pattern
   (`components/editor/design-picker.tsx`): a LISTBOX of option buttons, ONE tab stop — the current pack — with the Kit's
   `gridKeys` moving focus across the three columns and never writing an edit (an arrow that switched would journal one
   edit per press); Enter or a press switches. The Current card follows the press at once, as S7b draws it, while the canvas
   catches up. Reading along (R-192) the list still opens — it is a view — and every cell is greyed and unclickable inside
   the Kit's `ReadOnly`; `commit`'s guard is the wall underneath. A press, never a hover (S7a draws Tangerine hovered over an
   unchanged Paper canvas; FR-E2 says switching).

   Every colour and face arrives as data (`PackChoice`, derived on the server by `lib/style-pack.ts`'s `packChoices`): this
   module imports nothing of the library or the runtime, so no client carries the font pool (DW-323). */

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

/** S4a's card, at rest: the project's pack and a Change button that opens the list. */
export function StylePackCard({ pack: p, onChange, changeRef }: { pack: PackChoice; onChange: () => void; changeRef: Ref<HTMLButtonElement> }) {
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
      <Dots size={16} colours={p.cardDots} />
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

/** S7a's list: the Current card and every preset, each a pressable option. */
export function StylePackRoster({
  packs,
  current: now,
  readOnly,
  onChoose,
}: {
  packs: readonly PackChoice[]
  /** the pack in force — the Current card, the ringed cell and the list's one tab stop */
  current: PackChoice
  /** R-192: a window reading along sees every cell greyed and unclickable */
  readOnly: boolean
  onChoose: (preset: string) => void
}) {
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
        <div
          role="listbox"
          aria-label={`${PACK_WORDS.name}s`}
          onKeyDown={(event: KeyboardEvent<HTMLDivElement>) => gridKeys(event, { right: 1, down: 3 })}
          className="grid grid-cols-3 gap-[6px]"
        >
          {packs.map((p) => {
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
                className={`block rounded-sm text-left transition-shadow hover:shadow-md disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:shadow-none ${ring}`}
              >
                <PackCell name={p.name} glyphFamily={p.glyphFamily} palette={p.cellDots} active={on} />
              </button>
            )
          })}
        </div>
      </ReadOnly>
    </div>
  )
}
