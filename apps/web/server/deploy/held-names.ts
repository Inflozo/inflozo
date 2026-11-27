import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * STORY 7.24 — THE NAMES ALREADY HELD ON ONE GHOST, the `held` that `themeNameFor` (`lib/deploy.ts`) suffixes past (FR-J10).
 *
 * BY THE SITE'S ADDRESS, NOT ITS RECORD. Ghost's theme names live on the Ghost, not in an Inflozo account. Slugs are unique per
 * account (DW-24), so a read per site record would almost never find a collision (only a suffixed name meeting a sibling's base,
 * which the user's own bindings here cover too). Two accounts connected to one Ghost (an agency and its client; the owner's test
 * accounts on T1) each hold their own site record with the same `url` — `normaliseSiteUrl`'s lowercased origin, so case and a
 * trailing path never split them — and without this read the second account's upload would replace the first's theme, live
 * included (R-264). So: every binding, in any account, to any site record at the linked site's address — disconnected records
 * included, since their themes are still on the Ghost — except this project's own. What it cannot see (the review, 2026-11-27):
 * one Ghost connected under two addresses (`http` and `https`, a `*.ghost.io` address and a custom domain) is two Ghosts here.
 * Story 7.25's per-site advisory lock (`server/site-lock.ts`) is keyed on the same address, and Ship it reads this under it — so
 * two accounts shipping one free name serialize, and the second reads the first's binding and is re-made under the next name.
 *
 * NOT GHOST'S OWN LIST. The staff token lifts `GET /themes/` (VERIFY 9), but reading it would only change the answer for a theme
 * named `inflozo-{slug}` that no Inflozo binding claims — almost always this customer's own (a ZIP export uploaded by hand, or a
 * deleted project's theme). Replacing that is right; suffixing would leave an orphan beside it, the thing FR-J10 prevents. It
 * would also cost a Ghost call on every editor load and work only where a token is stored. D1a naming the exact theme is the
 * safeguard for it (the epic's criterion).
 *
 * THE SERVICE ROLE, SCOPED: the first query is the caller's own CONNECTED site (`user_id`, `disconnected_at` null — the review,
 * 2026-11-27: the reason below holds only while the caller's key is connected), and nothing is read unless it is; the answer is
 * the names alone — never an id, an account or a project. Anyone who can connect the site holds its Admin key and already sees
 * those themes in Ghost Admin. `heldNames` (`held-names-io.ts`) is this over `supabaseAdmin()`, for the editor's read; Pre-flight
 * hands its own client (`project-input.ts`). A failed query throws, marked as infrastructure for `run.ts`' retry (AD-20).
 */
export async function heldNamesIn(db: SupabaseClient, a: { siteId: string; userId: string; projectId: string }): Promise<string[]> {
  const site = must(await db.from('sites').select('url').eq('id', a.siteId).eq('user_id', a.userId).is('disconnected_at', null).maybeSingle(), 'the site') as { url?: unknown } | null
  if (typeof site?.url !== 'string' || site.url === '') return []
  // ponytail: `sites.url` has no index — a scan of every account's sites per editor load and Pre-flight; add one when `sites`
  // outgrows a scan (no schema change in Story 7.24)
  const records = (must(await db.from('sites').select('id').eq('url', site.url), 'the sites at its address') ?? []) as { id: string }[]
  if (records.length === 0) return []
  const bindings = (must(await db.from('project_site_bindings').select('theme_name').in('site_id', records.map((r) => r.id)).neq('project_id', a.projectId), 'the names held there') ?? []) as { theme_name: string }[]
  // deduped and sorted: one answer for one set. (The staleness hash reads only the NAME the rule picks — `reads.themeName` in
  // `project-input.ts` — so a binding elsewhere on the Ghost that leaves the name alone never makes an artefact stale.)
  return [...new Set(bindings.map((b) => b.theme_name))].sort()
}

function must<T>(answer: { data: T; error: { code?: string } | null }, what: string): T {
  if (answer.error) throw Object.assign(new Error(`deploy: ${what} could not be read (${answer.error.code ?? 'error'})`), { infra: true })
  return answer.data
}
