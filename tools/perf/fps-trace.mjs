#!/usr/bin/env node
// NFR-1'S 3-SECOND TRACE, RUN BY HAND (Story 5.23a — R-206, R-208; its three bars Story 5.23b's — DW-289). NEVER CI's: NFR-1
// is a manual gate on the reference computer at 4× CPU throttle, and CI gates the MECHANISM instead (the keyboard journey's
// 5.23a stops, and 5.23b's render counts).
//
//   node tools/perf/fps-trace.mjs                      4× throttle, 3 runs
//   node tools/perf/fps-trace.mjs --rate 1 --runs 1    unthrottled, once
//
// It BUILDS and STARTS the production harness itself — `INFLOZO_HARNESS=1` on `next build` and on `next start`, never
// `next dev`, whose unminified React is not what a customer runs — on a free port, and opens the editor on the long Home
// (`x-inflozo-harness-home`, the harness's cycled fixture) at 1440 × 900. Then, for each run, in a fresh browser context:
//
//   THE FIRST SELECTION (DW-290, Story 5.24e): once the canvas's faces have loaded, the session's first Layers pick, its
//   longest task printed for the record — never one of the bars.
//   WARM, as NFR-1 defines it: the page painted, a ringed section selected from its Layers row, hovered — which mounts its
//   pill and the chrome layers, the session's first-hover task — and its Style group open.
//   THE CONTROL (standing rule 2): an 80 ms busy task on a timer must show as a long task AND as dropped vsyncs, or the
//   run is refused — a recorder that saw nothing is not a measurement.
//   THE CLOCK, 3 s: a Shuffle from the pill, two control changes (arrow keys on a radio in the open group), a pill-grip
//   drag of about 20 pointer moves and a drop, and a ⌥↓ from its Layers row — the drag before the ⌥↓, while the section
//   is still on screen where the warm-up put it. A gesture that could not be performed fails the run: a trace missing one
//   is not a result. Gestures that outrun the 3 s are traced to their end, and the window says so.
//
// THE METRIC — THREE BARS, AND A RUN PASSES ONLY WHEN ALL THREE HOLD (DW-289, Story 5.23b). A rAF interval in the editor's
// document is a frame, and a frame's time is COUNTED IN WHOLE REFRESHES, n = max(1, round(Δ / 16.67)), never compared to
// 16.7 ms: headless rAF reads 16.6–16.8 ms on a smooth frame, and timestamp jitter must never fail a smooth run.
//   1. THE P95 FRAME, NFR-1's own words: the 95th-percentile frame lasts at most ONE refresh — "at most 5% of frames took
//      longer than one".
//   2. THE SHARE OF REFRESHES DROPPED: a frame of n refreshes drops n − 1, and at most 5% of the window's refreshes may be
//      dropped. This is the bar that weighs a LONG stall: one frame that swallows nine refreshes is one frame in the p95's
//      count and nine in this one, so a trace that passed on the p95 alone could hide it.
//   3. NO LONG TASK OVER 50 ms: the longest `longtask` in the window.
// Each is printed per run, the raw p95 in milliseconds beside its count for the record. Exit 0 when every run passes all
// three, 1 otherwise (a refusal included).
//
// It restores apps/web/next-env.d.ts, which `next build` rewrites, and stops its own server. NEVER beside `pnpm keyboard`:
// both build into apps/web/.next-harness.

import { spawn, spawnSync } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { createServer } from 'node:net'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from '@playwright/test'

const REPO = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const WEB = join(REPO, 'apps', 'web')
const NEXT = join(WEB, 'node_modules', 'next', 'dist', 'bin', 'next')
const NEXT_ENV = join(WEB, 'next-env.d.ts')

/** FR-D14's long page and NFR-1's (`prd.md` §5 FR-D14, §6 NFR-1): the section count the trace runs on. */
const LONG_HOME = 40
/** NFR-1's bars (the METRIC above): the p95 frame at most one refresh, at most 5% of refreshes dropped, and no long task
 *  over 50 ms. */
const P95_MAX = 1
const DROPPED_MAX = 0.05
const TASK_MAX = 50
const VSYNC = 1000 / 60
const CLOCK_MS = 3000
/** the control's busy task — over the 50 ms a long task starts at, and several vsyncs long */
const CONTROL_MS = 80

