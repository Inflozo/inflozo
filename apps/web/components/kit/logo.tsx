/*
 * Inflozo's own identity — the Nest mark and the lockup.
 *
 * The mark is `Logo/export/Inflozo Logo/assets/mark-light.svg` INLINED VERBATIM: the `viewBox`
 * and all three `<rect>`s are the export's bytes, corner radii, stroke widths and dash values
 * exactly as drawn. THE ONLY THING DROPPED IS THE `<metadata>` C2PA MANIFEST — provenance bytes,
 * not drawing; the same file ships whole at `public/brand/mark-light.svg`. The README warns that
 * a rescale or re-radius invalidates the dash rhythm (period = pathLength / 8), so nothing here
 * is redrawn: only the rendered box is sized, and the SVG scales.
 *
 * The lockup obeys the README's ratios: mark height 1.85× the wordmark's CAP height, which the
 * export's own six horizontal lockups pin to 1.221× the FONT size (43.6/35.7, 52.3/42.9,
 * 101.6/83.2, 29.0/23.8, 75.5/61.9, 34.6/28.3 — every one 1.219–1.223, so cap height is 0.66em);
 * the gap and the clear space are 0.28× the mark's height. Bricolage Grotesque 800, tracking
 * −0.035em, never below 600 and never positive. The lowercase *i* is not typed: it is the capital
 * I scaled to 0.809 on the vertical over `50% 82.86%`, with a 0.16em accent tittle — the export's
 * own construction, copied from `Inflozo Logo.html`, so the stem width matches the setting.
 *
 * The tittle's #C2381F is the identity's accent — the mark's own core colour, and the mark's
 * colours are written here as hex beside it rather than as chrome tokens, the way `style-pack.ts`
 * keeps a pack's colours out of the chrome. A dark surface takes `mark-dark.svg` (#F7F5F2 ink,
 * #FF5941 core); the app has no dark chrome yet, so nothing here draws it.
 *
 * Nothing animates. The export ships a 2.9s launch animation; the owner ruled on 2026-09-06 that
 * it plays nowhere for now (Story 1.6, question 1), so its CSS is not copied.
 */
import Link from 'next/link'
import { ring } from './greyed'

/** The Nest mark alone, decorative: the lockup's word is the accessible name. */
export const Mark = ({ size, className }: { size: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 44 44"
    aria-hidden
    className={className}
    style={{ display: 'block', flexShrink: 0 }}
  >
    <rect
      x="2.5"
      y="2.5"
      width="39"
      height="39"
      rx="5.51"
      fill="none"
      stroke="#1C1B1A"
      strokeWidth="3"
      strokeDasharray="13.2 5.007"
      strokeDashoffset="10.817"
    />
    <rect x="10.8" y="10.8" width="22.4" height="22.4" rx="2.96" fill="none" stroke="#1C1B1A" strokeWidth="2.6" />
    <rect x="16.5" y="16.5" width="11" height="11" rx="1.75" fill="#C2381F" />
  </svg>
)

/**
 * The horizontal lockup — the mark beside the word, at the README's ratios.
 *
 * `size` is the wordmark's font size in px; the mark and the gap derive from it. With `href` it
 * is a link wearing the app's one focus ring, without it a plain span. `className` is for the
 * caller that needs two sizes at two breakpoints (Sign In draws both and hides one), because the
 * ratios live in inline `style` and cannot be expressed as a responsive utility.
 */
export function Lockup({
  size,
  href,
  className = '',
}: {
  size: number
  href?: string
  className?: string
}) {
  const mark = size * 1.221
  const inner = (
    <>
      <Mark size={mark} />
      <span
        className="font-display font-extrabold leading-none tracking-[-0.035em] text-ink"
        style={{ fontSize: size, whiteSpace: 'nowrap' }}
      >
        <span className="relative inline-block">
          <span className="inline-block origin-[50%_82.86%] scale-y-[0.809]">I</span>
          <span
            aria-hidden
            className="absolute left-[.12em] top-[.13em] size-[.16em] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#C2381F]"
          />
        </span>
        nflozo
      </span>
    </>
  )
  const style = { gap: mark * 0.28 }

  return href ? (
    <Link href={href} className={`inline-flex items-center rounded-sm ${ring} ${className}`} style={style}>
      {inner}
    </Link>
  ) : (
    <span className={`inline-flex items-center ${className}`} style={style}>
      {inner}
    </span>
  )
}
