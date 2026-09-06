'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { Button } from '@/components/kit/button'
import { ring } from '@/components/kit/greyed'
import { Lockup } from '@/components/kit/logo'

/**
 * THE APP'S ERROR BOUNDARY — DW-17, closed here because the owner met it.
 *
 * With no boundary anywhere under `/app`, anything that threw in the browser fell through to
 * Next's own global error, which is an unbranded page reading "This page couldn't load. Reload
 * to try again, or go back." That is what the owner saw twice after deleting a project (his
 * findings 3 and 8, 2026-09-05) — the bare page is this file's absence, whatever threw.
 *
 * It sits at the `/app` segment rather than inside `(authed)`, so it catches a throw in the
 * SHELL as well as in a page: the shell is `(authed)/layout.tsx`, a child of this segment, and
 * an `error.tsx` never catches its own segment's layout. The shell is on screen for every one of
 * those pages, so a boundary that covered only the page would have missed half of the thing it
 * exists for. (This sentence used to justify itself with "`revalidatePath` after a write
 * re-renders the shell and the page together" — an assertion about a framework that nothing here
 * executes, and the wrong one: every call in `projects/actions.ts` is `revalidatePath(DASHBOARD)`
 * at the default `'page'` scope, which does not revalidate the layout. Standing rule 1 — the
 * claim is gone rather than restated, because the boundary's placement never needed it. If a
 * later story has to refresh the shell itself — the plan badge after an upgrade is the one in
 * sight — that call is the one that takes `'layout'`; review, 2026-09-06.)
 * ponytail: one boundary for the whole app host — it loses the sidebar while it is showing. A
 * second `error.tsx` inside `(authed)` keeps the shell for page-level throws; add it if a real
 * error turns out to be common enough that the sidebar is worth having on screen beside it.
 *
 * `reset()` re-renders the segment without a reload, which is the right first move for the
 * transient case (a dropped connection, a deploy landing mid-action). The link is the second.
 */
export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  // The digest only: logs carry no user content (spine, Security floor), and the message of a
  // production error is a digest anyway.
  useEffect(() => {
    console.error('app: unhandled error', { digest: error.digest })
  }, [error])

  // `<main>` and not a `<div>`: this boundary replaces the whole document, OUTSIDE the shell's
  // own `<main>` in `(authed)/layout.tsx`, so without it the heading and both controls sit in no
  // landmark at all — axe's `region` rule, the same one `/kit` was changed for (review,
  // 2026-09-06). It is never on screen beside the shell, so there is still exactly one.
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-paper p-6 text-center">
      {/* The S3 extrapolation draws the word alone; the LOGO is this page's one departure from
          it (owner, 2026-09-06 — DW-31 → Story 1.6). No link: the page's own button is the way
          out, and a second route out of a broken render is a second thing that can break. */}
      <Lockup size={20} />
      <div className="flex max-w-[420px] flex-col gap-2">
        <h1 className="font-display text-[28px] font-bold tracking-[-0.01em] text-ink">
          We couldn&rsquo;t show that just now.
        </h1>
        <p className="text-[15px] leading-[1.55] text-ink-soft">
          Nothing you have made is lost. Try again — and if it keeps happening, tell us and we&rsquo;ll
          look.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button variant="coral" size={44} onClick={reset}>
          Try again
        </Button>
        <Link
          href="/"
          className={`rounded-sm text-ui-dense font-medium text-ink-soft underline underline-offset-[3px] hover:text-ink ${ring}`}
        >
          Back to your projects
        </Link>
      </div>
    </main>
  )
}
