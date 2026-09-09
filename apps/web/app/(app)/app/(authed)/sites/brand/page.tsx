import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Submit } from '@/components/kit/submit'
import { ProjectThumb } from '../../placeholder'
import { hostOf } from '@/lib/connect-rule'
import { resolveEntitlement } from '@/lib/entitlement'
import { atCap } from '@/lib/plan'
import { BRAND_COPY, brandTarget, hasBrand, imageUrl, isAccent, navOf } from '@/lib/probe-rule'
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
   the screen says WHICH project will wear the brand before the press, not after. With nothing to
   brand yet it says one will be made; at the project cap it names the one that will be branded
   instead; and where a project for this site already exists it ASKS instead of telling, which is
   his Question 3 ruling and is true whether or not there are cards to choose from. The decision
   rides in a hidden field and `useBrand` re-counts it, so a cap filled in another tab sends the
   customer back here with a true sentence rather than rebranding a project this screen never
   named. */

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

/**
 * `app/error.tsx` is the screen for a page that cannot answer, and this is how it gets there.
 *
 * NOT `throw postgrestError`: it is a plain object rather than an `Error`, and it carries `details`
 * and `hint`, which PostgREST fills with row values — straight into the server log and the error
 * digest, against the epic's "never log" rule, which is about content and not only credentials.
 * Every other reader in this epic logs `{ code }` and nothing else (review 4, 2026-09-09).
 */
function readFailed(what: string, code: string | undefined): never {
  console.error('sites/brand: read failed', { what, code })
  throw new Error(`sites/brand: ${what} read failed`)
}

