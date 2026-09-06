/**
 * Loading is SKELETON CARDS, never a spinner (UX state patterns, Dashboard row) — and the
 * skeleton is the shape that is coming, which is why this is not `components/kit/loading.tsx`'s
 * `Skeleton`: that one is the Layers row's shape, for a 280px sidebar.
 *
 * Three, because three is a row of the grid at 1440 and enough of one at 390.
 *
 * ponytail: this boundary covers every `(authed)` child, and today the dashboard is the only
 * page with a shape (`/kit` is internal; Sites and Assets 404). The first sibling page that
 * needs its own skeleton moves the dashboard and this file into their own route group.
 */
export default function Loading() {
  return (
    <div className="flex flex-col gap-4 p-[16px_20px] tablet:gap-5 tablet:p-6" aria-busy>
      {/* The skeleton is decoration; this line is what a screen reader gets meanwhile. */}
      <p className="sr-only">Loading projects…</p>
      <div aria-hidden className="grid grid-cols-1 gap-[14px] tablet:grid-cols-3 tablet:gap-5">
        {[0, 1, 2].map((n) => (
          <div key={n} className="overflow-hidden rounded border border-line bg-surface">
            <div className="h-[150px] border-b border-line bg-paper-sunk tablet:aspect-[16/10] tablet:h-auto" />
            <div className="flex flex-col gap-2 p-[14px_16px]">
              <div className="h-[13px] w-[55%] rounded-[3px] bg-paper-sunk" />
              <div className="h-[11px] w-[35%] rounded-[3px] bg-paper-sunk/70" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
