/* Editor Sidebar Kit.dc.html:246 — loading: SKELETONS MATCHING THE SHAPE THAT IS COMING,
   and coral progress bars where a real byte count exists. NEVER A SPINNER. */

export const Skeleton = () => (
  <div aria-hidden className="flex flex-col gap-2">
    <div className="flex items-center gap-[10px]">
      <div className="h-8 w-11 rounded-[6px] bg-paper-sunk" />
      <div className="flex flex-1 flex-col gap-[6px]">
        <div className="h-[9px] w-[70%] rounded-[3px] bg-paper-sunk" />
        <div className="h-[7px] w-[45%] rounded-[3px] bg-paper-sunk/70" />
      </div>
    </div>
    <div className="h-[9px] w-[88%] rounded-[3px] bg-paper-sunk" />
    <div className="h-[9px] w-[60%] rounded-[3px] bg-paper-sunk/70" />
  </div>
)

/** A progress bar exists only where a real byte count does — hence the required label. */
export function Progress({
  label,
  count,
  percent,
}: {
  label: string
  count: string
  percent: number
}) {
  const p = Math.min(100, Math.max(0, Number.isFinite(percent) ? percent : 0))
  return (
    <div className="flex flex-col gap-[6px]">
      <div className="flex justify-between">
        <span className="text-control-label font-medium text-ink">{label}</span>
        <span className="font-mono text-helper-caption text-ink-soft">{count}</span>
      </div>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuenow={p}
        aria-valuemin={0}
        aria-valuemax={100}
        className="h-[5px] overflow-hidden rounded-[3px] bg-paper-sunk"
      >
        <div style={{ width: `${p}%` }} className="h-full rounded-[3px] bg-coral" />
      </div>
    </div>
  )
}
