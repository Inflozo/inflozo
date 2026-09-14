// Story 4.7 — every `core` row of the I/O matrix, on core.js's SHIPPED BYTES and on `bundle`'s bytes,
// in jsdom with a fake `matchMedia` and `IntersectionObserver` (jsdom has neither). The same rows run in
// real Chromium on T1 and T3 through `python3 tools/probe/run-verify-core.py` (R-82).
//
// It reads a file, so it lives beside the module rather than in `src/`, where AD-1 bans `node:fs`; and it
// is `.mjs` because core.js is browser code the product never runs, outside AD-1's lint (eslint.config.js).

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { JSDOM, VirtualConsole } from 'jsdom'
import { bundle } from '../src/modules.ts'

const CORE = readFileSync(new URL('./core.js', import.meta.url), 'utf8')
const tick = () => new Promise((resolve) => setTimeout(resolve, 20))

/** The platform half jsdom lacks, driven by the test: a viewport width and the reduced-motion preference. */
function fakePlatform(win, env) {
  env.queries = []
  env.observers = []
  win.matchMedia = (media) => {
    const width = /^\(width < (\d+)px\)$/.exec(media)
    const evaluate = () => (media === '(prefers-reduced-motion: reduce)' ? env.reduce : width !== null && env.width < Number(width[1]))
    const q = {
      media,
      listeners: new Set(),
      get matches() { return evaluate() },
      addEventListener(type, fn, opts) {
        if (type !== 'change') return
        q.listeners.add(fn)
        opts?.signal?.addEventListener('abort', () => q.listeners.delete(fn))
      },
      removeEventListener(type, fn) { q.listeners.delete(fn) },
      last: evaluate(),
    }
    env.queries.push(q)
    return q
  }
  win.IntersectionObserver = class {
    constructor(callback, init) {
      this.callback = callback
      this.init = init
      this.targets = new Set()
      env.observers.push(this)
    }
    observe(t) { this.targets.add(t) }
    unobserve(t) { this.targets.delete(t) }
    disconnect() { this.targets.clear() }
  }
  env.set = (change) => {
    Object.assign(env, change)
    for (const q of env.queries) {
      if (q.matches === q.last) continue
      q.last = q.matches
      for (const fn of [...q.listeners]) fn({ matches: q.matches, media: q.media })
    }
  }
}

/** A page with core.js evaluated from its bytes, and every error the page reports collected. */
function page(body, env = {}) {
  const dom = new JSDOM(`<!doctype html><html><body>${body}</body></html>`, { runScripts: 'outside-only', virtualConsole: new VirtualConsole() })
  const win = dom.window
  Object.assign(env, { width: 1024, reduce: false, ...env })
  fakePlatform(win, env)
  const errors = []
  win.addEventListener('error', (e) => { errors.push(e.error); e.preventDefault() })
  const core = win.eval(`${CORE}\ncore`)
  const $ = (sel) => win.document.querySelector(sel)
  return { win, env, errors, core, $ }
}

const enabled = (el) => el.classList.contains('js-enabled')
const listenersLeft = (env) => env.queries.reduce((n, q) => n + q.listeners.size, 0)

test('core mounts a declared module once, with its ctx, and marks that element only', () => {
  const { win, core, $ } = page('<section id="s" data-module="probe"><p>x</p></section>')
  const calls = []
  core(win, [['probe', (el, ctx) => calls.push({ el, ctx }), { editSafe: true, animates: false }]])
  assert.equal(calls.length, 1)
  const [{ el, ctx }] = calls
  assert.equal(el, $('#s'))
  assert.ok(ctx.signal instanceof win.AbortSignal && !ctx.signal.aborted)
  assert.equal(typeof ctx.t, 'function')
  assert.equal(typeof ctx.observe, 'function')
  assert.equal(ctx.reducedMotion, false)
  assert.ok(enabled($('#s')))
  assert.ok(!enabled(win.document.documentElement) && !enabled(win.document.body), 'never on <html> or <body>')
})

test('a module that throws is reported, never swallowed, and the next mount still runs', async () => {
  const { win, errors, core, $ } = page('<div id="a" data-module="boom"></div><div id="b" data-module="probe"></div>')
  let signal
  const boom = new Error('the probe threw')
  assert.doesNotThrow(() => core(win, [
    ['boom', (el, ctx) => { signal = ctx.signal; assert.ok(enabled(el), 'js-enabled is set BEFORE mount'); throw boom }, { editSafe: true, animates: false }],
    ['probe', () => {}, { editSafe: true, animates: false }],
  ]))
  assert.ok(!enabled($('#a')))
  assert.ok(signal.aborted)
  assert.ok(enabled($('#b')))
  assert.deepEqual(errors, [])
  await tick()
  assert.deepEqual(errors, [boom], 'reported asynchronously')
})

