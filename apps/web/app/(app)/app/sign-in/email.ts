import { z } from 'zod'

/**
 * ONE SCHEMA AT THE EMAIL BOUNDARY (spine, Consistency Conventions) — imported by both the
 * client form and the server action, so the sentence the field shows and the sentence the
 * action returns cannot drift apart. It is a plain module, not the `'use server'` one: a
 * client component may only import async functions from that.
 *
 * The message is the frame's own helper caption, not zod's default.
 */
export const BAD_EMAIL = 'Enter an email address like you@example.com'

// Trim BEFORE validating, not after: `z.email().trim()` runs the transform on the way out, so
// a pasted address with a trailing space failed while reading as valid (executed with 4.4.3).
export const emailSchema = z
  .string({ error: BAD_EMAIL })
  .trim()
  .pipe(z.email({ error: BAD_EMAIL }).max(254, { error: BAD_EMAIL }))

/** `null` when it is not an address. */
export const parseEmail = (value: unknown): string | null => {
  const r = emailSchema.safeParse(value)
  return r.success ? r.data : null
}
