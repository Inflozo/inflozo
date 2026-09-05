// The countdown, pure, so `node --test` can prove it — the clock is an argument, never a read.
//
// UX-DR13: the countdown BLOCKS NOTHING. It says when a new email may be asked for; the link
// already sent stays valid for its own 15 minutes (the project's `mailer_otp_exp`, 900 s) and
// "Use a different email" is live throughout. The two numbers are unrelated and the frame draws
// them apart on purpose.

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
 * TWO different 429s, and only one of them means "your link is already on its way".
 * `over_email_send_rate_limit` is the per-address minimum interval: nothing was sent because
 * something was sent seconds ago, so S1b with the countdown reset is the truth (UX-DR13 — it
 * blocks nothing, and the earlier link is still good). The project-wide hourly cap also answers
 * 429; showing "Check your inbox" for that one would be a lie, so it is not this.
 */
export function linkAlreadySent(error: { status?: number; code?: string }): boolean {
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
