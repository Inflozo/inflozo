'use client'

import type { Ref } from 'react'
import { PRESETS as LIBRARY } from '@inflozo/library/packs'
import { packTokens, type Pack } from '@inflozo/section-runtime'
import { IconButton } from '@/components/kit/button'
import { ring } from '@/components/kit/greyed'
import { ChevronLeft } from '@/components/kit/icons'
import { PackCell } from '@/components/kit/pack-cell'
import { PRESETS, presetIdOf, type Preset } from '@/lib/style-pack'

/* STORY 6.2 — THE PROJECT'S STYLE PACK, LOOKING ONLY (R-118: Change works here, because it opens something; choosing a
   pack is Story 6.3's switch, so a cell is information, not a button — no hover, no pointer, not focusable).

   THE CARD is S4a's rest panel (`S4 Editor.dc.html:110-115`): "Ag" in the pack's heading face, its name, the two families
   ("Fraunces · Inter"), its dots and a Change button. S4a draws six dots; the sixth is the site's brand colour, which S7d
   reads "From your site" and Story 6.6 seeds, so the card draws five — background, surface, accent, text and the engine's
   `--plate` (S4a's fifth is Paper's band tint, a step off the computed plate).

   THE ROSTER is S7a's panel (`S7 Style Packs.dc.html:116-122`): the Current card, then every preset in a three-column grid
   in Appendix D §D.d's order, each `PackCell` with "Ag" in its own heading face, its name and four dots — background,
   accent, text, plate — the current one ringed and named "Current". With R-231's names, never S7a's placeholders, and
   without its pencil, custom cell, "+ New pack" and pack-level rows (Story 6.4, DW-310). The back chevron and "Style Pack"
   are the panel head, drawn by the editor in place of "Page" (`StylePackHead`).

   Every colour is the library's, through the engine (`packTokens`), as the canvas's token block is — never a literal. */

const LIGHT = Object.fromEntries(LIBRARY.map((p) => [p.id, packTokens(p.pack as Pack).light]))
const dot = (preset: Preset, property: '--bg-page' | '--bg-surface' | '--accent' | '--text-body' | '--plate') => LIGHT[preset.id]?.[property] ?? ''
const cellDots = (p: Preset) => [dot(p, '--bg-page'), dot(p, '--accent'), dot(p, '--text-body'), dot(p, '--plate')]
const current = (stylePack: unknown) => PRESETS[presetIdOf(stylePack)] as Preset

/** A row of the pack's own colours. A light dot carries the Kit's hairline so it reads on the card's white. */
function Dots({ colours, size }: { colours: string[]; size: number }) {
  return (
    <span aria-hidden className="flex" style={{ gap: size > 12 ? 6 : 4 }}>
      {colours.map((c, i) => (
        <span key={i} style={{ background: c, width: size, height: size }} className="rounded-full shadow-hairline-inset" />
      ))}
    </span>
  )
}

/** S4a's card, at rest: the project's pack and a Change button that opens the roster. */
export function StylePackCard({ stylePack, onChange, changeRef }: { stylePack: unknown; onChange: () => void; changeRef: Ref<HTMLButtonElement> }) {
  const p = current(stylePack)
  return (
    <div data-style-pack-card className="flex flex-col gap-3 rounded border border-line bg-surface p-[14px]">
      <div className="flex items-center gap-3">
        <span aria-hidden style={{ fontFamily: p.glyphFamily, fontSynthesis: 'none', color: dot(p, '--text-body') }} className="text-[26px] leading-none">
          Ag
        </span>
        <span className="flex flex-col gap-px">
          <span className="text-ui-dense font-semibold text-ink">{p.name}</span>
          <span className="text-helper-caption text-ink-soft">{`${p.heading} · ${p.body}`}</span>
        </span>
      </div>
      <Dots size={16} colours={[dot(p, '--bg-page'), dot(p, '--bg-surface'), dot(p, '--accent'), dot(p, '--text-body'), dot(p, '--plate')]} />
      <button
        ref={changeRef}
        type="button"
        id="style-pack-change"
        aria-label={`Change Style Pack, ${p.name}`}
        onClick={onChange}
        className={`h-8 rounded-sm border border-line bg-surface text-ui-dense font-medium text-ink transition-colors hover:bg-paper ${ring}`}
      >
        Change
      </button>
    </div>
  )
}

/** S7a's head, in place of "Page" while the roster is open: the back chevron and the panel's name. */
export function StylePackHead({ onBack, backRef }: { onBack: () => void; backRef: Ref<HTMLButtonElement> }) {
  return (
    <span className="flex items-center gap-2">
      <IconButton ref={backRef} id="style-pack-back" label="Back to Page" title="Back to Page" onClick={onBack} className="-ml-[6px]">
        <ChevronLeft size={14} />
      </IconButton>
      <span id="editor-panel-name" className="text-panel-label font-semibold uppercase tracking-[0.04em] text-ink-soft">
        Style Pack
      </span>
    </span>
  )
}

/** S7a's roster: the Current card and every preset, looking only. */
export function StylePackRoster({ stylePack }: { stylePack: unknown }) {
  const now = current(stylePack)
  return (
    <div data-style-pack-roster className="flex flex-col gap-[9px]">
      <div className="flex items-center gap-[11px] rounded border border-line bg-surface p-[9px_12px]">
        <span aria-hidden style={{ fontFamily: now.glyphFamily, fontSynthesis: 'none' }} className="text-[24px] leading-none">
          Ag
        </span>
        <span className="flex flex-1 flex-col gap-[2px]">
          <span className="text-ui-dense font-semibold text-ink">{now.name}</span>
          <Dots size={11} colours={cellDots(now)} />
        </span>
        <span className="rounded-pill bg-coral-tint px-2 py-[2px] text-[10px] font-semibold text-coral-text">Current</span>
      </div>
      <ul role="list" aria-label="Style Packs" className="grid list-none grid-cols-3 gap-[6px] p-0">
        {Object.values(PRESETS).map((p) => (
          <li key={p.id} data-style-pack={p.id}>
            <PackCell name={p.name} glyphFamily={p.glyphFamily} palette={cellDots(p)} active={p.id === now.id} />
          </li>
        ))}
      </ul>
    </div>
  )
}
