import { notFound } from 'next/navigation'
import { HARNESS } from '@/lib/harness'

/** Story 5.24b (DW-91) — the one page that throws on purpose, so `pnpm keyboard` can put the app's error boundary
 *  (`app/(app)/app/error.tsx`) on a screen and read the tab title it sets: nothing else on a local build ever reaches
 *  it, and Story 3.9's fix of that title was checked once, by hand. It does not exist unless INFLOZO_HARNESS=1, as
 *  every harness page (`app-routes.test.ts`'s HARNESS_ONLY): production answers 404, and the deployed walk's step 79
 *  asserts it does. */
export default function HarnessError() {
  if (!HARNESS) notFound()
  throw new Error('harness: the app error boundary, on purpose')
}
