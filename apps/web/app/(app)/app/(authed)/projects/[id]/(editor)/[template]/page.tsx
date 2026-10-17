import type { Metadata } from 'next'
import { ghostLabel } from '@inflozo/section-runtime/routes'
import { canvasFromSegment, fileOf, isRouteCanvas, labelOf } from '@/lib/editor'
import { projectOf, routeTemplatesOf } from '../read'

/* A canvas other than Home, `/projects/<id>/<key>`. It renders nothing, as Home's page does — the editor is the
   `[id]` layout's — and carries the title a notFound() below inherits.

   STORY 7.16b — a Routes Manager canvas's title is its template's display name (R-170: the switcher's row says the same),
   read here from the same `cache`d rows the editor reads. One that names no template is titled by Ghost's own label for
   its file (`ghostLabel`), the name its notice says, until the editor's move to Home retitles the tab. */

export async function generateMetadata({ params }: { params: Promise<{ id: string; template: string }> }): Promise<Metadata> {
  const { id, template } = await params
  const [project, key] = [await projectOf(id), canvasFromSegment(template)]
  const named = key !== null && isRouteCanvas(key) && project ? (await routeTemplatesOf(id)).find((t) => t.canvas === key)?.name : undefined
  const label = key === null ? '' : isRouteCanvas(key) ? (named ?? ghostLabel(fileOf(key))) : labelOf(key)
  return {
    title: project && key ? `${project.name} · ${label} — Inflozo` : 'Page not found · Inflozo',
    robots: { index: false, follow: false },
  }
}

export default function TemplateCanvas() {
  return null
}
