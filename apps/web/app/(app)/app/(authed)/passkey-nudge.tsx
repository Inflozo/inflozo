'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'
import { Banner } from '@/components/kit/banner'
import { Button, buttonClasses } from '@/components/kit/button'
import { isRedirect } from '@/lib/action-redirect'
import { dismissPasskeyNudge } from './account/actions'

/**
 * ITS OWN SENTENCE, not the actions' `passkey_failed`, whose words are about ADDING a passkey
 * ("We couldn't add that passkey just now") and would be a non-sequitur under "Not now".
 */
const DISMISS_FAILED = "We couldn't put that away just now. Try again in a moment."

/**
 * THE POST-ONBOARDING NUDGE — FR-A2's "offered once", extrapolated from the Kit's notice Banner
 * (Editor Sidebar Kit.dc.html:238-241) because no frame draws it. Marigold, because marigold
 * "nudges without blocking" (EXPERIENCE.md); one sentence, one way on, one way out.
 *
 * THE TWO ACTIONS ARE THE KIT'S BUTTONS, NOT LINKS — the owner's test of story 2.1 (2026-09-06):
 * "Add passkey as primary button and Not now as secondary (muted design) button." The Kit's 32px
 * size, the banner's own smallest control; `Add a passkey` stays an anchor so it still opens in a
 * new tab, wearing the primary look through `buttonClasses`.
 *
 * ONCE PER USER, NOT PER DEVICE: the fact is a key in `user_metadata` that arrives inside the
 * dashboard's own `getUser()`, so the answer costs no extra call — and the phone never re-offers
 * what the laptop already answered. Registering a passkey answers it too.
 *
 * `useTransition` and not `useActionState`: the row goes away because the server said so, and
 * until it does the button says what it is doing.
 */
export function PasskeyNudge() {
  const [pending, startTransition] = useTransition()
  // The action revalidates `/app`, so the banner leaves with the re-rendered tree; this holds it
  // shut for the moment before that lands, so the sentence cannot be dismissed twice.
  const [gone, setGone] = useState(false)
  const [failed, setFailed] = useState<string | null>(null)
  if (gone) return null

  function dismiss() {
    // `aria-disabled` does not stop a real button from being pressed again, and a second post
    // would write the nudge key from an already-stale metadata snapshot (review, 2026-09-06).
    if (pending) return
    setFailed(null)
    startTransition(async () => {
      try {
        const result = await dismissPasskeyNudge()
        // NOT HIDDEN BEFORE THE ANSWER ARRIVES. Hiding first made `pending` unreachable — the
        // banner unmounted before "Not now…" could ever paint — and turned a refusal into a row
        // that blinked away and came back with nothing said, which is the symptom the previous
        // review meant to fix and only half did (review, 2026-09-06).
        if ('error' in result) setFailed(DISMISS_FAILED)
        else setGone(true)
      } catch (error) {
        // The session ended and `ready()` sent us to sign in: that navigation is already running.
        // This was the ONE ceremony caller without this guard, so an expired session turned
        // "Not now" into the dashboard's error boundary (review, 2026-09-06).
        if (isRedirect(error)) return
        console.error('passkey: nudge dismiss threw', { name: (error as { name?: string })?.name })
        setFailed(DISMISS_FAILED)
      }
    })
  }

  return (
    <div className="p-[16px_20px] pb-0 tablet:p-6 tablet:pb-0">
      <Banner kind="notice" rowHeight={32}>
        <span className="flex flex-col gap-2">
          <span className="flex flex-wrap items-center gap-x-3 gap-y-2">
            {/* The sentence declares the control row's own height, so its line box is 32px
                whether the buttons sit beside it (1440) or wrap below it (390) — that is what
                keeps the icon level with it in both. */}
            <span className="flex min-h-8 items-center">Sign in faster next time — add a passkey.</span>
            <span className="flex items-center gap-2">
              <Link href="/account" className={buttonClasses('primary', 32)}>
                Add a passkey
              </Link>
              <Button
                size={32}
                variant="secondary"
                aria-busy={pending || undefined}
                aria-disabled={pending || undefined}
                onClick={dismiss}
              >
                {pending ? 'Not now…' : 'Not now'}
              </Button>
            </span>
          </span>
          {/* A refusal is said, in the banner it belongs to — never a row that simply reappears. */}
          {failed ? <span className="text-helper-caption">{failed}</span> : null}
        </span>
      </Banner>
    </div>
  )
}
