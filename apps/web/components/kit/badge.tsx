import type { ReactNode } from 'react'

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
