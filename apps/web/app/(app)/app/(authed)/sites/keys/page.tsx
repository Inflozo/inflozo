import type { Metadata } from 'next'
import { panelBox } from '@/components/kit/dialog'
import { KeysScreen, type KeysSearchParams } from '../keys-screen'

/* ───────── FR-C8's MANAGE KEYS, on its own route — S11e's wide panel as a full page.

   SINCE THE OWNER'S TEST (finding 1, 2026-09-10) THIS IS NOT THE ONLY WAY IN, AND IT IS STILL THE
   ONE THAT ALWAYS WORKS. S11a's ⋯ "Manage API keys" is an `<a href="/sites/keys?site=…">` whose
   click JavaScript turns into a soft navigation, which `@modal/(.)keys` intercepts and draws as a
   popup over the Sites list. Every other way here is a document load and lands on THIS page: a
   typed URL, a modified click, a new tab, a refresh, a shared link, and a browser with scripts
   off. `keys-screen.tsx` is the component both render, so there is one panel and one credential
   read whichever door was used.

   NO `loading.tsx`, and that is deliberate rather than forgotten (R-98): nothing soft-navigates
   to THIS route. The one soft navigation that aims at `/sites/keys` is intercepted before it gets
   here, and `@modal/(.)keys/loading.tsx` is the skeleton it shows. Everything that reaches this
   file is a document load with the browser's own progress on it. `sites/disconnect` and
   `sites/connect` carry the same reason, and `busy.test.ts` carries all three. */

export const metadata: Metadata = {
  title: 'API keys · Inflozo',
  robots: { index: false, follow: false },
}

export default async function Keys({ searchParams }: { searchParams: Promise<KeysSearchParams> }) {
  return (
    <div className="flex flex-1 items-center justify-center p-[16px_20px] tablet:p-6">
      {/* `panelBox` AND NOT A COPY OF IT — the review of 2026-09-09 found `sites/disconnect` had
          hand-copied the sheet's tokens and already diverged on `max-w`. `flex` is this page's
          own: `panelSheet` says `open:flex`, which means nothing on a plain element. */}
      <div className={`flex flex-col ${panelBox}`}>
        <KeysScreen searchParams={searchParams} />
      </div>
    </div>
  )
}
