import Link from 'next/link'
import { buttonClasses } from '@/components/kit/button'
import { NOT_FOUND } from '@/lib/not-found'

/**
 * THE APP'S NOT-FOUND, INSIDE THE SHELL — DW-17's remaining half, DW-26, DW-67's page half and
 * DW-74's arrival control, all of which are one file and one route between them.
 *
 * Until this existed, every `notFound()` in the app rendered NEXT'S OWN unstyled 404: outside the
 * shell, outside the export's vocabulary, and with `<main>` empty — which is why `brand-ownership`'s
 * positive control was unreliable (DW-74), because the sentence it waits for lived outside the
 * landmark it waited in. A `not-found.tsx` at this segment renders INSIDE `(authed)/layout.tsx`,
 * so the sidebar, the account menu and the shell's own `<main>` are all still there. It declares
 * no `<main>` of its own — the shell is the only one, which `app-routes.test.ts` asserts.
 *
 * EXTRAPOLATED FROM `M9 404.dc.html` (R-74 — the export is the design authority and is never
 * edited). Same drawing, same 404 pill, same headline, the app's own Kit. FOUR DEPARTURES, each
 * recorded in the spec's Design Notes and each here beside the thing it changed:
 *
 *   1. THE MARKETING NAV IS NOT DRAWN. M9 is the marketing 404 and carries Features / How it works
 *      / Sections / Pricing / Docs / Sign in / Start free above the illustration. This surface
 *      renders inside the app shell instead, which is the nearest drawn frame for a signed-in page.
 *   2. *BROWSE SECTIONS* IS ABSENT, NOT GREYED (UX-DR3: a control that could never act is absent).
 *      No sections surface exists in any epic yet, so the frame's second button has no destination.
 *   3. THE COUNT IN THE SECOND SENTENCE DOES NOT SURVIVE. The frame reads "We looked through all 18
 *      variants"; the owner ruled it out (Question 3, option 1, 2026-09-11) under standing rule 4 —
 *      a count written down goes stale, and nothing would ever catch it on a 404 page.
 *   4. THE ROOT `/_not-found` IS UNTOUCHED. M9 with its own marketing nav is Epic 14's. The app host
 *      no longer reaches the root one, because `[...unbuilt]/page.tsx` takes every unmatched app URL
 *      first.
 *
 * NO SKELETON, DELIBERATELY, and it is declared in `busy.test.ts`'s `NO_SKELETON` with its reason:
 * there is nothing here to stream and nothing to wait for, and a `loading.tsx` is a Suspense
 * boundary that would commit a 200 before this page ever ran (R-98's second effect, DW-67).
 */
export default function AuthedNotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 p-6 text-center">
      {/* M9's own drawing, at the frame's viewBox. The two upright cards, the tilted one that
          slipped out, and the dotted trail between them. `aria-hidden`: the heading says it. */}
      <svg width="240" height="144" viewBox="0 0 300 180" fill="none" aria-hidden>
        <rect
          x="40"
          y="26"
          width="150"
          height="120"
          rx="10"
          stroke="var(--color-ink)"
          strokeWidth="1.5"
          strokeDasharray="6 6"
        />
        <rect x="56" y="44" width="118" height="26" rx="4" fill="var(--color-surface)" stroke="var(--color-ink)" strokeWidth="1.5" />
        <rect x="64" y="52" width="46" height="4" rx="2" fill="var(--color-line-strong)" />
        <rect x="64" y="60" width="30" height="4" rx="2" fill="var(--color-line)" />
        <rect x="56" y="112" width="118" height="26" rx="4" fill="var(--color-surface)" stroke="var(--color-ink)" strokeWidth="1.5" />
        <rect x="64" y="120" width="52" height="4" rx="2" fill="var(--color-line-strong)" />
        <rect x="64" y="128" width="34" height="4" rx="2" fill="var(--color-line)" />
        <g transform="rotate(9 246 96)">
          <rect x="206" y="80" width="118" height="30" rx="4" fill="var(--color-surface)" stroke="var(--color-ink)" strokeWidth="1.5" />
          <rect x="215" y="89" width="44" height="4" rx="2" fill="var(--color-line-strong)" />
          <rect x="215" y="97" width="26" height="6" rx="2" fill="var(--color-coral)" />
        </g>
        <path d="M186 88c8-3 14-4 20-3" stroke="var(--color-ink)" strokeWidth="1.2" strokeLinecap="round" strokeDasharray="3 4" />
        <path d="M252 62l2 5.5 5.5 2-5.5 2-2 5.5-2-5.5-5.5-2 5.5-2z" fill="var(--color-marigold)" />
        <ellipse cx="252" cy="122" rx="26" ry="4" fill="var(--color-line)" />
      </svg>

      <span className="rounded-pill border border-line bg-surface p-[3px_12px] font-mono text-control-label text-ink-soft">
        {NOT_FOUND.badge}
      </span>

      <div className="flex max-w-[440px] flex-col gap-3">
        <h1 className="font-display text-[28px] font-extrabold leading-[1.1] tracking-[-0.03em] text-ink tablet:text-[40px]">
          {NOT_FOUND.title}
        </h1>
        <p className="text-[15px] leading-[1.6] text-ink-soft">
          {NOT_FOUND.sub}
        </p>
      </div>

      {/* ONE control, not the frame's two (departure 2). `/` is the dashboard, which is where the
          shell's own wordmark goes, so this agrees with the frame around it. */}
      <Link href="/" className={buttonClasses('coral', 44)}>
        {NOT_FOUND.home}
      </Link>
    </div>
  )
}
