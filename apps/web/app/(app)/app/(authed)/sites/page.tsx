import type { Metadata } from 'next'
import { Banner } from '@/components/kit/banner'
import { ring } from '@/components/kit/greyed'
import { ExternalLink } from '@/components/kit/icons'
import { ConnectSiteButton } from '@/components/shell/shell'
import { checkedLabel, filterSites, ghostLabel, hostOf, projectCounts, projectsLabel, SITES_EMPTY } from '@/lib/connect-rule'
import { PREVIEW_COPY } from '@/lib/probe-rule'
import { currentUser, supabaseServer } from '@/lib/supabase/server'
import { ConnectSiteDialog } from './connect-dialog'
import { SiteNotices, type NoticeSite } from './site-notices'

/* ───────── S11 Sites.dc.html — S11a, its top bar, and the empty screen the export does not draw.

   THE OWNER'S TEST WROTE THIS FILE'S SHAPE (2026-09-08, R-80 as amended), and two of its three
   departures are from the frame itself, recorded here so a later story does not "correct" them
   back:

   1. WITH NOTHING CONNECTED THIS IS AN EMPTY SCREEN, not the handshake (his finding 7). `/sites`
      used to BE S2b·1 and `?step=keys` S2b·2 (EXPERIENCE.md:318, amended with this story); now it
      is the shape of the Projects empty screen (S3b): a drawing, the display title, the quieter
      line, and a centred "Connect site" that opens the same sheet the top bar's does. The
      full-page handshake did not disappear — it is `/sites/connect`, which is where that link
      goes with JavaScript off. No frame draws this screen, so it is extrapolated from the nearest
      one that has (R-74) and its words and drawing are the owner's rulings at Questions 5 and 6.
   2. THE TOP BAR IS THE SHELL'S, as Projects' is (his finding 5): the search field on the left,
      "Connect site" on its right, the 64px rule under both. Its bell is Story 13.4's and is drawn
      on no surface here (his ruling at Question 4).
   3. THE CARD PUTS "Connected" JUST ABOVE "Checked …" (his finding 6), not on the pills' line as
      the frame draws it (`:70-75`), and the two sit closer together than the card's other rows.
      One component draws every card, so "finalise this for all site cards" is satisfied by
      changing it once — and the later stories that add to this card inherit THIS layout, not the
      frame's (deferred-work.md, DW-57).

   The sites are read through the USER'S OWN SESSION, so RLS scopes the list rather than a
   `where user_id =` being trusted to; `(user_id) where disconnected_at is null` is the index the
   filter is the shape of (schema :174). A DISCONNECTED record is a record Inflozo kept (FR-C6)
   and is not a site — it does not appear here and it does not count against the plan.

   STORY 3.3 ADDED TWO THINGS TO THE CARD AND OBEYED DW-57 IN WHERE IT PUT THEM. The sky
   **Preview-only** chip is on the STATE LINE beside "Connected", not on the pills' line, because
   it is a property of the CONNECTION and the pills are metadata about the site — so 3.5's ⋯ menu
   and 3.7's health badges now add to the state line the owner made, rather than reading the frame
   and undoing him (the ledger entry is amended to say so). And `<SiteNotices>` is the card's LAST
   block: the one-time code-injection notice, the two questions the probes could not answer for
   themselves, and B15's Preview-Only Notice — every control in it a form, so all of them work
   with JavaScript off.

   ABSENT FROM THIS SURFACE, each another story's and each absent rather than greyed (UX-DR3):
   the ⋯ menu with Re-check, Reconnect, Manage keys and Disconnect (3.5, 3.6), the health badges
   and "Reconnect needed" (3.7), and S11c's ghost slot at the Free cap (3.5). Every card here is
   Connected, because that is still the only health this epic can write. */

export const metadata: Metadata = {
  title: 'Sites · Inflozo',
  robots: { index: false, follow: false },
}

/* The card's own columns, plus the four Story 3.3 reads for `<SiteNotices>`. `capability` and
   `capability_source` are server-asserted (AD-7) and read here only to draw with. */
