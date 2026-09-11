import { needsSiteCount, type FirstRunState } from '@/lib/first-run'
import { supabaseServer } from '@/lib/supabase/server'

/**
 * THE TWO COUNTS FIRST RUN IS DERIVED FROM, read through the caller's own session (Story 3.8).
 *
 * One reader for two layouts: `(dashboard)/layout.tsx` sends an account with nothing to `/start`,
 * and `start/layout.tsx` sends an account with anything back to `/` (review, 2026-09-11 — executed
 * on app.inflozo.com: a project made from the welcome screen's own Blank door left the customer
 * standing on the three doors, and a typed `/start` drew them over an account with work). Two
 * callers each restating the reads would be two deciders; this is the one, and `lib/first-run.ts`
 * is the rule it feeds.
 *
 * A FAILED READ IS NOT AN EMPTY ACCOUNT — the dashboard's own scar (`(dashboard)/page.tsx`). An
 * unread projects table is `unread`, an unread sites table is `null`, and both mean "render the
 * dashboard", the page that already works and says so in a red Banner.
 *
 * `head` and an exact count: no row crosses the wire. The sites filter is FR-C6's — a disconnected
 * record is a record Inflozo kept and is not a site — and it is the WHOLE filter because connect
 * writes a row only after the Admin key validated against the real Ghost, always with
 * `disconnected_at: null` (`sites/actions.ts`); there is no half-made site row to exclude.
 *
 * NOTHING IS REMEMBERED (the owner's Question 1 ruling, option 1, 2026-09-11): derived on every
 * render from these two counts — no column, no migration, no metadata key.
 */
export async function readFirstRun(hasQuery: boolean): Promise<FirstRunState> {
  const supabase = await supabaseServer()
  const { count, error } = await supabase.from('projects').select('id', { count: 'exact', head: true })
  const state = { unread: Boolean(error) || count === null, projects: count ?? 0, hasQuery }

  let sites: number | null = null
  if (needsSiteCount(state)) {
    const { count: connected, error: sitesError } = await supabase
      .from('sites')
      .select('id', { count: 'exact', head: true })
      .is('disconnected_at', null)
    // Logged without the id — logs carry no user content.
    if (sitesError) console.error('first-run: sites read failed', { code: sitesError.code })
    else sites = connected
  }
  return { ...state, sites }
}
