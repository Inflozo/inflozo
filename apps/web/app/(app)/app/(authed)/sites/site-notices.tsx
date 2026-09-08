import type { ReactNode } from 'react'
import { Banner } from '@/components/kit/banner'
import { Button } from '@/components/kit/button'
import { INJECTION_COPY, PLAN_COPY, PORTAL_COPY, PREVIEW_COPY } from '@/lib/probe-rule'
import { answerPlan, answerPortal, dismissInjectionNotice, recheckPlan } from './actions'

/* ───────── STORY 3.3 — the four blocks the probes put on a Sites card, in this order: the
   one-time code-injection notice, the plan question, the Portal question, and B15's Preview-Only
   Notice (`B Missing Surfaces.dc.html:1188-1225`).

   EVERY CONTROL HERE IS A `<form action={serverAction}>` WITH A HIDDEN SITE ID, so all of them
   work with JavaScript off and none of them needs state. There is no client component in this
   file and no `'use client'` — the card is a server render, and the only thing that changes it is
   a POST that revalidates the route.

   THE TWO QUESTIONS USE THE BANNER'S TWO-BUTTON EXCEPTION, the owner's own from his test of story
   2.1 (`components/kit/banner.tsx:9-13`): a banner that ASKS FOR AN ANSWER may carry the Kit's
   32px buttons — a primary for the recommended answer and a secondary for the other. The
   code-injection notice merely TELLS, so it keeps the sentence and one **Got it**.

   B15 IS NOT A BANNER. The frame draws it as its own bordered block with a sky panel inside it,
   an uppercase "What clears this" and a bottom control row above a rule, and that is what is built
   here — from the frame, with **Export theme zip** and **Ship it** ABSENT rather than greyed,
   because no export path and no deploy path exists in any epic yet (UX-DR3; they arrive with E11
   and E7). `PREVIEW_COPY` in `lib/probe-rule.ts` holds every sentence, so the harness reads the
   app's own words rather than retyping them.

   DW-57 BINDS THE CHIP, NOT THIS FILE: the sky "Preview-only" chip is on the card's STATE LINE
   beside "Connected" (`page.tsx`), because it is the connection's state and the pills line is
   metadata. These four blocks are the card's last child. */

export type NoticeSite = {
  id: string
  capability: 'full' | 'preview_only' | null
  capability_source: string | null
  code_injection_notice_shown_at: string | null
  site_settings: {
    code_injection?: boolean
    portal_button_source?: string
    plan_ask?: boolean
  } | null
}

/** The hidden field every one of the four forms carries, and the only input any of them takes. */
const SiteField = ({ id }: { id: string }) => <input type="hidden" name="site_id" value={id} />

/** The Kit's 32px control row, declared once so the Banner's icon centres on it (`banner.tsx`). */
const ROW = 32

function Ask({
  children,
  action,
  primary,
  secondary,
  siteId,
}: {
  children: ReactNode
  action: (formData: FormData) => Promise<void>
  primary: { name: string; value: string; label: string }
  secondary: { name: string; value: string; label: string }
  siteId: string
}) {
  return (
    <Banner kind="info" rowHeight={ROW}>
      <span className="flex flex-col gap-2">
        <span className="flex items-center" style={{ minHeight: ROW }}>
          {children}
        </span>
        <span className="flex flex-wrap items-center gap-2">
          {/* TWO FORMS, NOT ONE WITH TWO SUBMIT VALUES: a submit button's `value` is sent only by
              the button that was pressed, which is true in a browser and NOT true of every
              assistive click path — and with scripts off the difference is silent. One form per
              answer sends its own hidden field, always. */}
          <form action={action}>
            <SiteField id={siteId} />
            <input type="hidden" name={primary.name} value={primary.value} />
            <Button type="submit" size={ROW} variant="primary">
              {primary.label}
            </Button>
          </form>
          <form action={action}>
            <SiteField id={siteId} />
            <input type="hidden" name={secondary.name} value={secondary.value} />
            <Button type="submit" size={ROW} variant="secondary">
              {secondary.label}
            </Button>
          </form>
        </span>
      </span>
    </Banner>
  )
}

