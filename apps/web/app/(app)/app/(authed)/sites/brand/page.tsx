import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Button } from '@/components/kit/button'
import { hostOf } from '@/lib/connect-rule'
import { resolveEntitlement } from '@/lib/entitlement'
import { atCap } from '@/lib/plan'
import { BRAND_COPY, hasBrand } from '@/lib/probe-rule'
import { currentUser, supabaseServer } from '@/lib/supabase/server'
import { skipBrand, useBrand } from '../actions'

/* ───────── S2 Onboarding.dc.html — S2c, the auto-branding moment (`:150-196`), and FR-C4's one
   screen. It is where CONNECT LANDS when the site it just read has a brand to offer, and where
   the Sites card's offer link goes for ever after.

   IT SITS WHERE THE CONNECT WIZARD SITS — centred in the same shell, on its own route — because
   it is the same moment one step later, and because the redirect out of a server action needs a
   URL to name.

   ONE DEPARTURE FROM THE FRAME, and it is a fact Inflozo does not have: the frame captions the
   swatch with the accent's NAME ("Burnt orange"). Ghost answers a hex and nothing else (§40), so
   the swatch is captioned with the hex in mono — the card's own idiom for a machine value, the
   same one the site's address is printed in. Naming a colour would be asserting what was not read.

   NOTHING HERE IS A LINK TO THE CUSTOMER'S SITE. The menu entries keep their `url` in the column
   for the epic that turns a menu into a section, but the frame draws them as text pills and so
   does this: an `href` off a value read from someone's Ghost is an attribute this screen has no
   reason to write. The logo is an `<img>` and is `https:`-only, checked in `brandOf` — `img-src`
   admits `data:` (`csp.ts:60`) and a `data:` SVG is script.

   BOTH CONTROLS ARE `<form action={serverAction}>` WITH A HIDDEN SITE ID, so both work with
   JavaScript off — `site-notices.tsx` is the pattern, and there is no client component here.

   THE CAPTION UNDER **Use your brand** IS THE OWNER'S RULING (Question 1, option 1, 2026-09-08):
   the screen says WHICH project will wear the brand before the press, not after. With room it
   says one will be made; at the project cap it names the one that will be branded instead. The
   decision rides in a hidden field and `useBrand` re-counts it, so a cap filled in another tab
   sends the customer back here with a true sentence rather than rebranding a project this screen
   never named. */

export const metadata: Metadata = {
  title: 'Use your site’s brand · Inflozo',
  robots: { index: false, follow: false },
}

type Row = {
  id: string
  title: string | null
  url: string
  site_settings: { brand?: unknown; public_url?: string } | null
}

