import { useCallback, useInsertionEffect, useMemo, useRef, useState, type Dispatch, type ProfilerOnRenderCallback, type SetStateAction } from 'react'
import { flushSync } from 'react-dom'

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

/* R-210's HAND-OVER — CANVAS FIRST, THE PANELS IN THE NEXT TASK (Story 5.23b's Dev, found by the deployed walk).
 *
 * A section operation paints the canvas and moves the editor's `latest` in the press's own task, inside `canvasFirst`; every
 * call it makes to a `handed` setter is HELD, in order, and handed to React together in the NEXT task (`flushSync`), so
 * the press's task stays short and the panels follow at once after it. NOT A TRANSITION: Next's server actions and
 * navigations are router transitions, and React renders every pending transition in one batch — so a transition's panels
 * waited for whatever server call was in flight. Executed on the harness with each server action's answer held 2 s: a
 * Delete's Layers rows landed 2.2 s after the canvas, an ⌥↓ during the editor's opening re-read 3.8 s after it.
 *
 * ORDER IS KEPT, which a transition's rebasing gave for free: the hold closes when the press's task yields (a microtask),
 * and a handed setter called after that and before the hand-over's task first hands over everything owed, so no later
 * state ever lands before an earlier one (a hover the paint let go, then the pointer's own hover of the new node).
 * Setters that are not `handed` run as they always did. */
let holding: (() => void)[] | null = null
let owed: (() => void)[] = []

function payOwed() {
  const calls = owed
  owed = []
  for (const call of calls) call()
}

/** The hand-over's own task: everything owed, in order, rendered at once. */
function settle() {
  if (owed.length > 0) flushSync(payOwed)
}

/** Runs `operation` now and holds every `handed` setter call made until the press's task yields. Nested calls join. */
export function canvasFirst(operation: () => void): void {
  if (holding !== null) return operation()
  const held: (() => void)[] = []
  holding = held
  queueMicrotask(() => {
    if (holding === held) holding = null
    if (held.length === 0) return
    owed.push(...held)
    // ponytail: a timer, not a MessageChannel — a later setter call pays what is owed first anyway, so only the panels'
    // first frame waits on it; a background tab's throttled timer delays panels nobody is looking at
    setTimeout(settle, 0)
  })
  operation()
}

/** A setter the hand-over can hold — outside one it sets at once, after anything still owed. */
export function handed<T>(set: Dispatch<SetStateAction<T>>): Dispatch<SetStateAction<T>> {
  return (value) => {
    if (holding !== null) {
      holding.push(() => set(value))
      return
    }
    if (owed.length > 0) payOwed()
    set(value)
  }
}

/** `useState` whose setter is `handed` — the editor's state, and the Layers rows' focus that moves with it. */
export function useHanded<S>(initial: S | (() => S)): [S, Dispatch<SetStateAction<S>>] {
  const [state, set] = useState(initial)
  return [state, useMemo(() => handed(set), [set])]
}

/**
 * DW-205 (Story 5.24e): ONE ANNOUNCER, FOR EVERY LIVE REGION IN THE APP. A region whose words are set to what they
 * already were changes nothing in the DOM, so a screen reader hears nothing — the second identical ⌘D's "duplicated"
 * was silent, and four more regions had the same fault. So the words carry a count that every `say` bumps, and the
 * region draws `<span key={n}>{words}</span>`: a new key is a NEW node, which a live region always announces. The
 * technique React Aria's LiveAnnouncer and react-aria-live document. Handed (`useHanded`), so the editor's R-210
 * hand-over orders it with every other state; outside the editor nothing is ever held, and it is plain state.
 */
export type Said = { words: string; n: number }
export function useSaid(): [Said, (words: string) => void] {
  const [said, set] = useHanded<Said>({ words: '', n: 0 })
  return [said, useMemo(() => (words: string) => set((was) => ({ words, n: was.n + 1 })), [set])]
}
