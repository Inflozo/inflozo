import { ghostProPreviewProbe } from '@/lib/flags'
import {
  announcementOf,
  capabilityOf,
  injectionFlag,
  portalState,
  settingsOf,
} from '@/lib/probe-rule'
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
      .select('site_settings')
      .eq('id', args.siteId)
      .eq('user_id', args.userId)
      .maybeSingle<{ site_settings: Record<string, unknown> | null }>()
    if (readError || !before) {
      console.error('sites: probe read failed', { code: readError?.code ?? 'site_not_found' })
      return { ok: false, code: readError?.code ?? 'site_not_found' }
    }

    // Two calls, each its own `vault_decrypt` + `admin_read` pair. Both carry `Accept-Version`,
    // which `call()` pins from the row's stored `ghost_version` — executed against T1 6.58.0 and
    // T3 5.130.6 on 2026-09-08: both answer 200 to `config/` AND `settings/` with the header and
    // with the integration key alone (§39).
    const config = await call({ siteId: args.siteId, path: PATHS.config, route: args.route })
    const settingsResponse = await call({ siteId: args.siteId, path: PATHS.settings, route: args.route })
    if (!config.ok || !settingsResponse.ok) {
      console.error('sites: probe refused', { code: config.code ?? settingsResponse.code })
      return { ok: false, code: config.code ?? settingsResponse.code }
    }

    const body = (config.body as { config?: { version?: unknown; hostSettings?: unknown } })?.config
    const version = typeof body?.version === 'string' ? body.version : undefined
    // A payload whose `config` could not be read is not a self-hosted site — `undefined` would
    // claim "no hostSettings" about a body nobody parsed. `verdict` stays null and both capability
    // columns keep what they had.
    const verdict = body ? capabilityOf(body.hostSettings, await ghostProPreviewProbe()) : null

    const settings = settingsOf(settingsResponse.body)
    const injection = injectionFlag(settings)
    const portal = portalState(settings)
    const asked = verdict !== null && 'ask' in verdict

    // `site_settings` GAINS keys and loses none: `public_url` and anything a later story put here
    // is spread through untouched. `plan_ask` is written only while it is true, and the answer
    // action deletes it.
    const previous = (before.site_settings ?? {}) as Record<string, unknown>
    const site_settings: Record<string, unknown> = {
      ...previous,
      code_injection: injection,
      ...portal,
      announcement: announcementOf(settings),
    }
    if (asked) site_settings.plan_ask = true
    else delete site_settings.plan_ask

    const capability = verdict && 'capability' in verdict ? verdict : null
    const { error: writeError } = await admin
      .from('sites')
      .update({
        ...(version ? { ghost_version: version } : {}),
        ...(capability ?? {}),
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
      capability: capability?.capability ?? 'unchanged',
      code_injection: injection,
    }
  } catch (thrown) {
    // A THROWN PROBE LEAVES A CONNECTED SITE. `AdminError` carries a code; anything else carries a
    // name — and neither carries a value (spine, Security floor).
    const e = (thrown ?? {}) as { code?: string; name?: string }
    console.error('sites: probe threw', { code: e.code ?? e.name })
    return { ok: false, code: e.code ?? e.name }
  }
}
