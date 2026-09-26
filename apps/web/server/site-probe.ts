import { versionVerdict } from '@/lib/connect-rule'
import { ghostProPreviewProbe } from '@/lib/flags'
import { capabilityOf, membersOf, probePatch, settingsOf, settingsReadable, type Members } from '@/lib/probe-rule'
import { supabaseAdmin } from '@/lib/supabase/server'
import { call } from '@/server/ghost-admin'

/**
 * FR-C2's FOUR PROBES, ON THE WIRE — Story 3.3, and the Admin chokepoint's first caller that uses
 * a STORED key.
 *
 * IT RUNS ON `call()`, NEVER ON THE KEY IN HAND, AND THAT IS THE POINT. At connect the Admin key
 * is a variable two lines away and `fetchWithKey` would save a decryption; **Re-check plan** and
 * Story 3.7's cron have no typed key and must run the identical probe. One function, three
 * callers, one audit shape — a second code path is how "the daily check re-runs the connect probe"
 * quietly becomes false. It also gives DW-54's decrypt path its first product caller, which is the
 * difference between `call()` being tested and `call()` being used: two GETs, each preceded by a
 * `vault_decrypt` row and each leaving its own `admin_read` row (`ghost-admin/index.ts:181-203`).
 * ponytail: one extra config/ read at connect so connect, Re-check and the cron are the same call.
 *
 * DW-63 CLOSED HERE, BY STORY 3.7, AND IT IS ONE CLAUSE. This function used to copy whatever
 * `version` Ghost reported straight onto the row, with none of connect's floor applied — so a site
 * downgraded to Ghost 4 would have had `4.x` stored and `majorOf` would then have pinned
 * `Accept-Version: v4.0` on every later call, talking a dialect the product does not support. The
 * floor is `versionVerdict` in `lib/connect-rule.ts` — connect's own rule, CALLED and not restated
 * — and a version it refuses is REPORTED to the caller and not written: `checkSite` turns it into
 * FR-C5's "Reconnect needed" with its own reason, which is the surface DW-63 was waiting for, and
 * the stored version stays a major the chokepoint can still talk to.
 *
 * A PROBE FAILURE IS NOT A CONNECT FAILURE. `config/` has already passed with the typed key by the
 * time this runs, so a site whose probe throws is a CONNECTED site: `capability` stays `full`,
 * `settings_read_at` is left where it was, a code is logged with no value, and the caller is told
 * in a string it may log. Nothing in here throws to its caller.
 *
 * THE WRITE IS THE SERVER'S. `authenticated` may update only `(title, favicon_url, updated_at)` on
 * `sites` (schema :1198) — `capability`, `capability_source`, `site_settings` and `settings_read_at`
 * are all server-asserted by AD-7 — so this file joins the `supabaseAdmin()` importer list in
 * `server-wiring.test.ts` as well as the chokepoint's.
 */

/** What each probe reads. `settings/` is a browse over ~100 rows; both are GETs, so no allowlist. */
const PATHS = { config: 'config/', settings: 'settings/' } as const

export interface ProbeSummary {
  ok: boolean
  /** For the caller's log line: a code, never a value. */
  code?: string
  capability?: string
  code_injection?: boolean
  /**
   * WHAT GHOST REPORTED, whether or not it was stored (DW-63). `checkSite` applies FR-C5's health
   * verdict to it, so the re-detected version has to leave here even when the floor refused it —
   * the alternative was a second `config/` read one level up, which is the second code path this
   * function's whole header argues against.
   */
  version?: string
}

