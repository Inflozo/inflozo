import type { Metadata } from 'next'
import { passkeysEnabled, READ_TIMEOUT_MS } from '@/lib/flags'
import { passkeyRows, type PasskeyRow } from '@/lib/passkey-name'
import { currentUser, supabaseServer } from '@/lib/supabase/server'
import { withTimeout } from '@/lib/with-timeout'
import { DangerCard } from './danger-card'
import { EmailCard } from './email-card'
import { EMAIL_CHANGED, isEmailChanged, isEmailStale, pendingChange } from './email-change-rule'
import { PasskeysCard } from './passkeys-card'
import { SavingCard } from './saving-card'
import { SessionsCard } from './sessions-card'

/* ─────────────────────────────────────── S12 Billing.dc.html — S12a, its RIGHT column.

   The frame draws one surface called "Account & Billing" in two columns: the plan, its meters
   and the invoices on the left, and Email · Passkeys · Danger zone on the right. THE LEFT COLUMN
   IS EPIC 12'S and is ABSENT rather than greyed, because it could not act today (UX-DR3); the
   DANGER ZONE LANDED WITH 2.5 and is `danger-card.tsx`, for the reason the Email card moved out
   of here — the frame's button opens a dialog and a dialog needs a client. The pencil and the bin
   at the end of every passkey row LANDED WITH
   2.2 and are drawn by `passkeys-card.tsx`; CHANGE EMAIL landed with 2.3 and the whole Email
   card now lives in `email-card.tsx`, because the frame's button opens a dialog and a dialog
   needs a client. The heading is still the frame's own — the surface it names is the one being
   built, one card at a time.

   Values are read off the frame and never rounded: the cards at `rounded-lg` with the frame's
   own `shadow-sm`, 20/24 padding, the label 13px/600 uppercase at 0.04em, the address 13px/500
   over 11px ink-soft. At 390 the two-column row is one column — the frame's own collapse, and
   the reason `flex-col` is the base and the width class is the exception.

   THE COLUMN'S WIDTH IS THE FRAME'S, not a cap of ours: S12a's right column is `flex:1` beside a
   480px plan column and a 24px gap (`S12 Billing.dc.html:35`), so at desktop the cards take
   `100% - 504px` — the room beside where Epic 12's column will sit, so nothing moves when it
   lands (the owner's ruling, question 2, 2026-09-06). Below desktop the frame draws nothing and
   the column is full width, as it is at 390.

   The Passkeys card is absent entirely unless BOTH switches are on (`lib/flags.ts`). THE
   SESSIONS CARD IS NOT: 2.4 extrapolated it from the Email card beside it, because the frame
   draws no sessions surface, and it renders whether or not the passkey switches are on — a way
   out of every device must not hang on a way in.

   STORY 5.8 ADDS THE SAVING CARD on the same terms and for the same reason: the frame draws no
   saving surface either, so it is extrapolated from its neighbours (R-74), and it is
   unconditional because a setting about whether work leaves the device must not hang on a
   feature flag. `EXPERIENCE.md:702` is what puts FR-D10's toggle on this screen. The skeleton
   below it is already four cards and does not become five — see `loading.tsx` for why a count
   there is deliberately not kept in step. */

export const metadata: Metadata = {
  title: 'Account · Inflozo',
  robots: { index: false, follow: false },
}

