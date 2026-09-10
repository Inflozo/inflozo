/**
 * S2c'S OWN SHAPE WHILE IT LOADS, drawn once for both chromes — the popup over the Sites list
 * (`@modal/(.)brand`) and the full page `connectSite` lands on.
 *
 * It exists for the half of the owner's finding 1 of Story 3.4 that is a LINK rather than a
 * button: the offer was an `<a href>`, so pressing it left the Sites page standing, unchanged,
 * until the next document painted. It is a `next/link` now (`site-notices.tsx`), so the press is a
 * soft navigation and this appears in the same frame — and, because a `Link` prefetches on hover,
 * usually with nothing left to wait for.
 *
 * The shape is `brand-panel.tsx`'s, in its order: the header's two lines, then the two columns —
 * the logo/title/host row, the accent row, the pill line and the mini homepage on the left; the
 * chooser and the two stacked presses on the right. It stacks below `tablet` exactly as the real
 * panel does, which is R Responsive System's collapse for a two-pane card.
 *
 * Nothing here is painted in the customer's accent. The accent is the one thing this screen exists
 * to show and it has not been read yet; drawing a guess at it would be a skeleton that lies about
 * the shape that is coming.
 *
 * The two `loading.tsx` files that render it carry their own `sr-only` sentence and their own
 * `aria-hidden`, which is what `busy.test.ts` reads — a route's sentence is the route's.
 */
const Bar = ({ className }: { className: string }) => <div className={`rounded-[3px] bg-paper-sunk ${className}`} />

export function BrandSkeleton() {
  return (
    <>
      <div className="flex shrink-0 flex-col gap-[9px] border-b border-line-faint p-[18px_20px] tablet:p-[24px_28px]">
        <Bar className="h-[20px] w-[58%]" />
        <Bar className="h-[11px] w-[40%] bg-paper-sunk/70" />
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden tablet:flex-row tablet:items-stretch">
        <div className="flex min-w-0 flex-1 flex-col gap-6 p-[16px_20px] tablet:p-[20px_22px]">
          <Bar className="h-[11px] w-[104px] bg-paper-sunk/70" />
          <div className="flex items-center gap-[14px]">
            <div className="size-12 shrink-0 rounded-thumb bg-paper-sunk" />
            <div className="flex min-w-0 flex-1 flex-col gap-[6px]">
              <Bar className="h-[13px] w-[54%]" />
              <Bar className="h-[10px] w-[38%] bg-paper-sunk/70" />
            </div>
          </div>
          <div className="flex flex-col gap-[10px]">
            <Bar className="h-[10px] w-[84px] bg-paper-sunk/70" />
            <div className="flex items-center gap-[10px]">
              <div className="size-7 shrink-0 rounded-full bg-paper-sunk" />
              <Bar className="h-[11px] w-[76px]" />
            </div>
          </div>
          <div className="flex flex-wrap gap-[6px]">
            {[54, 68, 46].map((w) => (
              <div key={w} style={{ width: w }} className="h-[23px] rounded-pill bg-paper-sunk/70" />
            ))}
          </div>
          <div className="mt-auto flex flex-col items-center gap-3 rounded-thumb bg-paper p-5">
            <div className="h-[170px] w-[250px] max-w-full rounded-thumb bg-surface shadow-md" />
            <Bar className="h-[10px] w-[62%] bg-paper-sunk/70" />
          </div>
        </div>

        <div className="flex w-full shrink-0 flex-col gap-4 border-t border-line-faint bg-paper-raised p-[16px_20px] tablet:w-[360px] tablet:border-t-0 tablet:border-l tablet:p-[20px_22px]">
          <div className="mt-auto flex flex-col gap-[10px]">
            <Bar className="h-[10px] w-[88%] bg-paper-sunk/70" />
            <div className="h-11 rounded bg-paper-sunk" />
            <div className="h-11 rounded bg-paper-sunk/70" />
          </div>
        </div>
      </div>
    </>
  )
}
