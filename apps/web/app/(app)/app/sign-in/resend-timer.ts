// The countdown, pure, so `node --test` can prove it — the clock is an argument, never a read.
//
// UX-DR13: the countdown BLOCKS NOTHING. It says when a new email may be asked for; a link
// already sent AND STILL UNUSED stays valid for its own 15 minutes (the project's
// `mailer_otp_exp`, 900 s) and "Use a different email" is live throughout. The two numbers are
// unrelated and the frame draws them apart on purpose.
//
// THAT SECOND CLAUSE IS LOAD-BEARING and it used to be missing: signing out and signing back in
// inside the minute is the case where the earlier link is spent, so the countdown is then the
// only mail there will be — see `sentTooRecently` below (owner's fourth test, finding 1).

/** The project's `smtp_max_frequency`, in seconds — the value `configure-supabase-auth.py`
 *  writes and reads back. It is where the countdown STARTS; GoTrue's own 429 message wins
 *  when the two disagree, because that one is the server's answer rather than our copy. */
export const SEND_INTERVAL = 60

/** Whole seconds left before a resend is allowed. Never negative, and never more than the
 *  interval — a clock stepped backwards would otherwise show more time than was ever asked for. */
export function secondsLeft(sentAt: number, interval: number, now: number): number {
  const elapsed = Math.floor((now - sentAt) / 1000)
  return Math.min(interval, Math.max(0, interval - elapsed))
}

/**
 * TWO different 429s, and only one of them means "an address was mailed moments ago".
 * `over_email_send_rate_limit` is the per-address minimum interval: NOTHING WAS SENT, because
 * something was sent inside the last `smtp_max_frequency` seconds. The project-wide hourly cap
 * also answers 429, and it is a plain failure — not this.
 *
 * IT WAS CALLED `linkAlreadySent` AND THAT NAME WAS THE DEFECT (the owner's fourth test,
 * finding 1). The card read it as "a link is in their inbox" and said "Check your inbox ✨",
 * which is true only while the earlier link is UNUSED. Sign out and sign straight back in and it
 * is not: the link just spent is the one this is talking about, so the card sent him to wait for
 * mail that could never arrive. The 429 says one thing only — too soon — and the card now says
 * that and nothing more.
 */
export function sentTooRecently(error: { status?: number; code?: string }): boolean {
  return error.status === 429 && error.code === 'over_email_send_rate_limit'
}

/** `27` -> `0:27`, the frame's own form (S1b: "Resend in 0:27"). */
export function mmss(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

/**
 * GoTrue answers a too-soon resend with 429 and a message naming the real remainder — "For
 * security purposes, you can only request this after 27 seconds." That number wins over the
 * project's configured interval, because it is the server's own answer rather than our copy
 * of a setting. No match (a reworded message, a different locale) falls back to the interval,
 * which is never longer than the truth.
 */
export function retryAfterFrom(message: string, fallback: number): number {
  const named = /after (\d+) seconds?/.exec(message)
  return named ? Number(named[1]) : fallback
}

/**
 * THE MAPPING ITSELF, not just the predicate under it. `sentTooRecently` was pinned by
 * `resend-timer.test.ts` while the thing the owner actually reported — the card claiming a send
 * that never happened — lived in the `'use server'` action, which `node --test` cannot import:
 * dropping `throttled: true` there left the whole gate green and the defect back (review,
 * 2026-09-06). This is the same move `lib/shell-user.ts` made for the account row's rule.
 *
 * `null` means "not a too-soon answer" — the caller's error branch owns it.
 */
export function sentStateFor(
  error: { status?: number; code?: string; message?: string },
  interval: number,
): { retryAfter: number; throttled: true } | null {
  if (!sentTooRecently(error)) return null
  return { retryAfter: retryAfterFrom(error.message ?? '', interval), throttled: true }
}
