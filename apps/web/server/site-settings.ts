import type { SupabaseClient } from '@supabase/supabase-js'
import { settingsOf, settingsPatch, settingsReadable, storedMembers, storedSurfaces, type Members, type Surfaces } from '../lib/probe-rule.ts'

/**
 * STORY 5.24b — THE ONE WRITER OF `sites.site_settings` AND `sites.credentials_present` (DW-65, DW-271, DW-84's second
 * half), and the executed ownership refusal of the editor's re-read (DW-272).
 *
 * EVERY WRITER USED TO READ, SPREAD AND WRITE THE WHOLE JSONB BACK, so two writers landing between each other's read and
 * write lost one's keys: the daily check and a Re-check, the Paywall's re-read on open, the two notice answers, connect's
 * own read of `site/`, and the Content key's save racing a key stored from another tab. PostgREST has no `||` for jsonb,
 * and the ledger refused a second SQL path for an ordinary settings write (all SQL goes through `server/ghost-admin/`,
 * whose point is that it is the one place a credential is decrypted). So this is COMPARE-AND-SET over the client the
 * writers already hold: the write is conditional on the row's `updated_at` still being the one that was read, and a write
 * that matched nothing re-reads and re-patches.
 *
 * `updated_at` IS THE VERSION AND NO COLUMN WAS ADDED. `sites_touch` sets it to the writing transaction's `now()` on every
 * update (SCHEMA.sql §10c), so any write in between — this module's, `store()`'s and `remove()`'s SQL merges, the
 * disconnect stamp — moves it, and the conditional write then matches no row. postgrest-js encodes the `+00:00` the read
 * hands back (`@supabase/postgrest-js` 2.115.0), so the value round-trips as the exact microsecond it was.
 * ponytail: two writes whose transactions START in the same microsecond share an `updated_at` and look like one; a
 * `version` column bumped by the trigger is the upgrade if that is ever observed.
 *
 * RELATIVE IMPORTS AND `import type` ONLY, so `node --test` loads this file (`site-settings.test.ts`): `site-probe.ts`
 * imports `@/lib` and the chokepoint, and cannot be loaded outside Next. The Supabase client and the chokepoint's `call`
 * are therefore HANDED IN — the shape `purge-rule.ts`'s `PurgeDeps` set for Story 2.6.
 *
 * NAMED EXCEPTIONS, and `server-wiring.test.ts` holds them to exactly these: connect's insert and its re-adopt write a
 * whole connection, and a failed store puts a kept record back as it was (`storeOrUndo`) — each a whole record by design,
 * never a merge. `store()` and `remove()` write `credentials_present` as ONE SQL statement (`credentials_present || …`),
 * which is atomic and needs no version.
 */

/** What every patch is decided from: the row as it stands, with the version it will be written against. */
export type SiteRow = {
  site_settings: Record<string, unknown> | null
  credentials_present: Record<string, boolean> | null
  capability_source: string | null
  disconnected_at: string | null
  updated_at: string
}

/** The columns to write, from the row as read — or null to refuse, which writes nothing. Called again on every retry. */
export type Patch = (row: SiteRow) => Record<string, unknown> | null

export type Patched = { ok: true; written: Record<string, unknown> } | { ok: false; code: string }

const READ = 'site_settings, credentials_present, capability_source, disconnected_at, updated_at'

/** What each probe reads, spelled once for both files (review, 2026-09-29). `settings/` is a browse over ~100 rows; both are GETs, so no allowlist. */
export const ADMIN_PATHS = { config: 'config/', settings: 'settings/' } as const

/** Three tries in all: a writer that loses three times running is not racing one other writer, it is starved. */
export const TRIES = 3

/**
 * READ, PATCH, WRITE IF UNCHANGED — up to `TRIES` times. The row is the caller's own or it is no row: BOTH the read and
 * the write carry `.eq('user_id', …)`, because ownership belongs beside the write and not in the memory of each caller
 * (`remove()`'s rule in the chokepoint), and every writer this replaced carried that clause on its own write.
 *
 * Codes, never values: `no_such_site` (not the caller's, or gone), `refused` (the patch said no), `contended` (three
 * writes in a row lost their race — nothing written, and logged here, the one outcome no single caller can see coming),
 * or the read's or the write's own PostgREST code. Every caller logs what it gets back, with its own label.
 */
