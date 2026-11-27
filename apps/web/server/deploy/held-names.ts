import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * STORY 7.24 — THE NAMES ALREADY HELD ON ONE GHOST, the `held` that `themeNameFor` (`lib/deploy.ts`) suffixes past (FR-J10).
 *
 * BY THE SITE'S ADDRESS, NOT ITS RECORD. Ghost's theme names live on the Ghost, not in an Inflozo account. Within one account
 * a collision cannot happen — slugs are unique per account (DW-24) — so a read per site record would never find one. Two
 * accounts connected to one Ghost (an agency and its client; the owner's test accounts on T1) each hold their own site record
 * with the same normalised `url`, and without this read the second account's upload would replace the first's theme, live
 * included (R-264). So: every binding, in any account, to any site record at the linked site's address — disconnected records
 * included, since their themes are still on the Ghost — except this project's own.
 *
 * NOT GHOST'S OWN LIST. The staff token lifts `GET /themes/` (VERIFY 9), but reading it would only change the answer for a theme
 * named `inflozo-{slug}` that no Inflozo binding claims — almost always this customer's own (a ZIP export uploaded by hand, or a
 * deleted project's theme). Replacing that is right; suffixing would leave an orphan beside it, the thing FR-J10 prevents. It
 * would also cost a Ghost call on every editor load and work only where a token is stored. D1a naming the exact theme is the
 * safeguard for it (the epic's criterion).
 *
 * THE SERVICE ROLE, SCOPED: the first query is the caller's own site (`user_id`), and nothing is read unless it is; the answer is
 * the names alone — never an id, an account or a project. Anyone who can connect the site holds its Admin key and already sees
 * those themes in Ghost Admin. `heldNames` (`held-names-io.ts`) is this over `supabaseAdmin()`, for the editor's read; Pre-flight
 * hands its own client (`project-input.ts`). A failed query throws, marked as infrastructure for `run.ts`' retry (AD-20).
 */
export async function heldNamesIn(db: SupabaseClient, a: { siteId: string; userId: string; projectId: string }): Promise<string[]> {
  const site = must(await db.from('sites').select('url').eq('id', a.siteId).eq('user_id', a.userId).maybeSingle(), 'the site') as { url?: unknown } | null
  if (typeof site?.url !== 'string' || site.url === '') return []
  const records = (must(await db.from('sites').select('id').eq('url', site.url), 'the sites at its address') ?? []) as { id: string }[]
  if (records.length === 0) return []
  const bindings = (must(await db.from('project_site_bindings').select('theme_name').in('site_id', records.map((r) => r.id)).neq('project_id', a.projectId), 'the names held there') ?? []) as { theme_name: string }[]
  // deduped and sorted, so the staleness hash Pre-flight writes reads the same set alike
  return [...new Set(bindings.map((b) => b.theme_name))].sort()
}

function must<T>(answer: { data: T; error: { code?: string } | null }, what: string): T {
  if (answer.error) throw Object.assign(new Error(`deploy: ${what} could not be read (${answer.error.code ?? 'error'})`), { infra: true })
  return answer.data
}
