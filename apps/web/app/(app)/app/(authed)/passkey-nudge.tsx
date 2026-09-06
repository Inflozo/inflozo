'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'
import { Banner } from '@/components/kit/banner'
import { Button, buttonClasses } from '@/components/kit/button'
import { dismissPasskeyNudge } from './account/actions'

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
 * `useTransition` and not `useActionState`: there is no result to render. The row goes away
 * because the server said so, and until it does the button says what it is doing.
 */
export function PasskeyNudge() {
  const [pending, startTransition] = useTransition()
  // The action revalidates `/app`, so the banner leaves with the re-rendered tree; this is only
  // for the moment before it does, so the sentence cannot be dismissed twice.
  const [gone, setGone] = useState(false)
  if (gone) return null

  return (
    <div className="p-[16px_20px] pb-0 tablet:p-6 tablet:pb-0">
      <Banner kind="notice">
        <span className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <span>Sign in faster next time — add a passkey.</span>
          <span className="flex items-center gap-2">
            <Link href="/account" className={buttonClasses('primary', 32)}>
              Add a passkey
            </Link>
            <Button
              size={32}
              variant="secondary"
              aria-disabled={pending || undefined}
              onClick={() =>
                startTransition(async () => {
                  setGone(true)
                  // A refused dismissal would otherwise vanish now and be back on the next visit
                  // with nothing said; the banner stays, and the button is live again.
                  const result = await dismissPasskeyNudge()
                  if ('error' in result) setGone(false)
                })
              }
            >
              {pending ? 'Not now…' : 'Not now'}
            </Button>
          </span>
        </span>
      </Banner>
    </div>
  )
}