export async function patchSite(admin: SupabaseClient, at: { siteId: string; userId: string }, patch: Patch): Promise<Patched> {
  for (let tried = 0; tried < TRIES; tried++) {
    const { data: row, error: readError } = await admin
      .from('sites')
      .select(READ)
      .eq('id', at.siteId)
      .eq('user_id', at.userId)
      .maybeSingle<SiteRow>()
    if (readError) return { ok: false, code: readError.code ?? 'read_failed' }
    if (!row) return { ok: false, code: 'no_such_site' }
    const next = patch(row)
    if (!next) return { ok: false, code: 'refused' }
    // `.select('id')` SO A WRITE THAT MATCHED NO ROW IS NOT SILENCE: PostgREST answers it with no error and no rows, and
    // that is exactly the answer a lost race gives.
    const { data, error: writeError } = await admin
      .from('sites')
      .update(next)
      .eq('id', at.siteId)
      .eq('user_id', at.userId)
      .eq('updated_at', row.updated_at)
      .select('id')
    if (writeError) return { ok: false, code: writeError.code ?? 'write_failed' }
    if (data?.length) return { ok: true, written: next }
  }
  console.error('sites: settings write contended', { code: 'contended' })
  return { ok: false, code: 'contended' }
}

/**
 * THE CONTENT KEY'S SAVE (FR-C8, `saveKeys`). `credentials_present` is the client's mirror of what is stored, so it is
 * patched from the row as it stands NOW — a key `store()` put in from another tab since the screen was drawn survives —
 * and a record disconnected since is REFUSED: a disconnected record holds no credential of any kind (Story 3.5), and a
 * Content save racing Disconnect must not hand one back to it (the I/O matrix's row).
 */
export const contentKeyPatch =
  (contentKey: string): Patch =>
  (row) =>
    row.disconnected_at ? null : { content_key: contentKey, credentials_present: { ...(row.credentials_present ?? {}), content: true } }

/** The chokepoint's `call()`, as much of it as the re-read uses — handed in, so this file never imports the chokepoint. */
export type SettingsCall = (args: { siteId: string; path: string; route: string }) => Promise<{ ok: boolean; body: unknown; code?: string }>

/**
 * STORY 5.21's RE-READ OF THE SITE'S SETTINGS, MOVED HERE FROM `site-probe.ts` SO ITS OWNERSHIP REFUSAL EXECUTES (DW-272).
 * One Admin `settings/` read, every key that payload decides merged through `settingsPatch`, and the snapshot handed back
 * as stored. `site-probe.ts`'s `readSettings` is the wrapper that hands in `supabaseAdmin()` and the real `call`.
 *
 * THE SITE MUST BE THE CALLER'S BEFORE GHOST IS ASKED. `call()` decrypts whatever site id it is handed, and this id comes
 * from `projects.linked_site_id`, which `authenticated` may write and whose foreign key checks only that the site exists
 * — and the service role reads past RLS, so RLS is not the guard here. The owned read comes FIRST, and a site that is not
 * this user's is refused with no key decrypted and no request made; `site-settings.test.ts` executes that refusal, and
 * `server-wiring.test.ts` still reads the order out of the source.
 *
 * Null for every way it can fail, a code logged with no value, and nothing written then: the snapshot stays what the last
 * reading made it. A 200 that is not the browse shape is not a read (`probeSite`'s rule) — it would flatten to `{}` and
 * write every key's "could not read" over the snapshot.
 */
export async function rereadSettings(
  io: { admin: SupabaseClient; call: SettingsCall; route: string },
  userId: string,
  siteId: string,
): Promise<{ members: Members | null; surfaces: Surfaces } | null> {
  try {
    const { data: owned, error: ownError } = await io.admin
      .from('sites')
      .select('id')
      .eq('id', siteId)
      .eq('user_id', userId)
      .maybeSingle()
    if (ownError || !owned) {
      console.error('sites: settings re-read refused a site', { code: ownError?.code ?? 'site_not_found' })
      return null
    }
    const response = await io.call({ siteId, path: ADMIN_PATHS.settings, route: io.route })
    if (!response.ok) {
      console.error('sites: settings re-read refused', { code: response.code })
      return null
    }
    if (!settingsReadable(response.body)) {
      console.error('sites: settings re-read unreadable', { code: 'settings_unreadable' })
      return null
    }
    const settings = settingsOf(response.body)
    const written = await patchSite(io.admin, { siteId, userId }, (row) => ({ site_settings: settingsPatch(row.site_settings ?? {}, settings) }))
    if (!written.ok) {
      console.error('sites: settings re-read write failed', { code: written.code })
      return null
    }
    // AS STORED: the same re-checks `read.ts` makes on the way out, so the editor draws what the next open would
    const site_settings = written.written.site_settings
    return { members: storedMembers(site_settings), surfaces: storedSurfaces(site_settings) }
  } catch (thrown) {
    const e = (thrown ?? {}) as { code?: string; name?: string }
    console.error('sites: settings re-read threw', { code: e.code ?? e.name })
    return null
  }
}
