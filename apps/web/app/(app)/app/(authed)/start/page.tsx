import type { Metadata } from 'next'
import { resolveEntitlement } from '@/lib/entitlement'
import { FIRST_RUN } from '@/lib/first-run'
import { currentUser } from '@/lib/supabase/server'
import { NewProjectSheet } from '../new-project-sheet'
import { Doors } from './doors'

/* ───────── S2 Onboarding.dc.html — S2a FIRST RUN, the first surface after the first sign-in.

   `EXPERIENCE.md` § Onboarding has listed it since the UX spine was written and nothing built it:
   a new account landed on S3b, the Projects empty screen, whose single control makes a BLANK
   project — the least recommended of the three doors and the one that leaves the customer with no
   site, no brand and sample content. DW-19 named the gap; the owner closed it by ruling First Run
   to be Epic 3's last story, planned after 3.4 so the Recommended door runs all the way through.

   THIS ROUTE ADDS NO CAPABILITY. Every door already has its destination built — Connect is 3.2's
   full-page handshake, which redirects on success to 3.4's brand offer and makes the project;
   Blank opens the sheet the dashboard opens; Starter is greyed until Epic 11. What this story adds
   is a screen and a redirect, and no column and no migration: NOTHING IS REMEMBERED about First
   Run (the owner's Question 1 ruling, option 1, 2026-09-11), so `(dashboard)/layout.tsx` derives it
   from two counts on every render and `lib/first-run.ts` is the whole of the rule.

   WHY A ROUTE AND NOT A BRANCH INSIDE THE DASHBOARD: a `loading.tsx` can only draw one shape, and
   `(dashboard)/loading.tsx` draws project cards. The owner's finding 2 on Story 3.4 is precisely
   that a skeleton must match what is coming, so First Run gets its own route and its own skeleton
   and the dashboard keeps the one it has.

   FOUR DEPARTURES FROM S2a, EACH DELIBERATE AND EACH RECORDED (R-74 — the export is not edited):

   1. IT LIVES INSIDE THE APP SHELL. The frame draws a bare page with only the wordmark; so do
      S2b·1, S2b·2 and S2c, and all three are built inside the shell (`sites/connect/page.tsx`,
      `sites/brand/page.tsx`). This is that same departure, and it is what gives the customer a way
      to Sites, Assets and Billing from here. `/start` is not in the shell's `BARS`, so the route
      draws no top bar and there is no second call to action competing with the three cards.
   2. THE STARTER DOOR'S COUNT COMES FROM THE ROSTER, NOT THE FRAME. S2a says "Three ready-made
      sites"; Appendix E's roster is ten and the shipped New Project Sheet already says so. Counts
      are derived, never restated — hence one sentence in `lib/first-run.ts`, imported by both.
   3. "colours", NOT "colors". The product's shipped voice is British.
   4. 834 AND 390 ARE EXTRAPOLATED. S2a is drawn at 1440 only; the cards collapse the way the
      dashboard grid already does (`grid-cols-1 tablet:grid-cols-3`), which is the one collapse
      rule this app has and the one the owner has already tested twice. The 44px heading comes down
      to 28px below tablet — S3b's own display size, so the two empty screens read as one hand. */

export const metadata: Metadata = {
  /* THE SAME TITLE THE DASHBOARD WEARS, and that is the owner's ruling rather than an oversight:
     the welcome screen IS what Projects looks like while you have no site and no project, and the
     nav item the customer clicked to get here says Projects. */
  title: 'Projects · Inflozo',
  robots: { index: false, follow: false },
}

export default async function FirstRun() {
  const user = await currentUser()
  // The layout's guard has already redirected anyone without one; this is the type narrowing.
  if (!user) return null

  // The sheet's own sentences are the plan's (`lib/plan.ts`), so it needs the plan — one cached
  // read the layout has already made for the account chip (`resolveEntitlement`).
  const { plan } = await resolveEntitlement(user.id)

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-12 p-[16px_20px] tablet:p-6">
      <h1 className="text-center font-display text-[28px] font-bold tracking-[-0.02em] text-balance text-ink tablet:text-[44px]">
        {FIRST_RUN.heading}
      </h1>
      <Doors />
      <p className="text-ui text-ink-soft">{FIRST_RUN.footer}</p>
      {/* THE BLANK DOOR'S DESTINATION, and it is the dashboard's own sheet rather than a copy —
          `openNewProject()` finds it by id. `atCap={false}` is a fact and not an assumption: this
          screen is only ever drawn for an account with no project at all, and `createProject`
          re-counts server-side anyway, so a sheet that raced a second tab still refuses. */}
      <NewProjectSheet atCap={false} plan={plan} />
    </div>
  )
}
