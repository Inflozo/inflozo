/**
 * THE SITES LIST'S OWN SKELETON — the owner's test of Story 3.4, finding 2: "When the Projects or
 * Sites are being loaded. They are showing a generic shmmer. I want the loading shimmer to match
 * the cards they show."
 *
 * Until this file existed `/sites` inherited the dashboard's boundary and drew three PROJECT
 * cards — a 16:10 image band over two lines — for a card that has no image on it at all. The rule
 * was already the project's ("skeletons matching the shape that is coming", DESIGN.md § Loading);
 * what was missing was a file, and a `loading.tsx` covering a sibling segment is exactly how a
 * rule like that goes quietly unkept.
 *
 * IT LIVES IN `(list)` — a path-transparent route group — for the same reason the dashboard lives
 * in `(dashboard)`: at `sites/loading.tsx` it was a boundary over `/sites/brand` and
 * `/sites/connect` as well, and would have drawn this list over S2c exactly as the dashboard's
 * once drew project cards over this list. A skeleton covers one route only when its segment has
 * no child routes, and `busy.test.ts` asserts it.
 *
 * The rows are `page.tsx`'s card, in its order: the 40px monogram beside the title and the mono
 * host, then the pills line, then the state line and its timestamp pushed to the bottom by
 * `mt-auto` — the same `min-h` the real card gets from its own content, so the grid does not
 * resize under the reader when the cards land.
 *
 * Three, because three is a row of the grid at 1440 and enough of one at 390 — the dashboard's
 * own reason, and the same grid.
 *
 * `/sites/connect` now has no boundary at all, and needs none: the "Connect site" opener is an
 * `<a href>` whose click JavaScript turns into the sheet, so the only way to that route is a
 * document navigation (scripts off, or a modified click opening a new tab) and a route skeleton
 * is not what a browser shows for one. `/sites/brand` has its own, because it IS reached by a
 * soft navigation — the card's offer link.
 */
export default function Loading() {
  return (
    <div className="flex flex-col gap-4 p-[16px_20px] tablet:gap-5 tablet:p-6" aria-busy>
      {/* The skeleton is decoration; this line is what a screen reader gets meanwhile. */}
      <p className="sr-only">Loading sites…</p>
      <div aria-hidden className="grid grid-cols-1 gap-[14px] tablet:grid-cols-3 tablet:gap-5">
        {[0, 1, 2].map((n) => (
          <div
            key={n}
            className="flex min-h-[168px] flex-col gap-[14px] rounded border border-line bg-surface p-[18px] shadow-sm"
          >
            <div className="flex items-start gap-3">
              <div className="size-10 shrink-0 rounded-thumb bg-paper-sunk" />
              <div className="flex min-w-0 flex-1 flex-col gap-[6px]">
                <div className="h-[13px] w-[62%] rounded-[3px] bg-paper-sunk" />
                <div className="h-[10px] w-[80%] rounded-[3px] bg-paper-sunk/70" />
              </div>
            </div>
            {/* The pills keep their own line on the card, so they keep it here (DW-57). */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="h-[17px] w-[58px] rounded-pill bg-paper-sunk/70" />
              <div className="h-[17px] w-[74px] rounded-pill bg-paper-sunk/70" />
            </div>
            <div className="mt-auto flex flex-col gap-[5px]">
              <div className="h-[11px] w-[86px] rounded-[3px] bg-paper-sunk" />
              <div className="h-[10px] w-[124px] rounded-[3px] bg-paper-sunk/70" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
