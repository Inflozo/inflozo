'use client'

import { useState } from 'react'
import { buttonClasses } from '@/components/kit/button'
import { Download } from '@/components/kit/icons'
import { BusyLabel } from '@/components/kit/submit'
import { followSigned, followsHere, SIGNED_WORDS } from '@/lib/signed-download'

/** STORY 7.23b (DW-391) — A SIGNED DOWNLOAD AS A LINK: D3a's "Download the live theme first", the Roll back confirm's and History's
 *  original-theme row's. It stays an `<a href>` — a press with a modifier, or scripts off, follows the route's 303 as before — and
 *  a plain press is followed by `followSigned` (`lib/signed-download.ts`): "Preparing…" while it is out (R-98), the zip as an
 *  attachment (the page stays), and a route's 404, 502 or the sign-in said under it in its own `role="status"` line, never in
 *  place of the editor. The Backup step's Theme Download is a button (it captures first) and follows the same way (`fetchRow`).
 *
 *  STORY 7.26 (DW-405) — MOVED HERE from the wizard, so the Sites page imports no wizard: the export window's Download again and
 *  the Sites page's original-theme Download (at 32, its row's height) follow the same way. `onFollowed` tells the caller how a
 *  follow ended (null: the zip is on its way) — the export window says its ready line only then. */
export function SignedDownload({ id, href, label, size = 40, className = '', describedBy, onFollowed }: {
  id: string; href: string; label: string; size?: 40 | 32 | 28; className?: string
  /** what else describes the link — the Sites page's row, so a list of Downloads tells one from the next (WCAG 2.4.4) */
  describedBy?: string
  onFollowed?: (said: string | null) => void
}) {
  const [out, setOut] = useState(false)
  const [said, setSaid] = useState<string | null>(null)
  return (
    <span className={`flex flex-col gap-[6px] ${className}`}>
      <a
        id={id}
        href={href}
        aria-busy={out || undefined}
        aria-disabled={out || undefined}
        aria-describedby={[describedBy, said === null ? undefined : `${id}-said`].filter(Boolean).join(' ') || undefined}
        onClick={(event) => {
          if (!followsHere(event)) return
          event.preventDefault()
          if (out) return
          setOut(true)
          setSaid(null)
          void followSigned(href).then((words) => {
            setSaid(words)
            setOut(false)
            onFollowed?.(words)
          })
        }}
        className={`self-start ${buttonClasses('secondary', size)}`}
      >
        <BusyLabel pending={out} busy={SIGNED_WORDS.preparing}>
          <Download size={size === 40 ? 13 : 12} />
          {label}
        </BusyLabel>
      </a>
      <span id={`${id}-said`} role="status" data-signed-said className="text-[11.5px] leading-[1.5] text-danger-text empty:absolute [text-wrap:pretty]">{said}</span>
    </span>
  )
}
