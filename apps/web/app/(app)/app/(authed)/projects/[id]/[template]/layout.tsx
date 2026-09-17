import { notFound, permanentRedirect } from 'next/navigation'
import type { ReactNode } from 'react'
import { canvasFromSegment, canvasPath } from '@/lib/editor'

/**
 * THE SCHEME'S TWO REFUSALS (Story 5.1, Design Notes): `/projects/<id>/home` is a 308 to the project's own address, and
 * every segment that is not a canvas this story opens — reserved (`index`, `private`, `custom-…`, `paywall`, `cards`)
 * or unknown — is a real 404. A layout, so both run in the part of the response rendered before the editor's Suspense
 * boundary (`../layout.tsx` renders this outside it), where the status line is still theirs to set.
 */
export default async function TemplateLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ id: string; template: string }>
}) {
  const { id, template } = await params
  if (template === 'home') permanentRedirect(canvasPath(id))
  if (!canvasFromSegment(template)) notFound()
  return children
}
