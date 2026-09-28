import { useCallback, useInsertionEffect, useRef, type ProfilerOnRenderCallback } from 'react'

/* STORY 5.23b — THE TWO TOOLS EVERY PART THAT REDRAWS ONLY WHAT TOUCHED IT NEEDS (R-208), ONCE.
 *
 * A `memo` part skips its render only while every prop it is given keeps its identity. A handler written inline in the
 * editor is a NEW function on every render, so a part handed one redraws on every render all the same — and a handler
 * memoized on its inputs is either stale (it closes over an older render) or new whenever they change. `useStable` is
 * the third way: one function for the component's whole life, calling whatever the LATEST COMMITTED render passed. The
 * ref moves in an insertion effect, so a render React throws away never becomes the handler, and every layout effect
 * of the same commit already reaches the new one.
 *
 * WHAT A HANDLER READS THROUGH IT IS THE RENDER THAT DREW WHAT WAS PRESSED — which, since R-210, may be a frame older
 * than the canvas. So a handler that needs the newest docs, selection or hover reads them through the editor's
 * `latest`, and uses its render's values only to say WHAT WAS ON SCREEN when it was pressed (the Controls panel's
 * stale-press guard is exactly that comparison).
 *
 * `counted` IS REACT'S OWN `<Profiler>` CALLBACK, and the keyboard gate reads what it writes: each profiled part's
 * commits, by its id, in `window.__inflozoRenders`. Outside production only — React calls it in development builds,
 * and the production build (the one the trace and every customer runs) never writes. A `<Profiler>` counts its OWN
 * subtree, so it sits INSIDE the memoized part's boundary: outside a `memo` it would count every render of the parent. */

export function useStable<A extends unknown[], R>(fn: (...args: A) => R): (...args: A) => R {
  const ref = useRef(fn)
  useInsertionEffect(() => {
    ref.current = fn
  })
  return useCallback((...args: A) => ref.current(...args), [])
}

/** The keyboard gate's render counts: one per commit of each `<Profiler>`, by its id. */
export type Renders = Record<string, number>

export const counted: ProfilerOnRenderCallback = (id) => {
  if (process.env.NODE_ENV === 'production') return
  const w = window as Window & { __inflozoRenders?: Renders }
  const renders = (w.__inflozoRenders ??= {})
  renders[id] = (renders[id] ?? 0) + 1
}
