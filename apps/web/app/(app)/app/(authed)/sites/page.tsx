import type { Metadata } from 'next'
import { Banner } from '@/components/kit/banner'
import { ring } from '@/components/kit/greyed'
import { checkedLabel, ghostLabel, hostOf, stepOf } from '@/lib/connect-rule'
import { currentUser, supabaseServer } from '@/lib/supabase/server'
import { ConnectSiteButton } from './connect-dialog'
import { ConnectWizard } from './connect-wizard'

/* ───────── S11 Sites.dc.html — S11a, and S2 Onboarding.dc.html's S2b when there is nothing yet.

   SITES WITH NONE: THE CONNECT CARD IS THE WHOLE PAGE (EXPERIENCE.md:318). `/sites` is S2b·1 and
   `/sites?step=keys` is S2b·2 — the same two screens the dialog shows, on their own route as
   well, so the pair works with JavaScript switched off.

   The sites are read through the USER'S OWN SESSION, so RLS scopes the list rather than a
   `where user_id =` being trusted to; `(user_id) where disconnected_at is null` is the index the
   filter is the shape of (schema :174). A DISCONNECTED record is a record Inflozo kept (FR-C6)
   and is not a site — it does not appear here and it does not count against the plan.

   ABSENT FROM THIS SURFACE, each another story's and each absent rather than greyed (UX-DR3):
   the ⋯ menu with Re-check, Reconnect, Manage keys and Disconnect (3.5, 3.6), the health badges
   and "Reconnect needed" (3.7), S11c's ghost slot at the Free cap (3.5), and the Preview-only
   chip (3.3). Every card here is Connected, because that is the only state this story can write.

   The shell's search field and "New project" belong to the DASHBOARD and are drawn only there,
   so this surface carries its own single action. */

export const metadata: Metadata = {
  title: 'Sites · Inflozo',
  robots: { index: false, follow: false },
}

type Row = {
  id: string
  title: string | null
  url: string
  ghost_version: string | null
  site_settings: { public_url?: string } | null
  settings_read_at: string | null
}

export default async function Sites({
  searchParams,
}: {
  searchParams: Promise<{ step?: string | string[] }>
}) {
  const [{ step }, user] = await Promise.all([searchParams, currentUser()])
  // The layout's guard has already redirected anyone without one; this is the type narrowing.
  if (!user) return null

  const supabase = await supabaseServer()
  const [{ data, error }, { data: projects }] = await Promise.all([
    supabase
      .from('sites')
      .select('id, title, url, ghost_version, site_settings, settings_read_at')
      .is('disconnected_at', null)
      .order('created_at', { ascending: false }),
    // FR-B5: at most one site per project, so the card's "n projects" is a tally of this column.
    supabase.from('projects').select('linked_site_id'),
  ])

  const sites: Row[] = data ?? []
  // A FAILED READ IS NOT AN EMPTY ACCOUNT — the dashboard's own finding (review, 2026-09-05):
  // `data ?? []` would show someone with a connected site the first-run handshake instead.
  const unread = Boolean(error)
  const linked = new Map<string, number>()
  for (const project of projects ?? []) {
    const id = project.linked_site_id
    if (id) linked.set(id, (linked.get(id) ?? 0) + 1)
  }

  // One clock for the whole render, so two cards a millisecond apart never disagree.
  const now = new Date()

  if (unread) {
    return (
      <div className="flex flex-col gap-4 p-[16px_20px] tablet:p-6">
        <h1 className="sr-only">Sites</h1>
        <Banner kind="error">We couldn&rsquo;t load your sites just now. Try again in a moment.</Banner>
      </div>
    )
  }

  if (sites.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-[16px_20px] tablet:p-6">
        {/* "Back" from the handshake's first step is Projects: First Run (S2a, Story 3.8) is what
            will sit behind it, and until it does the nav's other page is what is actually there. */}
        <ConnectWizard step={stepOf(step)} backHref="/" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 p-[16px_20px] tablet:gap-5 tablet:p-6">
      {/* The frame draws no heading — S11a's own title is the nav item. A screen reader still
          needs the page's name above the cards' own <h2>s (the dashboard's finding). */}
      <h1 className="sr-only">Sites</h1>
      <div className="flex tablet:justify-end">
        <ConnectSiteButton />
      </div>
      <div className="grid grid-cols-1 gap-[14px] tablet:grid-cols-3 tablet:gap-5">
        {sites.map((site) => {
          // The PUBLIC url is what the address links to, never the admin one it was connected
          // with — on Ghost(Pro) the two differ by design (EXPERIENCE.md:113, F-068).
          const publicUrl = site.site_settings?.public_url || site.url
          const title = site.title || hostOf(site.url)
          const version = ghostLabel(site.ghost_version)
          const projectCount = linked.get(site.id) ?? 0
          return (
            <article
              key={site.id}
              className="flex flex-col gap-[14px] rounded border border-line bg-surface p-[18px] shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-start gap-3">
                <span
                  aria-hidden
                  className="flex size-10 shrink-0 items-center justify-center rounded-thumb bg-ink font-display text-[18px] font-bold text-paper"
                >
                  {title.slice(0, 1).toUpperCase()}
                </span>
                <div className="flex min-w-0 flex-col gap-[2px]">
                  <h2 className="truncate text-ui font-semibold text-ink">{title}</h2>
                  <a
                    href={publicUrl}
                    target="_blank"
                    rel="noreferrer"
                    className={`truncate rounded-sm font-mono text-helper-caption text-ink-soft underline-offset-2 hover:underline ${ring}`}
                  >
                    {hostOf(publicUrl)}
                  </a>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-[5px] text-control-label font-medium text-mint-text">
                  <span aria-hidden className="size-[7px] rounded-full bg-mint" />
                  Connected
                </span>
                {version ? (
                  <span className="rounded-pill border border-line px-2 py-[2px] font-mono text-[10px] text-ink-soft">
                    {version}
                  </span>
                ) : null}
                <span className="rounded-pill border border-line px-2 py-[2px] text-helper-caption text-ink-soft">
                  {projectCount} project{projectCount === 1 ? '' : 's'}
                </span>
              </div>
              <span className="text-helper-caption text-ink-soft">
                {checkedLabel(site.settings_read_at, now)}
              </span>
            </article>
          )
        })}
      </div>
    </div>
  )
}
