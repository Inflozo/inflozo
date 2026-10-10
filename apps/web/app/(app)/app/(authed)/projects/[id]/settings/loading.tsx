/**
 * THESE ROWS' OWN SHAPE, never a parent's (R-98, and the owner's test of Story 3.4, finding 2): the back arrow and the
 * heading, then D6a's two columns in the page's order. On the left, Posts per page (its heading, the stepper and its chip,
 * the caption), the rule, Site basics (its heading and line, three Ghost-owned rows) and R-131's block, flat under its rule
 * as D6a draws it (Question 4, owner, 2026-10-10) — "This project" over its pill and caption, the bordered clear row. On the
 * right, Custom settings (the heading and meter, two captions), the freeze notice, one setting's row and the dashed Promote
 * form with its "What your site's owner will see" box. Story 7.9 drew the rows it built; nothing D6a leaves to a later
 * story is drawn, so the skeleton promises no screen this page does not have.
 *
 * Its segment has no child routes, so this boundary stands over exactly one route — the half a first fix of that
 * finding got wrong, and what the `(editor)` route group next door exists to keep true (`busy.test.ts`).
 */
const BAR = 'rounded-[3px] bg-paper-sunk'
const FAINT = 'rounded-[3px] bg-paper-sunk/70'

export default function Loading() {
  return (
    <div className="flex flex-col gap-4 p-[16px_20px] tablet:gap-5 tablet:p-6" aria-busy>
      <p className="sr-only">Loading theme settings…</p>
      <div aria-hidden className="flex flex-col gap-4 tablet:gap-5">
        <div className="flex items-center gap-[10px]">
          <div className="size-7 shrink-0 rounded-sm bg-paper-sunk/70" />
          <div className={`h-[15px] w-[128px] ${BAR}`} />
        </div>
        <div className="flex flex-col gap-6 tablet:flex-row tablet:items-start">
          <div className="flex min-w-0 flex-1 flex-col gap-[15px]">
            {/* Posts per page */}
            <div className="flex flex-col gap-2">
              <div className={`h-[20px] w-[150px] ${BAR}`} />
              <div className="flex items-center gap-[11px]">
                <div className="h-[38px] w-[130px] rounded-sm bg-paper-sunk" />
                <div className="h-[18px] w-[104px] rounded-pill bg-paper-sunk/70" />
              </div>
              <div className={`h-[11px] w-[88%] ${FAINT}`} />
            </div>
            <div className="h-px bg-line-faint" />
            {/* Site basics */}
            <div className="flex flex-col gap-[15px]">
              <div className="flex flex-col gap-1">
                <div className={`h-[20px] w-[118px] ${BAR}`} />
                <div className={`h-[12px] w-[70%] ${FAINT}`} />
              </div>
              {[0, 1, 2].map((row) => (
                <div key={row} className="flex flex-col gap-[6px]">
                  <div className={`h-[11px] w-[76px] ${FAINT}`} />
                  <div className="h-[38px] rounded-sm bg-paper-sunk" />
                  <div className={`h-[11px] w-[132px] ${FAINT}`} />
                </div>
              ))}
            </div>
            {/* R-131's block */}
            <div className="flex flex-col gap-[9px] border-t border-line-faint pt-[14px]">
              <div className="flex flex-col gap-[6px]">
                <div className={`h-[11px] w-[76px] ${FAINT}`} />
                <div className="h-[34px] w-[220px] rounded-pill bg-paper-sunk" />
                <div className={`h-[11px] w-[88%] ${FAINT}`} />
              </div>
              <div className="flex flex-col gap-[6px]">
                <div className="flex items-center gap-[10px] rounded-sm border border-line p-[9px_11px]">
                  <div className="size-3 shrink-0 rounded-full bg-paper-sunk" />
                  <div className="flex min-w-0 flex-1 flex-col gap-[4px]">
                    <div className={`h-[11px] w-[132px] ${BAR}`} />
                    <div className={`h-[10px] w-[168px] ${FAINT}`} />
                  </div>
                  <div className="h-7 w-[58px] shrink-0 rounded-[9px] bg-paper-sunk/70" />
                </div>
                <div className={`h-[10px] w-[80%] ${FAINT}`} />
              </div>
            </div>
          </div>
          <div className="hidden w-px self-stretch bg-line-faint tablet:block" />
          {/* Custom settings */}
          <div className="flex min-w-0 flex-1 flex-col gap-3">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <div className={`h-[14px] w-[120px] flex-none ${BAR}`} />
                <div className="ml-auto h-[18px] w-[64px] rounded-pill bg-paper-sunk/70" />
              </div>
              <div className={`h-[12px] w-[92%] ${FAINT}`} />
              <div className={`h-[11px] w-[80%] ${FAINT}`} />
            </div>
            <div className="h-[40px] rounded-thumb border border-line bg-paper-raised" />
            <div className="flex items-center gap-[11px] rounded-thumb border border-line bg-surface p-[10px_12px]">
              <div className="flex min-w-0 flex-1 flex-col gap-[4px]">
                <div className={`h-[12px] w-[120px] ${BAR}`} />
                <div className={`h-[10px] w-[180px] ${FAINT}`} />
              </div>
              <div className="h-[16px] w-[52px] shrink-0 rounded-pill bg-paper-sunk/70" />
            </div>
            <div className="flex flex-col gap-[10px] rounded-thumb border border-dashed border-line-strong bg-paper-raised p-3">
              <div className={`h-[12px] w-[118px] ${BAR}`} />
              <div className="h-[38px] rounded-sm bg-paper-sunk" />
              <div className="flex gap-2">
                <div className="h-9 flex-1 rounded-sm bg-paper-sunk" />
                <div className="h-9 flex-1 rounded-sm bg-paper-sunk" />
              </div>
              <div className="h-[38px] rounded-sm bg-paper-sunk" />
              <div className="h-9 rounded-sm bg-paper-sunk" />
              <div className="flex flex-col gap-[6px] rounded-thumb border border-line bg-surface p-[11px_12px]">
                <div className={`h-[10px] w-[150px] ${FAINT}`} />
                <div className={`h-[12px] w-[92%] ${BAR}`} />
                <div className={`h-[12px] w-[60%] ${BAR}`} />
              </div>
              <div className="h-8 w-[84px] rounded-thumb bg-paper-sunk" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
