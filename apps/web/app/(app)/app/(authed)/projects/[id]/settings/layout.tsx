import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'
import { ChevronLeft } from '@/components/kit/icons'
import { ring } from '@/components/kit/greyed'
import { canvasPath } from '@/lib/editor'
import { adminAt } from '@/lib/paywall'
import { linkedSiteOf, projectOf } from '../(editor)/read'
import { SettingsRail } from './rail'

/**
 * THEME SETTINGS' FRAME (Story 7.12) — the back arrow and the heading (moved here from Story 5.6's page) and D6a's left rail
 * (`D6 Theme Settings Completed.dc.html:41-48`), drawn once above BOTH pages' Suspense boundaries: Theme settings (the
 * `(theme)` group) and Translations. Each page keeps its own `loading.tsx`, drawing only its own rows (R-98, `busy.test.ts`).
 *
 * THE 404 GUARD STAYS IN `[id]/layout.tsx` (R-98's second effect, DW-67): `projectOf` here is the same `cache`d row, so its
 * `notFound()` is unreachable and only narrows the type.
 *
 * THE RAIL (Question 2, ruled option 1, owner, 2026-10-15): **Theme settings** — the page's one name (R-170), where D6a's
 * prose says "Site basics" — and **Translations**; then, on a project linked to a Ghost site, Ghost's own **Navigation**,
 * **Social accounts** and **Code injection** as ↗ links into that site's settings in a new tab, as the logo's "Change this
 * in Ghost ↗" already is. With no linked site they are absent, not greyed (R-118). The site's address passes the same
 * http(s) check Site basics' link does; a failed read is no links, never a black page.
 */
export default async function SettingsLayout({ children, params }: { children: ReactNode; params: Promise<{ id: string }> }) {
  const { id } = await params
  const project = await projectOf(id)
  if (!project) notFound()
  const site = project.linked_site_id === null ? null : await linkedSiteOf(project.linked_site_id)
  const url = typeof site?.url === 'string' && /^https?:\/\/[^\s]+$/i.test(site.url.trim()) ? site.url.trim() : null
  const ghost = url === null
    ? null
    : { navigation: adminAt(url, 'navigation'), social: adminAt(url, 'social-accounts'), injection: adminAt(url, 'code-injection') }
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
      {/* the rail beside the page from 1024 up — D6a draws it at 1440; below 1024 the page's own two columns would have
          under 360px each beside it, so it is a row over the page there (measured: 834 − 48 − 228 leaves 558) */}
      <div className="flex flex-col gap-4 min-[1024px]:flex-row min-[1024px]:items-stretch min-[1024px]:gap-6">
        <SettingsRail projectId={id} ghost={ghost} />
        <div className="flex min-w-0 flex-1 flex-col gap-4 tablet:gap-5">{children}</div>
      </div>
    </div>
  )
}
