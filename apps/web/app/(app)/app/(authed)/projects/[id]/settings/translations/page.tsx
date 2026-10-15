import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { CATALOG, translatableKeys } from '@inflozo/library'
import { LANGUAGES, SCRIPT_NAMES, type Script } from '@inflozo/library/languages'
import { untouchedWords } from '@inflozo/section-runtime'
import { coverageOf } from '@inflozo/section-runtime/fonts'
import { adminAt } from '@/lib/paywall'
import { liveHolder } from '@/lib/theme-settings'
import { ownName, untouchedRows, type Coverage } from '@/lib/translations'
import { editorData, linkedSiteOf, projectOf, readTranslations } from '../../(editor)/read'
import { Translations } from './translations'

/* TRANSLATIONS (Story 7.12, FR-Q6, FR-Q8) — `/projects/<id>/settings/translations`, Theme settings' second page under D6a's
   rail (`settings/layout.tsx`), with its own `loading.tsx` drawing B18's header and rows (R-98).

   EVERYTHING IS READ HERE, ON THE SERVER, AND HANDED DOWN AS PLAIN DATA: the list (`translatableKeys()`, catalog order — no
   `credit.*` and no retired key, on Free and Pro alike: the surface is ungated, `prd.md:1261`); the language in force and the
   stored overrides, each judged by FR-Q8's one judge (`readTranslations` — the judge is server only, intl-messageformat never
   reaches the browser); each listed language's own name (so both renders agree); the pairing in force's coverage of every
   script but Latin (`coverageOf`, §D.b — so the caption is there at the moment of choice and the browser never carries the
   font pool, DW-323); the linked site's stored Ghost language and its Publication Language address; Question 1's rows
   (`untouchedWords` over the same docs the editor reads); and the lock's live holder (R-192). */

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const project = await projectOf((await params).id)
  return {
    title: project ? `${project.name} · Translations — Inflozo` : 'Page not found · Inflozo',
    robots: { index: false, follow: false },
  }
}

const SCRIPTS = (Object.keys(SCRIPT_NAMES) as Script[]).filter((s) => s !== 'latin')

export default async function TranslationsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const project = await projectOf(id)
  if (!project) notFound()
  const [data, read, site] = await Promise.all([
    editorData(id),
    readTranslations(id),
    project.linked_site_id === null ? null : linkedSiteOf(project.linked_site_id),
  ])
  // the pack in force's pairing: the project's own record of it, else the preset's (`packIdOf` made an unknown id Paper)
  const pairing = (data.ownPacks[data.preset] ?? data.packs.find((p) => p.id === data.preset)?.record ?? data.packs[0]?.record)?.pairing ?? ''
  const coverage: Partial<Record<Script, Coverage>> = Object.fromEntries(SCRIPTS.map((s) => [s, coverageOf(pairing, s)]))
  const url = typeof site?.url === 'string' && /^https?:\/\/[^\s]+$/i.test(site.url.trim()) ? site.url.trim() : null
  const locale = (site?.site_settings as { locale?: unknown } | null | undefined)?.locale
  const names = Object.fromEntries([...LANGUAGES.map((l) => l.code), read.language].map((code) => [code, ownName(code)]))

  return (
    <Translations
      projectId={id}
      language={read.language}
      rtlAck={read.rtlAck}
      rows={translatableKeys().map((key) => ({ key, en: CATALOG.keys[key]?.en ?? '' }))}
      stored={{ ...read.overrides, ...Object.fromEntries(Object.entries(read.refused).map(([k, r]) => [k, r.value])) }}
      refused={Object.fromEntries(Object.entries(read.refused).map(([k, r]) => [k, r.sentence]))}
      names={names}
      coverage={coverage}
      siteLocale={typeof locale === 'string' ? locale : null}
      admin={url === null ? null : adminAt(url, 'publication-language')}
      untouched={untouchedRows(id, untouchedWords(data.docs, (designId) => data.entries[designId]))}
      holder={liveHolder(data.lock)}
    />
  )
}
