import type { Metadata } from 'next'
import Link from 'next/link'
import { Banner } from '@/components/kit/banner'
import { NewProjectButton } from '@/components/shell/shell'
import { ring } from '@/components/kit/greyed'
import { resolveEntitlement } from '@/lib/entitlement'
import { atCap as overCap, capSentence, goProLabel } from '@/lib/plan'
import { filterProjects } from '@/lib/projects'
import { passkeysEnabled } from '@/lib/flags'
import { currentUser, supabaseServer } from '@/lib/supabase/server'
import { isSignOutFailed, SIGN_OUT_FAILED } from '../sign-in/signed-out'
import { isRestored, RESTORED, RESTORED_SENTENCE } from './account/deletion-rule'
import { nudgeDone } from './account/nudge'
import { PasskeyNudge } from './passkey-nudge'
import { NewProjectSheet } from './new-project-sheet'
import { ProjectCard, type Project } from './project-card'
import { DuplicateScope } from './project-menu'

/* ───────────────────────────────────────── S3 Dashboard.dc.html — S3a, S3b and S3c.

   The projects are read through the USER'S OWN SESSION, so RLS scopes the list rather than a
   `where user_id =` being trusted to; `(user_id, updated_at desc)` is the index the order is
   the shape of (schema :229).

   S3b when there is nothing yet · S3a when there is · S3c's upgrade tile as the grid's next
   cell once a Free account is at the cap. The search is `?q=`, read here, because the field is
   in the layout and the cards are here and the URL is the one piece of state both share.

   Absent from this surface, each another epic's and each absent rather than greyed: the
   connected-sites strip (E3), the deploy chips (E7), the storage meter (E8), the what's-new
   popover and the notifications bell (E13). */

export const metadata: Metadata = {
  title: 'Projects · Inflozo',
  robots: { index: false, follow: false },
}

