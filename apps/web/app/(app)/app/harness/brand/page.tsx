import { notFound } from 'next/navigation'
import { BRAND_TITLE_ID, BrandPanel, type BrandProject } from '@/app/(app)/app/(authed)/sites/brand-panel'
import { PanelModal } from '@/app/(app)/app/(authed)/sites/panel-modal'
import { panelBox } from '@/components/kit/dialog'
import { HARNESS } from '@/lib/harness'
import { PLANS } from '@/lib/plan'
import { BRAND_COPY } from '@/lib/probe-rule'
import { placeholderFor } from '@/lib/style-pack'

/** Story 6.6 (DW-70; review, 2026-10-05) — S2c's brand offer, mounted for the keyboard gate alone, so `pnpm keyboard`
 *  measures the "Which project?" chooser at scale on every commit. The bound was measured once at Dev, on a scratch page
 *  that was never committed, and after that only by the deployed probe: giving the rail's form its box back left CI
 *  green with the caption and both presses under the rail. Its own page, outside `(authed)`, as `harness/connect` is:
 *  production answers 404 (`app-routes.test.ts`'s HARNESS_ONLY).
 *
 *  THE REAL `BrandPanel`, IN BOTH CHROMES, WITH STAND-IN ROWS AND NO READ. `brand-screen.tsx` is the half that needs a
 *  session and a database, so it is the half left out; what it hands the panel is made here. `?projects=` is how many
 *  cards (`cap` is Pro's own number, from `PLANS`, never written here), and `?chrome=page` is the full screen's box as
 *  `sites/brand/page.tsx` draws it; anything else is the popup, in the real `PanelModal`.
 *
 *  NEITHER PRESS CAN DO ANYTHING, TWICE OVER. Both forms post the real actions, and `siteOf` — the first line of each —
 *  asks for a session the harness has no Supabase to hold, then refuses a `site_id` that is not a uuid, which this
 *  stand-in's is not. Nothing here presses them either: the gate reads where they sit. */
const SITE = 'harness-site'

const standInProjects = (count: number): BrandProject[] =>
  Array.from({ length: count }, (_, i) => ({
    id: `harness-project-${i + 1}`,
    name: `Stand-in project ${i + 1}`,
    style_pack: null,
    // all three of a card's second lines: this site's, another site's, and none
    linked_site_id: i === 0 ? SITE : i === 1 ? 'harness-other-site' : null,
  }))

export default async function HarnessBrand({
  searchParams,
}: {
  searchParams: Promise<{ projects?: string | string[]; chrome?: string | string[]; target?: string | string[] }>
}) {
  if (!HARNESS) notFound()
  const { projects: asked, chrome, target } = await searchParams
  const cap = PLANS.pro.projects
  // more than one, or there is no chooser to measure (`choosing` in `brand-screen.tsx`); never past the cap
  const count = asked === 'cap' ? cap : Math.min(cap, Math.max(2, Number(asked) || 2))
  const projects = standInProjects(count)
  const panel = (
    <BrandPanel
      site={{
        id: SITE,
        title: 'Stand-in site',
        host: 'harness-ghost.example',
        url: 'https://harness-ghost.example',
        logo: null,
        // a colour the app already owns — the default pack's accent — because no colour is written in a component
        accent: placeholderFor(null).accent,
        nav: [{ label: 'Home' }, { label: 'About' }],
      }}
      caption={count >= cap ? BRAND_COPY.atLimitChoose : BRAND_COPY.alreadyOn(projects[0].name)}
      failed={false}
      projects={projects}
      // `?target=last`: the pre-selected project is the LAST row, the one a scroller would hide (Question 5)
      targetId={(target === 'last' ? projects[projects.length - 1] : projects[0]).id}
      choosing
      popup={chrome !== 'page'}
      back="/app/harness/brand"
    />
  )
  return chrome === 'page' ? (
    // `sites/brand/page.tsx`'s own two elements, on a window-high ground where the shell would have been
    <div className="flex min-h-dvh items-center justify-center p-[16px_20px] tablet:p-6">
      <div className={`flex flex-col ${panelBox}`}>{panel}</div>
    </div>
  ) : (
    <PanelModal labelledBy={BRAND_TITLE_ID}>{panel}</PanelModal>
  )
}