export async function probeSite(args: {
  siteId: string
  userId: string
  route: string
}): Promise<ProbeSummary> {
  try {
    const admin = supabaseAdmin()
    // THE MERGE IS READ-THEN-WRITE, so `public_url` — which Story 3.2 wrote and nothing here
    // knows — survives. supabase-js speaks PostgREST and PostgREST has no `||` for jsonb.
    // ponytail: a read and a write; one `update … set site_settings = site_settings || …` inside
    // server/ghost-admin if the pair ever races something other than its own caller.
    const { data: before, error: readError } = await admin
      .from('sites')
      // `capability_source` comes back with it because `probePatch` needs to know whether the user
      // has already ANSWERED the plan question, so a re-probe does not ask it again (review).
      .select('site_settings, capability_source')
      .eq('id', args.siteId)
      .eq('user_id', args.userId)
      .maybeSingle<{
        site_settings: Record<string, unknown> | null
        capability_source: string | null
      }>()
    if (readError || !before) {
      console.error('sites: probe read failed', { code: readError?.code ?? 'site_not_found' })
      return { ok: false, code: readError?.code ?? 'site_not_found' }
    }

    // Two calls, each its own `vault_decrypt` + `admin_read` pair. Both carry `Accept-Version`,
    // which `call()` pins from the row's stored `ghost_version` — executed against T1 6.58.0 and
    // T3 5.130.6 on 2026-09-08: both answer 200 to `config/` AND `settings/` with the header and
    // with the integration key alone (§39).
    const config = await call({ siteId: args.siteId, path: PATHS.config, route: args.route })
    // SEQUENTIAL AND SHORT-CIRCUITED: a `config/` that Ghost refused is a probe that has already
    // failed, and asking `settings/` anyway spent a second decryption, a second round trip and a
    // second `admin_read error` row to learn the same thing twice (review, 2026-09-08).
    if (!config.ok) {
      console.error('sites: probe refused', { code: config.code })
      return { ok: false, code: config.code }
    }
    const settingsResponse = await call({ siteId: args.siteId, path: PATHS.settings, route: args.route })
    if (!settingsResponse.ok) {
      console.error('sites: probe refused', { code: settingsResponse.code })
      return { ok: false, code: settingsResponse.code }
    }
    // A 200 THAT IS NOT THE BROWSE SHAPE IS NOT A READ. Writing from it would flatten to `{}` and
    // quietly wipe `code_injection`, Portal and the announcement, then stamp `settings_read_at` to
    // say it had all just been checked (review, 2026-09-08).
    if (!settingsReadable(settingsResponse.body)) {
      console.error('sites: probe unreadable', { code: 'settings_unreadable' })
      return { ok: false, code: 'settings_unreadable' }
    }

    const body = (config.body as { config?: { version?: unknown; hostSettings?: unknown } })?.config
    const version = typeof body?.version === 'string' ? body.version : undefined
    // A payload whose `config` could not be read is not a self-hosted site — `undefined` would
    // claim "no hostSettings" about a body nobody parsed. `verdict` stays null and both capability
    // columns keep what they had.
    const verdict = body ? capabilityOf(body.hostSettings, await ghostProPreviewProbe()) : null

    // THE WHOLE MAPPING IS PURE AND LIVES IN `probe-rule.ts`, where `node --test` can reach the
    // two verdicts no live Ghost can produce. `site_settings` GAINS keys and loses none:
    // `public_url` and anything a later story put here is spread through untouched.
    const previous = (before.site_settings ?? {}) as Record<string, unknown>
    const patch = probePatch({
      previous,
      previousSource: before.capability_source,
      settings: settingsOf(settingsResponse.body),
      verdict,
    })
    const { site_settings } = patch
    const injection = site_settings.code_injection === true

    // DW-63: THE FLOOR DECIDES WHETHER THE VERSION IS STORED, and it is connect's own.
    const floor = versionVerdict(version)
    const { error: writeError } = await admin
      .from('sites')
      .update({
        ...(version && floor.ok ? { ghost_version: version } : {}),
        ...(patch.capability ? { capability: patch.capability, capability_source: patch.capability_source } : {}),
        site_settings,
        // Stamped WITH the read it names: "Checked just now" may only be said about a read that
        // happened (Story 3.2's own finding).
        settings_read_at: new Date().toISOString(),
      })
      .eq('id', args.siteId)
      .eq('user_id', args.userId)
    if (writeError) {
      console.error('sites: probe write failed', { code: writeError.code })
      return { ok: false, code: writeError.code }
    }

    return {
      ok: true,
      capability: patch.capability ?? 'unchanged',
      code_injection: injection,
      ...(version ? { version } : {}),
    }
  } catch (thrown) {
    // A THROWN PROBE LEAVES A CONNECTED SITE. `AdminError` carries a code; anything else carries a
    // name — and neither carries a value (spine, Security floor).
    const e = (thrown ?? {}) as { code?: string; name?: string }
    console.error('sites: probe threw', { code: e.code ?? e.name })
    return { ok: false, code: e.code ?? e.name }
  }
}

