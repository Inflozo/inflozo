/**
 * THE ONE PLACE THE APP SENDS AN EMAIL ITSELF.
 *
 * Almost every email in the product is GoTrue's — the magic link, the email-change link, the
 * "your address was changed" notice — sent by Supabase from the templates under `supabase/auth/`,
 * with no code of ours involved. FR-P1's eighth is the first the APP sends: the deletion
 * confirmation (the owner's ruling R-96, 2026-09-07), because nothing in GoTrue knows an account
 * has asked to be deleted.
 *
 * ONE `fetch`, NO SDK. The `resend` package would be a dependency for a single POST with three
 * fields. `// ponytail: one fetch, no SDK; the resend package the day E12 wants batch or
 * attachments.`
 *
 * IT NEVER THROWS AND IT NEVER BLOCKS THE THING IT REPORTS ON. Every caller so far is telling the
 * user about something that has ALREADY happened in the database; a send that fails must not undo
 * it or turn it into an error page. So the answer is an envelope, the failure is a status, and the
 * decision about what to do with it belongs to the caller.
 *
 * THE KEYS ARE READ AT CALL TIME, not at module load: `next build` runs with no environment in CI
 * (`lib/supabase/server.ts` made the same move for the same reason), and reading them at the top
 * would bake in whatever was — or was not — set when the module was first evaluated.
 *
 * NOTHING IS LOGGED BUT A STATUS AND AN ID. Never an address, never the key, never the body.
 */

/** Resend's HTTP API. One endpoint; the account and sender come from the key and `RESEND_FROM`. */
const ENDPOINT = 'https://api.resend.com/emails'

/**
 * A send that hangs must not hang the request that made it. The action redirects the browser to
 * `/restore` the moment this returns, and the page it lands on carries the deadline anyway.
 */
export const SEND_TIMEOUT_MS = 8_000

export type Sent = { ok: true; id: string | null } | { ok: false; status: number; reason?: string }

export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string
  subject: string
  html: string
  text: string
}): Promise<Sent> {
  const key = process.env.RESEND_API_KEY
  const from = process.env.RESEND_FROM
  if (!key || !from) {
    // `status: 0` is "we never asked", not "they refused" — the caller's log says which.
    console.error('email: not configured', { key: Boolean(key), from: Boolean(from) })
    return { ok: false, status: 0 }
  }

  try {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to: [to], subject, html, text }),
      signal: AbortSignal.timeout(SEND_TIMEOUT_MS),
    })
    const body = (await response.json().catch(() => null)) as
      | { id?: string; name?: string; message?: string }
      | null
    // A refusal keeps Resend's own reason — `validation_error`, `restricted_api_key`, an
    // unverified sender — because a bare 4xx is what the owner would otherwise be debugging
    // his inbox from (review, 2026-09-07). Still no address, no key, no body of ours.
    if (!response.ok) {
      const reason = [body?.name, body?.message].filter(Boolean).join(': ').slice(0, 200)
      return reason ? { ok: false, status: response.status, reason } : { ok: false, status: response.status }
    }
    return { ok: true, id: body?.id ?? null }
  } catch {
    // A timeout, a DNS failure, a socket reset. `status: 0` again: nothing was answered.
    return { ok: false, status: 0 }
  }
}