const arg = (name, fallback) => {
  const at = process.argv.indexOf(`--${name}`)
  if (at === -1) return fallback
  const value = Number(process.argv[at + 1])
  if (!Number.isFinite(value) || value < 1) {
    console.error(`--${name} takes a number of at least 1`)
    process.exit(1)
  }
  return value
}
const RATE = arg('rate', 4)
const RUNS = Math.floor(arg('runs', 3))

const browserPath = chromium.executablePath()
if (!browserPath || !existsSync(browserPath)) {
  console.error('REFUSED: the trace needs Chromium and this machine has none.\n         pnpm exec playwright install chromium')
  process.exit(1)
}

const freePort = () =>
  new Promise((resolve) => {
    const s = createServer()
    s.listen(0, '127.0.0.1', () => {
      const { port } = s.address()
      s.close(() => resolve(port))
    })
  })

/** Frames and long tasks in the editor's document, from now until the page closes. */
const RECORDER = () => {
  const w = window
  w.__trace = { frames: [], tasks: [] }
  new PerformanceObserver((list) => {
    for (const e of list.getEntries()) w.__trace.tasks.push({ at: e.startTime, ms: e.duration })
  }).observe({ type: 'longtask' })
  const loop = (t) => {
    w.__trace.frames.push(t)
    requestAnimationFrame(loop)
  }
  requestAnimationFrame(loop)
}

/** A window of the recording, as NFR-1 reads it — the frame after the window's end included, so a task that runs over
 *  the end is still counted. */
async function measure(page, from, to) {
  const { frames, tasks } = await page.evaluate(() => window.__trace)
  const first = frames.findIndex((t) => t >= from)
  const last = frames.findIndex((t) => t > to)
  const shown = first === -1 ? [] : frames.slice(first, last === -1 ? undefined : last + 1)
  const deltas = shown.slice(1).map((t, i) => t - shown[i])
  // each frame in whole refreshes — jitter-proof (the METRIC)
  const refreshes = deltas.map((d) => Math.max(1, Math.round(d / VSYNC)))
  const vsyncs = refreshes.reduce((sum, n) => sum + n, 0)
  const dropped = vsyncs - refreshes.length
  const p95th = (values) => {
    const sorted = [...values].sort((a, b) => a - b)
    return sorted.length === 0 ? 0 : sorted[Math.ceil(sorted.length * 0.95) - 1]
  }
  const longest = Math.max(0, ...tasks.filter((t) => t.at + t.ms > from && t.at < to).map((t) => t.ms))
  return { vsyncs, dropped, share: vsyncs === 0 ? 0 : dropped / vsyncs, p95: p95th(refreshes), p95ms: p95th(deltas), longest }
}

/** The selected section's root and the one after it, on screen: the frame's rect and the fit applied. */
const rootsOnScreen = (page) =>
  page.evaluate(() => {
    const f = document.querySelector('iframe[title$="canvas"]')
    const fr = f.getBoundingClientRect()
    const k = fr.width / f.offsetWidth
    const root = f.contentDocument.querySelector('#canvas > [data-inflozo-selected]')
    const box = (el) => {
      if (!el) return null
      const r = el.getBoundingClientRect()
      return { x: fr.left + (r.left + r.width / 2) * k, top: fr.top + r.top * k, height: r.height * k }
    }
    return { at: box(root), next: box(root?.nextElementSibling ?? null), frameTop: fr.top, frameBottom: fr.bottom }
  })

/** Rest the pointer on the selected section, clear of its edges, until its pill is drawn. */
async function hoverSelected(page) {
  const { at, frameTop, frameBottom } = await rootsOnScreen(page)
  if (!at) throw new Error('the selected section has no root on the canvas')
  const y = Math.min(Math.max(at.top + Math.min(at.height / 2, 120), frameTop + 12), frameBottom - 12)
  await page.mouse.move(at.x - 40, y)
  await page.mouse.move(at.x, y)
  await page.locator('[data-section-pill]').waitFor({ state: 'visible', timeout: 5000 })
}

/** The canvas's scroll, once it has stopped moving — a Layers pick scrolls the section into view. */
const settled = (page) =>
  page.waitForFunction(() => {
    const w = document.querySelector('iframe[title$="canvas"]').contentWindow
    const now = w.scrollY
    const was = window.__lastScroll
    window.__lastScroll = now
    return was === now
  }, null, { polling: 200, timeout: 10_000 })

