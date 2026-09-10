/**
 * S11e's OWN SHAPE WHILE THE PANEL LOADS — R-98, "every route the user reaches has a skeleton in
 * its own shape", and the window over the Sites list is what a soft navigation actually reaches.
 * Opening the panel reads the site row and then the credential row through the Admin chokepoint's
 * pooler — two round trips, so there IS a gap to draw.
 *
 * IT IS A `<Suspense>` FALLBACK AND NO LONGER A `loading.tsx`, because the popup is no longer a
 * route: it is `/sites?manage=…`, a parameter on the list (`panel-modal.tsx` carries the whole
 * argument). The list page wraps the panel in its own boundary and this is what that boundary
 * shows, inside the `<dialog>` that is already open — so the panel replaces it without the window
 * moving, exactly as before.
 *
 * IT DRAWS S11e, NOT A GENERIC CARD (the owner's test of Story 3.4, finding 2): the header's two
 * lines and its ✕, then the body's two columns — three credential blocks on the left, the context
 * rail on the right with its Test connection card on the bottom edge — then the footer's single
 * control.
 *
 * The rail's shape is drawn from `tablet` up only, exactly as the panel's is: below it the
 * columns are one and the rail sits under the keys.
 */
const Bar = ({ className }: { className: string }) => <div className={`rounded-[3px] bg-paper-sunk ${className}`} />

export function KeysSkeleton() {
  return (
    <>
      <p className="sr-only">Loading your API keys…</p>

      <div aria-hidden className="flex shrink-0 items-start gap-4 border-b border-line-faint p-[18px_20px] tablet:p-[24px_28px]">
        <div className="flex min-w-0 flex-1 flex-col gap-[9px]">
          <Bar className="h-[18px] w-[46%]" />
          <Bar className="h-[11px] w-[74%] bg-paper-sunk/70" />
        </div>
        <div className="size-7 shrink-0 rounded-thumb bg-paper-sunk/70" />
      </div>

      <div aria-hidden className="flex min-h-0 flex-1 flex-col overflow-hidden tablet:flex-row tablet:items-stretch">
        <div className="flex min-w-0 flex-1 flex-col gap-3 p-[16px_20px] tablet:p-[20px_22px]">
          {/* The three credential blocks, in the panel's own order and with its own border. */}
          {[0, 1, 2].map((n) => (
            <div key={n} className="flex flex-col gap-[9px] rounded-thumb border border-line p-[12px_13px]">
              <div className="flex items-center gap-[9px]">
                <Bar className="h-[12px] w-[104px]" />
                <div className="ml-auto size-[6px] rounded-full bg-paper-sunk" />
                <Bar className="h-[10px] w-[46px] bg-paper-sunk/70" />
              </div>
              <Bar className="h-[10px] w-[82%] bg-paper-sunk/70" />
              <div className="h-[34px] rounded-thumb border border-line bg-paper" />
            </div>
          ))}
        </div>

        <div className="flex w-full shrink-0 flex-col gap-4 border-t border-line-faint bg-paper-raised p-[16px_20px] tablet:w-[322px] tablet:border-t-0 tablet:border-l tablet:p-[20px_22px]">
          <div className="flex flex-col gap-[6px]">
            <Bar className="h-[10px] w-[58px] bg-paper-sunk/70" />
            <Bar className="h-[12px] w-[76%]" />
            <Bar className="h-[10px] w-[88%] bg-paper-sunk/70" />
          </div>
          <div className="hidden h-px bg-line-faint tablet:block" />
          <Bar className="h-[10px] w-[92%] bg-paper-sunk/70" />
          <div className="h-[68px] rounded-thumb bg-sky-tint" />
          <div className="mt-auto flex flex-col gap-[11px] rounded-thumb border border-line bg-surface p-[12px_13px]">
            <Bar className="h-[11px] w-[70%] bg-paper-sunk/70" />
            <div className="h-9 rounded bg-paper-sunk/70" />
          </div>
        </div>
      </div>

      <div aria-hidden className="flex shrink-0 items-center justify-end border-t border-line-faint p-[12px_20px] tablet:p-[14px_28px]">
        <div className="h-9 w-[88px] rounded bg-paper-sunk/70" />
      </div>
    </>
  )
}
