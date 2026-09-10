import { timingSafeEqual } from 'node:crypto'

/**
 * EVERY CRON'S DOOR, AND IT IS ONE FUNCTION (AD-33). It was `purge-rule.ts`'s until Story 3.7
 * added the second scheduled job; a copy beside the new route would have been two places for the
 * fail-closed rule to be true, and the one that mattered would be whichever route somebody edited
 * last. Lifted rather than copied, so both jobs are locked by the same lock.
 *
 * VERCEL'S OWN MECHANISM, FAIL-CLOSED. A project that carries `CRON_SECRET` gets
 * `Authorization: Bearer $CRON_SECRET` on every cron invocation (Vercel docs, read 2026-09-07).
 *
 * AN UNSET SECRET IS A 401, never an open endpoint: the `!secret` line is the whole difference
 * between a door that is shut when the variable is missing and a job anyone on the internet can
 * fire. The length check comes first because `timingSafeEqual` THROWS on unequal lengths rather
 * than returning false, and it is the comparison itself — never `===` — because the header is
 * attacker-supplied and the secret is the only thing guarding the job behind it.
 */
export function authorized(header: string | null, secret: string | undefined): boolean {
  if (!secret || !header) return false
  const expected = Buffer.from(`Bearer ${secret}`)
  const given = Buffer.from(header)
  return given.length === expected.length && timingSafeEqual(given, expected)
}
