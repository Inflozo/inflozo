/* Editor Sidebar Kit.dc.html:266 — the panel empty state. EVERY EMPTY STATE IN THE PRODUCT
   IS DESIGNED LIKE THIS ONE: a sentence that says what to do, not an apology. */

export function EmptyPanel({ title, instruction }: { title: string; instruction: string }) {
  return (
    <div className="flex flex-col items-center gap-[10px] p-[22px_12px] text-center">
      <svg width="64" height="44" viewBox="0 0 64 44" fill="none" aria-hidden>
        <rect
          x="4"
          y="4"
          width="56"
          height="36"
          rx="6"
          stroke="var(--color-line-strong)"
          strokeWidth="1.5"
          strokeDasharray="4 4"
        />
        <rect x="14" y="14" width="22" height="5" rx="2.5" fill="var(--color-line)" />
        <rect x="14" y="24" width="14" height="7" rx="3" fill="var(--color-coral-tint-strong)" />
      </svg>
      <span className="text-ui-dense font-semibold text-ink">{title}</span>
      <span className="text-control-label leading-[1.5] text-ink-soft">{instruction}</span>
    </div>
  )
}
