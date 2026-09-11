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
   merely TELLS the user something keeps the sentence and `BannerLink` — or, where the thing it
   tells you is over once you have read it, the sentence and ONE dismissing button: Story 3.3's
   code-injection notice and its **Got it**, which the spec sanctioned in those words. What the
   rule forbids is a second WAY ON dressed as a link (review, 2026-09-08). */

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

/**
 * @param rowHeight The height in px of the caller's FIRST ROW, when that row is taller than a
 * line of the sentence — the 32px control row of the exception above is the one case. The icon
 * centres on it. Omit it and the icon centres on the sentence's own line box (`1lh` of the
 * row's 12.5px × 1.5, set once on the row so the two cannot drift — review, 2026-09-06),
 * which is what the hand-set `margin-top:1px` in `Editor Sidebar Kit.dc.html:238` approximated;
 * NEVER pass the height of a multi-line block, or the icon leaves the sentence it belongs to.
 */
export function Banner({
  kind,
  rowHeight,
  children,
}: {
  kind: BannerKind
  rowHeight?: number
  children: ReactNode
}) {
  const { box, icon } = looks[kind]
  return (
    <div
      role={kind === 'error' ? 'alert' : 'status'}
      className={`flex gap-[9px] rounded-thumb border p-[11px_13px] text-[12.5px] leading-[1.5] ${box}`}
    >
      <span className="flex shrink-0 items-center" style={{ height: rowHeight ?? '1lh' }}>
        {icon}
      </span>
      {/* A `<div>` AND NOT A `<span>` (DW-61, Story 3.9). `<span>` is phrasing content and cannot
          legally contain the `<form>` that four of the site-card notices and the passkey nudge put
          in this slot — the pattern arrived with the owner's own two-button ruling at his test of
          2.1. Every browser accepts it and axe reported nothing, but a strict validator does not,
          and unlike `<p>` there is no reparse to make it visible. The parent is `flex`, so the
          child's own inline-vs-block display was never what laid this out; every Banner was looked
          at at 1440, 834 and 390 after the change. NO CLASS ON IT, deliberately: a `min-w-0` here
          would also let a long unbroken string shrink and wrap where it used to overflow, which is
          a second change nobody asked for and the entry says this one is invisible. */}
      <div>{children}</div>
    </div>
  )
}

/** A link inside a banner. Sky, never coral — that is the rule this component exists for. */
export const BannerLink = ({ href, children }: { href: string; children: ReactNode }) => (
  <a href={href} className="font-semibold text-sky-text underline underline-offset-2">
    {children}
  </a>
)
