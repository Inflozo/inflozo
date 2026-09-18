import type { Metadata } from 'next'
import { CANVASES, canvasFromSegment } from '@/lib/editor'
import { projectOf } from '../read'

/* A canvas other than Home, `/projects/<id>/<key>`. It renders nothing, as Home's page does — the editor is the
   `[id]` layout's — and carries the title a notFound() below inherits. */

export async function generateMetadata({ params }: { params: Promise<{ id: string; template: string }> }): Promise<Metadata> {
  const { id, template } = await params
  const [project, key] = [await projectOf(id), canvasFromSegment(template)]
  return {
    title: project && key ? `${project.name} · ${CANVASES[key].label} — Inflozo` : 'Page not found · Inflozo',
    robots: { index: false, follow: false },
  }
}

export default function TemplateCanvas() {
  return null
}
