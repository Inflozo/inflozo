import { panelBox } from '@/components/kit/dialog'
import { BrandSkeleton } from '../brand-skeleton'

/**
 * The brand offer's skeleton on the FULL-PAGE chrome — the one `connectSite`'s redirect lands on.
 *
 * IT CARRIES `page.tsx`'s OWN WRAPPER, and that is the half a shared drawing cannot supply: a
 * `loading.tsx` stands in for the whole page, so without the centring and `panelBox` the skeleton
 * would paint edge to edge and the panel would then snap into a 900px box — a skeleton that lies
 * about the shape that is coming, which is the rule this file exists under. The popup's own
 * `loading.tsx` needs none of it: its box is the `<dialog>` its layout already opened.
 */
export default function Loading() {
  return (
    <div className="flex flex-1 items-center justify-center p-[16px_20px] tablet:p-6">
      <p className="sr-only">Reading your site’s brand…</p>
      {/* The drawing is decoration; the sentence above is what a screen reader gets meanwhile. */}
      <div aria-hidden className={`flex flex-col ${panelBox}`}>
        <BrandSkeleton />
      </div>
    </div>
  )
}
