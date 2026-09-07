import { BAD_EMAIL, parseEmail } from '../../sign-in/email.ts'

/**
 * THE EMAIL-CHANGE BOUNDARY AND THE URL CONTRACT, in one plain module beside the actions —
 * because a `'use server'` file may export only async functions (`passkey-name-rule.ts` and
 * `signed-out.ts` are here for the same reason). Pure, so `node --test` holds every sentence the
 * field can say and every path the link can land on.
 *
 * NOTHING OF OURS STORES AN EMAIL. `new_email` and `email_change_sent_at` are Supabase's own
 * record of a pending change and arrive inside `getUser()`; this module only reads them.
 */

/** The address is already this account's — GoTrue would no-op (`internal/api/user.go:135`). */
export const SAME_EMAIL = "That's already your address."
/** GoTrue's `422 email_exists`, refused BEFORE anything is sent (`user.go:135-139`). */
export const IN_USE = 'That email is already in use on another account.'
export const SEND_FAILED = "We couldn't send that link just now. Try again in a moment."
/**
 * A LINK THAT IS TOO OLD OR ALREADY SPENT, said where the button that fixes it is. The owner's
 * own words (R-94, 2026-09-07): the sign-in page cannot say this to a signed-in browser, because
 * it redirects one to the dashboard before it renders (`sign-in/page.tsx:41`), and the browser a
 * user opens the email on is usually the one they are already signed in on.
 */
export const STALE_LINK = 'That link has expired or was already used. Press Change email to get a new one.'

/** The two refusals `newEmailFor` can make, keyed by its codes: the dialog says them at the
 *  submit and `actions.ts`'s `MESSAGES` spreads them, so neither side keeps its own copy. */
export const FIELD_REFUSALS = { bad_email: BAD_EMAIL, same_email: SAME_EMAIL } as const

/**
 * How long the link in the email is good for, in seconds: the project's `mailer_otp_exp`, which
 * `tools/probe/configure-supabase-auth.py` writes and reads back. It is the ONE number the
 * pending banner is time-boxed by, and `email-change-rule.test.ts` reads it out of that file
 * rather than restating it, so the two cannot drift (counts are derived, never restated).
 *
 * ponytail: a constant mirroring a setting; a settings read the day the app has one.
 */
export const LINK_LIFETIME_S = 900

export type NewEmail = { email: string } | { code: 'bad_email' | 'same_email' }

/**
 * What may be sent. The comparison is case-insensitive and trimmed on both sides — addresses are
 * case-insensitive at the mailbox for every provider this product will meet, and GoTrue stores
 * them lowercased, so `Maya@…` typed against `maya@…` is the SAME address and must be refused
 * here rather than sent as a change to nothing. The value that goes on the wire is the parsed
 * one, not the lowercased one: GoTrue does its own normalising and ours would be a second rule.
 */
export function newEmailFor(current: string | undefined, raw: unknown): NewEmail {
  const email = parseEmail(raw)
  if (!email) return { code: 'bad_email' }
  if (email.toLowerCase() === (current ?? '').trim().toLowerCase()) return { code: 'same_email' }
  return { email }
}

/** The shape `getUser()` hands back for a change that has been asked for but not confirmed. */
export type PendingSource = {
  new_email?: string | null
  email_change_sent_at?: string | null
}

/**
 * The pending address, or `null`. It is shown only while the link is STILL GOOD: a link that
 * expired unopened leaves the card on the next render, because the banner promises something
 * ("open it to finish") that a dead link cannot deliver. An unparseable or missing timestamp is
 * not a pending change — it is a shape we do not understand, and the honest card says nothing.
 */
export function pendingChange(user: PendingSource, now: number): { email: string } | null {
  const email = user.new_email
  if (!email) return null
  const sentAt = Date.parse(user.email_change_sent_at ?? '')
  if (Number.isNaN(sentAt)) return null
  return sentAt + LINK_LIFETIME_S * 1000 > now ? { email } : null
}

/**
 * THE OTHER END OF THE LINK. `signed-out.ts`'s shape and for its reason: the key was shared once
 * and the value was not, so changing one side left every check green and lost the sentence. Both
 * a VALUE and a READER, and `email-change-rule.test.ts` walks the real round trip.
 *
 * A BROWSER PATH — `/account`, not `/app/account`: `proxy.ts` rewrites `app.inflozo.com/` onto
 * `/app`, so the public URL has no prefix. `revalidatePath` in `actions.ts` addresses the
 * internal tree and is therefore the other one. The two are not interchangeable.
 */
export const EMAIL_CHANGED = 'email'
export const EMAIL_CHANGED_VALUE = 'changed'
export const EMAIL_CHANGED_PATH = `/account?${EMAIL_CHANGED}=${EMAIL_CHANGED_VALUE}`

/**
 * THE SAME KEY'S OTHER VALUE, for a link that did not work (R-94). One key and two values rather
 * than a second key: the card strips the key once it has said its sentence, and one strip cannot
 * miss a key it does not know about.
 */
export const EMAIL_STALE_VALUE = 'stale'
export const EMAIL_STALE_PATH = `/account?${EMAIL_CHANGED}=${EMAIL_STALE_VALUE}`

/** What the account page asks of `searchParams[EMAIL_CHANGED]`. A repeated key is an array. */
export const isEmailChanged = (value: string | string[] | undefined) => value === EMAIL_CHANGED_VALUE
export const isEmailStale = (value: string | string[] | undefined) => value === EMAIL_STALE_VALUE
