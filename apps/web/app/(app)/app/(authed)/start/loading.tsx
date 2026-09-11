/**
 * R-98: a route reached by a soft navigation carries its own skeleton, drawing the cards THAT
 * route shows and never a parent's. This one is the three doors' own shape — the 140px band, the
 * 22px title, two lines of body — laid out on the same grid `doors.tsx` uses, so nothing moves
 * when the real cards arrive.
 *
 * IT IS REACHED: the shell's Projects link is a `<Link>`, so clicking it soft-navigates to `/`,
 * which redirects here while an account still has no site and no project.
 *
 * Never a spinner (DESIGN.md § Loading). The drawing is decoration and is hidden from a reader,
 * which gets one sentence in its place.
 */
export default function Loading() {
  return (
    <div
      aria-busy
      className="flex flex-1 flex-col items-center justify-center gap-12 p-[16px_20px] tablet:p-6"
    >
      <p className="sr-only">Loading…</p>
      <div aria-hidden className="h-[34px] w-[280px] rounded-[4px] bg-paper-sunk tablet:h-[50px] tablet:w-[620px]" />
      <div aria-hidden className="grid w-full max-w-[1104px] grid-cols-1 gap-6 tablet:grid-cols-3">
        {[0, 1, 2].map((n) => (
          <div key={n} className="flex flex-col gap-5 rounded border border-line bg-surface p-7 shadow-sm">
            <div className="h-[140px] rounded-thumb bg-paper-sunk" />
            <div className="flex flex-col gap-2">
              <div className="h-[18px] w-[60%] rounded-[3px] bg-paper-sunk" />
              <div className="h-[11px] w-full rounded-[3px] bg-paper-sunk/70" />
              <div className="h-[11px] w-[70%] rounded-[3px] bg-paper-sunk/70" />
            </div>
          </div>
        ))}
      </div>
      <div aria-hidden className="h-[11px] w-[160px] rounded-[3px] bg-paper-sunk/70" />
    </div>
  )
}
