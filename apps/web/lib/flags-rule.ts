/**
 * THE TWO-SWITCH RULE, kept free of `next/*` and of any client so `node --test` can prove it.
 *
 * MEASUREMENTS §20: Inflozo's `feature_flags.passkeys` row and Supabase's project-level
 * `passkeys_enabled` are two independent switches, and if they disagree the user is offered a
 * flow the platform refuses. So both must be on, and — because "the flag is off" and "we could
 * not find out" must land in the same place — anything that is not a literal `true` is off.
 *
 * `flags.ts` next door does the two reads; this is the whole of the decision they feed.
 */
export function bothOn(row: unknown, settings: unknown): boolean {
  return row === true && settings === true
}

/**
 * THE TWO WIRE SHAPES, mapped here so the field names are under test. A wrong name on either
 * ("passkey_enabled", the Management API's spelling, for GoTrue's "passkeys_enabled") is a
 * reader that is off for ever, and fail-closed hides it: every off-switch control still passes
 * (review, 2026-09-06). The literals in `flags-rule.test.ts` are the ones the live project
 * answered.
 */
export const rowEnabled = (data: unknown): unknown => (data as { enabled?: unknown } | null)?.enabled

export const settingEnabled = (json: unknown): unknown =>
  (json as { passkeys_enabled?: unknown } | null)?.passkeys_enabled
