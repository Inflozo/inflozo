import { Skeleton } from '@/components/kit/loading'

/**
 * THE EDITOR'S OWN SKELETON (R-98) — the Suspense fallback in `layout.tsx`, below the 404 guard, so what arrives first
 * on `/projects/<id>` is the editor's shape and never the dashboard's cards: the bar with the project's name, both
 * panels and the page card on its ground, with `Skeleton` blocks where the rows and the sections will be. Decoration
 * is hidden; a reader gets one sentence. Never a spinner (DESIGN.md § Loading).
 */
export function EditorSkeleton({ name }: { name: string }) {
  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-paper text-ink" aria-busy>
      <p className="sr-only">Opening the editor for {name}…</p>
      <div aria-hidden className="flex min-h-0 flex-1 flex-col">
        <div className="flex h-12 shrink-0 items-center gap-[10px] border-b border-line px-3">
          <div className="size-7" />
          <span className="text-ui-dense font-semibold">{name}</span>
        </div>
        <div className="flex min-h-0 flex-1">
          <div className="flex w-[240px] shrink-0 flex-col gap-4 border-r border-line p-4">
            <Skeleton />
            <Skeleton />
          </div>
          <div className="flex min-w-0 flex-1 flex-col items-center justify-center bg-canvas-ground px-7 pt-6">
            {/* R-137 (Story 5.7): the resting card is Desktop's 1440 × 900 fitted — centred in the ground, rounded on
                all four corners, with ground below it. A skeleton that draws a different shape from the screen it
                stands in for is the very flicker R-98 exists to remove.
                ponytail: width-bound only, which the owner's 1440 stage is (864 / 1440 beats 828 / 900). On a short,
                wide window the real card is height-bound and this draws taller; measure the stage here if that is
                ever seen — the fallback has no `ResizeObserver` to read. */}
            <div className="flex aspect-[1440/900] max-h-full w-full shrink-0 flex-col gap-8 overflow-hidden rounded-[6px] bg-paper-raised p-8 shadow-canvas-page">
              <Skeleton />
              <Skeleton />
              <Skeleton />
            </div>
          </div>
          <div className="w-[280px] shrink-0 border-l border-line p-4">
            <Skeleton />
          </div>
        </div>
      </div>
    </div>
  )
}