test('a declaration naming no module this main.js carries is reported, and the rest mount', async () => {
  const { win, errors, core, $ } = page('<div data-module="lightbox"></div><div id="b" data-module="probe"></div>')
  core(win, [['probe', () => {}, { editSafe: true, animates: false }]])
  assert.ok(enabled($('#b')))
  await tick()
  assert.equal(errors.length, 1)
  assert.match(errors[0].message, /lightbox/)
})

test('review — a malformed declaration on the live page is reported as such, not as an uncarried name', async () => {
  const { win, errors, core, $ } = page('<div data-module="accordion:0"></div><div data-module="Probe"></div><div id="b" data-module="probe"></div>')
  core(win, [['probe', () => {}, { editSafe: true, animates: false }]])
  assert.ok(enabled($('#b')))
  await tick()
  assert.deepEqual(errors.map((e) => /is not a module declaration/.test(e.message)), [true, true])
})

test('while editing, only an edit-safe module mounts (R-21)', () => {
  const { win, core, $ } = page('<div id="a" data-module="unsafe"></div><div id="b" data-module="safe"></div>')
  const ran = []
  core(win, [
    ['unsafe', () => ran.push('unsafe'), { editSafe: false, animates: false }],
    ['safe', () => ran.push('safe'), { editSafe: true, animates: false }],
  ], { editing: true })
  assert.deepEqual(ran, ['safe'])
  assert.ok(!enabled($('#a')) && enabled($('#b')))
})

test('the motion gate: an animating module waits for reduced motion to clear, and stops when it returns', () => {
  const env = { reduce: true }
  const { win, core, $ } = page('<div id="m" data-module="motion"></div><div id="p" data-module="plain"></div>', env)
  const signals = []
  let plainCtx
  core(win, [
    ['motion', (el, ctx) => signals.push(ctx.signal), { editSafe: true, animates: true }],
    ['plain', (el, ctx) => { plainCtx = ctx }, { editSafe: true, animates: false }],
  ])
  assert.equal(signals.length, 0)
  assert.ok(!enabled($('#m')))
  assert.ok(enabled($('#p')) && plainCtx.reducedMotion === true, 'a non-animating module runs and reads the preference')
  env.set({ reduce: false })
  assert.equal(signals.length, 1)
  assert.ok(enabled($('#m')))
  assert.equal(plainCtx.reducedMotion, false)
  env.set({ reduce: true })
  assert.ok(signals[0].aborted)
  assert.ok(!enabled($('#m')))
  assert.equal(env.queries.filter((q) => q.media === '(prefers-reduced-motion: reduce)').length, 1, 'one query gates every animating module')
})

test('a width: the module runs only below it, one query per declared width', () => {
  const env = {}
  const { win, core, $ } = page('<div id="a" data-module="probe:768"></div><div id="b" data-module="other:768"></div>', env)
  const signals = []
  core(win, [
    ['probe', (el, ctx) => signals.push(ctx.signal), { editSafe: true, animates: false }],
    ['other', () => {}, { editSafe: true, animates: false }],
  ])
  assert.equal(signals.length, 0)
  assert.ok(!enabled($('#a')))
  env.set({ width: 600 })
  assert.equal(signals.length, 1)
  assert.ok(enabled($('#a')) && enabled($('#b')))
  env.set({ width: 1024 })
  assert.ok(signals[0].aborted)
  assert.ok(!enabled($('#a')) && !enabled($('#b')))
  assert.deepEqual(env.queries.map((q) => q.media).filter((m) => m.startsWith('(width')), ['(width < 768px)'])
})

test('stop() aborts every signal, removes every js-enabled and leaves no media listener', () => {
  const env = {}
  const { win, core } = page('<div data-module="probe"></div><div data-module="probe:768"></div><div data-module="motion"></div>', env)
  const signals = []
  const handle = core(win, [
    ['probe', (el, ctx) => { signals.push(ctx.signal); ctx.observe(el, () => {}) }, { editSafe: true, animates: false }],
    ['motion', (el, ctx) => signals.push(ctx.signal), { editSafe: true, animates: true }],
  ])
  assert.ok(listenersLeft(env) > 0)
  assert.equal(signals.length, 2)
  handle.stop()
  assert.ok(signals.every((s) => s.aborted))
  assert.equal(win.document.querySelectorAll('.js-enabled').length, 0)
  assert.equal(listenersLeft(env), 0)
  assert.ok(env.observers.every((o) => o.targets.size === 0))
  env.set({ width: 600 })
  assert.equal(signals.length, 2, 'nothing mounts after stop')
})

