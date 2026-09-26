import { notFound } from 'next/navigation'
import { canvasFromSegment } from '@/lib/editor'
import { HARNESS } from '@/lib/harness'

/** Story 5.20 — every other canvas, in the harness: a segment the scheme knows renders nothing (the editor is the
 *  layout's), and one it does not is "not found", as `projects/[id]/(editor)/[template]/layout.tsx` refuses it. */
export default async function HarnessCanvas({ params }: { params: Promise<{ template: string }> }) {
  if (!HARNESS) notFound()
  const { template } = await params
  if (canvasFromSegment(template) === null || template === 'home') notFound()
  return null
}
