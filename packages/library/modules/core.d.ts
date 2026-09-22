// Story 5.15 — `core.js`'s types, for its one importer: the editor, which runs `core` against the canvas window
// (DW-136). `core.js` stays the theme's runtime, untyped; `bundle()` pastes it into main.js without its `export`.

/** What `core` hands a module on each mount — `core.js`'s header is the contract. */
export type ModuleContext = {
  readonly signal: AbortSignal
  t(key: string, params?: Readonly<Record<string, unknown>>): string
  observe(
    target: Element,
    callback: (entry: IntersectionObserverEntry) => void,
    options?: { root?: Element | Document | null; rootMargin?: string; threshold?: number | readonly number[] },
  ): void
  readonly reducedMotion: boolean
}

/** A module file's one function, called once per mount on the element carrying its `data-module`. */
export type ModuleFn = (el: Element, ctx: ModuleContext) => void

/** Mounts every declared module in `win`'s document. With `editing`, a module that is not edit-safe is held still
 *  and its mount is in `paused`; with `report`, every error is handed to it rather than thrown from a timer. */
export function core(
  win: Window,
  modules: readonly (readonly [name: string, fn: ModuleFn, row: { readonly editSafe: boolean; readonly animates: boolean }])[],
  options?: { editing?: boolean; report?: (error: unknown) => void },
): { stop(): void; readonly paused: readonly Element[] }
