/**
 * THE ONE KEY THE NUDGE IS REMEMBERED BY, in a plain module beside the actions because a
 * `'use server'` file may export only async functions — the same reason `signed-out.ts` and
 * `resend-timer.ts` exist.
 *
 * It is a key in `auth.users.raw_user_meta_data`, which `getUser()` already returns, so the
 * dashboard's reader costs nothing. A VALUE and a READER, not just a key: the sign-out contract
 * next door was written with the key shared and the value not, and one edit silently lost the
 * owner's sentence (review, 2026-09-06).
 */
export const NUDGE_DONE = 'passkey_nudge_done_at'

/** Whether the offer has been answered — taken or waved off — on any device. */
export const nudgeDone = (metadata: Record<string, unknown> | undefined): boolean =>
  Boolean(metadata?.[NUDGE_DONE])
