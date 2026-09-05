import { placeholderFor } from '@/lib/style-pack'

/**
 * FR-B1's STATIC PLACEHOLDER — never a captured or rendered thumbnail.
 *
 * The drawing is `S3 Dashboard.dc.html`'s card 2, the unlinked, never-deployed card, which is
 * exactly what a 1.5 project is: a 40%×14 bar, a 55%×7 bar, then three equal 44px blocks with
 * the middle one at 85%.
 *
 * THE LAYOUT IS THE FRAME'S AND THE COLOURS ARE THE PROJECT'S STYLE PACK — the pack's surface
 * behind it, the pack's text colour in the headline bar, the pack's accent in the middle block.
 * Those three are the USER'S SITE's system and arrive as colour strings from `lib/style-pack.ts`
 * (which is why they are inline `style` and never Tailwind classes — the app's palette is
 * cleared on purpose). The two outer blocks and the sub-bar stay in the app's own `line` and
 * `line-strong`: they are the wireframe's paper, not the site's ink.
 *
 * With one pack every card looks alike today, and that is the truthful state until E6 makes
 * packs differ.
 */
export function Placeholder({ stylePack }: { stylePack: unknown }) {
  const pack = placeholderFor(stylePack)
  return (
    <div
      aria-hidden
      style={{ background: pack.surface }}
      className="flex h-[150px] flex-col items-center gap-2 border-b border-line p-[18px_24px] tablet:aspect-[16/10] tablet:h-auto"
    >
      <div style={{ background: pack.text }} className="mt-[14px] h-[14px] w-[40%] rounded-[3px]" />
      <div className="h-[7px] w-[55%] rounded-[2px] bg-line-strong" />
      <div className="mt-3 flex w-full gap-2">
        <div className="h-11 flex-1 rounded-[5px] bg-line" />
        <div style={{ background: pack.accent, opacity: 0.85 }} className="h-11 flex-1 rounded-[5px]" />
        <div className="h-11 flex-1 rounded-[5px] bg-line" />
      </div>
    </div>
  )
}
