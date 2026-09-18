import { notFound, permanentRedirect } from 'next/navigation'
import type { ReactNode } from 'react'
import { canvasFromSegment, canvasPath } from '@/lib/editor'

/**
 * THE SCHEME'S REFUSALS (Story 5.1, Design Notes): `/projects/<id>/home` is a 308 to the project's own address, and
 * every segment that is not a canvas — reserved (`paywall`, `cards`, an unbuilt `custom-…`), CONDITIONAL (`private`,
 * which the switcher offers to nobody yet) or unknown — is a real 404. `index` is a 404 PERMANENTLY (R-127: page 2
 * has no canvas and is derived from the Home doc). A layout, so all of it runs in the part of the response rendered
 * before the editor's Suspense boundary (`../layout.tsx` renders this outside it), where the status line is still
 * theirs to set.
 *
 * AND ALL OF IT IS SYNCHRONOUS, WHICH IS THE POINT (Story 5.5, executed 2026-09-18). A `notFound()` thrown after a
 * database read lets Next flush first: the status was still 404 but the BODY was Next's bare `__next_error__`
 * document, with none of the app's 404 and no way home, while every synchronous refusal beside it answered the app's
 * own. So `canvasFromSegment` decides a conditional canvas too, from the scheme, and the story that gives a condition
 * something to read carries that problem with it (DW-192).
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