test("t reads the mount's data-i18n-*, fills the params it is handed and leaves the rest as written", () => {
  const { win, core } = page('<div data-module="probe" data-i18n-load-more-loading="Loading {count} more" data-i18n-mixed="{count} of {other}"></div>')
  let t
  core(win, [['probe', (el, ctx) => { t = ctx.t }, { editSafe: true, animates: false }]])
  assert.equal(t('load-more-loading', { count: 12 }), 'Loading 12 more')
  assert.equal(t('absent'), '')
  assert.equal(t('mixed', { count: 3 }), '3 of {other}')
  assert.equal(t('mixed', Object.create({ count: 9 })), '{count} of {other}', 'own params only')
})

test('one IntersectionObserver per root, rootMargin and threshold; an aborted mount unobserves its targets', () => {
  const env = {}
  const { win, core, $ } = page('<div id="a" data-module="probe"></div><div id="b" data-module="probe"></div><div id="c" data-module="probe:768"></div>', env)
  const seen = []
  core(win, [['probe', (el, ctx) => ctx.observe(el, (entry) => seen.push(entry.target.id), el.id === 'c' ? { rootMargin: '0px 0px -20%' } : { threshold: 0.5 }), { editSafe: true, animates: false }]])
  env.set({ width: 600 })
  assert.equal(env.observers.length, 2)
  const [shared, other] = env.observers
  assert.deepEqual([...shared.targets].map((t) => t.id), ['a', 'b'])
  assert.deepEqual({ ...shared.init }, { root: null, threshold: 0.5 })
  assert.deepEqual([...other.targets].map((t) => t.id), ['c'])
  shared.callback([{ target: $('#b') }])
  assert.deepEqual(seen, ['b'])
  env.set({ width: 1024 })
  assert.equal(other.targets.size, 0, "the aborted mount's target is unobserved")
  assert.equal(shared.targets.size, 2)
  env.set({ width: 600 })
  assert.equal(env.observers.length, 2, 'a remount reuses the observer')
})

test('review — observe after the mount stopped observes nothing, and one throwing callback never starves the batch', async () => {
  const env = {}
  const { win, errors, core, $ } = page('<div id="a" data-module="probe:768"></div><div id="b" data-module="probe"></div>', env)
  let late = null
  const seen = []
  core(win, [['probe', (el, ctx) => {
    if (el.id === 'a') { late = () => ctx.observe(el, () => {}) ; return }
    ctx.observe(el, () => { throw new Error('cb') })
    ctx.observe(el, () => seen.push('second'))
  }, { editSafe: true, animates: false }]])
  env.set({ width: 600 })
  env.set({ width: 1024 }) // #a's mount aborted
  late()
  assert.ok(env.observers.every((o) => !o.targets.has($('#a'))), 'a late observe on an aborted signal left nothing observed')
  env.observers[0].callback([{ target: $('#b') }])
  assert.deepEqual(seen, ['second'])
  await tick()
  assert.deepEqual(errors.map((e) => e.message), ['cb'], 'reported, not swallowed')
})

test("bundle's bytes, with probe rows, mount with JavaScript on and nothing with JavaScript off", () => {
  const sources = { core: CORE, probe: 'function probe(el, ctx) {\n  el.setAttribute("data-said", ctx.t("hello", { who: "T1" }))\n}\n' }
  const main = bundle(['probe'], sources, [{ name: 'probe', editSafe: false, animates: false }])
  const html = `<!doctype html><html><body><section id="s" data-module="probe" data-i18n-hello="Hi {who}"></section><script>${main}</script></body></html>`
  const env = {}
  const on = new JSDOM(html, { runScripts: 'dangerously', virtualConsole: new VirtualConsole(), beforeParse: (win) => fakePlatform(win, Object.assign(env, { width: 1024, reduce: false })) })
  const s = on.window.document.querySelector('#s')
  assert.ok(enabled(s))
  assert.equal(s.getAttribute('data-said'), 'Hi T1')
  assert.equal(typeof on.window.core, 'undefined', 'core stays inside the wrapping function')
  assert.equal(typeof on.window.probe, 'undefined')
  const off = new JSDOM(html, { virtualConsole: new VirtualConsole() })
  assert.equal(off.window.document.querySelectorAll('.js-enabled, [data-said]').length, 0)
  assert.ok(off.window.document.querySelector('[data-module="probe"]'), 'the page is the same authored markup')
})
