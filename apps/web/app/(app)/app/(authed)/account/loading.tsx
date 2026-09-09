/**
 * THE ACCOUNT PAGE'S OWN SKELETON. It is not in the owner's finding by name — he named Projects
 * and Sites — but it is the same defect, and he asked for a thorough check: until this file
 * existed `/account` inherited the dashboard's boundary and drew three project cards in a
 * three-column grid for a page that is a single column of stacked cards.
 *
 * The shape is `page.tsx`'s: the heading, then the column at the frame's own width (S12a's right
 * column beside where Epic 12's 480px plan column will sit), then one card per section in the
 * order the page renders them — Email, Passkeys, Sign out everywhere, Danger zone — each in
 * `email-card.tsx`'s shell: `rounded-lg`, a hairline, 20/24 padding.
 *
 * FOUR CARDS, NOT A COUNT TO KEEP IN STEP. The Passkeys card is absent unless both feature
 * switches are on, so the real page is sometimes three; a skeleton that guessed which would be
 * wrong half the time either way, and one card too many for a beat reads as the page still
 * arriving. Nothing here should be derived from a flag read the skeleton exists to wait for.
 */
export default function Loading() {
  return (
    <div className="flex flex-col gap-4 p-[16px_20px] tablet:gap-5 tablet:p-6" aria-busy>
      {/* The skeleton is decoration; this line is what a screen reader gets meanwhile. */}
      <p className="sr-only">Loading your account…</p>
      <div aria-hidden className="h-[17px] w-[168px] rounded-[3px] bg-paper-sunk" />
      <div aria-hidden className="flex flex-col gap-4 desktop:max-w-[calc(100%-504px)]">
        {[0, 1, 2, 3].map((n) => (
          <div
            key={n}
            className="flex flex-col gap-[14px] rounded-lg border border-line bg-surface p-[20px_24px] shadow-sm"
          >
            <div className="h-[11px] w-[92px] rounded-[3px] bg-paper-sunk" />
            <div className="flex items-center justify-between gap-4">
              <div className="flex min-w-0 flex-1 flex-col gap-[6px]">
                <div className="h-[13px] w-[54%] rounded-[3px] bg-paper-sunk" />
                <div className="h-[11px] w-[72%] rounded-[3px] bg-paper-sunk/70" />
              </div>
              <div className="h-9 w-[108px] shrink-0 rounded bg-paper-sunk/70" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
