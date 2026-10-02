import { notFound } from 'next/navigation'
import { ConnectWizard } from '@/app/(app)/app/(authed)/sites/connect-wizard'
import { HARNESS } from '@/lib/harness'

/** DW-303 (Story 5.24e) — the connect wizard's keys step, mounted for the keyboard gate alone, so `pnpm keyboard` presses
 *  Connect under `next dev`'s StrictMode on every commit. DW-295 (Story 5.24d) was a wizard stuck on "Connecting…" there,
 *  with no POST ever sent — an `alive` ref only the effect's cleanup wrote — and it was walked once, by hand, in the main
 *  session. Its own page, outside `(authed)`, as `harness/error` is: production answers 404 (`app-routes.test.ts`'s
 *  HARNESS_ONLY, and the deployed walk's step 79). */
export default function HarnessConnect() {
  if (!HARNESS) notFound()
  return <ConnectWizard step="keys" />
}