type Row = NoticeSite & {
  title: string | null
  url: string
  ghost_version: string | null
  settings_read_at: string | null
  site_settings: (NonNullable<NoticeSite['site_settings']> & { public_url?: string }) | null
}

export default async function Sites({
  searchParams,
}: {
  // A repeated key (`?q=a&q=b`) arrives as an ARRAY; `filterSites` takes the first, as the
  // dashboard's own filter does. `recheck` is B15's own: `recheckPlan` redirects here with it
  // when the re-run probe could not reach Ghost, so the card is unchanged and says why.
  searchParams: Promise<{ q?: string | string[]; recheck?: string | string[] }>
}) {
  const [{ q, recheck }, user] = await Promise.all([searchParams, currentUser()])
  // The layout's guard has already redirected anyone without one; this is the type narrowing.
  if (!user) return null

  const supabase = await supabaseServer()
  const [{ data, error }, { data: projects, error: projectsError }] = await Promise.all([
    supabase
      .from('sites')
      .select(
        'id, title, url, ghost_version, site_settings, settings_read_at, capability, capability_source, code_injection_notice_shown_at',
      )
      .is('disconnected_at', null)
      .order('created_at', { ascending: false }),
    // FR-B5: at most one site per project, so the card's "n projects" is a tally of this column.
    supabase.from('projects').select('linked_site_id'),
  ])

  const sites: Row[] = data ?? []
  // A FAILED READ IS NOT AN EMPTY ACCOUNT — the dashboard's own finding (review, 2026-09-05):
  // `data ?? []` would show someone with a connected site the first-run empty screen instead.
  const unread = Boolean(error)
  // A failed tally is no tally: the pill is absent rather than stating "0 projects" as a fact
  // (review, 2026-09-08). Logged without the id: logs carry no user content.
  if (projectsError) console.error('sites: projects read failed', { code: projectsError.code })
  const linked = projectCounts(projects ?? [])

  const { query, shown } = filterSites(sites, q)
  // B15's own: `recheckPlan` redirects here when the re-run probe could not reach Ghost.
  const recheckFailed = (Array.isArray(recheck) ? recheck[0] : recheck) === 'failed'

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

  return (
    <>
      {sites.length === 0 ? (
        /* The first-run state, and neither a search that matched nothing nor a read that failed
           is it — the drawing would be telling someone with a site that they have none. */
        <div className="flex flex-1 flex-col items-center justify-center gap-6 p-6 text-center">
          {/* Question 6's ruling: a browser window meeting a plug, drawn in the Projects screen's
              own hand and tokens (`page.tsx:117-134`) — dashed `currentColor` at 1.5, one
              `fill-coral`, one `fill-marigold`, 160×120. */}
          <svg width="160" height="120" viewBox="0 0 160 120" fill="none" aria-hidden className="text-ink">
            <rect
              x="10"
              y="26"
              width="86"
              height="64"
              rx="8"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeDasharray="5 5"
            />
            <line x1="10" y1="44" x2="96" y2="44" stroke="currentColor" strokeWidth="1.5" opacity=".25" />
            <circle cx="22" cy="35" r="2" className="fill-line" />
            <circle cx="30" cy="35" r="2" className="fill-line" />
            <rect x="22" y="56" width="42" height="8" rx="3" className="fill-line" />
            <rect x="22" y="70" width="26" height="8" rx="3" className="fill-line" />
            <path
              d="M96 58h20"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeDasharray="4 4"
              strokeLinecap="round"
            />
            <path d="M116 52h10M116 64h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <rect x="126" y="44" width="22" height="28" rx="7" className="fill-coral" />
            <path
              d="M128 6l2.2 6.2L136.4 14.4l-6.2 2.2-2.2 6.2-2.2-6.2-6.2-2.2 6.2-2.2z"
              transform="translate(-16 16)"
              className="fill-marigold"
            />
          </svg>
          <div className="flex flex-col items-center gap-2">
            <h1 className="font-display text-[28px] font-bold tracking-[-0.01em] text-ink">{SITES_EMPTY.title}</h1>
            <p className="text-[15px] text-ink-soft">{SITES_EMPTY.sub}</p>
          </div>
          {/* The top bar keeps its own "Connect site" — Projects draws both (UX-DR6). At 390 the
              top bar has none, so this centred one is the only one and is still right. */}
          <ConnectSiteButton look="empty" />
        </div>
      ) : (
        <div className="flex flex-col gap-4 p-[16px_20px] tablet:gap-5 tablet:p-6">
          {/* The frame draws no heading — S11a's own title is the nav item. A screen reader still
              needs the page's name above the cards' own <h2>s (the dashboard's finding). */}
          <h1 className="sr-only">Sites</h1>
          {/* 390 puts the action first, full width — the frame's own order, and Projects' too. */}
          <div className="tablet:hidden">
            <ConnectSiteButton look="mobile" />
          </div>

          {shown.length === 0 ? (
            <p className="text-ui-dense text-ink-soft">{SITES_EMPTY.noMatch(query)}</p>
          ) : (
            <div className="grid grid-cols-1 gap-[14px] tablet:grid-cols-3 tablet:gap-5">
              {shown.map((site) => {
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
                        {/* The owner's finding 4: the address opens in a new tab, so it SAYS so.
                            The glyph is the export's own (`P0-2:111`) and is decorative — the
                            link's name is the address, and "opens in a new window" is the title
                            a screen reader reads after it. */}
                        <a
                          href={publicUrl}
                          target="_blank"
                          rel="noreferrer"
                          className={`flex min-w-0 items-center gap-[5px] rounded-sm font-mono text-helper-caption text-ink-soft underline-offset-2 hover:underline ${ring}`}
                        >
                          <span className="truncate">{hostOf(publicUrl)}</span>
                          <ExternalLink size={12} className="shrink-0" label="opens in a new tab" />
                        </a>
                      </div>
                    </div>
                    {/* THE PILLS KEEP THEIR OWN LINE (his finding 6) — nothing else joins them. */}
                    {version || !projectsError ? (
                      <div className="flex flex-wrap items-center gap-2">
                        {version ? (
                          <span className="rounded-pill border border-line px-2 py-[2px] font-mono text-[10px] text-ink-soft">
                            {version}
                          </span>
                        ) : null}
                        {projectsError ? null : (
                          <span className="rounded-pill border border-line px-2 py-[2px] text-helper-caption text-ink-soft">
                            {projectsLabel(projectCount)}
                          </span>
                        )}
                      </div>
                    ) : null}
                    {/* "Connected" JUST ABOVE "Checked …", and closer to it than to anything else
                        — one state and its timestamp, read as one thing (his finding 6). THE
                        PREVIEW-ONLY CHIP JOINS THIS LINE, not the pills' (DW-57): it is the
                        connection's state, and the frame's own chip is exactly this — a white
                        pill with a hairline and a 6px sky dot (`B15:1189-1192`). */}
                    <div className="mt-auto flex flex-col gap-[3px]">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-[5px] text-control-label font-medium text-mint-text">
                          <span aria-hidden className="size-[7px] rounded-full bg-mint" />
                          Connected
                        </span>
                        {site.capability === 'preview_only' ? (
                          <span className="inline-flex items-center gap-[6px] rounded-pill border border-line bg-surface px-[9px] py-[2px] text-[11.5px] font-semibold text-ink">
                            <span aria-hidden className="size-[6px] rounded-full bg-sky" />
                            {PREVIEW_COPY.chip}
                          </span>
                        ) : null}
                      </span>
                      <span className="text-helper-caption text-ink-soft">
                        {checkedLabel(site.settings_read_at, now)}
                      </span>
                    </div>
                    <SiteNotices site={site} recheckFailed={recheckFailed} />
                  </article>
                )
              })}
            </div>
          )}
        </div>
      )}
      {/* KEYED ON THE NUMBER OF CARDS. A connect made from the sheet redirects to this same route,
          which re-renders in place — so the sheet stayed open over the new card with the keys
          still in its fields. One more card remounts it closed (review, 2026-09-08);
          `connect-dialog.tsx` says the same from its side. The opener is in the shell's top bar
          and on the empty screen; this is the one sheet both of them open. */}
      <ConnectSiteDialog key={sites.length} />
    </>
  )
}
