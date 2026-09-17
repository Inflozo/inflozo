import { notFound } from 'next/navigation'
import { Suspense, type ReactNode } from 'react'
import { Editor } from './editor'
import { EditorSkeleton } from './editor-skeleton'
import { editorData, projectOf } from './read'

/**
 * THE EDITOR'S LAYOUT (Story 5.1) — the guard, then the editor. A layout and not a page, because a layout survives a
 * change of its child segment: moving between canvases (`/projects/<id>` → `/post`) keeps the editor mounted, with its
 * folds now and its journal and lock later (5.8, 5.17). The pages render nothing; the canvas is read off the path.
 *
 * THE ORDER IS THE STATUS LINE (R-98's second effect, DW-67). The 404 guard runs before any Suspense boundary, and
 * `{children}` — whose `[template]` layout 308s `home` and 404s every segment that is not a canvas — renders OUTSIDE
 * and BEFORE the boundary, so both decide the response before the first flush. Inside it they would stream as a 200.
 * That this placement keeps the real status is a claim about Next: `tools/probe/run-verify-editor.cjs` reads it.
 *
 * The skeleton is the boundary's fallback, below the guard, so a stranger never sees an editor's shape.
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
  return <Editor project={project} {...data} />
}
