import type { Metadata } from 'next'
import { CANVASES } from '@/lib/editor'
import { projectOf } from './read'

/* Home's canvas, `/projects/<id>`. It renders nothing: the editor is the layout's, which a change of canvas keeps
   mounted, and the canvas is read off the path. It carries the title, which a notFound() below inherits. */

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const project = await projectOf((await params).id)
  return {
    title: project ? `${project.name} · ${CANVASES.home.label} — Inflozo` : 'Page not found · Inflozo',
    robots: { index: false, follow: false },
  }
}

export default function HomeCanvas() {
  return null
}
