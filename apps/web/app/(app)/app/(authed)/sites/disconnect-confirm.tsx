import type { ReactNode } from 'react'
import { LinkOff } from '@/components/kit/icons'
import { Submit } from '@/components/kit/submit'
import { title } from '@/components/kit/dialog'
import { DISCONNECT } from '@/lib/connect-rule'
import { disconnectSite } from './actions'

/* ────────────────────────────── THE CONFIRM ITSELF, ONCE, FOR BOTH PLACES IT APPEARS.

   `site-menu.tsx` renders it inside S11a's `<dialog>`; `disconnect/page.tsx` renders the SAME
   component as a full page, which is where the ⋯ row's link lands when nothing intercepts it. One
   component and not two, for the reason `ConnectWizard` is one component behind S11b and
   `/sites/connect`: two copies of a confirm are two chances for the sentence, the glyph or the
   hidden field to drift apart, and the harness reads the copy out of `lib/connect-rule.ts` so it
   would not see the drift.

   NO `'use client'`. Everything here is static markup plus a `<form action={disconnectSite}>` — a
   server action's dispatch, which is exactly what makes the POST work with scripts off — so the
   server page renders it directly and the client menu renders it as a child.

   CANCEL IS THE CALLER'S, because the way out differs and only that: in the dialog it is a button
   that closes the dialog, on the page it is a link back to Sites. Everything the customer READS is
   the same either way. */

export function DisconnectConfirm({ id, name, cancel }: { id: string; name: string; cancel: ReactNode }) {
  return (
    <>
      <div className="flex flex-col items-center gap-[14px] text-center">
        <span
          aria-hidden
          className="inline-flex size-[52px] shrink-0 items-center justify-center rounded-full bg-danger-tint text-danger ring-8 ring-danger-tint/50"
        >
          <LinkOff size={22} strokeWidth={1.7} />
        </span>
        <div className="flex min-w-0 flex-col gap-[6px]">
          <h2 id={`disconnect-${id}-title`} className={`${title} wrap-anywhere`}>
            {DISCONNECT.title(name)}
          </h2>
          <p className="text-ui-dense leading-[1.5] text-ink-soft">{DISCONNECT.body}</p>
        </div>
      </div>

      <form action={disconnectSite} className="flex flex-col gap-5">
        <input type="hidden" name="site_id" value={id} />
        {/* Two equal halves, so neither choice looks like the small one and both are a full-width
            tap target at 390. Cancel is first: it is the way out, and it is what opens focused. */}
        <div className="grid grid-cols-2 gap-[10px]">
          {cancel}
          {/* LIVE ON THE FIRST CLICK — there is no field to type into and nothing greys it. */}
          <Submit variant="danger" size={44} className="w-full" busy={DISCONNECT.busy}>
            {DISCONNECT.menu}
          </Submit>
        </div>
      </form>
    </>
  )
}
