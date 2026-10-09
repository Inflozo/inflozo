import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { darkOverrideCount } from '@inflozo/section-runtime'
import { ChevronLeft } from '@/components/kit/icons'
import { ring } from '@/components/kit/greyed'
import { canvasPath, templateKeyOf } from '@/lib/editor'
import { siteAccentOf } from '@/lib/style-pack'
import { boundLabels, liveHolder, placedControls, promotable, SETTING_COLUMNS, siteBasics, storedSettings } from '@/lib/theme-settings'
import { supabaseServer } from '@/lib/supabase/server'
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
   overrides have never been saved. That is 5.8's missing half, not a wrong count.

   STORY 7.9 — THE REST OF D6a, read here beside it: `posts_per_page` off the same cached row; the project's custom
   settings through the caller's own session (RLS), each through `storedSettings`; the controls the Promote form offers,
   derived from the same `editorData` docs (`placedControls`, every synthesized doc skipped — no row binds to one); the linked
   site's title, logo and accent for Site basics, read and never written (AD-10's P8); and the lock's live holder, so a
   tab reading along draws every editing control greyed (R-192). */

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
  const sb = await supabaseServer()
  const [{ docs, entries, synthesized, lock }, settingsRead, siteRead] = await Promise.all([
    editorData(id),
    sb.from('custom_settings').select(SETTING_COLUMNS).eq('project_id', id).order('position').order('created_at'),
    project.linked_site_id === null ? null : sb.from('sites').select('url, title, site_settings').eq('id', project.linked_site_id).maybeSingle(),
  ])
  if (settingsRead.error) throw new Error(`the project's theme settings could not be read (${settingsRead.error.code})`)
  // a failed site read is the three rows unread ("Not set in Ghost"), never a black page over values Ghost owns
  if (siteRead?.error) console.error('projects/settings: the linked site could not be read', { code: siteRead.error.code })
  const settings = storedSettings(settingsRead.data)
  const placed = placedControls(docs, entries, new Set(synthesized.map(templateKeyOf)))

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
        postsPerPage={project.posts_per_page}
        basics={siteRead === null ? null : siteBasics(siteRead.data, siteAccentOf(siteRead.data?.site_settings))}
        settings={settings}
        controls={promotable(placed, settings)}
        bound={boundLabels(placed, settings)}
        holder={liveHolder(lock)}
      />
    </div>
  )
}
