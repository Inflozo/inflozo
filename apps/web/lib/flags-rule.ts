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
