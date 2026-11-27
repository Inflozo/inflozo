'use client'

import { useRef } from 'react'
import { buttonClasses } from '@/components/kit/button'
import { ring } from '@/components/kit/greyed'
import { ChevronDown } from '@/components/kit/icons'
import { arrowKeys, item as row, openMenu } from '@/lib/menu'
import { PREVIEW_COPY } from '@/lib/probe-rule'

/* ───────── STORY 7.26 — B15's Export theme zip when SEVERAL projects link the site (Pro only: Free holds one project). The frame
   draws one button (`B Missing Surfaces.dc.html:1221`); with several projects it opens a menu naming each, one link per project to
   its editor with the export asked. LIFTED FROM `site-menu.tsx` — the same `popover="auto"` menu, `lib/menu.ts`' placement, arrow
   keys and `item` row (R-74: never a second vocabulary). Every row is a plain link, so it works with scripts off too. */

export function ExportMenu({ siteId, links }: { siteId: string; links: readonly { id: string; name: string; href: string }[] }) {
  const menuId = `export-menu-${siteId}`
  const menu = useRef<HTMLDivElement>(null)
  return (
    <>
      <button
        type="button"
        id={`export-zip-${siteId}`}
        popoverTarget={menuId}
        onClick={(event) => {
          // the rect is read here because the popover is still `display:none` (`lib/menu.ts`)
          if (menu.current) openMenu(menu.current, event.currentTarget, { side: 'down', align: 'left' })
        }}
        className={buttonClasses('primary', 36)}
      >
        {PREVIEW_COPY.exportZip}
        <ChevronDown size={12} />
      </button>
      <div
        ref={menu}
        id={menuId}
        popover="auto"
        onKeyDown={arrowKeys}
        // `open:flex` and never a bare `flex`: an author `display` beats the user agent's `[popover]:not(:popover-open)`
        className="w-[240px] flex-col rounded border border-line bg-surface p-[6px] shadow-lg open:flex"
      >
        {links.map((link) => (
          <a key={link.id} href={link.href} data-export-project={link.id} className={`${row} ${ring} hover:bg-paper`}>
            <span className="min-w-0 truncate">{link.name}</span>
          </a>
        ))}
      </div>
    </>
  )
}