export default async function AccountPage({
  searchParams,
}: {
  // The confirm route's landing hint — a repeated key arrives as an ARRAY, which is not the
  // value (`email-change-rule.ts`, and `(authed)/page.tsx`'s own shape).
  searchParams: Promise<{ [EMAIL_CHANGED]?: string | string[] }>
}) {
  const [{ [EMAIL_CHANGED]: changed }, user] = await Promise.all([searchParams, currentUser()])
  // The layout's guard has already redirected anyone without one; this is the type narrowing.
  if (!user) return null

  const supabase = await supabaseServer()
  // The two counts S12c's sentence is composed from. HEAD requests — `count: 'exact', head: true`
  // sends no rows at all — and RLS scopes both, so neither carries a `where` of ours.
  // ponytail: counts on the sentence are two HEAD requests; one view the day the page needs a third.
  const [passkeys, projects, assets, profile] = await Promise.all([
    passkeysEnabled(),
    countOf(supabase, 'projects'),
    countOf(supabase, 'assets'),
    // FR-D10's toggle, per USER (`schema:118`). A read that FAILS answers the column's own default, which is the
    // state that sends MORE — never a switch that shows "off" over a preference nobody turned off.
    supabase.from('profiles').select('autosave_enabled').eq('user_id', user.id).maybeSingle(),
  ])
  // `auth.passkey.list()` is asked for ONLY when the module is on: with the flag off the method
  // is not merely unused, it is a call the platform would refuse.
  const rows = passkeys ? await listPasskeys() : null

  return (
    <div className="flex flex-col gap-4 p-[16px_20px] tablet:gap-5 tablet:p-6">
      <h1 className="font-display text-[17px] font-bold tracking-[-0.01em] text-ink">
        Account &amp; Billing
      </h1>

      <div className="flex flex-col gap-4 desktop:max-w-[calc(100%-504px)]">
        {/* A PENDING CHANGE IS SUPABASE'S OWN RECORD, not a table of ours: `new_email` and
            `email_change_sent_at` ride in on the `getUser()` above, so the card costs no read. */}
        <EmailCard
          email={user.email}
          pending={pendingChange(user, Date.now())}
          justChanged={isEmailChanged(changed)}
          staleLink={isEmailStale(changed)}
        />

        {passkeys ? <PasskeysCard passkeys={rows} /> : null}

        {/* FR-A6's sign-out-everywhere. It sits under Passkeys and above the Danger zone, and it
            costs no read: GoTrue owns the sessions and nothing of ours lists them. */}
        <SessionsCard />

        {/* FR-D10's autosave toggle (Story 5.8). Extrapolated from the cards beside it exactly as Sessions was, and
            unconditional for the same reason: a setting about whether work leaves the device must not hang on a
            feature flag. */}
        <SavingCard autosave={profile.data?.autosave_enabled !== false} />

        {/* FR-A5's way out, last on the surface as the frame draws it, and unconditional for the
            reason the Sessions card is: leaving must not depend on a feature flag. */}
        <DangerCard projects={projects} assets={assets} />
      </div>
    </div>
  )
}

/**
 * How much this account holds, for S12c's sentence alone. Through the user's own session, so RLS
 * scopes it; a count that could not be READ is 0 and a log line, which `deletionSentence` renders
 * as "Everything in your account" — true whatever the account holds, and never a page that will
 * not render because a meter failed.
 */
async function countOf(
  supabase: Awaited<ReturnType<typeof supabaseServer>>,
  table: 'projects' | 'assets',
): Promise<number> {
  const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true })
  if (error) {
    console.error('account: count failed', { table, code: error.code })
    return 0
  }
  return count ?? 0
}

/**
 * The list, through the user's OWN session — the passkeys are theirs and GoTrue scopes the call
 * to the bearer token. A read that fails is `null` — the card says it could not load, rather
 * than claiming there are none and offering "Add a passkey" to someone who has one (review,
 * 2026-09-06) — and a log line, never a page that cannot render: the Email card is still true.
 * The envelope is `passkeyRows`'s, under test in `passkey-name.test.ts`.
 */
async function listPasskeys(): Promise<PasskeyRow[] | null> {
  // WRAPPED, because this one can THROW rather than answer. `auth.passkey.*` asserts the
  // `experimental.passkey` opt-in BEFORE its own try (`auth-js/lib/helpers.js:450-454`) and
  // re-throws anything that is not an `AuthError`, so the single missing line in `server.ts`
  // would take the whole `/account` render down — the Email card with it — instead of showing
  // the card's "couldn't load" sentence. `server-wiring.test.ts` keeps that line honest; this
  // keeps the page standing if it ever is not (review, 2026-09-06).
  try {
    const supabase = await supabaseServer()
    // RACED, because the library exposes no `AbortSignal` for this call and a platform that
    // HANGS rather than errors would hang this page — `passkeysEnabled()`'s two reads were given
    // the same ceiling by a review for exactly that (DW-33 (2)), and it is THE SAME CONSTANT, not
    // a copy. The request is not cancelled, it is abandoned: the render gives up and the card
    // says it could not load. `withTimeout` is under `node --test`; this line is not.
    // ponytail: a race, not a cancel — a real AbortSignal the day the library exposes one.
    const answered = await withTimeout(supabase.auth.passkey.list(), READ_TIMEOUT_MS)
    if (!answered) {
      console.error('passkey: list timed out', { ms: READ_TIMEOUT_MS })
      return null
    }
    const { data, error } = answered
    if (error || !data) {
      console.error('passkey: list failed', { status: error?.status, code: error?.code })
      return null
    }
    return passkeyRows(data)
  } catch (error) {
    console.error('passkey: list threw', { name: (error as { name?: string })?.name })
    return null
  }
}
