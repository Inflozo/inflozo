import type { ReactNode } from 'react'
import { MAIN_FEED } from '@/lib/data-group'

/* Editor Sidebar Kit.dc.html:159 — badges & chips. Pro is a marigold-tint pill carrying
   ✦ AND THE WORD PRO; Free is line-bordered and says Free; Live is a mint dot beside the
   word Live; version chips are mono; a gscan result reads `0 · 2` in mono.
   Marigold is for Pro and celebration and nothing else, never for an error.
   NO UPGRADE SHEET ON CLICK, EVER (UX-DR19) — which is why Pro is a <span>, not a button. */

const pill = 'inline-flex items-center rounded-pill px-[9px] py-[2px] text-helper-caption font-semibold'

/** `small` is the variant thumb's pill — 10px, 1×7 (Kit :208) beside the 11px, 2×9 badge (Kit :161). */
export const ProBadge = ({ small = false }: { small?: boolean }) => (
  <span
    className={`inline-flex items-center rounded-pill bg-marigold-tint font-semibold text-marigold-text ${small ? 'px-[7px] py-px text-[10px]' : 'px-[9px] py-[2px] text-helper-caption'}`}
  >
    ✦ Pro
  </span>
)

export const FreeBadge = () => (
  <span className={`${pill} border border-line text-ink-soft`}>Free</span>
)

/** The dot never speaks alone — the word Live is part of the badge. */
export const LiveBadge = ({ version }: { version?: string }) => (
  <span className="inline-flex items-center gap-[5px] text-control-label font-medium text-mint-text">
    <span aria-hidden className="size-[6px] rounded-full bg-mint" />
    Live
    {version ? <span className="font-mono text-helper-caption">{version}</span> : null}
  </span>
)

/** Story 5.19 — D5c's MAIN FEED chip (`D5 Canvas Markers and Template Switcher.dc.html:290`, `:312`, `:335`): mono 8.5px
 *  500 at .03em, a pill. Its words are "Main feed", uppercased by CSS so assistive technology reads words (R-170, one
 *  list: `lib/data-group.ts`). In Layers and at the panel head its ground is D5c's own `paper-sunk`, and its words `ink`,
 *  the nearest token to the frame's text colour (which is not one); on the canvas's outline it sits on the page ground
 *  (`paper-raised`) with a 1px `line` border and 7px sides. VersionChip is its nearest recipe. Words, never a control. */
export const MainFeedChip = ({ on = 'panel', id }: { on?: 'panel' | 'canvas'; id?: string }) => (
  <span
    id={id}
    data-main-feed-chip
    // the mono face through `--font-mono` itself, not the `font-mono` utility, which names next/font's own variable — one
    // the canvas's chrome layer does not carry (`lib/canvas-layer.ts`'s `fontStacks` hands the three stacks alone)
    className={`inline-flex shrink-0 items-center whitespace-nowrap rounded-pill py-[2px] [font-family:var(--font-mono)] text-[8.5px] font-medium uppercase leading-[1.4] tracking-[.03em] text-ink ${
      on === 'canvas' ? 'border border-line bg-paper-raised px-[7px]' : 'bg-paper-sunk px-[6px]'
    }`}
  >
    {MAIN_FEED}
  </span>
)

export const VersionChip = ({ children }: { children: ReactNode }) => (
  <span className="inline-flex items-center rounded-pill border border-line bg-surface px-[9px] py-[2px] font-mono text-helper-caption text-ink-soft">
    {children}
  </span>
)

/** A gscan-style result chip: mono, and its tone says how it went. */
export const ResultChip = ({
  tone,
  children,
}: {
  tone: 'clean' | 'warned' | 'failed'
  children: ReactNode
}) => (
  <span
    className={`inline-flex items-center rounded-pill px-2 py-[2px] font-mono text-[10px] font-medium ${
      tone === 'clean'
        ? 'bg-mint-tint text-mint-text'
        : tone === 'warned'
          ? 'bg-marigold-tint text-marigold-text'
          : 'bg-danger-tint text-danger-text'
    }`}
  >
    {children}
  </span>
)

export const StatusChip = ({
  tone,
  children,
}: {
  tone: 'recommended' | 'planned' | 'shipped'
  children: ReactNode
}) => (
  <span
    className={`inline-flex items-center rounded-pill px-[10px] py-[3px] text-helper-caption font-semibold ${
      tone === 'recommended'
        ? 'bg-coral-tint text-coral-text'
        : tone === 'planned'
          ? 'bg-sky-tint text-sky-text'
          : 'bg-mint-tint text-mint-text'
    }`}
  >
    {children}
  </span>
)

export const TagChip = ({ children }: { children: ReactNode }) => (
  <span className="inline-flex items-center rounded-pill border border-line bg-surface px-[9px] py-[2px] font-mono text-helper-caption text-ink-soft">
    {children}
  </span>
)
