/**
 * Loading is SKELETON CARDS, never a spinner (DESIGN.md § Loading: "skeletons matching the shape
 * that is coming"; EXPERIENCE.md State Patterns, Dashboard row) — and the skeleton is the shape
 * that is coming, which is why this is not `components/kit/loading.tsx`'s `Skeleton`: that one is
 * the Layers row's shape, for a 280px sidebar.
 *
 * Three, because three is a row of the grid at 1440 and enough of one at 390.
 *
 * THIS FILE IS THE DASHBOARD'S AND ONLY THE DASHBOARD'S, and it took the owner's test of Story
 * 3.4 (finding 2: "they are showing a generic shmmer") to make that true. A `loading.tsx` covers
 * every child segment that has none of its own, so when Sites arrived in Epic 3 it inherited
 * THESE cards — a 16:10 image band over two lines — for a card that is a monogram, a title, a
 * mono host and pills with no image anywhere on it. `/account` inherited them too. Each of those
 * routes now has its own, which is the sibling half of the note this file used to carry; moving
 * the dashboard into a route group would have done the same thing with a larger diff.
 *
 * ponytail: `/kit` still inherits this one. It is the internal component gallery, reachable only
 * by typing the path, and giving a gallery of every control a skeleton of every control is the
 * definition of work nobody asked for. `busy.test.ts` names it as the one exception, with this
 * reason, so it is a decision rather than an omission.
 *
 * The rows below are `project-card.tsx`'s, in its order: the Placeholder's band, then the name
 * beside its ⋯, then the "Sample content" pill with the date pushed to the end of the line.
 */
export default function Loading() {
  return (
    <div className="flex flex-col gap-4 p-[16px_20px] tablet:gap-5 tablet:p-6" aria-busy>
      {/* The skeleton is decoration; this line is what a screen reader gets meanwhile. */}
      <p className="sr-only">Loading projects…</p>
      <div aria-hidden className="grid grid-cols-1 gap-[14px] tablet:grid-cols-3 tablet:gap-5">
        {[0, 1, 2].map((n) => (
          <div key={n} className="overflow-hidden rounded border border-line bg-surface shadow-sm">
            <div className="h-[150px] border-b border-line bg-paper-sunk tablet:aspect-[16/10] tablet:h-auto" />
            <div className="flex flex-col gap-2 p-[14px_16px]">
              {/* The name and the ⋯ share a row on the card, so they share one here. */}
              <div className="flex items-center justify-between gap-2">
                <div className="h-[13px] w-[55%] rounded-[3px] bg-paper-sunk" />
                <div className="size-[18px] shrink-0 rounded-sm bg-paper-sunk/70" />
              </div>
              <div className="flex items-center gap-2">
                <div className="h-[17px] w-[92px] rounded-pill bg-paper-sunk/70" />
                <div className="ml-auto h-[11px] w-[64px] rounded-[3px] bg-paper-sunk/70" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
