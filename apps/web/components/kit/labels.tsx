import type { ReactNode } from 'react'

/* Editor Sidebar Kit.dc.html:31 — labels & text. Panel label 13/600/0.04em uppercase,
   control label 12/500, helper caption 11px. Every one of them in ink-soft. */

export const PanelLabel = ({ id, children }: { id?: string; children: ReactNode }) => (
  // `id` is optional and names ONE label for a reader that must find it — the editor's panel head, which since
  // Story 5.11 carries the category word beneath the name inside a wrapper, so "the first span in the panel" is
  // no longer this element and a probe that took it that way was reading the wrapper's own inherited type.
  <span id={id} className="text-panel-label font-semibold uppercase tracking-[0.04em] text-ink-soft">
    {children}
  </span>
)

export const ControlLabel = ({ htmlFor, children }: { htmlFor?: string; children: ReactNode }) =>
  htmlFor ? (
    <label htmlFor={htmlFor} className="text-control-label font-medium text-ink-soft">
      {children}
    </label>
  ) : (
    <span className="text-control-label font-medium text-ink-soft">{children}</span>
  )

/** One line of guidance under a control. Never jargon. */
export const HelperCaption = ({ children }: { children: ReactNode }) => (
  <span className="text-helper-caption leading-[1.5] text-ink-soft">{children}</span>
)

/** The counter chip beside a selected-section header: mono, "4 / 18". */
export const CounterChip = ({ children }: { children: ReactNode }) => (
  <span className="rounded-pill border border-line bg-surface px-2 py-[2px] font-mono text-helper-caption text-ink-soft">
    {children}
  </span>
)

export const SectionHeader = ({ name, counter }: { name: string; counter?: string }) => (
  <div className="flex items-center justify-between">
    <PanelLabel>{name}</PanelLabel>
    {counter ? <CounterChip>{counter}</CounterChip> : null}
  </div>
)
