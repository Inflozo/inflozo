'use client'

import { Button, buttonClasses } from '@/components/kit/button'
import { adminAt, PAYWALL_WORDS } from '@/lib/paywall'

/* ─────────────────────────────────────────── Story 5.20 — C3b, THE PAYWALL CANVAS WITH MEMBERS SWITCHED OFF.

   `C Post Body.dc.html` C3b (:1649-1678), in A7 item 12's words as R-198 corrected them (`lib/paywall.ts`): the 400px
   card on the mat, its drawing, the title in Bricolage 20/700, the sentence, two numbered steps over a hairline, **Open
   Ghost admin** in ink and **Re-check** as the white bordered button, and the footnote. Step 2's "pick a design" is "we
   re-check whenever you open this screen" because nothing can be picked until Story 10.107 (the spec's Design Notes).

   IT READS THE RECORD (`site_settings.members`), NEVER THE CONTENT API, and it stands in for the canvas only while the
   canvas shows the site's content: on Sample content the sample paywall draws as ever (the I/O matrix's two rows).

   RE-CHECK IS R-98's PRESSED CONTROL: "Re-checking…" and `aria-busy` while the Admin read runs, NEVER `disabled` —
   `busy.test.ts` holds the shape — and it stays pressable reading along (R-192: a look, not an edit). A refusal is the
   one sentence under the buttons; the record is then unchanged. Open Ghost admin opens a new tab and says so. */

export function PaywallNotice({
  site,
  url,
  busy,
  refusal,
  onRecheck,
}: {
  /** the site's one name (R-170) */
  site: string
  /** the site's address, where Ghost admin lives */
  url: string
  /** a Re-check is in flight */
  busy: boolean
  /** the last Re-check's refusal sentence, or null */
  refusal: string | null
  onRecheck: () => void
}) {
  return (
    <section
      aria-labelledby="paywall-off-title"
      data-paywall-off
      className="flex w-[400px] max-w-full flex-col items-center gap-[15px] rounded-sm bg-paper-raised px-8 py-[30px] text-center shadow-md"
    >
      {/* C3b's own drawing (:1657-1663): a page with a warning mark — decorative, so it is hidden from the tree */}
      <svg width="72" height="56" viewBox="0 0 72 56" fill="none" aria-hidden className="shrink-0">
        <rect x="10" y="12" width="52" height="34" rx="3" className="stroke-line-strong" strokeWidth="1.5" />
        <path d="M10 24h52" className="stroke-line-strong" strokeWidth="1.5" />
        <path d="M20 33h13M20 39h20" className="stroke-line-strong" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="52" cy="36" r="9" className="fill-coral-tint stroke-coral" strokeWidth="1.5" />
        <path d="M52 32v5M52 40.5v.5" className="stroke-coral" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
      <div className="flex flex-col gap-[7px]">
        <h2 id="paywall-off-title" className="font-display text-[20px] font-bold tracking-[-0.015em] text-ink-deep">
          {PAYWALL_WORDS.offTitle}
        </h2>
        <p className="text-[13px] leading-[1.6] text-ink-mid">{PAYWALL_WORDS.offBody(site)}</p>
      </div>
      <ol role="list" className="flex w-full list-none flex-col gap-2 border-t border-line-faint pt-[15px]">
        {[PAYWALL_WORDS.offStep1, PAYWALL_WORDS.offStep2].map((step, n) => (
          <li key={step} className="flex items-center gap-[9px] text-left">
            <span aria-hidden className="inline-flex size-[18px] shrink-0 items-center justify-center rounded-full bg-paper-sunk text-[10px] font-semibold text-ink-soft-aa">
              {n + 1}
            </span>
            <span className="text-[12px] leading-[1.45] text-ink-mid">{step}</span>
          </li>
        ))}
      </ol>
      <div className="flex w-full gap-[9px] pt-[3px]">
        {/* C3b draws the words alone, so the new tab is said to a screen reader rather than drawn */}
        <a href={adminAt(url, 'members')} target="_blank" rel="noreferrer" className={`${buttonClasses('primary', 36)} flex-1 whitespace-nowrap`}>
          {PAYWALL_WORDS.openAdmin}
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
        <Button
          id="paywall-recheck"
          variant="secondary"
          size={36}
          className="flex-1 whitespace-nowrap"
          aria-busy={busy || undefined}
          onClick={() => {
            if (!busy) onRecheck()
          }}
        >
          {busy ? PAYWALL_WORDS.rechecking : PAYWALL_WORDS.recheck}
        </Button>
      </div>
      {refusal === null ? null : (
        <p role="status" className="text-[12px] leading-[1.45] text-danger-text">
          {refusal}
        </p>
      )}
      <p className="text-[11.5px] leading-[1.5] text-ink-soft-aa">{PAYWALL_WORDS.offFoot}</p>
    </section>
  )
}
