import type { Metadata } from 'next'
import { Suspense } from 'react'
import Link from 'next/link'
import { Banner } from '@/components/kit/banner'
import { ring } from '@/components/kit/greyed'
import { ExternalLink, Refresh } from '@/components/kit/icons'
import { ConnectSiteButton } from '@/components/shell/shell'
import {
  checkedLabel,
  connectMessage,
  filterSites,
  ghostLabel,
  HEALTH,
  hostOf,
  KEYS,
  keysPath,
  keysPopupPath,
  ORPHAN_SNAPSHOT_DAYS,
  projectCounts,
  projectsLabel,
  SITES_EMPTY,
} from '@/lib/connect-rule'
import { resolveEntitlement } from '@/lib/entitlement'
import { HEALTH_REASONS, openHealthNotices, type HealthReason } from '@/lib/health-rule'
import { atSiteCap, goProLabel, siteCapSentence } from '@/lib/plan'
import { hasBrand, PREVIEW_COPY } from '@/lib/probe-rule'
import { currentUser, supabaseServer } from '@/lib/supabase/server'
import { deadlineLabel } from '../../account/deletion-rule'
import { BRAND_TITLE_ID } from '../brand-panel'
import { BrandScreen } from '../brand-screen'
import { BrandPanelSkeleton } from '../brand-skeleton'
import { ConnectSiteDialog } from '../connect-dialog'
import { KEYS_TITLE_ID } from '../keys-panel'
import { KeysScreen } from '../keys-screen'
import { KeysSkeleton } from '../keys-skeleton'
import { PanelLink } from '../panel-link'
import { PanelModal } from '../panel-modal'
import { SiteMenu } from '../site-menu'
import { SiteNotices, type NoticeSite } from '../site-notices'

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

   STORY 3.5 ADDED THE ⋯ AND THE GHOST SLOT, AND OBEYED DW-57 TWICE OVER. `<SiteMenu>` goes at
   the TOP RIGHT OF THE HEADER ROW, in the `margin-left:auto` slot the frame draws it in
   (`S11 Sites.dc.html:68`) — nothing joined the pills' line and nothing joined the state line. It
   holds **Disconnect** and nothing else: the frame's other three rows are 3.6's and 3.7's and are
   ABSENT rather than greyed (UX-DR3), and those stories add INTO this menu rather than building a
   second one. S11c's ghost slot is the grid's next cell at the Free cap, `atSiteCap` and
   `siteCapSentence` deciding both the WHETHER and the sentence — nothing here types a number
   (standing rule 4).

   STORY 3.6 ADDED TWO THINGS AND OBEYED DW-57 IN BOTH. **Manage API keys** went INTO the ⋯ menu
   above the rule — the frame's own third row — and nothing else on the card moved; and FR-C8's
   "Moved domains?" hint reads `?moved=` exactly as `?recheck=` and `?disconnect=` already do, so
   it belongs to ONE card and no other claims it.

   STORY 3.7 FINISHED THE STATE LINE AND OBEYED DW-57 IN DOING IT. The line the owner made now
   carries THREE states rather than one — mint **Connected**, marigold **Reconnect needed** with the
   reason and the date under it, and marigold **Checking…** with a pulsing dot while a check is in
   flight — and nothing joined the pills' line, nothing left the state line, and the ⋯ stayed in the
   header row's `margin-left:auto` slot. The unhealthy card gains the frame's own **Reconnect**
   button (`S11 Sites.dc.html:99`), which is EXPERIENCE.md's promised second entry point into
   Manage keys and which appears only where it can act (UX-DR3).

   AND THE CARD'S BRAND LINK LEFT IT — the owner's instruction of 2026-09-10. "Use this site's
   brand" is now the ⋯ menu's first row, where every other per-site action already lives, so the
   card hands `SiteMenu` a boolean and `site-notices.tsx` no longer draws the offer at all.

   ONE MORE READ BESIDE THE PROJECTS TALLY: the caller's OPEN `site_health` notification rows, taken
   once for the whole list and joined in memory the way `projectCounts` already is. `sites.health`
   is the STATE; the notification is the record of the transition, and its `data.reason` and
   `created_at` are where the unhealthy card's caption comes from — which is why this story added no
   column to `sites` and needed no migration (`server/site-health.ts` carries that argument).

   `?health=` READS EXACTLY AS `?recheck=`, `?disconnect=` AND `?moved=` DO, so one card owns a
   check that could not be finished and no other claims it. */

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
  /* STORY 3.7: the connection's own two columns. Both are server-asserted (AD-7) and read here
     only to draw with — `health` is the state and `last_checked_at` is the stamp the check writes. */
  health: 'healthy' | 'unhealthy' | null
  last_checked_at: string | null
  site_settings: (NonNullable<NoticeSite['site_settings']> & { public_url?: string }) | null
}

