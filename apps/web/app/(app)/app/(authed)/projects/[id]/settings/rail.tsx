'use client'

import Link from 'next/link'
import { useSelectedLayoutSegment } from 'next/navigation'
import type { ReactNode } from 'react'
import { ring } from '@/components/kit/greyed'
import { settingsPath, TRANSLATIONS, translationsPath } from '@/lib/editor'
import { RAIL_WORDS } from '@/lib/translations'

/* D6a's LEFT RAIL (`D6 Theme Settings Completed.dc.html:41-48`, Story 7.12): the "SETTINGS" heading at 10.5/600 and each item
   at 12.5 in a 7×9 box of radius 8, the page in force coral-tint with coral-text at 600, the others ink-soft with D6a's faint
   hover wash. The item in force is the settings layout's child segment — `translations`, or the `(theme)` group. A client
   component for that one hook; everything it draws is a link, so nothing here starts work a busy state must cover beyond
   the browser's own navigation and each page's skeleton. */

const ITEM = `rounded-sm px-[9px] py-[7px] text-[12.5px] transition-colors ${ring}`

function Item({ href, current, children }: { href: string; current: boolean; children: ReactNode }) {
  return (
    <Link href={href} aria-current={current ? 'page' : undefined} className={`${ITEM} ${current ? 'bg-coral-tint font-semibold text-coral-text' : 'text-ink-soft hover:bg-ink-wash'}`}>
      {children}
    </Link>
  )
}

const Out = ({ href, children }: { href: string; children: ReactNode }) => (
  <a href={href} target="_blank" rel="noreferrer" className={`${ITEM} text-ink-soft hover:bg-ink-wash`}>
    {children}
  </a>
)

export function SettingsRail({ projectId, ghost }: { projectId: string; ghost: { navigation: string; social: string; injection: string } | null }) {
  const onTranslations = useSelectedLayoutSegment() === TRANSLATIONS
  return (
    <nav
      aria-label={RAIL_WORDS.label}
      data-settings-rail
      className="flex flex-wrap items-center gap-[2px] border-b border-line pb-[10px] min-[1024px]:w-[204px] min-[1024px]:shrink-0 min-[1024px]:flex-col min-[1024px]:flex-nowrap min-[1024px]:items-stretch min-[1024px]:border-r min-[1024px]:border-b-0 min-[1024px]:pr-[10px] min-[1024px]:pb-0"
    >
      <span aria-hidden className="px-2 text-[10.5px] font-semibold tracking-[0.04em] text-ink-soft min-[1024px]:pb-[6px]">{RAIL_WORDS.heading}</span>
      <Item href={settingsPath(projectId)} current={!onTranslations}>{RAIL_WORDS.theme}</Item>
      <Item href={translationsPath(projectId)} current={onTranslations}>{RAIL_WORDS.translations}</Item>
      {ghost === null ? null : (
        <>
          <Out href={ghost.navigation}>{RAIL_WORDS.navigation}</Out>
          <Out href={ghost.social}>{RAIL_WORDS.social}</Out>
          <Out href={ghost.injection}>{RAIL_WORDS.injection}</Out>
        </>
      )}
    </nav>
  )
}
