import type { ReactNode } from 'react'
import { AlertTriangle, CheckCircleSolid, InfoCircle, XCircleSolid } from './icons'

/* Editor Sidebar Kit.dc.html:238 — feedback banners: ONE ICON, ONE PLAIN SENTENCE, in the
   four colours, each with the hairline the frame draws as its own hex (:238-241). Sky informs,
   mint succeeds, marigold nudges without blocking, danger is serious. A LINK INSIDE TAKES SKY,
   NEVER CORAL (DESIGN.md Don'ts) — `BannerLink` below is that rule and stays the default.

   THE ONE EXCEPTION, and it is the owner's: a banner that ASKS FOR AN ANSWER may carry the Kit's
   own 32px buttons instead — a primary for the way on and a secondary for the way out. He ruled
   it on his test of story 2.1 for the passkey nudge (`(authed)/passkey-nudge.tsx`, 2026-09-06):
   "Add passkey as primary button and Not now as secondary (muted design) button." A banner that
   merely TELLS the user something keeps the sentence and `BannerLink`. */

export type BannerKind = 'info' | 'success' | 'notice' | 'error'

const looks: Record<BannerKind, { box: string; icon: ReactNode }> = {
  info: {
    box: 'bg-sky-tint border-sky-line text-sky-text',
    icon: <InfoCircle />,
  },
  success: {
    box: 'bg-mint-tint border-mint-line text-mint-text',
    icon: <CheckCircleSolid className="text-mint" />,
  },
  notice: {
    box: 'bg-marigold-tint border-marigold-line text-marigold-text',
    icon: <AlertTriangle />,
  },
  error: {
    box: 'bg-danger-tint border-danger-line text-danger-text',
    icon: <XCircleSolid className="text-danger" />,
  },
}

export function Banner({ kind, children }: { kind: BannerKind; children: ReactNode }) {
  const { box, icon } = looks[kind]
  return (
    <div role={kind === 'error' ? 'alert' : 'status'} className={`flex gap-[9px] rounded-thumb border p-[11px_13px] ${box}`}>
      <span className="mt-px shrink-0">{icon}</span>
      <span className="text-[12.5px] leading-[1.5]">{children}</span>
    </div>
  )
}

/** A link inside a banner. Sky, never coral — that is the rule this component exists for. */
export const BannerLink = ({ href, children }: { href: string; children: ReactNode }) => (
  <a href={href} className="font-semibold text-sky-text underline underline-offset-2">
    {children}
  </a>
)
