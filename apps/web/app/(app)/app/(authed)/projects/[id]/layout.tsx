import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'
import { projectOf } from './(editor)/read'

/**
 * THE PROJECT'S GUARD, AND NOTHING ELSE (Story 5.1, split by Story 5.6's R-131).
 *
 * It used to render the Editor too — which is exactly why `settings` could not be a child of this segment: every
 * child of `[id]` came up inside the editor's bar, Layers, canvas and Controls. The editor therefore descends into
 * `(editor)/`, a route group, which is NOT a URL segment: `/projects/<id>` and every canvas segment are
 * byte-identical afterwards, and `run-verify-editor.cjs` steps 2, 6 and 9 are the control that says so.
 *
 * THE GUARD STAYS HERE, ABOVE BOTH CHILDREN AND ABOVE EVERY SUSPENSE BOUNDARY (R-98's second effect, DW-67). A 404
 * decided above the first flush is a real 404; decided inside a boundary it streams as a 200. `projectOf` is
 * `cache`d, so the editor's own read, the pages' metadata and the settings screen share this one query.
 *
 * NOTHING ELSE MOVED WITH IT. The editor is still in a LAYOUT (`(editor)/layout.tsx`), because a layout survives a
 * change of its child segment: moving between canvases keeps the editor mounted, with its folds now and its journal
 * and lock later (5.8, 5.17).
 */
export default async function ProjectLayout({ children, params }: { children: ReactNode; params: Promise<{ id: string }> }) {
  if (!(await projectOf((await params).id))) notFound()
  return children
}
