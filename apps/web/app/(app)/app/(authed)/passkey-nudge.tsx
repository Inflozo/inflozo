'use client'

import { useState, useTransition } from 'react'
import { Banner, BannerLink } from '@/components/kit/banner'
import { ring } from '@/components/kit/greyed'
import { dismissPasskeyNudge } from './account/actions'

/**
 * THE POST-ONBOARDING NUDGE — FR-A2's "offered once", extrapolated from the Kit's notice Banner
 * (Editor Sidebar Kit.dc.html:238-241) because no frame draws it. Marigold, because marigold
 * "nudges without blocking" (EXPERIENCE.md); one sentence, one link, one way out.
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
        Sign in faster next time — add a passkey.{' '}
        <BannerLink href="/account">Add a passkey</BannerLink>{' '}
        <button
          type="button"
          aria-disabled={pending || undefined}
          onClick={() =>
            startTransition(async () => {
              setGone(true)
              await dismissPasskeyNudge()
            })
          }
          className={`font-semibold underline underline-offset-2 ${ring}`}
        >
          {pending ? 'Not now…' : 'Not now'}
        </button>
      </Banner>
    </div>
  )
}
