/**
 * THESE ROWS' OWN SHAPE, never a parent's (R-98, and the owner's test of Story 3.4, finding 2): the back arrow and
 * the heading, then the card holding D6a's "This project" label over its two-segment pill, its caption, and the
 * bordered clear row with its two lines and its button. Nothing else — the rest of D6a is Epic 7's and absent, so a
 * skeleton of it would promise a screen this story does not build.
 *
 * Its segment has no child routes, so this boundary stands over exactly one route — the half a first fix of that
 * finding got wrong, and what the `(editor)` route group next door exists to keep true (`busy.test.ts`).
 */
export default function Loading() {
  return (
    <div className="flex flex-col gap-4 p-[16px_20px] tablet:gap-5 tablet:p-6" aria-busy>
      <p className="sr-only">Loading theme settings…</p>
      <div aria-hidden className="flex flex-col gap-4 tablet:gap-5">
        <div className="flex items-center gap-[10px]">
          <div className="size-7 shrink-0 rounded-sm bg-paper-sunk/70" />
          <div className="h-[15px] w-[128px] rounded-[3px] bg-paper-sunk" />
        </div>
        <div className="flex max-w-[520px] flex-col gap-[14px] rounded border border-line bg-surface p-[18px] shadow-sm">
          <div className="flex flex-col gap-[6px]">
            <div className="h-[11px] w-[76px] rounded-[3px] bg-paper-sunk/70" />
            <div className="h-[34px] w-[220px] rounded-pill bg-paper-sunk" />
            <div className="h-[11px] w-[88%] rounded-[3px] bg-paper-sunk/70" />
          </div>
          <div className="flex flex-col gap-[6px] border-t border-line pt-[14px]">
            <div className="flex items-center gap-[10px] rounded-sm border border-line p-[9px_11px]">
              <div className="size-3 shrink-0 rounded-full bg-paper-sunk" />
              <div className="flex min-w-0 flex-1 flex-col gap-[4px]">
                <div className="h-[11px] w-[132px] rounded-[3px] bg-paper-sunk" />
                <div className="h-[10px] w-[168px] rounded-[3px] bg-paper-sunk/70" />
              </div>
              <div className="h-7 w-[58px] shrink-0 rounded-[9px] bg-paper-sunk/70" />
            </div>
            <div className="h-[10px] w-[80%] rounded-[3px] bg-paper-sunk/70" />
          </div>
        </div>
      </div>
    </div>
  )
}
