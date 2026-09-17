// HOVER AND SELECTION, THE PURE HALF (Story 5.2). Everything the editor decides about a pointer, a key or an edit that
// needs no DOM of its own, so `node --test` reaches it (`selection.test.ts`); `editor.tsx` wires it to both documents.
// Client-safe and import-free at run time: the types below are erased.

import type { ControlState, DocInstance, ProjectDoc } from '@inflozo/section-runtime'

/** The walk every function here needs from a node: a DOM element satisfies it, and so does a plain object. */
export type Walkable = { parentElement: Walkable | null }

/** Each section's root, index-aligned with the renders that were joined into the mount: a render that is the empty
 *  string (a gated section — a root `data-if` that is false) has no root, and every other one takes the next child. */
export function sectionRoots<E>(parts: readonly string[], mount: { children: ArrayLike<E> }): (E | null)[] {
  let next = 0
  return parts.map((html) => (html === '' ? null : (mount.children[next++] ?? null)))
}

/** The root an event target sits in, or null — the canvas ground, the space below the last section. */
export function rootFrom<E extends Walkable>(target: Walkable | null, roots: readonly (E | null)[]): E | null {
  for (let n = target; n; n = n.parentElement) {
    if (roots.includes(n as E)) return n as E
  }
  return null
}

type Focusable = Walkable & {
  tagName?: string
  isContentEditable?: boolean
  open?: boolean
  matches?: (selector: string) => boolean
}

/** Esc deselects unless it belongs to the control it was pressed in: a text field, a select, a `contenteditable`, an
 *  open popover (every picker is one) or an open dialog (the reset confirm). */
export function escDeselects(target: Focusable | null): boolean {
  for (let n: Focusable | null = target; n; n = n.parentElement as Focusable | null) {
    const tag = n.tagName?.toUpperCase()
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || n.isContentEditable === true) return false
    if (tag === 'DIALOG' && n.open === true) return false
    if (n.matches?.(':popover-open') === true) return false
  }
  return true
}

/** New docs with one instance's stored slice replaced by the panel's next state, and nothing else touched. */
export function withState(
  docs: Readonly<Record<string, ProjectDoc>>,
  key: string,
  instanceId: string,
  state: ControlState,
): Record<string, ProjectDoc> {
  const doc = docs[key]
  if (!doc) throw new Error(`there is no ${key} doc to edit`)
  if (!doc.instances.some((i) => i.instanceId === instanceId)) throw new Error(`the ${key} doc has no instance ${instanceId}`)
  const instances = doc.instances.map((i): DocInstance =>
    i.instanceId === instanceId
      ? { ...i, content: { ...state.content }, controls: { ...state.controls }, data: { ...state.data }, darkOverrides: { ...state.darkOverrides } }
      : i,
  )
  return { ...docs, [key]: { ...doc, instances } }
}

// ─── tap and hold (UX-DR18) ───────────────────────────────────────────────────

export const HOLD_MS = 500
export const SLOP_PX = 10

export type HoldState = {
  /** the press being watched, or null when there is none or it moved too far */
  at: { x: number; y: number; t: number } | null
  held: boolean
  /** a completed hold swallows the click its lift may fire, until the next press */
  swallow: boolean
}
export type HoldEvent =
  | { type: 'down' | 'move'; x: number; y: number; t: number }
  | { type: 'up' | 'timer'; t: number }
  | { type: 'cancel' | 'click' }
/** `hover`: show the hover state on the pressed section · `tap`: select it · `swallow`: prevent this click */
export type HoldOutcome = 'hover' | 'tap' | 'swallow' | null

export const HOLD_IDLE: HoldState = { at: null, held: false, swallow: false }

export function hold(state: HoldState, e: HoldEvent): [HoldState, HoldOutcome] {
  switch (e.type) {
    case 'down':
      return [{ at: { x: e.x, y: e.y, t: e.t }, held: false, swallow: false }, null]
    case 'move':
      if (state.at && !state.held && Math.hypot(e.x - state.at.x, e.y - state.at.y) > SLOP_PX) return [{ ...state, at: null }, null]
      return [state, null]
    case 'timer':
      if (state.at && !state.held && e.t - state.at.t >= HOLD_MS) return [{ ...state, held: true }, 'hover']
      return [state, null]
    case 'up': {
      if (!state.at) return [{ ...state, at: null, held: false }, null]
      // a late timer is not a tap: a press that lasted the hold is a hold, whichever event saw it first
      if (state.held) return [{ at: null, held: false, swallow: true }, null]
      if (e.t - state.at.t >= HOLD_MS) return [{ at: null, held: false, swallow: true }, 'hover']
      return [HOLD_IDLE, 'tap']
    }
    case 'cancel':
      return [{ ...state, at: null, held: false }, null]
    case 'click':
      return state.swallow ? [{ ...state, swallow: false }, 'swallow'] : [state, null]
  }
}
