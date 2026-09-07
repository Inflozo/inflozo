/**
 * A CEILING ON A PROMISE THAT CANNOT BE CANCELLED. `AbortSignal.timeout` is the right tool when
 * the callee takes a signal (`lib/flags.ts` does that for its two reads); `auth.passkey.list()`
 * takes none, so its read is RACED instead: the first to settle wins, and a caller that hears
 * `null` treats it as a failed read. The request itself runs on — this is abandonment, not
 * cancellation — and the timer is cleared on a real answer so a fast read leaves nothing pending.
 *
 * Pure, so `node --test` can hold it with mock timers (`with-timeout.test.ts`), which is what
 * DW-33 (2) lacked as a `Promise.race` inline in `account/page.tsx` (review, 2026-09-07).
 */
export function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T | null> {
  let timer: ReturnType<typeof setTimeout> | undefined
  const ceiling = new Promise<null>((resolve) => {
    timer = setTimeout(() => resolve(null), ms)
  })
  return Promise.race([promise, ceiling]).finally(() => clearTimeout(timer))
}
