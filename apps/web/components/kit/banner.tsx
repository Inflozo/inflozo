import type { ReactNode } from 'react'
import { AlertTriangle, CheckCircleSolid, InfoCircle, XCircleSolid } from './icons'

/* Editor Sidebar Kit.dc.html:238 — feedback banners: ONE ICON, ONE PLAIN SENTENCE, in the
   four colours. Sky informs, mint succeeds, marigold nudges without blocking, danger is
   serious. A LINK INSIDE TAKES SKY, NEVER CORAL (DESIGN.md Don'ts). */

export type BannerKind = 'info' | 'success' | 'notice' | 'error'

const looks: Record<BannerKind, { box: string; icon: ReactNode }> = {
  info: {
    box: 'bg-sky-tint border-sky/25 text-sky-text',
    icon: <InfoCircle />,
  },
  success: {
    box: 'bg-mint-tint border-mint/30 text-mint-text',
    icon: <CheckCircleSolid className="text-mint" />,
  },
  notice: {
    box: 'bg-marigold-tint border-marigold/40 text-marigold-text',
    icon: <AlertTriangle />,
  },
  error: {
    box: 'bg-danger-tint border-danger/30 text-danger-text',
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