export default async function BrandOffer({
  searchParams,
}: {
  // A repeated key (`?site=a&site=b`) arrives as an ARRAY; every other page in this epic takes
  // the first, and so does this one.
  searchParams: Promise<{ site?: string | string[]; failed?: string | string[] }>
}) {
  const [{ site, failed }, user] = await Promise.all([searchParams, currentUser()])
  // The layout's guard has already redirected anyone without one; this is the type narrowing.
  if (!user) return null
  const siteId = Array.isArray(site) ? site[0] : site
  if (!siteId) notFound()

  const supabase = await supabaseServer()
  const [{ data: row, error: rowError }, { data: projects, error: projectsError }, { plan }] = await Promise.all([
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
    // on" means the same thing on both screens — and `id` breaks the tie, because two projects
    // saved in the same millisecond let this page and `useBrand` name different rows and the
    // press then bounced back here for ever (review, 2026-09-08).
    supabase
      .from('projects')
      .select('id, name, style_pack, linked_site_id')
      .order('updated_at', { ascending: false })
      .order('id', { ascending: false }),
    resolveEntitlement(user.id),
  ])

  const brand = row?.site_settings?.brand
  // A CARD THAT OFFERS NOTHING IS NOT DRAWN (UX-DR3) — and a route that would draw it is not a
  // route: with no accent, no logo and no menu there is nothing to keep, so this 404s and the
  // Sites card carries no link to it.
  // A READ THAT FAILED IS NOT A ROW THAT IS NOT THERE, and this one used to be the only read on
  // the screen whose error was thrown away: a transient PostgREST failure rendered the not-found
  // page to a customer whose site exists, so the offer looked gone rather than momentarily
  // unavailable, and there was nothing to press again (review 4, 2026-09-09). The projects read
  // below has taken this position since review 2 and `sites/page.tsx` since 3.3 — "A FAILED READ
  // IS NOT AN EMPTY ACCOUNT" — and two reads in one `Promise.all` were answering it two ways.
  if (rowError) readFailed('site', rowError.code)
  if (!row || !hasBrand(brand)) notFound()

  // A COUNT THAT COULD NOT BE READ IS NOT A COUNT OF ZERO. Falling back to `[]` printed "we'll
  // make a project" and then `useBrand` — whose own read succeeded — refused the stale decision
  // and sent the customer straight back here (review, 2026-09-08). `app/error.tsx` is the screen
  // for a page that cannot answer.
  if (projectsError) readFailed('projects', projectsError.code)
  const rows = projects ?? []
  // At the cap the brand goes onto the project the customer most recently worked on; with room it
  // goes onto the project already made for this site, and only when there is none is one made.
  // `brandTarget` is that rule, shared with `useBrand` so the caption and the write cannot drift.
  const capped = atCap(plan, rows.length)
  const target = brandTarget(capped, rows, row.id)
  // THE OWNER RULED THE CHOOSER (Question 3, 2026-09-08, and his A1/B1): ONE screen — the
  // sentence, the cards under it with the project this would have picked already selected, then
  // the button — and it appears ONLY when the brand is going onto a project that already exists
  // AND there is more than one to choose between. With one project there is no choice to offer,
  // and Free includes one, so the quiet path stays quiet.
  //
  // IT IS PURELY ADDITIVE: the pre-selected card is exactly what `brandTarget` would have written
  // on its own, so a customer who touches nothing gets the behaviour the owner already approved
  // at Question 1 — the chooser only lets him overrule it.
  const choosing = Boolean(target) && rows.length > 1
  // THREE CAPTIONS, AND THE CARDS DO NOT CHANGE WHICH ONE IS PRINTED. Nothing to brand yet says
  // so; at the cap the sentence NAMES the project (Question 1); otherwise the brand is going onto
  // a project that already exists, and that is a SECOND press, which asks (Question 3). The code
  // used to tie the asking to the cards as well, so the one-project customer — every Free
  // customer — was told rather than asked, against the owner's own words and against step 12 of
  // his manual test (review, 2026-09-08). `choosing` now decides the cards and nothing else.
  // FOUR STATES NOW, AND THE FOURTH IS THE OWNER'S QUESTION 6 RULING (option 1, 2026-09-09):
  // at the cap AND with cards, the caption keeps the limit and HANDS THE CHOICE TO THE CARDS
  // instead of pre-answering it. Before the ruling this branch printed `willBrand`, which names a
  // project — so the sentence announced the answer and the cards under it then asked the question,
  // one half his Question 5 ruling and the other half his Question 3 ruling (review 4).
  // `capped` and `choosing` are decided by different predicates, which is why the two could
  // disagree at all, and this is the one state where both are true.
  const caption = !target
    ? BRAND_COPY.willCreate
    : capped
      ? choosing
        ? BRAND_COPY.atLimitChoose
        : BRAND_COPY.willBrand(target.name)
      : BRAND_COPY.alreadyOn(target.name)

  const host = hostOf(row.site_settings?.public_url || row.url)
  const title = row.title || host
  // RE-VALIDATED HERE, ALL THREE: `brandOf` wrote them, but this reads them back out of a jsonb
  // column and each one crosses into an attribute — `style-pack.ts` takes the same position on
  // the accent it reads back out of `style_pack`. `hasBrand` is an OR, so a record admitted on
  // its logo alone carried an UNCHECKED accent into two inline `style` attributes and an
  // unchecked menu into JSX, where a non-string label throws in render rather than being dropped
  // (review, 2026-09-08 — the file's own rule is "checked where it crosses, every time", and it
  // was being applied to one of the three values this screen renders).
  const logo = imageUrl(brand.logo)
  const accent = isAccent(brand.accent) ? brand.accent : null
  const nav = navOf(brand.nav)

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
              {logo ? (
                // The customer's own logo, https-only. `alt=""` — the site's name is the line
                // beside it, and a screen reader reading it twice is worse than not at all.
                <img
                  src={logo}
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
                  {/* `Array.from` and not `slice(0, 1)`: a Ghost title starting with an emoji is
                      a surrogate PAIR, and half of one renders as the replacement character. */}
                  {(Array.from(title)[0] ?? '').toUpperCase()}
                </span>
              )}
              <div className="flex min-w-0 flex-col gap-[2px]">
                <span className="truncate text-body font-semibold text-ink">{title}</span>
                <span className="truncate font-mono text-control-label text-ink-soft">{host}</span>
              </div>
            </div>

            {accent ? (
              <div className="flex flex-col gap-[10px]">
                <h3 className="text-ui-dense text-ink-soft">{BRAND_COPY.accent}</h3>
                <div className="flex items-center gap-[10px]">
                  {/* THE ONE INLINE `style` ON THIS SCREEN, and the value behind it matched
                      `#rgb`/`#rrggbb` in `brandOf` before it was ever stored. */}
                  <span
                    aria-hidden
                    style={{ background: accent }}
                    className="size-7 shrink-0 rounded-full shadow-hairline-inset"
                  />
                  <span className="font-mono text-ui font-medium text-ink">{accent}</span>
                </div>
              </div>
            ) : null}

            {nav.length > 0 ? (
              <div className="flex flex-col gap-[10px]">
                <h3 className="text-ui-dense text-ink-soft">{BRAND_COPY.navigation}</h3>
                <ul className="flex list-none flex-wrap gap-[6px] p-0">
                  {nav.map((item, index) => (
                    <li
                      key={`${item.url}-${index}`}
                      className="rounded-pill border border-line bg-surface px-[10px] py-[3px] text-control-label font-medium text-ink"
                    >
                      {item.label}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {/* THE FRAME NESTS THIS UNDER Navigation and always draws a menu; a real site need
                not have one, and the sentence is about FONTS. It is one of the elements the
                story's own acceptance criterion enumerates, so it stays whatever else is
                readable (review, 2026-09-08). */}
            <p className="text-[11.5px] leading-[1.5] text-ink-soft">{BRAND_COPY.fonts}</p>
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
                style={accent ? { background: accent } : undefined}
                className={`mt-2 h-5 w-[74px] rounded-[5px] ${accent ? '' : 'bg-line-strong'}`}
              />
            </div>
            <p className="text-center text-ui-dense text-ink-soft">{BRAND_COPY.homepage}</p>
          </div>
        </div>

        <div className="flex w-full max-w-[760px] flex-col items-center gap-3">
          <p id="brand-caption" className="text-center text-helper-caption text-ink-soft">
            {caption}
          </p>

          {/* The matrix's "insert fails → the page says so". `useBrand` redirects back here with
              the flag rather than returning a value, so the message survives scripts off — the
              same shape `recheckPlan` uses on the Sites page. ABOVE the buttons and not below
              them: it arrives with the document rather than as a later change, so a live region
              is not announced for it, and it is the reason the customer is being asked to press
              again (review, 2026-09-08). */}
          {failed ? (
            <p role="status" className="text-center text-helper-caption text-coral-text">
              {BRAND_COPY.failed}
            </p>
          ) : null}

          <div className="flex flex-wrap items-center justify-center gap-[14px]">
            <form action={useBrand} className="contents">
              <input type="hidden" name="site_id" value={row.id} />
              {/* THE CHOOSER, AND IT IS REAL RADIO INPUTS — not the Kit's presentational
                  `RadioCards`, which draws the shape with `role="radio"` on buttons and posts
                  nothing. Both controls on this screen work with JavaScript off (Boundaries), and
                  a native radio inside this form is the only version of a chooser that does; it
                  is also why this is cards and not a `<select>`, which cannot hold a drawing.
                  R-74: no frame draws this, so it is extrapolated from the two that draw its
                  parts — `radio-card.tsx`'s coral border and tint (Editor Sidebar Kit `:117`) and
                  `design-picker.tsx`'s 64×44 wireframe tile (`:71`) — same components, same
                  tokens, no second vocabulary. */}
              {choosing ? (
                <fieldset className="m-0 w-full border-0 p-0">
                  {/* A real `<legend>`, and the cards in a flex column INSIDE the fieldset rather
                      than making the fieldset itself the flex container — a legend is laid out
                      specially and does not want to be a flex item. */}
                  <legend className="mb-[10px] w-full text-center text-ui-dense font-semibold text-ink">
                    {BRAND_COPY.whichProject}
                  </legend>
                  <div className="flex flex-col gap-[10px]">
                  {rows.map((project) => (
                    <label
                      key={project.id}
                      /* THE HIGHLIGHT IS `:has(:checked)` AND NOTHING ELSE. A static class on the
                         pre-selected card would stay lit after the customer picked a different
                         one — two cards coral, with scripts off and nothing to clear it. The
                         `defaultChecked` below lights the right card on first paint and the
                         browser moves it from there, no JavaScript involved. */
                      className="flex cursor-pointer items-center gap-[11px] rounded-thumb border border-line p-[12px_13px] text-left hover:border-line-strong has-[:checked]:border-coral has-[:checked]:bg-coral-tint has-[:focus-visible]:shadow-focus"
                    >
                      <input
                        type="radio"
                        name="project_id"
                        value={project.id}
                        defaultChecked={project.id === target?.id}
                        /* `outline-none`: the LABEL carries the coral ring
                           (`has-[:focus-visible]:shadow-focus` above), so without this a keyboard
                           user got the UA outline on the 16px dot AND the ring on the card — two
                           focus indicators, which `greyed.ts:60`'s `ring` exists to prevent and
                           which axe cannot see (review 3, 2026-09-08). */
                        className="size-4 shrink-0 accent-coral outline-none"
                      />
                      <ProjectThumb stylePack={project.style_pack} />
                      <span className="min-w-0 flex-1 truncate text-ui-dense font-semibold text-ink">
                        {project.name}
                      </span>
                      {project.linked_site_id === row.id ? (
                        <span className="shrink-0 text-control-label text-ink-soft">{BRAND_COPY.thisSite}</span>
                      ) : project.linked_site_id ? (
                        /* BOUND TO A DIFFERENT SITE, and saying so is the whole of the change: the
                           brand still lands where the customer points it and `linked_site_id` is
                           still never written, so nothing about the binding moves. An unlabelled
                           card beside one marked "This site's project" reads as unbound, which is
                           the one thing it is not. */
                        <span className="shrink-0 text-control-label text-ink-soft">{BRAND_COPY.otherSite}</span>
                      ) : null}
                    </label>
                  ))}
                  </div>
                </fieldset>
              ) : (
                /* The decision the caption states, carried back so `useBrand` can refuse it if it
                   has gone stale. Empty means "make a project for this site". */
                <input type="hidden" name="project_id" value={target?.id ?? ''} />
              )}
              <Submit busy={BRAND_COPY.using} size={44} variant="primary" aria-describedby="brand-caption">
                {BRAND_COPY.use}
              </Submit>
            </form>
            <form action={skipBrand}>
              <input type="hidden" name="site_id" value={row.id} />
              <Submit busy={BRAND_COPY.skipping} size={44} variant="ghost" weight="font-medium">
                {BRAND_COPY.skip}
              </Submit>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
