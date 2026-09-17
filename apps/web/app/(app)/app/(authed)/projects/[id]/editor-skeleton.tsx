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
          <div className="flex min-w-0 flex-1 flex-col bg-canvas-ground px-7 pt-6">
            <div className="mx-auto flex min-h-0 w-full max-w-[1440px] flex-1 flex-col gap-8 rounded-t-[6px] bg-paper-raised p-8 shadow-canvas-page">
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
