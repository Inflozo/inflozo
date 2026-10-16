import type { ReactNode } from 'react'
import { ROUTES_WORDS } from '@/lib/routes'

/**
 * THE ROUTES PAGE'S OWN SHAPE (R-98, the owner's test of Story 3.4, finding 2): S9a's — the 56px bar (the back arrow, the
 * title, the site chip), then the two panes. On the left the Collections heading, its helper and two cards, the dashed
 * "+ New collection"; Custom routes with one row; Templates with one row; Taxonomies' two rows. On the right the banner
 * and the file card with its header and numbered lines. Its segment has no child routes, so it stands over exactly this
 * route (`busy.test.ts`), and "Manage routes" says "Opening…" while it shows.
 */
const BAR = 'rounded-[3px] bg-paper-sunk'
const FAINT = 'rounded-[3px] bg-paper-sunk/70'

const Heading = ({ w }: { w: string }) => <div className={`h-[13px] ${w} ${BAR}`} />
const Card = ({ children }: { children: ReactNode }) => (
  <div className="flex flex-col overflow-hidden rounded border border-line bg-surface">{children}</div>
)
const Row = ({ last = false }: { last?: boolean }) => (
  <div className={`flex items-center gap-3 p-[12px_16px] ${last ? '' : 'border-b border-line'}`}>
    <div className={`h-[12px] w-[90px] ${BAR}`} />
    <div className={`h-[18px] w-[110px] rounded-pill ${FAINT}`} />
    <div className={`ml-auto h-[12px] w-[18px] ${FAINT}`} />
  </div>
)

export default function Loading() {
  return (
    <div className="flex h-dvh flex-col bg-paper" aria-busy>
      <p className="sr-only">{ROUTES_WORDS.loading}</p>
      <div aria-hidden className="flex min-h-0 flex-1 flex-col">
        <div className="flex h-14 shrink-0 items-center gap-3 border-b border-line px-5">
          <div className="size-7 rounded-sm bg-paper-sunk/70" />
          <div className={`h-[17px] w-[170px] ${BAR}`} />
          <div className="h-[24px] w-[110px] rounded-pill border border-line bg-surface" />
        </div>
        <div className="flex min-h-0 flex-1 flex-col tablet:flex-row">
          <div className="flex flex-[1.1] flex-col gap-[18px] border-line p-[22px_24px] tablet:border-r">
            <div className="flex flex-col gap-[10px]">
              <Heading w="w-[96px]" />
              <div className={`h-[11px] w-[90%] ${FAINT}`} />
              {[0, 1].map((n) => (
                <div key={n} className="flex items-center gap-3 rounded border border-line bg-surface p-[14px_16px] shadow-sm">
                  <div className="h-[26px] w-[96px] rounded-sm bg-paper-sunk" />
                  <div className="flex flex-1 flex-col gap-[5px]">
                    <div className={`h-[12px] w-[90px] ${BAR}`} />
                    <div className={`h-[11px] w-[150px] ${FAINT}`} />
                  </div>
                  <div className={`h-[18px] w-[86px] rounded-pill ${FAINT}`} />
                  <div className={`h-[18px] w-[70px] rounded-pill ${FAINT}`} />
                </div>
              ))}
              <div className="h-8 w-[130px] rounded-sm border border-dashed border-line-strong" />
            </div>
            <div className="flex flex-col gap-[10px]">
              <Heading w="w-[110px]" />
              <Card><Row last /></Card>
            </div>
            <div className="flex flex-col gap-[10px]">
              <Heading w="w-[84px]" />
              <Card><Row last /></Card>
            </div>
            <div className="flex flex-col gap-[10px]">
              <Heading w="w-[92px]" />
              <Card><Row /><Row last /></Card>
            </div>
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-3 p-[22px_24px]">
            <div className="h-[40px] rounded-thumb border border-line bg-surface" />
            <div className="flex flex-1 flex-col overflow-hidden rounded border border-line bg-surface">
              <div className="flex items-center gap-2 border-b border-line p-[10px_16px]">
                <div className={`h-[12px] w-[84px] ${BAR}`} />
                <div className={`h-[11px] w-[200px] ${FAINT}`} />
              </div>
              <div className="flex flex-col gap-[11px] p-[16px]">
                {['w-[40%]', 'w-[30%]', 'w-[55%]', 'w-[45%]', 'w-[50%]', 'w-[35%]', 'w-[60%]'].map((w, n) => (
                  <div key={n} className="flex items-center gap-4">
                    <div className={`h-[11px] w-[16px] ${FAINT}`} />
                    <div className={`h-[11px] ${w} ${BAR}`} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
