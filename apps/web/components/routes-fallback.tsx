'use client'

import Link from 'next/link'
import { useActionState, useId } from 'react'
import { verifyRoutesAction } from '@/app/(app)/app/(authed)/sites/actions'
import { buttonClasses } from '@/components/kit/button'
import { ring } from '@/components/kit/greyed'
import { ArrowDown, SquareArrowUp } from '@/components/kit/icons'
import { Submit } from '@/components/kit/submit'
import { keysPath } from '@/lib/connect-rule'
import {
  byteLength, downloadHref, GHOST_ROUTES_HELP, ROUTES_FALLBACK_WORDS as W, sizeLabel, type RoutesFallback, type VerifyOutcome,
} from '@/lib/routes-upload'

/* ───────── STORY 7.17 — B16, THE ROUTES FALLBACK CARD (FR-I4), from `B Missing Surfaces.dc.html:1229-1270` as EXPERIENCE F3
   re-specifies it (R-74): the 600px card, its header tile and glyph, three numbered steps (the first carrying the file
   chip), and the footer's primary, secondary and footnote, in the frame's tokens through the Kit's (`globals.css`).

   IT IS A CARD, NEVER A TOAST OR A `Banner` (F3), and it has exactly two hosts, both server renders that mount it while the
   site still needs its routing (`sites.routes_fallback` set): the last child of the site's card on Sites
   (`site-notices.tsx`, where B15 sits) and the top of Routes & Templates, for the linked site. Story 7.18's Ship it opens
   it at its ending on a `fallback`; nothing here uploads.

   THE CAUSE DECIDES THREE THINGS AND NOTHING ELSE: the body, the secondary button and the footnote
   (`ROUTES_FALLBACK_WORDS`). No token is the frame verbatim; a token that stopped working says **Update the token**; a
   token below Administrator has neither button nor footnote, because a token cannot be given a role (F3).

   THE DOWNLOAD IS A `data:` LINK (routine call 10) — the file Inflozo offered, byte for byte, so nothing new is stored and
   no route is added. **Verify upload** is the Kit's `Submit` with its busy label (R-98), calling `verifyRoutesAction`; its
   answer is drawn here and the page is not revalidated, so a verified card becomes its one line and is gone at the next
   load (F3's "does not return"). */

/** `heading` — the title's level in its host's outline: an h3 under a Sites card's h2, an h2 under Routes & Templates' h1. */
export function RoutesFallback({ siteId, cause, file, heading: Heading = 'h3' }: { siteId: string; cause: RoutesFallback; file: string; heading?: 'h2' | 'h3' }) {
  const id = useId()
  const [said, verify] = useActionState<VerifyOutcome | null, FormData>(verifyRoutesAction, null)
  const card = 'flex w-full max-w-[600px] flex-col overflow-hidden rounded border border-line bg-surface shadow-sm'

  if (said?.kind === 'verified') {
    return (
      <section data-routes-fallback="verified" className={card}>
        <p role="status" className="p-[16px_20px] text-[13px] leading-[1.5] text-ink">{W.verified}</p>
      </section>
    )
  }

  const button = W.button[cause]
  const footnote = W.footnote[cause]
  const step = 'inline-flex size-[19px] shrink-0 items-center justify-center rounded-full bg-ink text-[10px] font-semibold text-surface mt-px'
  return (
    <section data-routes-fallback={cause} aria-labelledby={`${id}-title`} className={card}>
      <div className="flex items-start gap-3 border-b border-line-faint p-[18px_20px]">
        <span aria-hidden className="flex size-8 shrink-0 items-center justify-center rounded-[9px] bg-line-soft text-ink-soft-aa">
          <SquareArrowUp size={15} />
        </span>
        <div className="flex flex-1 flex-col gap-[5px]">
          <Heading id={`${id}-title`} className="text-[15px] font-semibold text-ink">{W.title}</Heading>
          <p className="text-[12.5px] leading-[1.55] text-ink-mid">{W.body[cause]}</p>
        </div>
      </div>
      <div className="flex flex-col gap-[13px] p-[16px_20px]">
        {/* an ordered list in the markup, as B15's steps are: a reader hears "1 of 3" */}
        <ol className="flex list-none flex-col gap-[9px] p-0">
          <li className="flex items-start gap-[11px]">
            <span aria-hidden className={step}>1</span>
            <div className="flex flex-1 flex-col gap-[7px]">
              <span id={`${id}-download`} className="text-[13px] leading-[1.5] text-ink">{W.download}</span>
              <div className="flex items-center gap-[10px] rounded-[9px] border border-line bg-paper-raised p-[9px_11px]">
                <span id={`${id}-file`} className="flex-1 font-mono text-[11px] text-ink [font-variant-ligatures:none]">{W.file}</span>
                <span data-size className="font-mono text-[10px] text-ink-soft-aa [font-variant-ligatures:none]">{sizeLabel(byteLength(file))}</span>
                <a
                  data-download
                  href={downloadHref(file)}
                  download={W.file}
                  aria-labelledby={`${id}-download ${id}-file`}
                  className={`flex size-6 items-center justify-center rounded-[7px] border border-line bg-surface text-ink-soft-aa transition-colors hover:bg-line-soft ${ring}`}
                >
                  <ArrowDown size={11} />
                </a>
              </div>
            </div>
          </li>
          <li className="flex items-start gap-[11px]">
            <span aria-hidden className={step}>2</span>
            <span className="flex-1 text-[13px] leading-[1.5] text-ink">
              {W.find}{' '}
              <a
                data-where
                href={GHOST_ROUTES_HELP}
                target="_blank"
                rel="noreferrer"
                className={`whitespace-nowrap border-b border-coral-text/35 font-semibold text-coral-text ${ring}`}
              >
                {W.where}
              </a>
            </span>
          </li>
          <li className="flex items-start gap-[11px]">
            <span aria-hidden className={step}>3</span>
            <span className="flex-1 text-[13px] leading-[1.5] text-ink">{W.verifyStep}</span>
          </li>
        </ol>
        {said === null ? null : (
          <p data-verify-said={said.kind} role="status" className="text-[12.5px] leading-[1.55] text-ink-mid">
            {said.kind === 'notYet' ? W.notYet : W.unreachable}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-[10px] border-t border-line-faint pt-[14px]">
          <form action={verify}>
            <input type="hidden" name="site_id" value={siteId} />
            <Submit variant="primary" size={36} busy={W.verifying}>{W.verify}</Submit>
          </form>
          {button === null ? null : (
            <Link data-token href={keysPath(siteId)} className={buttonClasses('secondary', 36)}>{button}</Link>
          )}
          {footnote === null ? null : (
            <>
              <span className="flex-1" />
              <span className="text-[11.5px] text-ink-soft">{footnote}</span>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
