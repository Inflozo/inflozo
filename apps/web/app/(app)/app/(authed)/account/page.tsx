import type { Metadata } from 'next'
import type { PasskeyListItem } from '@supabase/auth-js'
import { Mail } from '@/components/kit/icons'
import { passkeysEnabled } from '@/lib/flags'
import { currentUser, supabaseServer } from '@/lib/supabase/server'
import { PasskeysCard, type PasskeyRow } from './passkeys-card'

/* ─────────────────────────────────────── S12 Billing.dc.html — S12a, its RIGHT column.

   The frame draws one surface called "Account & Billing" in two columns: the plan, its meters
   and the invoices on the left, and Email · Passkeys · Danger zone on the right. THE LEFT COLUMN
   IS EPIC 12'S and the Danger zone is 2.5's; each is ABSENT rather than greyed, because neither
   could act today (UX-DR3). So is Change email (2.3), and so are the pencil and the bin at the
   end of every passkey row (2.2). The heading is still the frame's own — the surface it names is
   the one being built, one card at a time.

   Values are read off the frame and never rounded: the cards at `rounded-lg` with the frame's
   own `shadow-sm`, 20/24 padding, the label 13px/600 uppercase at 0.04em, the address 13px/500
   over 11px ink-soft. At 390 the two-column row is one column — the frame's own collapse, and
   the reason `flex-col` is the base and the width class is the exception.

   The Passkeys card is absent entirely unless BOTH switches are on (`lib/flags.ts`). */

export const metadata: Metadata = {
  title: 'Account · Inflozo',
  robots: { index: false, follow: false },
}

export default async function AccountPage() {
  const user = await currentUser()
  // The layout's guard has already redirected anyone without one; this is the type narrowing.
  if (!user) return null

  const passkeys = await passkeysEnabled()
  // `auth.passkey.list()` is asked for ONLY when the module is on: with the flag off the method
  // is not merely unused, it is a call the platform would refuse.
  const rows = passkeys ? await listPasskeys() : []

  return (
    <div className="flex flex-col gap-4 p-[16px_20px] tablet:gap-5 tablet:p-6">
      <h1 className="font-display text-[17px] font-bold tracking-[-0.01em] text-ink">
        Account &amp; Billing
      </h1>

      <div className="flex max-w-[720px] flex-col gap-4">
        <section className="flex flex-col gap-[14px] rounded-lg border border-line bg-surface p-[20px_24px] shadow-sm">
          <h2 className="text-ui-dense font-semibold uppercase tracking-[0.04em] text-ink-soft">Email</h2>
          <div className="flex items-center gap-3 py-px">
            <span className="shrink-0 text-ink-soft">
              <Mail size={16} />
            </span>
            <span className="flex min-w-0 flex-col gap-px">
              <span className="break-all text-ui-dense font-medium text-ink">{user.email}</span>
              <span className="text-helper-caption text-ink-soft">Magic links land here</span>
            </span>
          </div>
        </section>

        {passkeys ? <PasskeysCard passkeys={rows} /> : null}
      </div>
    </div>
  )
}

/**
 * The list, through the user's OWN session — the passkeys are theirs and GoTrue scopes the call
 * to the bearer token. A read that fails is an empty card and a log line, never a page that
 * cannot render: the Email card above it is still true.
 */
async function listPasskeys(): Promise<PasskeyRow[]> {
  const supabase = await supabaseServer()
  const { data, error } = await supabase.auth.passkey.list()
  if (error || !data) {
    console.error('passkey: list failed', { status: error?.status, code: error?.code })
    return []
  }
  // The library TYPES this as a bare array (`AuthPasskeyListResponse`), and that is a claim
  // about GoTrue's `GET /passkeys` that cannot be executed until Supabase's own switch is on —
  // this story's Deploy phase. So the envelope is accepted either way rather than asserted: an
  // array, or an object carrying one. Two lines, and no surface that renders empty because the
  // response was wrapped (standing rule 1).
  const list: PasskeyListItem[] = Array.isArray(data)
    ? data
    : ((data as { passkeys?: PasskeyListItem[] }).passkeys ?? [])

  return list.map((passkey) => ({
    id: passkey.id,
    // A passkey registered before the naming PATCH landed, or one whose PATCH failed, still has
    // a row to draw.
    name: passkey.friendly_name || 'Passkey',
    createdAt: passkey.created_at,
  }))
}
