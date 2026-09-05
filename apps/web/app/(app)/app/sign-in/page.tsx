import type { Metadata, Viewport } from 'next'
import { redirect } from 'next/navigation'
import { currentUser } from '@/lib/supabase/server'
import { passkeysEnabled } from '@/lib/flags'
import { SignInForm } from './sign-in-form'

/* ─────────────────────────────────────────────────── S1 Sign In.dc.html — S1a and S1b

   The frame is the authority (R-74) and every value below is read off it, never rounded
   (F-111): the 400px card at `rounded-lg` and `shadow-lg`, padding 40/36 at 1440 and 32/24 at
   390, the 380px paper-sunk watermark behind it (130px at 390), and "Terms · Privacy" pinned
   28px from the bottom (20px at 390).

   The passkey button and its "or" divider are S1a's and are NOT drawn while `feature_flags.
   passkeys` is off — absent, not greyed, because they could never act here today (UX-DR3).
   Story 2.1 turns the flag on and wires them. S1c is this same card at 40% behind the OS
   sheet and is 2.1's to reach. */

export const metadata: Metadata = {
  title: 'Sign in · Inflozo',
  description: 'Sign in or create an Inflozo account — no passwords, ever.',
  robots: { index: false, follow: false },
}

export const viewport: Viewport = { width: 'device-width', initialScale: 1 }

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  // Already signed in — the sign-in page has nothing to offer, so it is not shown (matrix).
  if (await currentUser()) redirect('/')

  const { error } = await searchParams

  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-paper px-6 mobile:px-6">
      {/* The watermark: paper-sunk, unselectable, and behind everything. `aria-hidden` because
          the word is already the wordmark on the card — a screen reader would hear it twice. */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[110px] -translate-x-1/2 select-none whitespace-nowrap font-display text-[130px] font-extrabold tracking-[-0.05em] text-paper-sunk tablet:top-1/2 tablet:-translate-y-[56%] tablet:text-[380px]"
      >
        Inflozo
      </div>

      <SignInForm
        linkError={error === 'link'}
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