export function SiteNotices({ site, recheckFailed }: { site: NoticeSite; recheckFailed?: boolean }) {
  const settings = site.site_settings ?? {}
  // The notice shows while the FACT is true and the COLUMN is null — one is what Ghost says, the
  // other is what the user said about it, and a re-probe rewrites only the first.
  const injection = settings.code_injection === true && !site.code_injection_notice_shown_at
  const planAsk = settings.plan_ask === true
  const portalAsk = settings.portal_button_source === 'default'
  const preview = site.capability === 'preview_only'
  if (!injection && !planAsk && !portalAsk && !preview) return null

  return (
    <div className="flex flex-col gap-[10px]">
      {injection ? (
        <Banner kind="info" rowHeight={ROW}>
          <span className="flex flex-col gap-2">
            <span className="flex items-center" style={{ minHeight: ROW }}>
              {INJECTION_COPY.body}
            </span>
            <form action={dismissInjectionNotice}>
              <SiteField id={site.id} />
              <Button type="submit" size={ROW} variant="secondary">
                {INJECTION_COPY.dismiss}
              </Button>
            </form>
          </span>
        </Banner>
      ) : null}

      {planAsk ? (
        <Ask
          action={answerPlan}
          siteId={site.id}
          primary={{ name: 'capability', value: 'full', label: PLAN_COPY.full }}
          secondary={{ name: 'capability', value: 'preview_only', label: PLAN_COPY.preview }}
        >
          {PLAN_COPY.body}
        </Ask>
      ) : null}

      {portalAsk ? (
        /* "Yes" IS THE PRIMARY, because Portal defaults to ON: the probe already wrote `true`, so
           the recommended answer is the one that changes nothing. */
        <Ask
          action={answerPortal}
          siteId={site.id}
          primary={{ name: 'portal_button', value: 'yes', label: PORTAL_COPY.yes }}
          secondary={{ name: 'portal_button', value: 'no', label: PORTAL_COPY.no }}
        >
          {PORTAL_COPY.body}
        </Ask>
      ) : null}

      {preview ? <PreviewOnly siteId={site.id} recheckFailed={recheckFailed} /> : null}
    </div>
  )
}

/** B15, from the frame: the sky panel with its glyph, What clears this 1 and 2, and Re-check plan. */
function PreviewOnly({ siteId, recheckFailed }: { siteId: string; recheckFailed?: boolean }) {
  return (
    /* LABELLED BY ITS OWN HEADING, not by the chip's word: `aria-label="Preview-only"` repeated a
       string a screen reader had already announced on the state line and threw away the sentence
       that says WHY, which is the heading two lines down (review, 2026-09-08). */
    <section
      aria-labelledby={`preview-${siteId}`}
      className="flex flex-col gap-[15px] rounded-thumb border border-line bg-paper p-[15px]"
    >
      {/* The frame's sky panel (`:1203`), its info glyph drawn at 15px with the same 1.7 stroke. */}
      <div className="flex gap-[11px] rounded-thumb bg-sky-tint p-[13px_15px]">
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          aria-hidden
          className="mt-[2px] shrink-0 text-sky-text"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M12 11v5" />
          <circle cx="12" cy="8" r="0.6" fill="currentColor" />
        </svg>
        <div className="flex flex-col gap-[6px]">
          <h3 id={`preview-${siteId}`} className="text-ui-dense font-semibold text-sky-text">
            {PREVIEW_COPY.title}
          </h3>
          <p className="text-[12.5px] leading-[1.55] text-sky-text">{PREVIEW_COPY.body}</p>
        </div>
      </div>

      <div className="flex flex-col gap-[9px]">
        <h4 className="text-[11.5px] font-semibold uppercase tracking-[0.04em] text-ink-soft">
          {PREVIEW_COPY.clearsTitle}
        </h4>
        {/* NUMBERED IN THE MARKUP, not only in the drawing: the frame's two circled digits are an
            ordered list, so a screen reader hears "1 of 2" rather than a loose paragraph. */}
        <ol className="flex list-none flex-col gap-[7px] p-0">
          {PREVIEW_COPY.clears.map((line, index) => (
            <li key={line} className="flex items-start gap-[10px]">
              <span
                aria-hidden
                className="mt-[1px] inline-flex size-[18px] shrink-0 items-center justify-center rounded-full bg-paper-sunk text-[10px] font-semibold text-ink-soft"
              >
                {index + 1}
              </span>
              <span className="text-[12.5px] leading-[1.5] text-ink">{line}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* The frame's control row above its rule. EXPORT THEME ZIP AND SHIP IT ARE ABSENT, not
          greyed: neither path exists in any epic yet (UX-DR3) and a control that could never act
          is absent. They arrive with E11 and E7. */}
      <div className="flex flex-col gap-2 border-t border-line pt-[14px]">
        <form action={recheckPlan}>
          <SiteField id={siteId} />
          <Button type="submit" size={36} variant="secondary">
            {PREVIEW_COPY.recheck}
          </Button>
        </form>
        {recheckFailed ? (
          <p role="status" className="text-helper-caption text-ink-soft">
            {PREVIEW_COPY.recheckFailed}
          </p>
        ) : null}
      </div>
    </section>
  )
}