const pageRows = (page) => page.locator('[data-layer-row]').evaluateAll((els) => els.map((e) => e.dataset.layerRow).filter((k) => !k.startsWith('site:')))
const designCount = (page) => page.locator('#editor-design-count').textContent().then((t) => (t ?? '').trim())
/** The first radio in the Style group's open body that is its group's tab stop — its group (by the label it is named by;
 *  the radios carry no name of their own but their words) and the place of the checked one. Found afresh each time: a
 *  Shuffle changes the design, and the design decides the rows. */
const styleRadio = (page) =>
  page.evaluate(() => {
    const radio = document.querySelector('#editor-controls [id$="-group-style-body"] [role="radio"][tabindex="0"]')
    const group = radio?.closest('[role="radiogroup"]')
    const label = group?.getAttribute('aria-labelledby')
    return label ? { label, checked: [...group.querySelectorAll('[role="radio"]')].findIndex((r) => r.getAttribute('aria-checked') === 'true') } : null
  })

async function pick(page, key) {
  await page.locator(`[data-layer-row="${key}"]`).focus()
  await page.keyboard.press('Enter')
  await page.waitForFunction((k) => document.querySelector(`[data-layer-row="${k}"]`)?.className.includes('bg-coral-tint'), key, { polling: 25 })
}