export default async function BrandOffer({
  searchParams,
}: {
  // A repeated key (`?site=a&site=b`) arrives as an ARRAY; every other page in this epic takes
  // the first, and so does this one.
  searchParams: Promise<{ site?: string | string[] }>
}) {
  const [{ site }, user] = await Promise.all([searchParams, currentUser()])
  // The layout's guard has already redirected anyone without one; this is the type narrowing.
  if (!user) return null
  const siteId = Array.isArray(site) ? site[0] : site
  if (!siteId) notFound()

  const supabase = await supabaseServer()
  const [{ data: row }, { data: projects }, { plan }] = await Promise.all([
    // THE CALLER'S OWN SESSION. A `?site=` naming a stranger's row returns no row through RLS —
    // and a malformed id returns none either, because PostgREST refuses the filter. Both are the
    // same 404, which is the point. A DISCONNECTED record is not a site (FR-C6).
    supabase
      .from('sites')
      .select('id, title, url, site_settings')
      .eq('id', siteId)
      .is('disconnected_at', null)
      .maybeSingle<Row>(),
    // `updated_at desc` is the dashboard's own order, so "the project you most recently worked
    // on" means the same thing on both screens.
    supabase.from('projects').select('id, name').order('updated_at', { ascending: false }),
    resolveEntitlement(user.id),
  ])

  const brand = row?.site_settings?.brand
  // A CARD THAT OFFERS NOTHING IS NOT DRAWN (UX-DR3) — and a route that would draw it is not a
  // route: with no accent, no logo and no menu there is nothing to keep, so this 404s and the
  // Sites card carries no link to it.
  if (!row || !hasBrand(brand)) notFound()

  const rows = projects ?? []
  // At the cap the brand goes onto the project the customer most recently worked on; with room a
  // project is made for the site. Either way the caption below says which, before the press.
  const target = atCap(plan, rows.length) ? rows[0] : undefined
  const caption = target ? BRAND_COPY.willBrand(target.name) : BRAND_COPY.willCreate

  const host = hostOf(row.site_settings?.public_url || row.url)
  const title = row.title || host

  return (
    <div className="flex flex-1 items-center justify-center p-[16px_20px] tablet:p-6">
      <div className="flex w-full flex-col items-center gap-7 tablet:gap-9">
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="font-display text-[28px] font-bold tracking-[-0.02em] text-ink tablet:text-[36px]">
            {BRAND_COPY.title}
          </h1>
          <p className="text-[15px] text-ink-soft">{BRAND_COPY.sub(host)}</p>
        </div>

        {/* The frame's 760 split card. At 390 the two halves stack and the divider goes with
            them — R Responsive System's own collapse for a two-pane card. */}
        <div className="flex w-full max-w-[760px] flex-col overflow-hidden rounded-lg bg-surface shadow-md tablet:flex-row">
          <div className="flex flex-1 flex-col gap-6 border-b border-line p-6 tablet:border-b-0 tablet:border-r tablet:p-8">
            <h2 className="text-ui-dense font-semibold uppercase tracking-[0.04em] text-ink-soft">
              {BRAND_COPY.siteToday}
            </h2>

            <div className="flex items-center gap-[14px]">
              {brand.logo ? (
                // The customer's own logo, https-only. `alt=""` — the site's name is the line
                // beside it, and a screen reader reading it twice is worse than not at all.
                <img
                  src={brand.logo}
                  alt=""
                  width={48}
                  height={48}
                  className="size-12 shrink-0 rounded-thumb object-contain"
                />
              ) : (
                <span
                  aria-hidden
                  className="flex size-12 shrink-0 items-center justify-center rounded-thumb bg-ink font-display text-[22px] font-bold text-paper"
                >
                  {title.slice(0, 1).toUpperCase()}
                </span>
              )}
              <div className="flex min-w-0 flex-col gap-[2px]">
                <span className="truncate text-body font-semibold text-ink">{title}</span>
                <span className="truncate font-mono text-control-label text-ink-soft">{host}</span>
              </div>
            </div>

            {brand.accent ? (
              <div className="flex flex-col gap-[10px]">
                <h3 className="text-ui-dense text-ink-soft">{BRAND_COPY.accent}</h3>
                <div className="flex items-center gap-[10px]">
                  {/* THE ONE INLINE `style` ON THIS SCREEN, and the value behind it matched
                      `#rgb`/`#rrggbb` in `brandOf` before it was ever stored. */}
                  <span
                    aria-hidden
                    style={{ background: brand.accent }}
                    className="size-7 shrink-0 rounded-full shadow-hairline-inset"
                  />
                  <span className="font-mono text-ui font-medium text-ink">{brand.accent}</span>
                </div>
              </div>
            ) : null}

            {brand.nav.length > 0 ? (
              <div className="flex flex-col gap-[10px]">
                <h3 className="text-ui-dense text-ink-soft">{BRAND_COPY.navigation}</h3>
                <ul className="flex list-none flex-wrap gap-[6px] p-0">
                  {brand.nav.map((item, index) => (
                    <li
                      key={`${item.url}-${index}`}
                      className="rounded-pill border border-line bg-surface px-[10px] py-[3px] text-control-label font-medium text-ink"
                    >
                      {item.label}
                    </li>
                  ))}
                </ul>
                <p className="text-[11.5px] leading-[1.5] text-ink-soft">{BRAND_COPY.fonts}</p>
              </div>
            ) : null}
          </div>

          <div className="flex flex-1 flex-col items-center justify-center gap-5 bg-paper p-6 tablet:p-8">
            {/* The frame's mini homepage. Its paper is the app's own `line` and `line-strong`,
                as the dashboard card's placeholder is (`placeholder.tsx`) — only the button is
                the customer's colour, which is the whole thing the drawing is here to show. */}
            <div
              aria-hidden
              className="flex h-[170px] w-[250px] flex-col gap-2 rounded-thumb bg-surface p-4 shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="h-[8px] w-[34px] rounded-[2px] bg-ink" />
                <div className="flex gap-1">
                  <div className="h-[5px] w-4 rounded-[2px] bg-line-strong" />
                  <div className="h-[5px] w-4 rounded-[2px] bg-line-strong" />
                </div>
              </div>
              <div className="mt-[10px] h-[26px] w-[80%] rounded-[3px] bg-ink" />
              <div className="h-[8px] w-[60%] rounded-[2px] bg-line-strong" />
              <div
                style={brand.accent ? { background: brand.accent } : undefined}
                className={`mt-2 h-5 w-[74px] rounded-[5px] ${brand.accent ? '' : 'bg-line-strong'}`}
              />
            </div>
            <p className="text-center text-ui-dense text-ink-soft">{BRAND_COPY.homepage}</p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-3">
          <div className="flex flex-wrap items-center justify-center gap-[14px]">
            <form action={useBrand}>
              <input type="hidden" name="site_id" value={row.id} />
              {/* The decision the caption states, carried back so `useBrand` can refuse it if it
                  has gone stale. Empty means "make a project for this site". */}
              <input type="hidden" name="project_id" value={target?.id ?? ''} />
              <Button type="submit" size={44} variant="primary" aria-describedby="brand-caption">
                {BRAND_COPY.use}
              </Button>
            </form>
            <form action={skipBrand}>
              <input type="hidden" name="site_id" value={row.id} />
              <Button type="submit" size={44} variant="ghost" weight="font-medium">
                {BRAND_COPY.skip}
              </Button>
            </form>
          </div>
          <p id="brand-caption" className="text-center text-helper-caption text-ink-soft">
            {caption}
          </p>
        </div>
      </div>
    </div>
  )
}
