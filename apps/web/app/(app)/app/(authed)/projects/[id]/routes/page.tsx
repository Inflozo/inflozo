import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { parseRoutesConfig, routesYaml, validateRoutes } from '@inflozo/section-runtime/routes'
import { hostOf, normaliseSiteUrl } from '@/lib/connect-rule'
import { siteFrom } from '@/lib/live-content'
import { ROUTES_WORDS, templatesOf } from '@/lib/routes'
import { supabaseServer } from '@/lib/supabase/server'
import { projectOf } from '../(editor)/read'
import { RoutesManager } from './routes-manager'

/* STORY 7.16a — THE ROUTES MANAGER (FR-I2, FR-I3), `/projects/<id>/routes`: `S9 Routes.dc.html` S9a (two panes), S9b (the
   pane's errors), S9c (New collection), S9d (the empty state) and S9e (New route), as `EXPERIENCE.md:177-179, :353, :747`
   re-specify them, and the parts no frame draws built beside the drawn ones (R-247). Reached from the Template menu's
   "Manage routes" (`template-switcher.tsx`); `lib/editor.ts`'s `ROUTES` names the segment.

   A STATIC SIBLING OF `[template]` beside `settings`, `sync` and `lock`, so Next resolves it first and the editor's canvas
   refusal is never asked about it. The 404 guard is `[id]/layout.tsx`'s, above this page's `loading.tsx` (R-98's second
   effect), so `projectOf` here is the same `cache`d row and its `notFound()` only narrows the type.

   ONE READ, IN ONE `Promise.all`, through the caller's own session (RLS): `routes_config`; the project's Routes Manager
   templates (`custom_templates` of kind `routes`, parsed — a filename outside `CUSTOM_TARGET_RE` is ignored, routine call
   14); the names this project has deployed (`deployed_template_names`, select-only); the custom canvases that carry a
   design (`project_templates` under `custom:` — none before Story 7.16b); and the linked site's row for its name in the
   bar and, where its Content API is readable, the tag and writer suggestions the sheets offer. Posts per page is the
   project's own column off the cached row. Everything the page shows is DERIVED here from what is stored: the YAML is
   `routesYaml(config)` and the errors `validateRoutes(config)` — the saved state, re-rendered after every write. */

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const project = await projectOf((await params).id)
  return {
    title: project ? `${project.name} · ${ROUTES_WORDS.title} — Inflozo` : 'Page not found · Inflozo',
    robots: { index: false, follow: false },
  }
}

export default async function RoutesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const project = await projectOf(id)
  if (!project) notFound()
  const sb = await supabaseServer()
  const [configRead, templatesRead, deployedRead, designedRead, siteRead] = await Promise.all([
    sb.from('routes_config').select('config').eq('project_id', id).maybeSingle(),
    sb.from('custom_templates').select('id, filename, display_name, kind, created_at').eq('project_id', id).eq('kind', 'routes').order('created_at'),
    sb.from('deployed_template_names').select('filename').eq('project_id', id),
    sb.from('project_templates').select('template_key').eq('project_id', id).like('template_key', 'custom:%'),
    project.linked_site_id === null ? null : sb.from('sites').select('url, title, content_key, disconnected_at').eq('id', project.linked_site_id).maybeSingle(),
  ])
  for (const read of [configRead, templatesRead, deployedRead, designedRead]) {
    if (read.error) throw new Error(`the project's routing could not be read (${read.error.code})`)
  }
  // a failed site read is the bar without the site's name and no suggestions, never a black page
  if (siteRead?.error) console.error('projects/routes: the linked site could not be read', { code: siteRead.error.code })
  const site = siteRead && !siteRead.error && siteRead.data ? siteFrom(siteRead.data, normaliseSiteUrl, hostOf) : null

  const templates = templatesOf(templatesRead.data)
  const stored = configRead.data?.config ?? {}
  const parsed = parseRoutesConfig(stored)
  const problems = validateRoutes(stored, { templates: templates.map((t) => t.file) })

  return (
    <RoutesManager
      projectId={id}
      projectName={project.name}
      siteName={site?.title ?? null}
      content={site !== null && 'origin' in site ? { origin: site.origin, key: site.key } : null}
      postsPerPage={project.posts_per_page}
      config={parsed.ok ? parsed.config : null}
      yaml={parsed.ok ? routesYaml(parsed.config) : null}
      problems={problems}
      templates={templates}
      deployed={(deployedRead.data ?? []).map((r) => r.filename as string)}
      designed={(designedRead.data ?? []).map((r) => (r.template_key as string).slice('custom:'.length))}
    />
  )
}