export default async function Sites({
  searchParams,
}: {
  // A repeated key (`?q=a&q=b`) arrives as an ARRAY; `filterSites` takes the first, as the
  // dashboard's own filter does. `recheck` is B15's own: `recheckPlan` redirects here with the
  // ID OF THE SITE whose re-run probe could not reach Ghost, so that card is unchanged and says
  // why — and no other card claims a failure that was not its own.
  // `disconnect` is Story 3.5's own, and the same shape: `disconnectSite` redirects here with the
  // ID OF THE SITE it could not let go, so that one card says why and no other claims it.
  // `health` is Story 3.7's, and the same shape again: `recheckConnection` redirects here with the
  // ID OF THE SITE whose check could not be FINISHED — never one whose check answered "Ghost
  // refused this key", which is a badge and not a failure — so that card says so and no other does.
  // `moved` is Story 3.6's, and the same shape again: a connect whose Admin key matches a record
  // this caller already has is FR-C8's domain move, and `connectSite` redirects here naming the
  // NEW site — so the hint lands on the one card it is about.
  // `manage` and `brand` ARE THE TWO PANELS THIS ROUTE CAN DRAW OVER ITSELF, and `keys`, `status`,
  // `test` and `failed` are what their own actions answer with — the owner's test of Story 3.6,
  // findings 2, 3 and 5. Each panel used to be an intercepted ROUTE, so the URL moved off `/sites`
  // when it opened and every answer afterwards was a navigation the interception did not survive;
  // as a parameter on this list the route never changes at all (`panel-modal.tsx` carries the
  // measurements). The panels read these themselves — this page passes the promise straight in.
  searchParams: Promise<{
    q?: string | string[]
    recheck?: string | string[]
    health?: string | string[]
    disconnect?: string | string[]
    moved?: string | string[]
    old?: string | string[]
    manage?: string | string[]
    brand?: string | string[]
    keys?: string | string[]
    status?: string | string[]
    test?: string | string[]
    failed?: string | string[]
  }>
}) {
  const [{ q, recheck, health, disconnect, moved, old, manage, brand }, user] = await Promise.all([
    searchParams,
    currentUser(),
  ])
  // The layout's guard has already redirected anyone without one; this is the type narrowing.
  if (!user) return null

  const supabase = await supabaseServer()
  // THE PLAN IS READ, READ-ONLY, exactly as the dashboard reads it for S3c's upgrade tile: S11c's
  // ghost slot is the same decision one row down the plan table (`lib/plan.ts`).
  const [{ data, error }, { data: projects, error: projectsError }, { data: notices, error: noticesError }, { plan }] =
    await Promise.all([
      supabase
        .from('sites')
        .select(
          'id, title, url, ghost_version, site_settings, settings_read_at, health, last_checked_at, capability, capability_source, code_injection_notice_shown_at',
        )
        .is('disconnected_at', null)
        .order('created_at', { ascending: false }),
      // FR-B5: at most one site per project, so the card's "n projects" is a tally of this column.
      supabase.from('projects').select('linked_site_id'),
      /* STORY 3.7 — THE OPEN `site_health` ROWS, ONE READ FOR THE WHOLE LIST. `sites.health` says
         WHETHER a connection needs attention; this says WHY and SINCE WHEN, which is the record of
         the transition AD-25 requires this epic to write anyway — so the card's caption costs one
         read per render rather than two columns and an R-99 Schema phase (`server/site-health.ts`
         makes that argument in full). Through the CALLER'S OWN SESSION, so
         `notifications_owner_read` scopes it: a card can never draw a reason written for somebody
         else's account. `resolved_at is null` is what makes a fixed connection stop explaining
         itself. */
      supabase
        .from('notifications')
        .select('data, created_at')
        .eq('kind', 'site_health')
        .is('resolved_at', null)
        .order('created_at', { ascending: false }),
      resolveEntitlement(user.id),
    ])

  const sites: Row[] = data ?? []
  // A FAILED READ IS NOT AN EMPTY ACCOUNT — the dashboard's own finding (review, 2026-09-05):
  // `data ?? []` would show someone with a connected site the first-run empty screen instead.
  const unread = Boolean(error)
  // A failed tally is no tally: the pill is absent rather than stating "0 projects" as a fact
  // (review, 2026-09-08). Logged without the id: logs carry no user content.
  if (projectsError) console.error('sites: projects read failed', { code: projectsError.code })
  const linked = projectCounts(projects ?? [])
  /* A FAILED NOTICE READ IS NOT A SITE WITH NO REASON, and it is not a reason to fail the list
     either: `sites.health` is the state and it came out of its own read, so an unhealthy card still
     wears its badge and simply says nothing under it. Logged without an id — logs carry no user
     content (the rule this file's projects tally already follows). */
  if (noticesError) console.error('sites: health notices read failed', { code: noticesError.code })
  const openNotices = openHealthNotices(notices)

  const { query, shown } = filterSites(sites, q)
  // B15's own: `recheckPlan` redirects here when the re-run probe could not reach Ghost, and it
  // names the SITE it failed for — the banner belongs to one card, not to the page, and a success
  // redirects without the parameter so it cannot outlive the failure it describes (review).
  const recheckedId = Array.isArray(recheck) ? recheck[0] : recheck
  const healthFailedId = Array.isArray(health) ? health[0] : health
  const disconnectedId = Array.isArray(disconnect) ? disconnect[0] : disconnect
  const movedId = Array.isArray(moved) ? moved[0] : moved
  // `?old=live` — the record this connect matched is STILL CONNECTED, so there is no orphan and no
  // 90-day clock to name (the clock is derived from `disconnected_at`, DW-43). Anything else takes
  // the orphan sentence, which is the safe default: it is the state a domain move actually leaves.
  const movedOld = Array.isArray(old) ? old[0] : old
  // THE ACTIVE SITES ARE WHAT THE CAP COUNTS — the read above already filters `disconnected_at`
  // out, which is the same rule the connect action enforces: a record Inflozo kept is not a site.
  // Free only, as S3c's tile is: on Pro at ten there is nothing further to sell (the dashboard's
  // own rule), so there is nothing to draw.
  const ghostSlot = plan === 'free' && atSiteCap(plan, sites.length)

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
                // STORY 3.7. `null` cannot happen — the column is `not null default 'healthy'`
                // (schema `:162`) — but the row is typed off a `select` and a healthy default is
                // the honest reading of a value nobody wrote.
                const unhealthy = site.health === 'unhealthy'
                const notice = unhealthy ? openNotices.get(site.id) : undefined
                return (
                  <article
                    key={site.id}
                    // `group` IS WHAT THE STATE LINE'S `:has()` HANGS OFF (see the two spans
                    // below): the ⋯ popover is a DOM descendant of this element even while it is
                    // rendered in the top layer, so `group-has-[…]` reaches the submit inside it.
                    className="group flex flex-col gap-[14px] rounded border border-line bg-surface p-[18px] shadow-sm transition-shadow hover:shadow-md"
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
                      {/* DW-57: THE ⋯ GOES HERE — the header row's `margin-left:auto` slot, level
                          with the site's name, where the frame draws it (`S11 Sites.dc.html:68`).
                          Nothing joins the pills' line and nothing joins the state line. */}
                      <div className="ml-auto shrink-0">
                        {/* STORY 3.7: the ⋯ draws "Use this site's brand" only where there is a
                            brand to offer — absent, never greyed (UX-DR3). `hasBrand` is the same
                            reader Story 3.4's link used, so the row appears in exactly the cases
                            the link did. */}
                        <SiteMenu id={site.id} name={title} brand={hasBrand(site.site_settings?.brand)} />
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
                        pill with a hairline and a 6px sky dot (`B15:1189-1192`).

                        STORY 3.7 MADE IT THREE STATES AND ADDED NOTHING ELSE TO THE CARD. The
                        frame draws two — mint `Connected` (`:70`) and marigold `Reconnect needed`
                        (`:94`) — and the third is the owner's, from 2026-09-10: while a check is
                        in flight the line reads **Checking…** beside an amber dot that pulses.

                        **AND IT COSTS NO CLIENT COMPONENT.** The Kit's busy behaviour already puts
                        `aria-busy="true"` on a submitting control, and the ⋯ menu's Re-check row
                        carries `data-recheck` beside it (`site-menu.tsx`), so this line SELECTS on
                        the press rather than being told about it: `group-has-[…]` hides the settled
                        state and shows the checking one. No state, no context, no card-wide client
                        boundary — and the scripts-off behaviour falls out for free, because with no
                        script there is no `aria-busy`, no swap, and the click is a document
                        navigation the browser reports itself.
                        ponytail: `:has()` off the submit's own aria-busy; a client card component
                        the day two controls need to disagree about what "busy" means. */}
                    <div className="mt-auto flex flex-col gap-[3px]">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-[5px] text-control-label font-medium group-has-[[data-recheck][aria-busy=true]]:hidden">
                          {unhealthy ? (
                            <span className="inline-flex items-center gap-[5px] text-marigold-text">
                              <span aria-hidden className="size-[7px] rounded-full bg-marigold" />
                              {HEALTH.unhealthy}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-[5px] text-mint-text">
                              <span aria-hidden className="size-[7px] rounded-full bg-mint" />
                              {HEALTH.connected}
                            </span>
                          )}
                        </span>
                        {/* THE CHECKING STATE, hidden until the ⋯'s own submit says it is busy.
                            `role="status"` so a reader is told the check started without the focus
                            leaving the row that started it. */}
                        <span
                          role="status"
                          className="hidden items-center gap-[5px] text-control-label font-medium text-marigold-text group-has-[[data-recheck][aria-busy=true]]:inline-flex"
                        >
                          <span
                            aria-hidden
                            className="size-[7px] animate-health-pulse rounded-full bg-marigold"
                          />
                          {HEALTH.checking}
                        </span>
                        {site.capability === 'preview_only' ? (
                          <span className="inline-flex items-center gap-[6px] rounded-pill border border-line bg-surface px-[9px] py-[2px] text-[11.5px] font-semibold text-ink">
                            <span aria-hidden className="size-[6px] rounded-full bg-sky" />
                            {PREVIEW_COPY.chip}
                          </span>
                        ) : null}
                      </span>
                      {/* `last_checked_at` FIRST, `settings_read_at` BEHIND IT. The health check is
                          what the customer just pressed and what runs daily, so its stamp is the
                          one "Checked just now" is about; a site connected before this story has
                          none, and connect's own settings read is then the honest answer rather
                          than "Not checked yet" about a site that was read at connect. */}
                      <span className="text-helper-caption text-ink-soft">
                        {checkedLabel(site.last_checked_at ?? site.settings_read_at, now)}
                      </span>
                      {/* THE FRAME'S OWN CAPTION AND ITS OWN BUTTON (`:99-100`) — "Key regenerated
                          Aug 15" beside an outline **Reconnect**, drawn only on an unhealthy card
                          where it can act (UX-DR3). The reason and the date come from the OPEN
                          `site_health` notification row, not from a column: the reason is the one
                          table's (`HEALTH_REASONS`), the date is `deadlineLabel`'s, and `HEALTH
                          .reason` is the wrapper — so no number and no date format lives in the
                          copy (standing rule 4).

                          **Reconnect** IS A `PanelLink`, EXACTLY AS THE ⋯'S Manage API keys ROW IS:
                          a plain click opens the Manage keys WINDOW over this list and a modified
                          or scripts-off click takes the full page, and it already carries its own
                          busy state (R-98). This is EXPERIENCE.md's promised second entry point
                          into that panel, and the first thing that has ever reached it besides the
                          ⋯ menu. A row that could not be read leaves the caption absent and the
                          button standing: the button is the recovery and does not depend on knowing
                          why. */}
                      {unhealthy ? (
                        <span className="mt-[7px] flex flex-wrap items-center gap-[10px]">
                          <PanelLink
                            href={keysPath(site.id)}
                            panel={keysPopupPath(site.id)}
                            busy={HEALTH.reconnectBusy}
                            className={`inline-flex h-8 items-center gap-[6px] rounded-thumb border border-coral bg-surface px-[14px] text-control-label font-semibold text-coral-text transition-colors hover:bg-coral-tint ${ring}`}
                          >
                            <Refresh size={12} strokeWidth={1.8} />
                            {HEALTH.reconnect}
                          </PanelLink>
                          {notice ? (
                            <span className="text-helper-caption text-ink-soft">
                              {HEALTH.reason(
                                notice.reason && notice.reason in HEALTH_REASONS
                                  ? HEALTH_REASONS[notice.reason as HealthReason]
                                  : HEALTH.emailUnknown,
                                deadlineLabel(notice.at),
                              )}
                            </span>
                          ) : null}
                        </span>
                      ) : null}
                    </div>
                    {/* The one card that could not be let go says so — `?disconnect=<id>` names it,
                        as `?recheck=` already does, and the sentence is the app's own table's. */}
                    {disconnectedId === site.id ? (
                      <Banner kind="error">{connectMessage('disconnect_failed')}</Banner>
                    ) : null}
                    {/* STORY 3.7: the one card whose check could not be FINISHED says so, and the
                        card's badge is unchanged — a check that did not run decides nothing
                        (`server/site-health.ts`'s `health: null`). */}
                    {healthFailedId === site.id ? <Banner kind="error">{HEALTH.failed}</Banner> : null}
                    {/* FR-C8's "Moved domains?" — INFO and not a warning: nothing is wrong, the
                        customer has connected the same Ghost at a new address and there are two
                        things to do about it. The days come from `ORPHAN_SNAPSHOT_DAYS`, so the
                        sentence in `KEYS` still names no number (standing rule 4). */}
                    {movedId === site.id ? (
                      <Banner kind="info">
                        {movedOld === 'live' ? KEYS.movedStillConnected : KEYS.movedDomains(ORPHAN_SNAPSHOT_DAYS)}
                      </Banner>
                    ) : null}
                    <SiteNotices site={site} recheckFailed={recheckedId === site.id} />
                  </article>
                )
              })}

              {/* S11c: the grid's NEXT CELL after the cards, at the Free cap. The grid stretches
                  it to the cards' own height, so it needs no min-height of its own; the dashed
                  `line-strong` border goes marigold on hover, as S3c's tile does. Every word of it
                  is derived — `siteCapSentence` and `goProLabel` from `lib/plan.ts` — so a change
                  to Appendix F.1 moves the slot, the pill and the connect action's banner together
                  (standing rule 4). */}
              {ghostSlot ? (
                <Link
                  href="/billing"
                  className={`flex flex-col items-center justify-center gap-2 rounded border-[1.5px] border-dashed border-line-strong p-5 transition-colors hover:border-marigold ${ring}`}
                >
                  <span aria-hidden className="text-[18px] text-marigold-text">
                    ✦
                  </span>
                  {/* S11c's OWN sizes, not S3c's — 13/12/12 against the dashboard tile's 14/13/13
                      (`S11 Sites.dc.html:181-184`). The two tiles are drawn on two frames and the
                      export decides each (R-74); everything else here is S3c's, one row down. */}
                  <span className="text-ui-dense font-semibold text-ink">Upgrade to connect more</span>
                  <span className="max-w-[200px] text-center text-control-label leading-[1.5] text-ink-soft">
                    {siteCapSentence(plan)}
                  </span>
                  <span className="mt-[2px] rounded-pill bg-marigold-tint px-[12px] py-[5px] text-control-label font-semibold text-marigold-text">
                    {goProLabel()}
                  </span>
                </Link>
              ) : null}
            </div>
          )}
        </div>
      )}
      {/* THE TWO PANELS THIS LIST CAN DRAW OVER ITSELF (the owner's test of Story 3.6, findings
          2, 3 and 5). Each is drawn ONLY while its parameter is there, so leaving unmounts it and
          there is no state to keep in step with the URL; each reads its own site id and its own
          answer out of the same search params this page was given, so the popup and the full page
          are one component with one read either way (`keys-screen.tsx`, `brand-screen.tsx`).

          `<Suspense>` INSIDE THE WINDOW AND NOT AROUND IT: `PanelModal` opens the `<dialog>` on
          mount, so it has to sit above the boundary — a dialog rendered by both the fallback and
          the panel would unmount and remount as the panel arrived, and the window would open,
          close and open again in front of the customer. The list itself never waits for either.

          THE CREDENTIAL READ IS STILL TAKEN ONCE AND ONLY WHEN THE PANEL IS OPENED. That was the
          cost the Dev pass rejected a card-rendered dialog for — one pooler round trip per card on
          the busiest route in the app — and a parameter on the route costs none of it: with no
          `?manage=` there is nothing here to render at all. */}
      {manage ? (
        <PanelModal labelledBy={KEYS_TITLE_ID}>
          <Suspense fallback={<KeysSkeleton />}>
            <KeysScreen searchParams={searchParams} popup />
          </Suspense>
        </PanelModal>
      ) : null}
      {/* `else if`: a URL carrying both parameters draws ONE window, not two stacked
          `showModal()`s racing to close (review 7, 2026-09-10). Manage keys wins by position. */}
      {!manage && brand ? (
        <PanelModal labelledBy={BRAND_TITLE_ID}>
          <Suspense fallback={<BrandPanelSkeleton />}>
            <BrandScreen searchParams={searchParams} popup />
          </Suspense>
        </PanelModal>
      ) : null}
      {/* KEYED ON THE NUMBER OF CARDS. A connect made from the sheet redirects to this same route,
          which re-renders in place — so the sheet stayed open over the new card with the keys
          still in its fields. One more card remounts it closed (review, 2026-09-08);
          `connect-dialog.tsx` says the same from its side. The opener is in the shell's top bar
          and on the empty screen; this is the one sheet both of them open. */}
      <ConnectSiteDialog key={sites.length} />
    </>
  )
}