async function run(browser, base, n) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, extraHTTPHeaders: { 'x-inflozo-harness-home': String(LONG_HOME) } })
  /** what the run was doing, so a failure names the step — a gesture that could not be performed is named, never guessed */
  let step = 'opening the editor'
  try {
    const page = await context.newPage()
    await page.goto(`${base}/app/harness/editor`)
    await page.frameLocator('iframe[title$="canvas"]').locator('#canvas > *').first().waitFor()
    await page.locator('[data-layer-row]').first().waitFor()
    const rows = await pageRows(page)
    if (rows.length !== LONG_HOME) throw new Error(`the harness built Home at ${rows.length} sections, not ${LONG_HOME}`)
    const cdp = await context.newCDPSession(page)
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: RATE })
    await page.evaluate(RECORDER)

    // ── DW-290 (Story 5.24e): THE SESSION'S FIRST SELECTION, recorded and never a bar — its long task is the chrome's first
    // mount and the Controls panel's. Taken once the canvas's faces have loaded and the page has had an idle moment, which
    // is when the editor now prepares the chrome's fonts and sheets (`prepareChrome`); before, the first press paid for them
    step = 'the first selection'
    await page.frameLocator('iframe[title$="canvas"]').locator('html').evaluate(() => document.fonts.ready.then(() => undefined))
    await page.waitForTimeout(500)
    const f0 = await page.evaluate(() => performance.now())
    await pick(page, rows[0])
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))))
    const firstPick = await measure(page, f0, await page.evaluate(() => performance.now()))

    // ── WARM: the first ringed section with two below it, selected, hovered, its Style group open
    step = 'warming: choosing a ringed section'
    let ringed = null
    for (const key of rows.slice(0, -2)) {
      await pick(page, key)
      if ((await designCount(page)) !== '1 of 1') {
        ringed = key
        break
      }
    }
    if (ringed === null) throw new Error('no section on the long Home has a ring — the harness fixture has changed')
    step = 'warming: hovering it'
    await settled(page)
    await hoverSelected(page)
    step = 'warming: opening its Style group'
    const style = page.locator('#editor-controls button[id$="-group-style"]')
    if ((await style.getAttribute('aria-expanded')) !== 'true') {
      await style.focus()
      await page.keyboard.press('Enter')
    }
    await page.waitForFunction(() => document.querySelector('#editor-controls [id$="-group-style-body"] [role="radio"][tabindex="0"]') !== null, null, { polling: 25, timeout: 5000 })

    // ── THE CONTROL: an 80 ms task on a timer, seen as a long task and as dropped vsyncs
    step = 'the control'
    const c0 = await page.evaluate(() => performance.now())
    await page.evaluate((ms) => new Promise((done) => setTimeout(() => {
      const t = performance.now()
      while (performance.now() - t < ms);
      setTimeout(done, 300)
    }, 0)), CONTROL_MS)
    const c1 = await page.evaluate(() => performance.now())
    const control = await measure(page, c0, c1)
    if (control.longest < TASK_MAX || control.dropped < 1) {
      return { n, refused: `the control was not seen — an ${CONTROL_MS} ms task read as a ${Math.round(control.longest)} ms long task and ${control.dropped} dropped vsyncs` }
    }

    // ── THE CLOCK
    const done = []
    const t0 = await page.evaluate(() => performance.now())
    // a Shuffle, from the pill
    step = 'the Shuffle'
    const was = await designCount(page)
    await page.locator('[data-section-pill] [data-pill-shuffle]').click()
    await page.waitForFunction((w) => document.querySelector('#editor-design-count')?.textContent?.trim() !== w, was, { polling: 25, timeout: 10_000 })
    done.push('Shuffle')
    // two control changes: arrow keys on a radio in the open group
    for (const key of ['ArrowRight', 'ArrowRight']) {
      step = `control change ${done.length}`
      const radio = await styleRadio(page)
      if (radio === null) throw new Error('the Style group holds no radio to change')
      await page.locator(`[role="radiogroup"][aria-labelledby="${radio.label}"] [role="radio"][tabindex="0"]`).focus()
      await page.keyboard.press(key)
      await page.waitForFunction(({ label, checked }) =>
        [...document.querySelectorAll(`[role="radiogroup"][aria-labelledby="${label}"] [role="radio"]`)].findIndex((r) => r.getAttribute('aria-checked') === 'true') !== checked,
      radio, { polling: 25, timeout: 10_000 })
      done.push('a control')
    }
    // the pill's grip: the Shuffle's paint let the hover go, so the pointer comes back to the section — before ⌥↓, while it
    // is still where the warm-up put it on screen — then about 20 moves, far enough for its middle to pass the next
    // section's (`lib/reorder.ts`'s `landingAt`), and a drop. Sections are tall at Desktop's fit, so the pointer runs past
    // the window's edge, as a person's does: the grip holds pointer capture, so every move still reaches it
    step = 'the pill-grip drag'
    await hoverSelected(page)
    const { at, next } = await rootsOnScreen(page)
    if (!at || !next) throw new Error('the dragged section has no section below it to pass')
    const dy = next.top + next.height / 2 - (at.top + at.height / 2) + 8
    const grip = await page.locator('[data-section-pill] span[title="Drag to reorder"]').boundingBox()
    if (!grip) throw new Error("the pill's grip is not drawn")
    const [gx, gy] = [grip.x + grip.width / 2, grip.y + grip.height / 2]
    const moved = (await pageRows(page)).indexOf(ringed)
    await page.mouse.move(gx, gy)
    await page.mouse.down()
    // the drag has begun once Layers draws its dashed slot; the pointer lifts once the slot has moved to the landing, as a
    // person's does — the drop reads the landing the last move rendered
    const slot = page.locator('[data-drop-slot]')
    await slot.waitFor({ timeout: 10_000 })
    const slotWas = await slot.evaluate((el) => el.style.top)
    for (let i = 1; i <= 20; i++) await page.mouse.move(gx, gy + (dy * i) / 20)
    await page.waitForFunction((was) => document.querySelector('[data-drop-slot]')?.style.top !== was, slotWas, { polling: 25, timeout: 10_000 })
    await page.mouse.up()
    await page.waitForFunction(([k, f]) => [...document.querySelectorAll('[data-layer-row]')].map((e) => e.dataset.layerRow).filter((r) => !r.startsWith('site:')).indexOf(k) > f, [ringed, moved], { polling: 25, timeout: 10_000 })
    done.push('a pill-grip drag')
    // ⌥↓, from its Layers row: one place further on
    step = '⌥↓'
    const from = (await pageRows(page)).indexOf(ringed)
    await page.locator(`[data-layer-row="${ringed}"]`).focus()
    await page.keyboard.press('Alt+ArrowDown')
    await page.waitForFunction(([k, f]) => [...document.querySelectorAll('[data-layer-row]')].map((e) => e.dataset.layerRow).filter((r) => !r.startsWith('site:')).indexOf(k) === f + 1, [ringed, from], { polling: 25, timeout: 10_000 })
    done.push('⌥↓')
    // the clock runs its 3 s; gestures that outran it are traced to their end
    const now = await page.evaluate(() => performance.now())
    if (now - t0 < CLOCK_MS) await page.waitForTimeout(CLOCK_MS - (now - t0))
    const t1 = await page.evaluate(() => performance.now())
    // two more frames, so the frame that ends the window is on record
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))))
    const clock = await measure(page, t0, t1)
    // a window the recorder saw no frame in reads as 0 dropped of 0 — a refusal, never a PASS (standing rule 2)
    if (clock.vsyncs === 0) return { n, refused: 'no frame was recorded inside the 3 s window' }
    return { n, control, done, window: t1 - t0, firstPick: firstPick.longest, ...clock }
  } catch (error) {
    return { n, failed: `${step} — ${error instanceof Error ? error.message.split('\n')[0] : String(error)}` }
  } finally {
    await context.close()
  }
}

