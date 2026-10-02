import { Skeleton } from '@/components/kit/loading'

/**
 * THE EDITOR'S OWN SKELETON (R-98) — the Suspense fallback in `layout.tsx`, below the 404 guard, so what arrives first
 * on `/projects/<id>` is the editor's shape and never the dashboard's cards: the bar with the project's name, both
 * panels and the page card on its ground, with `Skeleton` blocks where the rows and the sections will be. Decoration
 * is hidden; a reader gets one sentence. Never a spinner (DESIGN.md § Loading).
 *
 * STORY 5.22 — IN THE SHAPE THIS DEVICE WILL GET, and CSS decides it, because the server cannot know the pointer. It is
 * also what `editor.tsx`'s gate draws until the browser has asked `PHONE` once, so the server's first paint is this and
 * never the editor. A phone (R-201) gets D4f's shape — the 60px bar and the notice's card — and the compact editor (R-202,
 * D8) gets the icon rail's column where the 240/280 panels stand.
 */
export function EditorSkeleton({ name }: { name: string }) {
  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-paper text-ink" aria-busy>
      <p className="sr-only">Opening the editor for {name}…</p>
      {/* D4f's shape, on a phone alone */}
      <div aria-hidden className="hidden min-h-0 flex-1 flex-col phone:flex">
        <div className="flex h-[60px] shrink-0 items-center gap-2 border-b border-line pl-[6px] pr-3">
          <div className="size-11" />
          <span className="truncate text-[15px] font-semibold">{name}</span>
        </div>
        <div className="flex flex-col gap-5 px-5 py-6">
          <div className="flex flex-col gap-4 rounded-lg border border-line bg-surface px-[22px] py-[26px] shadow-sm">
            <Skeleton />
            <Skeleton />
          </div>
        </div>
      </div>
      <div aria-hidden className="flex min-h-0 flex-1 flex-col phone:hidden">
        <div className="flex h-12 shrink-0 items-center gap-[10px] border-b border-line px-3 coarse:h-14">
          <div className="size-7" />
          <span className="text-ui-dense font-semibold">{name}</span>
        </div>
        <div className="flex min-h-0 flex-1">
          <div className="flex w-[240px] shrink-0 flex-col gap-4 border-r border-line p-4 compact:hidden">
            <Skeleton />
            <Skeleton />
          </div>
          {/* D8's icon rail, which stands where Layers does below 1280 and on every touch screen */}
          <div className="hidden w-11 shrink-0 border-r border-line coarse:w-14 compact:block" />
          {/* DW-199 (Story 5.24e): THE GROUND IS A SIZE CONTAINER, so the card is fitted the way the real one is — `fitFor`'s
              `min(1, stage width / 1440, stage height / 900)`, read here as container units over the same padded box — and
              it carries the stage's touch padding too. Before this it was width-bound only: on a short, wide window it drew
              taller than the real card, and on a big screen wider than 1440, the very flicker R-98 exists to remove. */}
          <div className="@container-size flex min-w-0 flex-1 flex-col items-center justify-center bg-canvas-ground px-7 py-8 coarse:pb-[52px]">
            {/* R-137 (Story 5.7): the resting card is Desktop's 1440 × 900 fitted — centred in the ground, rounded on
                all four corners, with ground below it. A skeleton that draws a different shape from the screen it
                stands in for is the very flicker R-98 exists to remove. */}
            <div data-skeleton-card className="flex aspect-[1440/900] w-[min(100cqw,100cqh*1440/900,1440px)] shrink-0 flex-col gap-8 overflow-hidden rounded-[6px] bg-paper-raised p-8 shadow-canvas-page">
              <Skeleton />
              <Skeleton />
              <Skeleton />
            </div>
          </div>
          <div className="w-[280px] shrink-0 border-l border-line p-4 compact:hidden">
            <Skeleton />
          </div>
        </div>
      </div>
    </div>
  )
}