/**
 * STORY 5.20 — THE EDITOR'S RE-CHECK OF THE MEMBER SWITCHES (FR-H6, C3b): ONE Admin `settings/` read through `call()`,
 * its two member keys written to `site_settings.members`, and the record handed back. The Paywall canvas's **Re-check**
 * and its background re-check on open are its callers (`(editor)/actions.ts`'s `recheckMembers`).
 *
 * WHY NOT `probeSite`: that is FOUR facts and two reads, stamped `settings_read_at` as a whole — "Checked just now" about
 * the code injection, Portal, the announcement and the brand, none of which this press re-reads. So it writes the ONE
 * field it read, merged into what is there (the same read-then-write `probeSite` makes, for the same PostgREST reason),
 * and leaves the stamp alone. AD-10 holds: an Admin read on the server, never a Content read through a route.
 *
 * Null for every way it can fail — Ghost refused or did not answer, a payload that is not the browse shape or does not
 * carry both keys, a write that failed — and a code is logged with no value, as `probeSite` logs. Nothing is written
 * then: the record stays what the last reading made it.
 *
 * THE SITE MUST BE THE CALLER'S BEFORE GHOST IS ASKED. `call()` decrypts whatever site id it is handed, and the id comes
 * from `projects.linked_site_id`, which `authenticated` may write and whose foreign key checks only that the site exists
 * — so the row is read by id AND `user_id` first, and a site that is not this user's is refused with no key decrypted
 * and no request made.
 */
export async function readMembers(args: { siteId: string; userId: string; route: string }): Promise<Members | null> {
  try {
    const admin = supabaseAdmin()
    const { data: owned, error: ownError } = await admin
      .from('sites')
      .select('id')
      .eq('id', args.siteId)
      .eq('user_id', args.userId)
      .maybeSingle()
    if (ownError || !owned) {
      console.error('sites: members re-check refused a site', { code: ownError?.code ?? 'site_not_found' })
      return null
    }
    const response = await call({ siteId: args.siteId, path: PATHS.settings, route: args.route })
    if (!response.ok) {
      console.error('sites: members re-check refused', { code: response.code })
      return null
    }
    const members = settingsReadable(response.body) ? membersOf(settingsOf(response.body)) : null
    if (members === null) {
      console.error('sites: members re-check unreadable', { code: 'members_unreadable' })
      return null
    }
    const { data: before, error: readError } = await admin
      .from('sites')
      .select('site_settings')
      .eq('id', args.siteId)
      .eq('user_id', args.userId)
      .maybeSingle<{ site_settings: Record<string, unknown> | null }>()
    if (readError || !before) {
      console.error('sites: members re-check read failed', { code: readError?.code ?? 'site_not_found' })
      return null
    }
    const { error: writeError } = await admin
      .from('sites')
      .update({ site_settings: { ...(before.site_settings ?? {}), members } })
      .eq('id', args.siteId)
      .eq('user_id', args.userId)
    if (writeError) {
      console.error('sites: members re-check write failed', { code: writeError.code })
      return null
    }
    return members
  } catch (thrown) {
    const e = (thrown ?? {}) as { code?: string; name?: string }
    console.error('sites: members re-check threw', { code: e.code ?? e.name })
    return null
  }
}
