/**
 * S2c'S OWN SHAPE while it loads — the screen the Sites card's offer link goes to.
 *
 * It exists for the half of the owner's finding 1 that is a LINK rather than a button: the offer
 * was an `<a href>`, so pressing it left the Sites page standing, unchanged, until the next
 * document painted. It is a `next/link` now (`../site-notices.tsx`), so the press is a soft
 * navigation and this appears in the same frame — and, because a `Link` prefetches on hover,
 * usually with nothing left to wait for.
 *
 * The shape is `page.tsx`'s, in its order: the heading pair, the 760px split card with its two
 * halves — the logo/title/host row, the accent row and the pill line on the left; the mini
 * homepage on the right — then the caption and the two buttons. It stacks below `tablet` exactly
 * as the real card does, which is R Responsive System's collapse for a two-pane card.
 *
 * Nothing here is painted in the customer's accent. The accent is the one thing this screen
 * exists to show and it has not been read yet; drawing a guess at it would be a skeleton that
 * lies about the shape that is coming.
 */
export default function Loading() {
  return (
    <div className="flex flex-1 items-center justify-center p-[16px_20px] tablet:p-6" aria-busy>
      {/* The skeleton is decoration; this line is what a screen reader gets meanwhile. */}
      <p className="sr-only">Loading your brand…</p>
      <div aria-hidden className="flex w-full flex-col items-center gap-7 tablet:gap-9">
        <div className="flex flex-col items-center gap-3">
          <div className="h-[28px] w-[280px] rounded-[4px] bg-paper-sunk tablet:h-[36px] tablet:w-[380px]" />
          <div className="h-[13px] w-[220px] rounded-[3px] bg-paper-sunk/70" />
        </div>

        <div className="flex w-full max-w-[760px] flex-col overflow-hidden rounded-lg bg-surface shadow-md tablet:flex-row">
          <div className="flex flex-1 flex-col gap-6 border-b border-line p-6 tablet:border-b-0 tablet:border-r tablet:p-8">
            <div className="h-[11px] w-[104px] rounded-[3px] bg-paper-sunk" />
            <div className="flex items-center gap-[14px]">
              <div className="size-12 shrink-0 rounded-thumb bg-paper-sunk" />
              <div className="flex min-w-0 flex-1 flex-col gap-[6px]">
                <div className="h-[14px] w-[60%] rounded-[3px] bg-paper-sunk" />
                <div className="h-[11px] w-[76%] rounded-[3px] bg-paper-sunk/70" />
              </div>
            </div>
            <div className="flex flex-col gap-[10px]">
              <div className="h-[12px] w-[86px] rounded-[3px] bg-paper-sunk/70" />
              <div className="flex items-center gap-[10px]">
                <div className="size-7 shrink-0 rounded-full bg-paper-sunk" />
                <div className="h-[13px] w-[74px] rounded-[3px] bg-paper-sunk/70" />
              </div>
            </div>
            <div className="flex flex-col gap-[10px]">
              <div className="h-[12px] w-[78px] rounded-[3px] bg-paper-sunk/70" />
              <div className="flex flex-wrap gap-[6px]">
                <div className="h-[22px] w-[62px] rounded-pill bg-paper-sunk/70" />
                <div className="h-[22px] w-[54px] rounded-pill bg-paper-sunk/70" />
                <div className="h-[22px] w-[70px] rounded-pill bg-paper-sunk/70" />
              </div>
            </div>
            <div className="h-[11px] w-[88%] rounded-[3px] bg-paper-sunk/70" />
          </div>

          {/* The frame's mini homepage, in the paper the real one is drawn on. */}
          <div className="flex flex-1 flex-col items-center justify-center gap-5 bg-paper p-6 tablet:p-8">
            <div className="flex h-[170px] w-[250px] flex-col gap-2 rounded-thumb bg-surface p-4 shadow-md">
              <div className="flex items-center justify-between">
                <div className="h-[8px] w-[34px] rounded-[2px] bg-paper-sunk" />
                <div className="flex gap-1">
                  <div className="h-[5px] w-4 rounded-[2px] bg-paper-sunk" />
                  <div className="h-[5px] w-4 rounded-[2px] bg-paper-sunk" />
                </div>
              </div>
              <div className="mt-[10px] h-[26px] w-[80%] rounded-[3px] bg-paper-sunk" />
              <div className="h-[8px] w-[60%] rounded-[2px] bg-paper-sunk/70" />
              <div className="mt-2 h-5 w-[74px] rounded-[5px] bg-paper-sunk" />
            </div>
            <div className="h-[12px] w-[190px] rounded-[3px] bg-paper-sunk/70" />
          </div>
        </div>

        <div className="flex w-full max-w-[760px] flex-col items-center gap-4">
          <div className="h-[11px] w-[300px] max-w-full rounded-[3px] bg-paper-sunk/70" />
          <div className="flex flex-wrap items-center justify-center gap-[14px]">
            <div className="h-11 w-[150px] rounded bg-paper-sunk" />
            <div className="h-11 w-[74px] rounded bg-paper-sunk/70" />
          </div>
        </div>
      </div>
    </div>
  )
}
