'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { Button } from '@/components/kit/button'
import { ring } from '@/components/kit/greyed'

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
 * an `error.tsx` never catches its own segment's layout. `revalidatePath` after a write
 * re-renders the shell and the page together, so a boundary that covered only the page would
 * have missed half of the thing it exists for.
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

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-paper p-6 text-center">
      <span className="font-display text-[20px] font-extrabold tracking-[-0.02em] text-ink">Inflozo</span>
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
    </div>
  )
}