export default async function Dashboard({
  searchParams,
}: {
  // A repeated key (`?q=a&q=b`) arrives as an ARRAY; `filterProjects` takes the first and is
  // under test for it (review, 2026-09-05).
  searchParams: Promise<{
    q?: string | string[]
    [SIGN_OUT_FAILED]?: string | string[]
    [RESTORED]?: string | string[]
  }>
}) {
  const [{ q, [SIGN_OUT_FAILED]: signOutFailed, [RESTORED]: restored }, user] = await Promise.all([
    searchParams,
    currentUser(),
  ])
  // The layout's guard has already redirected anyone without one; this is the type narrowing.
  if (!user) return null

  const supabase = await supabaseServer()
  // The nudge costs ONE extra read on this page and it is the flag's, not the user's: whether it
  // has been answered already rode in on `getUser()` above (`account/nudge.ts`) — and once it
  // has been, the flag is not read at all (review, 2026-09-06).
  const [{ data, error }, { plan }, passkeys] = await Promise.all([
    supabase
      .from('projects')
      .select('id, name, style_pack, updated_at')
      .order('updated_at', { ascending: false }),
    resolveEntitlement(user.id),
    nudgeDone(user.user_metadata) ? false : passkeysEnabled(),
  ])

  const projects: Project[] = data ?? []
  // A FAILED READ IS NOT AN EMPTY ACCOUNT. `data ?? []` told a user with projects that they had
  // none — S3b's first-run illustration over their own work — and cleared `atCap` with it, so
  // the plan cap silently lifted at the same moment (review, 2026-09-05).
  const unread = Boolean(error)
  const atCap = !unread && overCap(plan, projects.length)
  const { query, shown } = filterProjects(projects, q)

  // One clock for the whole render, so two cards written a millisecond apart never disagree
  // about what "today" is.
  const now = new Date()

  return (
    <>
      {/* Sign out that FAILED. It sits above whichever of the three states renders, because the
          user arrived here from the account menu rather than from the grid, and it is the Kit's
          own error Banner — the same red strip a failed read uses — so nothing new is drawn for
          it (the owner's ruling at question 8, option 1, 2026-09-06). It says the attempt failed
          and NOT that anything happened: the session is still live, which is the whole reason
          this lands on the dashboard instead of the sign-in page. Like `?signed-out=1` it is a
          hint on the URL that nothing depends on. */}
      {isSignOutFailed(signOutFailed) ? (
        <div className="p-[16px_20px] pb-0 tablet:p-6 tablet:pb-0">
          <Banner kind="error">We couldn&rsquo;t sign you out just now. Try again in a moment.</Banner>
        </div>
      ) : null}
      {/* FR-A5's way BACK, said where the user lands: `restoreAccount` redirects here and this is
          the sentence. Same slot and the same URL-hint shape as the strip above — a value and a
          reader in `deletion-rule.ts`, both under test, so neither can silently stop matching. */}
      {isRestored(restored) ? (
        <div className="p-[16px_20px] pb-0 tablet:p-6 tablet:pb-0">
          <Banner kind="success">{RESTORED_SENTENCE}</Banner>
        </div>
      ) : null}
      {/* FR-A2's one-time offer, above the grid and above the three states below it, for the
          same reason the strip above is: it is about the account, not about the projects. */}
      {passkeys && !nudgeDone(user.user_metadata) ? <PasskeyNudge /> : null}
      {unread ? (
        <div className="flex flex-col gap-4 p-[16px_20px] tablet:p-6">
          <h1 className="sr-only">Projects</h1>
          <Banner kind="error">We couldn&rsquo;t load your projects just now. Try again in a moment.</Banner>
        </div>
      ) : /* S3b: the empty state is the FIRST-RUN state, and neither a search that matched
             nothing nor a read that failed is it — the illustration would be telling someone
             with projects that they have none. */
      projects.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-6 p-6 text-center">
          {/* The frame's own drawing, its four hexes read as the tokens they are. */}
          <svg width="160" height="120" viewBox="0 0 160 120" fill="none" aria-hidden className="text-ink">
            <rect
              x="24"
              y="18"
              width="112"
              height="76"
              rx="8"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeDasharray="5 5"
            />
            <line x1="24" y1="42" x2="136" y2="42" stroke="currentColor" strokeWidth="1.5" opacity=".25" />
            <rect x="38" y="54" width="46" height="8" rx="3" className="fill-line" />
            <rect x="38" y="68" width="30" height="12" rx="4" className="fill-coral" />
            <path d="M128 6l2.2 6.2L136.4 14.4l-6.2 2.2-2.2 6.2-2.2-6.2-6.2-2.2 6.2-2.2z" className="fill-marigold" />
            <circle cx="30" cy="106" r="3" stroke="currentColor" strokeWidth="1.5" />
            <path d="M44 108c14 4 58 4 74-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity=".4" />
          </svg>
          <div className="flex flex-col items-center gap-2">
            <h1 className="font-display text-[28px] font-bold tracking-[-0.01em] text-ink">
              Every great site starts somewhere.
            </h1>
            <p className="text-[15px] text-ink-soft">Yours starts with hundreds of gorgeous sections.</p>
          </div>
          {/* The top bar keeps its own "New project" — the frame draws both (UX-DR6). At 390
              the top bar has none, so this centred one is the only one and is still right. */}
          <NewProjectButton look="empty" />
        </div>
      ) : (
        <div className="flex flex-col gap-4 p-[16px_20px] tablet:gap-5 tablet:p-6">
          {/* The frame draws no heading and no count; a screen reader still needs the page's
              name above the cards' own `<h2>`s (review, 2026-09-05). */}
          <h1 className="sr-only">Projects</h1>
          {/* 390 puts the action first, full width — the frame's own order. */}
          <div className="tablet:hidden">
            <NewProjectButton look="mobile" />
          </div>

          {shown.length === 0 ? (
            <p className="text-ui-dense text-ink-soft">No projects match &ldquo;{query}&rdquo;.</p>
          ) : (
            <DuplicateScope>
              <div className="grid grid-cols-1 gap-[14px] tablet:grid-cols-3 tablet:gap-5">
                {shown.map((project) => (
                  <ProjectCard key={project.id} project={project} now={now} atCap={atCap} />
                ))}

                {/* S3c: the grid's next cell after the cards. Free only — on Pro at the cap
                    there is nothing further to sell, so there is nothing to draw. */}
                {atCap && plan === 'free' ? (
                  <Link
                    href="/billing"
                    className={`flex min-h-[280px] flex-col items-center justify-center gap-[10px] rounded border-[1.5px] border-dashed border-line-strong transition-colors hover:border-marigold ${ring}`}
                  >
                    <span aria-hidden className="text-[20px] text-marigold-text">
                      ✦
                    </span>
                    <span className="text-ui font-semibold text-ink">Upgrade to add more</span>
                    <span className="max-w-[200px] text-center text-ui-dense leading-[1.5] text-ink-soft">
                      {capSentence(plan)}
                    </span>
                    <span className="mt-1 rounded-pill bg-marigold-tint px-[14px] py-[6px] text-ui-dense font-semibold text-marigold-text">
                      {goProLabel()}
                    </span>
                  </Link>
                ) : null}
              </div>
            </DuplicateScope>
          )}
        </div>
      )}

      {/* D4a under the cap, D4b at it. One dialog, opened from the shell's button, from the
          empty state's, from 390's, and from a card's ⋯ Duplicate when the cap is already met. */}
      <NewProjectSheet atCap={atCap} plan={plan} />
    </>
  )
}
