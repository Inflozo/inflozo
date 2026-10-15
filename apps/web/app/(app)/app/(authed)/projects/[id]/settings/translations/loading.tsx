/**
 * TRANSLATIONS' OWN SHAPE, never a parent's (R-98, and the owner's test of Story 3.4, finding 2): B18's card — its header
 * (the title, its sentence and the scope line beside the language button), the three column heads and the rows, mono key,
 * English default and the field, on B18's alternating grounds. The back arrow, the heading and D6a's rail are
 * `settings/layout.tsx`'s, drawn above this boundary, so the skeleton draws neither. Its segment has no child routes, so it
 * stands over this route alone (`busy.test.ts`).
 */
import { TRANSLATION_WORDS } from '@/lib/translations'

const BAR = 'rounded-[3px] bg-paper-sunk'
const FAINT = 'rounded-[3px] bg-paper-sunk/70'
const ROWS = [0, 1, 2, 3, 4, 5, 6, 7]

export default function Loading() {
  return (
    <div className="flex flex-col gap-4 tablet:gap-5" aria-busy>
      <p className="sr-only">{TRANSLATION_WORDS.loading}</p>
      <div aria-hidden className="max-w-[940px] overflow-hidden rounded-sm border border-line bg-paper shadow-md">
        <div className="flex items-center gap-[11px] border-b border-line p-[16px_18px]">
          <div className="flex min-w-0 flex-1 flex-col gap-[6px]">
            <div className={`h-[15px] w-[104px] ${BAR}`} />
            <div className={`h-[12px] w-[78%] ${FAINT}`} />
            <div className={`h-[11px] w-[64%] ${FAINT}`} />
          </div>
          <div className="h-[34px] w-[118px] shrink-0 rounded-sm border border-line bg-surface" />
        </div>
        <div className="hidden grid-cols-[180px_1fr_1fr] border-b border-line bg-paper-sunk tablet:grid">
          {['w-[28px]', 'w-[104px]', 'w-[64px]'].map((w) => (
            <div key={w} className="px-[14px] py-[10px]"><div className={`h-[10px] rounded-[3px] bg-line ${w}`} /></div>
          ))}
        </div>
        {ROWS.map((n) => (
          <div key={n} className={`grid grid-cols-1 border-b border-line-faint tablet:grid-cols-[180px_1fr_1fr] ${n % 2 === 1 ? 'bg-paper-raised/50' : 'bg-surface'}`}>
            <div className="px-[14px] py-[13px]"><div className={`h-[10px] w-[120px] ${FAINT}`} /></div>
            <div className="px-[14px] py-[12px]"><div className={`h-[12px] w-[60%] ${BAR}`} /></div>
            <div className="px-[14px] py-[7px]"><div className="h-[32px] rounded-sm border border-line bg-surface" /></div>
          </div>
        ))}
      </div>
    </div>
  )
}
