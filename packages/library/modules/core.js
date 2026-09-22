// FR-G7(4): the one runtime every generated theme carries, `core`. It mounts each module a section
// declares, and nothing else. One exported declaration, which `bundle()` (src/modules.ts) pastes into the classic
// `main.js` without the keyword, inside one wrapping function, loaded `defer`, ending with `core(window, rows)`. So
// the top level is this one declaration, and every platform object is reached through `win` — no global is read.
//
// The contract a module is written against (docs/section-authoring.md, "Behaviour modules"):
//   function lightbox(el, ctx) — called once per mount, on the element carrying data-module="lightbox"
//   ctx.signal         aborts when the mount stops; pass it to every listener
//   ctx.t(key, params) the mount's data-i18n-<key>, with {name} filled from params; '' when absent
//   ctx.observe(target, callback, { root, rootMargin, threshold }) one shared IntersectionObserver per root,
//                      rootMargin and threshold; the target is unobserved when the mount stops
//   ctx.reducedMotion  true while (prefers-reduced-motion: reduce) matches, for incidental motion
//
// `js-enabled` is set on the MOUNT ELEMENT before the module runs and removed when the mount stops, never on
// <html> or <body>. So JavaScript off, suppression while editing, the motion gate and a width outside the
// declaration all leave that element in its no-JS CSS branch, which is what every research §7 line assumes.
export function core(win, modules, options) {
  const editing = options !== undefined && options !== null && options.editing === true
  // DW-136(b): a caller that hands its own `report` (the editor) is given every error in place of the timer's throw
  const given = options !== undefined && options !== null && typeof options.report === 'function' ? options.report : null
  const rows = new Map()
  for (const [name, fn, row] of modules) rows.set(name, { fn, editSafe: row.editSafe === true, animates: row.animates === true })

  const life = new win.AbortController() // core's own listeners; stop() aborts it
  const report = given !== null ? given : (error) => { win.setTimeout(() => { throw error }, 0) } // reported, never swallowed
  const reduce = win.matchMedia('(prefers-reduced-motion: reduce)')
  const widths = new Map() // one (width < Npx) query per declared width
  const observers = new Map() // root -> "rootMargin|threshold" -> { io, callbacks: Map<target, Set<fn>> }
  const mounts = []
  const paused = [] // the mounts the editing rule held still, in document order — the editor marks them (R-175)

  // ponytail: ONE scan, at start. A module that appends markup carrying data-module (load-more is the first)
  // needs a rescan of what it inserted; add it with that module, FR-G7(4).
  for (const el of win.document.querySelectorAll('[data-module]')) {
    const declared = el.getAttribute('data-module')
    const m = /^([a-z][a-z0-9-]*)(?::([1-9][0-9]*))?$/.exec(declared)
    if (m === null) {
      report(new Error(`data-module="${declared}" is not a module declaration ("accordion" or "accordion:768"), so nothing mounts here`))
      continue
    }
    const row = rows.get(m[1])
    if (row === undefined) {
      report(new Error(`data-module="${declared}" names no module this main.js carries`))
      continue
    }
    if (editing && !row.editSafe) { // R-21: suppressed on the canvas, the section at rest
      paused.push(el)
      continue
    }
    let query = null
    if (m[2] !== undefined) {
      query = widths.get(m[2])
      if (query === undefined) {
        query = win.matchMedia(`(width < ${m[2]}px)`)
        widths.set(m[2], query)
      }
    }
    mounts.push({ el, name: m[1], row, query, controller: null, failed: false })
  }

  function observe(signal) {
    return (target, callback, opts) => {
      if (signal.aborted) return // a late async call on a stopped mount observes nothing, so nothing is left observed
      const o = opts || {}
      const root = o.root || null
      const key = `${o.rootMargin === undefined ? '' : o.rootMargin}|${o.threshold === undefined ? '' : String(o.threshold)}`
      let byKey = observers.get(root)
      if (byKey === undefined) observers.set(root, (byKey = new Map()))
      let shared = byKey.get(key)
      if (shared === undefined) {
        const callbacks = new Map()
        const init = { root }
        if (o.rootMargin !== undefined) init.rootMargin = o.rootMargin
        if (o.threshold !== undefined) init.threshold = o.threshold
        const io = new win.IntersectionObserver((entries) => {
          for (const entry of entries) {
            for (const fn of [...(callbacks.get(entry.target) || [])]) {
              try { fn(entry) } catch (error) { report(error) } // one callback's throw never starves the rest of the batch
            }
          }
        }, init)
        byKey.set(key, (shared = { io, callbacks }))
      }
      let fns = shared.callbacks.get(target)
      if (fns === undefined) {
        shared.callbacks.set(target, (fns = new Set()))
        shared.io.observe(target)
      }
      fns.add(callback)
      signal.addEventListener('abort', () => {
        fns.delete(callback)
        if (fns.size === 0 && shared.callbacks.get(target) === fns) {
          shared.callbacks.delete(target)
          shared.io.unobserve(target)
        }
      }, { once: true })
    }
  }

  function translate(el) {
    return (key, params) => {
      const text = el.getAttribute(`data-i18n-${key}`)
      if (text === null) return ''
      return text.replace(/\{([A-Za-z0-9_]+)\}/g, (whole, name) =>
        params !== undefined && params !== null && Object.prototype.hasOwnProperty.call(params, name) ? String(params[name]) : whole)
    }
  }

  function start(mount) {
    const controller = new win.AbortController()
    mount.controller = controller
    mount.el.classList.add('js-enabled')
    const ctx = {
      signal: controller.signal,
      t: translate(mount.el),
      observe: observe(controller.signal),
      get reducedMotion() { return reduce.matches },
    }
    try {
      mount.row.fn(mount.el, ctx)
    } catch (error) {
      mount.failed = true // a mount that threw is not retried on the next media change
      halt(mount)
      report(error)
    }
  }

  function halt(mount) {
    if (mount.controller === null) return
    const controller = mount.controller
    mount.controller = null
    mount.el.classList.remove('js-enabled')
    controller.abort()
  }

  function sync() {
    for (const mount of mounts) {
      // the motion gate, once for every animating module (FR-G4): its reduced-motion state is its no-JS state
      const run = !mount.failed && !(mount.row.animates && reduce.matches) && (mount.query === null || mount.query.matches)
      if (run && mount.controller === null) start(mount)
      else if (!run) halt(mount)
    }
  }

  reduce.addEventListener('change', sync, { signal: life.signal })
  for (const query of widths.values()) query.addEventListener('change', sync, { signal: life.signal })
  sync()

  return {
    paused,
    stop() {
      life.abort()
      for (const mount of mounts) halt(mount)
      for (const byKey of observers.values()) for (const shared of byKey.values()) shared.io.disconnect()
      observers.clear()
    },
  }
}
