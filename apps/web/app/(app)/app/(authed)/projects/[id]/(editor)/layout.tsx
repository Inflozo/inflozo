import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { isStale, selfMarkScript } from '@/lib/lock'
import { Suspense, type ReactNode } from 'react'
import { Editor } from './editor'
import { EditorSkeleton } from './editor-skeleton'
import { editorData, projectOf } from './read'

/**
 * THE EDITOR'S LAYOUT (Story 5.1; descended into the `(editor)` route group by Story 5.6's R-131, which changed no
 * URL) — a layout and not a page, because a layout survives a change of its child segment: moving between canvases
 * (`/projects/<id>` → `/post`) keeps the editor mounted, with its folds now and its journal and lock later (5.8,
 * 5.17). The pages render nothing; the canvas is read off the path.
 *
 * THE ORDER IS STILL THE STATUS LINE (R-98's second effect, DW-67). `[id]/layout.tsx`'s 404 guard runs above this
 * file, and `{children}` — whose `[template]` layout 308s `home` and 404s every segment that is not a canvas —
 * renders OUTSIDE and BEFORE the boundary below, so both decide the response before the first flush. Inside it they
 * would stream as a 200. That this placement keeps the real status is a claim about Next:
 * `tools/probe/run-verify-editor.cjs` reads it.
 *
 * The guard is repeated here only to narrow the type — `projectOf` is `cache`d, so it is the same query the parent
 * already ran, and the `notFound()` is unreachable from the parent's own children.
 */
export default async function EditorLayout({ children, params }: { children: ReactNode; params: Promise<{ id: string }> }) {
  const project = await projectOf((await params).id)
  if (!project) notFound()
  return (
    <>
      {children}
      <Suspense fallback={<EditorSkeleton name={project.name} />}>
        <Loaded project={project} />
      </Suspense>
    </>
  )
}

async function Loaded({ project }: { project: { id: string; name: string } }) {
  const data = await editorData(project.id)
  // Story 5.17 — a live row might be THIS tab's own, reloading: mark it before the first paint (`selfMarkScript`).
  // CSP: the page's own nonce from `proxy.ts`, or the browser refuses it.
  const nonce = (await headers()).get('x-nonce') ?? undefined
  const mine = data.lock !== null && !isStale(data.lock) ? selfMarkScript(data.lock.holderSessionId) : null
  return (
    <>
      {mine === null ? null : <script nonce={nonce} dangerouslySetInnerHTML={{ __html: mine }} />}
      <Editor project={project} {...data} />
    </>
  )
}
