import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { darkOverrideCount } from '@inflozo/section-runtime'
import { ChevronLeft } from '@/components/kit/icons'
import { ring } from '@/components/kit/greyed'
import { canvasPath } from '@/lib/editor'
import { editorData, projectOf } from '../(editor)/read'
import { ThemeSettings } from './theme-settings'

/* THEME SETTINGS (R-131, owner 2026-09-18) — `/projects/<id>/settings`, the URL scheme's ONE non-canvas segment.
   It holds D6a's project-mode block and the project-level "Clear dark overrides" row, and nothing else that screen
   draws; `theme-settings.tsx` carries the rest of that reasoning.

   IT IS A SIBLING OF THE `(editor)` GROUP, not a child of the editor. `projects/[id]/layout.tsx` used to render the
   Editor for every child segment, so a page nested there came up inside the editor's bar, Layers, canvas and
   Controls; the editor descended into `(editor)/` (a route group, so no URL moved) and this sits beside it. The 404
   guard stayed in `[id]/layout.tsx`, above both children and above every Suspense boundary, which is where R-98's
   second effect requires it — so `projectOf` here is the same `cache`d row and its `notFound()` is unreachable.

   A STATIC SIBLING OF `[template]`, which Next resolves first, so `canvasFromSegment` is never asked about
   `settings` and Story 5.5's synchronous-refusal finding is untouched.

   THE COUNT IS DERIVED FROM THE DOCS (standing rule 4), through `editorData` — the same read the editor makes, which
   parses every doc through AD-27's one schema and checks every design against the library, so the count cannot be
   built on a doc the editor would refuse. Note that nothing writes `project_templates` before Story 5.8: until then
   an override made on the canvas is session state, so this count reads what is STORED and reads 0 on a project whose
   overrides have never been saved. That is 5.8's missing half, not a wrong count. */

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const project = await projectOf((await params).id)
  return {
    title: project ? `${project.name} · Theme settings — Inflozo` : 'Page not found · Inflozo',
    robots: { index: false, follow: false },
  }
}

export default async function ThemeSettingsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const project = await projectOf(id)
  if (!project) notFound()
  const { docs, entries } = await editorData(id)

  return (
    <div className="flex flex-col gap-4 p-[16px_20px] tablet:gap-5 tablet:p-6">
      <div className="flex items-center gap-[10px]">
        <Link
          href={canvasPath(id)}
          aria-label={`Back to ${project.name}`}
          title={`Back to ${project.name}`}
          className={`inline-flex size-7 items-center justify-center rounded-sm text-ink-soft transition-colors hover:bg-paper-sunk ${ring}`}
        >
          <ChevronLeft size={15} />
        </Link>
        <h1 className="text-[16px] font-bold tracking-[-0.01em]">Theme settings</h1>
      </div>
      <ThemeSettings
        projectId={id}
        darkEnabled={project.dark_enabled !== false}
        overriddenSections={darkOverrideCount(Object.values(docs), (designId) => entries[designId])}
      />
    </div>
  )
}
