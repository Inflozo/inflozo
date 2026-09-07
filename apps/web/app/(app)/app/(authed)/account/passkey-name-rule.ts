import { z } from 'zod'

/**
 * THE RENAME BOUNDARY, in a plain module beside the actions because a `'use server'` file may
 * export only async functions — the same reason `nudge.ts` and `signed-out.ts` exist. Pure, so
 * `node --test` holds it: the field's `maxLength` and the server's refusal are the same number
 * and the same sentence, from here.
 *
 * 120 IS THE PLATFORM'S OWN CEILING, not a choice of ours: `friendlyName` is documented "max 120
 * chars" on `PasskeyUpdateParams` (`@supabase/auth-js/dist/module/lib/types.d.ts:2437-2442`, read
 * 2026-09-07). Refusing the 121st here means GoTrue never has to, so the user gets our sentence
 * rather than the platform's.
 *
 * NOT `lib/projects`'s `nameSchema`: that one stops at 80 and its hint says "project".
 */
export const PASSKEY_NAME_MAX = 120

/** The hint QUOTES the limit rather than restating it — one number, one source. */
export const PASSKEY_NAME_HINT = `Give it a name — up to ${PASSKEY_NAME_MAX} characters.`

export const passkeyNameSchema = z
  .string()
  .trim()
  .min(1, PASSKEY_NAME_HINT)
  .max(PASSKEY_NAME_MAX, PASSKEY_NAME_HINT)

/**
 * THE OTHER HALF OF THE BOUNDARY: the passkey the row's button posted. A UUID, because that is
 * what GoTrue mints (read off the wire by the harness's `register` step, which asserts it) and the
 * only shape `PATCH`/`DELETE /passkeys/{id}` can mean — a hand-made POST is refused at the action
 * rather than sent upstream as a path segment with the user's bearer token. Here and not in
 * `actions.ts` so `node --test` can hold it (review, 2026-09-07).
 */
export const passkeyIdSchema = z.uuid()
