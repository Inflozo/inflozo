import { notFound } from 'next/navigation'
import { HARNESS } from '@/lib/harness'

/** Story 5.20 — Home, in the harness: the editor is the layout's (`layout.tsx`), and a page renders nothing of its own,
 *  as `projects/[id]/(editor)/page.tsx` renders nothing. It guards itself as the layout does (`app-routes.test.ts`). */
export default function HarnessHome() {
  if (!HARNESS) notFound()
  return null
}
