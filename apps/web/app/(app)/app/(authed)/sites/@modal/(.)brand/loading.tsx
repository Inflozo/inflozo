import { BrandSkeleton } from '../../brand-skeleton'

/** The brand offer's skeleton — the drawing is `brand-skeleton.tsx`'s, shared with the other
    chrome so the two cannot drift; the sentence a reader gets instead is this route's own. */
export default function Loading() {
  return (
    <>
      <p className="sr-only">Reading your site’s brand…</p>
      {/* `contents`: the skeleton's three blocks are the panel's own flex children, so the
          wrapper that hides them from a reader must not become a box between them. */}
      <div aria-hidden className="contents">
        <BrandSkeleton />
      </div>
    </>
  )
}
