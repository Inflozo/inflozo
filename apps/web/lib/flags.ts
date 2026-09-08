import { cache } from 'react'
import { bothOn, rowEnabled, settingEnabled } from './flags-rule.ts'
import { env, supabaseAdmin } from './supabase/server.ts'

/**
 * Feature flags are ROWS in `feature_flags`, read server-side per request, defaulting to off
 * (spine, Feature flags): an environment variable cannot be flipped without a redeploy, which
 * is the one capability FR-A2 asks for.
 *
 * TWO SWITCHES, NOT ONE, and both are read here (MEASUREMENTS §20). Ours is the row; Supabase's
 * is the project-level `passkeys_enabled`, reported by GoTrue's own public `/auth/v1/settings`.
 * If they disagree the user is offered a ceremony the platform refuses, so either one being off
 * takes the whole module away — the button, the divider, the Passkeys card, the nudge, and
 * every passkey action.
 *
 * FAIL CLOSED. Any read that throws, 500s, answers something that is not `true` — or does not
 * answer within `READ_TIMEOUT_MS` — is off; the decision and the two field mappings are
 * `flags-rule.ts`, where `node --test` reaches them. Nothing is logged but a code — logs carry
 * no user content (spine, Security floor).
 *
 * THE TIMEOUT IS PART OF FAIL-CLOSED: both reads sit on the sign-in page's render path, and a
 * platform that hangs rather than errors would otherwise hang the page (review, 2026-09-06).
 * ponytail: one constant for both reads; per-read budgets if either ever needs its own.
 *
 * `cache()` collapses the pair to one round trip per request: the sign-in page asks once, but
 * `/account` asks in the page and again in each action guard on the same request.
 *
 * NOTHING HERE RUNS AT MODULE LOAD. CI's `check` job builds with no environment at all, so the
 * keys are read inside the call — `supabaseAdmin()` is lazy for the same reason.
 *
 * DW-12 CLOSES HERE: the reader the ledger asked for is `supabaseAdmin()`, one cookie-less
 * client holding `SUPABASE_SECRET_KEY` for this one table.
 */
export const READ_TIMEOUT_MS = 3000

export const passkeysEnabled = cache(async function passkeysEnabled(): Promise<boolean> {
  const [row, settings] = await Promise.all([flagRow('passkeys'), supabaseSetting()])
  return bothOn(row, settings)
})

/**
 * FR-C2's PROBE SWITCH, added by Story 3.3. ONE switch, not two: the Ghost(Pro) `hostSettings`
 * shape is UNOBSERVED until the §4 T4 Starter trial, so the row exists to keep the half of the
 * probe that no server has ever confirmed off in production — it is seeded `false` and stays
 * there. Off means a site is never marked `preview_only` and the plan question is never asked;
 * `probe-rule.ts`'s `capabilityOf` is where that decision lives, and this only hands it the bit.
 *
 * Same fail-closed shape as the pair above: not a literal `true` is off, and a read that throws,
 * errors or hangs is off.
 */
export const ghostProPreviewProbe = cache(async function ghostProPreviewProbe(): Promise<boolean> {
  return (await flagRow('ghostpro_preview_probe')) === true
})

/**
 * ONE ROW READ, PARAMETERISED BY ITS KEY — the timeout, the fail-closed catch and the two log
 * lines are the same fact for every flag, and a second copy of them is a second place for
 * "fail closed" to stop being true. The KEY is still a literal at each call site, because
 * `server-wiring.test.ts` reads those literals and asserts a migration seeds each one: a typo
 * would otherwise answer null for ever with every gate green.
 */
async function flagRow(key: string): Promise<unknown> {
  try {
    const { data, error } = await supabaseAdmin()
      .from('feature_flags')
      .select('enabled')
      .eq('key', key)
      .abortSignal(AbortSignal.timeout(READ_TIMEOUT_MS))
      .maybeSingle()
    if (error) {
      // `message` AS WELL AS `code`, and safely: this query carries NO user input — the key comes
      // from a literal at each call site above, never from a request — so its failure text can
      // only be the platform's own.
      // Executed against the live project with a deliberately wrong key: PostgREST answers
      // `{ message: 'Invalid API key', hint }` and NO code at all, so `{ code }` alone logged
      // `code: undefined` and said nothing about a flag that had silently failed closed.
      console.error('flags: read failed', { code: error.code, message: error.message })
      return undefined
    }
    // `maybeSingle()` answers `null` for a missing row, which is off rather than an error: the
    // seed is part of the schema and its absence is still "not turned on".
    return rowEnabled(data)
  } catch (error) {
    // A missing key throws out of `env()`, and that must not take the sign-in page down with it;
    // `name` carries the timeout (`TimeoutError`) and the missing-key `Error` apart.
    console.error('flags: read threw', { name: (error as { name?: string })?.name })
    return undefined
  }
}

/**
 * GoTrue's own settings, over the publishable key — the same endpoint the probe reads
 * (`passkeys_enabled: false` on 2026-09-06, and `false` again at Dev time on the live project).
 * `no-store` because this is a switch, and a cached one is a switch that does not switch.
 */
async function supabaseSetting(): Promise<unknown> {
  try {
    // `env()` and not `process.env`: a missing key is the loud "is not set" `server.ts`
    // promises, caught below, not a fetch to `undefined/auth/v1/settings` (review, 2026-09-06).
    const response = await fetch(`${env('SUPABASE_URL')}/auth/v1/settings`, {
      headers: { apikey: env('SUPABASE_PUBLISHABLE_KEY') },
      cache: 'no-store',
      signal: AbortSignal.timeout(READ_TIMEOUT_MS),
    })
    if (!response.ok) {
      console.error('flags: settings unreadable', { status: response.status })
      return undefined
    }
    return settingEnabled(await response.json())
  } catch (error) {
    console.error('flags: settings unreachable', { name: (error as { name?: string })?.name })
    return undefined
  }
}
