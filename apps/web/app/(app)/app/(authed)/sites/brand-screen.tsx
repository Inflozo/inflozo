import { notFound } from 'next/navigation'
import { hostOf } from '@/lib/connect-rule'
import { resolveEntitlement } from '@/lib/entitlement'
import { atCap } from '@/lib/plan'
import { BRAND_COPY, brandTarget, hasBrand, imageUrl, isAccent, navOf } from '@/lib/probe-rule'
import { currentUser, supabaseServer } from '@/lib/supabase/server'
import { BrandPanel } from './brand-panel'

/* ───────── FR-C4's BRAND OFFER: THE READS, ONCE, FOR BOTH PLACES THE PANEL APPEARS.

   It was `brand/page.tsx`'s body until the owner asked for the offer as a popup (2026-09-10).
   `@modal/(.)brand` renders this over the Sites list when the card's offer LINK is clicked, and
   `brand/page.tsx` renders it as the full screen S2 draws — which is where `connectSite`'s
   redirect still lands, because a server action's `redirect()` is not intercepted (executed;
   `panel-modal.tsx` carries the measurement). One file, so the two can never disagree. */

export type BrandSearchParams = { site?: string | string[]; failed?: string | string[] }

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

export async function BrandScreen({ searchParams }: { searchParams: Promise<BrandSearchParams> }) {
  // A repeated key (`?site=a&site=b`) arrives as an ARRAY; every other page in this epic takes
  // the first, and so does this one.
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
  // A MALFORMED ID IS NOT A FAILED READ. `?site=` is typed by whoever holds the URL, and an id
  // that is not a uuid makes PostgREST answer `22P02 invalid input syntax` rather than an empty
  // row — so a mangled link rendered `app/error.tsx`, "something went wrong", for a request that
  // simply names nothing. There is no row it could be, which is what `notFound()` says
  // (review, 2026-09-09).
  if (rowError?.code === '22P02') notFound()
  if (rowError) readFailed('site', rowError.code)
  if (!row || !hasBrand(brand)) notFound()

  // A COUNT THAT COULD NOT BE READ IS NOT A COUNT OF ZERO. Falling back to `[]` printed "we'll
  // make a project" and then `useBrand` — whose own read succeeded — refused the stale decision
  // and sent the customer straight back here (review, 2026-09-08). `app/error.tsx` is the screen
  // for a page that cannot answer.
  if (projectsError) readFailed('projects', projectsError.code)
  const rows = projects ?? []
  // THE PROJECT FOR THIS SITE WINS ON BOTH SIDES OF THE CAP (the owner's Question 4 ruling,
  // 2026-09-08); only where this site has no project do the two sides differ — at the cap the
  // most recently updated one, with room none at all, which is what makes one. `brandTarget` is
  // that rule, shared with `useBrand` so the caption and the write cannot drift.
  const capped = atCap(plan, rows.length)
  const target = brandTarget(capped, rows, row.id)
  // THE OWNER RULED THE CHOOSER (Question 3, 2026-09-08, and his A1/B1): the sentence, the cards
  // under it with the project this would have picked already selected, then the button — and it
  // appears ONLY when the brand is going onto a project that already exists AND there is more than
  // one to choose between. With one project there is no choice to offer, and Free includes one, so
  // the quiet path stays quiet.
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
  // instead of pre-answering it.
  const caption = !target
    ? BRAND_COPY.willCreate
    : capped
      ? choosing
        ? BRAND_COPY.atLimitChoose
        : BRAND_COPY.willBrand(target.name)
      : BRAND_COPY.alreadyOn(target.name)

  const host = hostOf(row.site_settings?.public_url || row.url)
  // RE-VALIDATED HERE, ALL THREE: `brandOf` wrote them, but this reads them back out of a jsonb
  // column and each one crosses into an attribute — `style-pack.ts` takes the same position on
  // the accent it reads back out of `style_pack`. `hasBrand` is an OR, so a record admitted on
  // its logo alone carried an UNCHECKED accent into two inline `style` attributes and an
  // unchecked menu into JSX, where a non-string label throws in render rather than being dropped
  // (review, 2026-09-08 — the file's own rule is "checked where it crosses, every time").
  return (
    <BrandPanel
      site={{
        id: row.id,
        title: row.title || host,
        host,
        logo: imageUrl(brand.logo),
        accent: isAccent(brand.accent) ? brand.accent : null,
        nav: navOf(brand.nav),
      }}
      caption={caption}
      failed={Boolean(Array.isArray(failed) ? failed[0] : failed)}
      projects={rows}
      targetId={target?.id ?? null}
      choosing={choosing}
    />
  )
}