const kept = readFileSync(NEXT_ENV)
let server = null
const stop = () => {
  if (server !== null && server.exitCode === null) {
    try {
      process.kill(-server.pid, 'SIGTERM')
    } catch {}
  }
  if (!readFileSync(NEXT_ENV).equals(kept)) writeFileSync(NEXT_ENV, kept)
}
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => {
  stop()
  process.exit(130)
})

let failed = false
try {
  console.log(`building the production harness (INFLOZO_HARNESS=1 next build) …`)
  const build = spawnSync(process.execPath, [NEXT, 'build'], { cwd: WEB, env: { ...process.env, INFLOZO_HARNESS: '1' }, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
  if (build.status !== 0) {
    console.error(build.stdout, build.stderr)
    throw new Error('the harness did not build — see the output above')
  }
  const port = await freePort()
  const base = `http://127.0.0.1:${port}`
  server = spawn(process.execPath, [NEXT, 'start', '-p', String(port), '-H', '127.0.0.1'], { cwd: WEB, env: { ...process.env, INFLOZO_HARNESS: '1' }, stdio: 'ignore', detached: true })
  let ready = false
  for (let i = 0; i < 120 && !ready; i++) {
    ready = await fetch(`${base}/app/harness/editor`, { signal: AbortSignal.timeout(5000) }).then((r) => r.status === 200, () => false)
    if (!ready) await new Promise((r) => setTimeout(r, 500))
  }
  if (!ready) throw new Error(`the harness did not answer on ${base}`)

  const browser = await chromium.launch({ headless: true })
  console.log(`NFR-1 trace — ${LONG_HOME}-section Home, ${RATE}× CPU throttle, ${RUNS} run(s), Chromium ${browser.version()}, 1440 × 900`)
  const results = []
  for (let n = 1; n <= RUNS; n++) results.push(await run(browser, base, n))
  await browser.close()

  const pct = (x) => `${(x * 100).toFixed(1)}%`
  for (const r of results) {
    if ('refused' in r) {
      console.log(`run ${r.n}: REFUSED — ${r.refused}`)
      failed = true
      continue
    }
    if ('failed' in r) {
      console.log(`run ${r.n}: NOT A RESULT — ${r.failed}`)
      failed = true
      continue
    }
    // all three bars, or a FAIL — and each is printed whichever held
    const pass = r.share <= DROPPED_MAX && r.p95 <= P95_MAX && r.longest <= TASK_MAX
    if (!pass) failed = true
    console.log(
      `run ${r.n}: ${pass ? 'PASS' : 'FAIL'} — ${r.done.length} gestures (${r.done.join(', ')}) in ${Math.round(r.window)} ms` +
        `${r.window > CLOCK_MS + 50 ? ' (the gestures outran the 3 s)' : ''} · ${r.vsyncs} vsyncs, ${r.dropped} dropped (${pct(r.share)}; NFR-1 allows ${pct(DROPPED_MAX)})` +
        ` · p95 frame ${r.p95} refresh${r.p95 === 1 ? '' : 'es'} (${r.p95ms.toFixed(1)} ms; NFR-1 allows ${P95_MAX})` +
        ` · longest task ${Math.round(r.longest)} ms (NFR-1 allows ${TASK_MAX})` +
        ` · control: ${CONTROL_MS} ms task seen as ${Math.round(r.control.longest)} ms, ${r.control.dropped} vsyncs dropped` +
        ` · first selection's longest task ${Math.round(r.firstPick)} ms (recorded, not a bar — DW-290)`,
    )
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : error)
  failed = true
} finally {
  stop()
}
process.exit(failed ? 1 : 0)
