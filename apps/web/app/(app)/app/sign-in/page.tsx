import type { Metadata, Viewport } from 'next'
import { redirect } from 'next/navigation'
import { currentUser } from '@/lib/supabase/server'
import { passkeysEnabled } from '@/lib/flags'
import { SignInForm } from './sign-in-form'
import { isSignedOut, SIGNED_OUT } from './signed-out'

/* ─────────────────────────────────────────────────── S1 Sign In.dc.html — S1a and S1b

   The frame is the authority (R-74) and every value below is read off it, never rounded
   (F-111): the card at `rounded-lg` and `shadow-lg`, padding 40/36 at 1440 and 32/24 at 390, the
   380px paper-sunk watermark behind it (130px at 390), and "Terms · Privacy" pinned 28px from the
   bottom (20px at 390). THE ONE VALUE THAT IS NO LONGER THE FRAME'S is the card's width: the owner
   amended R-74 for this card on 2026-09-05 (his test, finding 4), so it is 440px and not the drawn
   400 — the reason is in `sign-in-form.tsx` beside the class, and the sentence under the headline
   moved with it (finding 5).

   The passkey button and its "or" divider are S1a's and are NOT drawn unless BOTH switches are
   on — our `feature_flags.passkeys` row AND Supabase's own project-level `passkeys_enabled`
   (`lib/flags.ts`, MEASUREMENTS §20) — absent, not greyed, because with either off they could
   never act (UX-DR3). Story 2.1 built both: the button and its ceremony live in
   `passkey-button.tsx`, and S1c — this same card at 40% behind the OS sheet, with nothing of the
   sheet drawn — is `sign-in-form.tsx`'s `passkeyPending`. */

export const metadata: Metadata = {
  title: 'Sign in · Inflozo',
  // The card's own sentence, verbatim: one wording, not two (the owner's ruling of 2026-09-05,
  // finding 5). It read 'an Inflozo account' here and 'an account' on the card, which is two.
  description: 'Sign in or create an account.',
  robots: { index: false, follow: false },
}

export const viewport: Viewport = { width: 'device-width', initialScale: 1 }

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; [SIGNED_OUT]?: string }>
}) {
  // Already signed in — the sign-in page has nothing to offer, so it is not shown (matrix).
  if (await currentUser()) redirect('/')

  // `?signed-out=1` is set by `signOut` and says one sentence on arrival; `?error=link` is the
  // confirm route's. Neither is trusted for anything — each only chooses a sentence.
  const { error, [SIGNED_OUT]: signedOut } = await searchParams

  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-paper px-6">
      {/* The watermark: paper-sunk on paper, unselectable, behind everything — 380px at 1440 and
          130px at 390, the frame's own numbers.

          THE WORD IS CSS `content`, NOT A TEXT NODE, and that is the honest description of it: it
          is ornament, the same way a background image is. Written as text it is 1.08:1 against the
          paper — WCAG's own logotype exception covers it, but axe cannot see an exception, and at
          390 (where the card no longer covers it) axe-core 4.12.1 reported exactly that as a
          `color-contrast` violation. Making it darker would be editing the frame, which R-74 does
          not allow. `aria-hidden` stays as well: the wordmark on the card is the real one. */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[110px] -translate-x-1/2 select-none whitespace-nowrap font-display text-[130px] font-extrabold tracking-[-0.05em] text-paper-sunk before:content-['Inflozo'] tablet:top-1/2 tablet:-translate-y-[56%] tablet:text-[380px]"
      />

      <SignInForm
        linkError={error === 'link'}
        signedOut={isSignedOut(signedOut)}
        passkeys={await passkeysEnabled()}
      />

      <footer className="absolute inset-x-0 bottom-5 flex justify-center gap-5 text-ui-dense text-ink-soft tablet:bottom-7">
        {/* inflozo.com/terms and /privacy are Epic 14's; the links are the frame's. */}
        <a href="https://inflozo.com/terms" className="text-ink-soft outline-none focus-visible:shadow-focus">
          Terms
        </a>
        <span className="text-line" aria-hidden>
          ·
        </span>
        <a href="https://inflozo.com/privacy" className="text-ink-soft outline-none focus-visible:shadow-focus">
          Privacy
        </a>
      </footer>
    </main>
  )
}
