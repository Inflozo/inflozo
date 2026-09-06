import { cache } from 'react'
import { bothOn } from './flags-rule.ts'
import { supabaseAdmin } from './supabase/server.ts'

/**
 * Feature flags are ROWS in `feature_flags`, read server-side per request, defaulting to off
 * (spine, Feature flags): an environment variable cannot be flipped without a redeploy, which
 * is the one capability FR-A2 asks for.
 *
 * TWO SWITCHES, NOT ONE, and both are read here (MEASUREMENTS §20). Ours is the row; Supabase's
 * is the project-level `passkeys_enabled`, reported by GoTrue's own public `/auth/v1/settings`.
 * If they disagree the user is offered a ceremony the platform refuses, so either one being off
 * takes the whole module away — the button, the divider, the Passkeys card, the nudge, and the
 * four server actions.
 *
 * FAIL CLOSED. Any read that throws, 500s or answers something that is not `true` is off; the
 * decision itself is `flags-rule.ts`, where `node --test` reaches it. Nothing is logged but a
 * code — logs carry no user content (spine, Security floor).
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
export const passkeysEnabled = cache(async function passkeysEnabled(): Promise<boolean> {
  const [row, settings] = await Promise.all([ourRow(), supabaseSetting()])
  return bothOn(row, settings)
})

async function ourRow(): Promise<unknown> {
  try {
    const { data, error } = await supabaseAdmin()
      .from('feature_flags')
      .select('enabled')
      .eq('key', 'passkeys')
      .maybeSingle()
    if (error) {
      // `message` AS WELL AS `code`, and safely: this query carries NO user input — one literal
      // filter and one boolean column — so its failure text can only be the platform's own.
      // Executed against the live project with a deliberately wrong key: PostgREST answers
      // `{ message: 'Invalid API key', hint }` and NO code at all, so `{ code }` alone logged
      // `code: undefined` and said nothing about a flag that had silently failed closed.
      console.error('flags: read failed', { code: error.code, message: error.message })
      return undefined
    }
    // `maybeSingle()` answers `null` for a missing row, which is off rather than an error: the
    // seed is part of the schema and its absence is still "not turned on".
    return data?.enabled
  } catch (error) {
    // A missing key throws out of `env()`, and that must not take the sign-in page down with it.
    console.error('flags: read threw', { code: (error as { code?: string })?.code })
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
    const response = await fetch(`${process.env.SUPABASE_URL}/auth/v1/settings`, {
      headers: { apikey: process.env.SUPABASE_PUBLISHABLE_KEY ?? '' },
      cache: 'no-store',
    })
    if (!response.ok) {
      console.error('flags: settings unreadable', { status: response.status })
      return undefined
    }
    return ((await response.json()) as { passkeys_enabled?: unknown }).passkeys_enabled
  } catch (error) {
    console.error('flags: settings unreachable', { code: (error as { code?: string })?.code })
    return undefined
  }
}
