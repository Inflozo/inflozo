// Story 4.11 — NFR-6(a)'s render matrix and NFR-5's accessibility scan, ONE page load per case and one matrix.
//
// Per case (the list is `cases.mjs`'s, derived): render the design through `renderCanvas` with the input the editor's
// `paint()` builds, write it into `#canvas` of the editor's own canvas document the way `paint()` does, set
// `data-mode`, add `js-enabled` to every module mount, size the window to the section as the editor sizes its iframe,
// photograph `#canvas` against its baseline, then run axe-core at WCAG 2.1 AA in the same page behind a positive
// control. Before the cases, the runner itself is held to `manifest.json` (DW-138), and every baseline to a case.
//
//     bash tools/matrix/run-matrix-gate.sh            the gate: inside the pinned image
//     bash tools/matrix/run-matrix-gate.sh --update   re-takes the baselines and the manifest — never in CI

import { test, expect } from '@playwright/test'
import { existsSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { join, relative } from 'node:path'
import { ORIGIN, REPO, VIEWPORTS, cases, only, pilot, renderCanvas, renderInput, selected, specimenMarkup } from './cases.mjs'
import { serve } from './serve.mjs'

const require = createRequire(import.meta.url)
const { JSDOM } = createRequire(join(REPO, 'packages/section-runtime/package.json'))('jsdom')
const { iconDrawing } = await import(join(REPO, 'packages/library/src/icons.ts'))
const AXE = require.resolve('axe-core/axe.min.js')
const WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']
const BASELINES = join(REPO, 'packages/library/baselines')
const MANIFEST = join(REPO, 'tools/matrix/manifest.json')
const LIST = cases()

/** `--update` is the only writer, and it writes only inside the pinned image and never in CI. */
function writes() {
  const on = test.info().config.updateSnapshots !== 'none'
  if (on && process.env.INFLOZO_MATRIX_IMAGE !== '1') throw new Error('a baseline is written only inside the pinned image — run bash tools/matrix/run-matrix-gate.sh --update, never --host')
  if (on && process.env.CI) throw new Error('CI never re-takes a baseline: a mass rebaseline is its own commit, on the owner\'s approval (docs/render-matrix.md)')
  return on
}

let server
test.beforeAll(async () => { server = await serve() })
test.afterAll(async () => { await server?.close() })

/** The canvas document with nothing on the network but itself: the pictures' real origin answered by the server, the
 *  document and its faces (`canvas?font=`) from the server, and every other request refused, so no case depends on a
 *  network it does not own. Story 6.2: the document is the case's pack's (`?pack=`), or its pairing's specimen. */
async function open(page, c = { pack: 'paper' }) {
  await page.route('**/*', async (route) => {
    const url = route.request().url()
    if (url.startsWith(`${server.url}/`)) return route.continue()
    if (url.startsWith(`${ORIGIN}/images/`)) return route.fulfill({ response: await route.fetch({ url: `${server.url}${new URL(url).pathname}` }) })
    return route.abort()
  })
  await page.goto(`${server.url}/?${c.pairing ? `specimen=${c.pairing}` : `pack=${c.pack}`}`, { waitUntil: 'load' })
}

// ─── the runner is part of the baseline ─────────────────────────────────────────────────────────────────────

/** What the baselines depend on, read from the running system rather than remembered: the image the Dockerfile pins,
 *  the Playwright and Chromium that ran, the faces Chromium actually drew each token font with, and the browser floor. */
async function runner(page, browser) {
  await open(page)
  const faces = {}
  for (const token of ['--font-heading', '--font-body']) {
    await page.evaluate((t) => {
      const probe = document.createElement('p')
      probe.id = 'font-probe'
      probe.style.fontFamily = `var(${t})`
      probe.textContent = 'Orbit Weekly'
      document.getElementById('canvas').replaceChildren(probe)
      return document.fonts.ready
    }, token)
    const cdp = await page.context().newCDPSession(page)
    const { root } = await cdp.send('DOM.getDocument')
    const { nodeId } = await cdp.send('DOM.querySelector', { nodeId: root.nodeId, selector: '#font-probe' })
    await cdp.send('CSS.enable')
    faces[token] = (await cdp.send('CSS.getPlatformFontsForNode', { nodeId })).fonts.map((f) => f.familyName).join(', ')
    await cdp.detach()
  }
  return {
    image: /^FROM\s+(\S+)/m.exec(readFileSync(join(REPO, 'tools/matrix/Dockerfile'), 'utf8'))[1],
    playwright: JSON.parse(readFileSync(require.resolve('@playwright/test/package.json'), 'utf8')).version,
    chromium: browser.version(),
    fonts: faces,
    widelyAvailableOnDate: JSON.parse(readFileSync(join(REPO, 'package.json'), 'utf8'))['browserslist-config-baseline'].widelyAvailableOnDate,
  }
}

test('manifest — the baselines were taken under this runner, these fonts and this browser floor (DW-138)', async ({ page, browser }) => {
  const now = await runner(page, browser)
  if (writes()) {
    const about = 'Written by bash tools/matrix/run-matrix-gate.sh --update, inside the pinned image, with the baselines it took. The gate fails when any value here differs from the running system — docs/render-matrix.md.'
    writeFileSync(MANIFEST, `${JSON.stringify({ about, ...now }, null, 2)}\n`)
    return
  }
  expect(existsSync(MANIFEST), 'tools/matrix/manifest.json is missing — no baseline set has been taken; run bash tools/matrix/run-matrix-gate.sh --update').toBe(true)
  const recorded = JSON.parse(readFileSync(MANIFEST, 'utf8'))
  const drift = Object.keys(now).filter((k) => JSON.stringify(recorded[k]) !== JSON.stringify(now[k])).map((k) => k === 'widelyAvailableOnDate'
    ? `widelyAvailableOnDate: the root package.json pins ${now[k]} and the baselines were taken under ${recorded[k]} — the baselines predate the floor; re-run bash tools/matrix/run-matrix-gate.sh --update and commit the baselines with the manifest (DW-138)`
    : `${k}: recorded ${JSON.stringify(recorded[k])}, running ${JSON.stringify(now[k])} — the runner is part of the baseline; re-take them under this one (--update) or restore the recorded runner`)
  expect(drift, drift.join('\n')).toEqual([])
})

test('every baseline on disk is a case — a design removed takes its photographs with it', () => {
  const expected = new Set(LIST.map((c) => c.snapshot.join('/')))
  const onDisk = baselineIdsOnDisk().filter((id) => selected(id, only())).flatMap((id) =>
    readdirSync(join(BASELINES, id)).filter((f) => f.endsWith('.png')).map((f) => `${id}/${f}`))
  const orphans = onDisk.filter((f) => !expected.has(f))
  if (writes()) return orphans.forEach((f) => rmSync(join(BASELINES, f)))
  expect(orphans, `${orphans.map((f) => relative(REPO, join(BASELINES, f))).join('\n')}\nno case photographs these; --update removes them`).toEqual([])
})

/** Every `{category}/{n}` directory under the baselines, so a baseline whose design is gone is still seen. */
function baselineIdsOnDisk() {
  if (!existsSync(BASELINES)) return []
  return readdirSync(BASELINES).flatMap((category) => readdirSync(join(BASELINES, category)).map((n) => `${category}/${n}`))
}

// ─── Story 6.4 — a specimen's lines, each in the pool's own face ────────────────────────────────────────────────

/** Every `[data-family]` line of the specimen, held to the faces Chromium drew it with: each the pool's file, of that
 *  family. Throws on a line drawn in anything else, and first on a control that is not caught. Answers the lines held. */
async function poolFacesOnly(page, title) {
  const cdp = await page.context().newCDPSession(page)
  try {
    // the CSS agent needs the DOM agent's first
    await cdp.send('DOM.enable')
    await cdp.send('CSS.enable')
    const drawnWith = async (selector) => {
      const { root } = await cdp.send('DOM.getDocument', { depth: -1 })
      const { nodeIds } = await cdp.send('DOM.querySelectorAll', { nodeId: root.nodeId, selector })
      return Promise.all(nodeIds.map(async (nodeId) => {
        const { attributes } = await cdp.send('DOM.getAttributes', { nodeId })
        const family = attributes[attributes.indexOf('data-family') + 1]
        const { fonts } = await cdp.send('CSS.getPlatformFontsForNode', { nodeId })
        // a file names its family as its own name table does — an instanced variable face may add its style ("Chivo
        // Medium", executed in the image) — so the family is the name or the name and a style
        const ofFamily = (name) => name === family || name.startsWith(`${family} `)
        return { family, fonts, ok: fonts.length > 0 && fonts.every((f) => f.isCustomFont && ofFamily(f.familyName)) }
      }))
    }
    // the control: a line in a family no @font-face declares, so Chromium draws it in a system face
    await page.evaluate(() => {
      const probe = document.createElement('p')
      probe.id = 'faces-control'
      probe.dataset.family = 'Inflozo control'
      probe.style.fontFamily = 'serif'
      probe.textContent = 'Control'
      document.getElementById('canvas').append(probe)
    })
    const [control] = await drawnWith('#faces-control')
    await page.evaluate(() => document.getElementById('faces-control')?.remove())
    if (!control || control.ok) throw new Error(`${title}: the face check's positive control — a line in a system face — was not caught, so this check is not a result (standing rule 2)`)
    const lines = await drawnWith('#canvas [data-family]')
    if (lines.length === 0) throw new Error(`${title}: the specimen names no line's family, so there is nothing to check`)
    const wrong = lines.filter((l) => !l.ok).map((l) => `${l.family}: drawn with ${l.fonts.map((f) => `${f.familyName}${f.isCustomFont ? '' : ' (not the pool\'s file)'}`).join(', ') || 'nothing'}`)
    expect.soft(wrong, `${title}: a line not drawn in the pool's own face\n${wrong.join('\n')}`).toEqual([])
    return lines.length
  } finally {
    await cdp.detach()
  }
}

// ─── the cases ──────────────────────────────────────────────────────────────────────────────────────────────

const entries = new Map()
const entry = (id) => entries.get(id) ?? entries.set(id, pilot(id)).get(id)

for (const viewport of VIEWPORTS) {
  test.describe(viewport.name, () => {
    test.use({
      viewport: { width: viewport.width, height: 900 },
      deviceScaleFactor: viewport.deviceScaleFactor ?? 1,
      reducedMotion: viewport.reducedMotion ?? 'no-preference',
    })
    for (const c of LIST.filter((x) => x.viewport === viewport)) {
      const annotation = [{ type: c.pairing ? 'specimen' : 'design', description: c.id }, { type: 'pack', description: c.pack }]
      // Story 6.4 (DW-324): a case on the contrast ground says so, for the totals line
      if (c.row.controls?.bg === 'contrast') annotation.push({ type: 'ground', description: 'contrast' })
      test(c.title, { annotation }, async ({ page }) => {
        writes()
        // a specimen is the matrix's own markup (R-233); a design is rendered as the editor's paint() renders it
        const html = c.pairing ? specimenMarkup(c.pairing) : ((e) => renderCanvas(new JSDOM('<body></body>').window.document, e.html, renderInput(e, c.row, iconDrawing)))(entry(c.id))
        await open(page, c)

        // paint(): the mode on <html>, the section into #canvas, and the state `core` leaves a mount in (no script)
        const drawn = await page.evaluate(({ markup, mode }) => {
          document.documentElement.setAttribute('data-mode', mode)
          const mount = document.getElementById('canvas')
          mount.innerHTML = markup
          for (const el of mount.querySelectorAll('[data-module]')) el.classList.add('js-enabled')
          return mount.childElementCount > 0
        }, { markup: html, mode: c.mode })
        // a Show-to arm is photographed as a visitor it hides from, so it must draw nothing; every other row draws
        expect(drawn, drawn ? `${c.title}: the section is drawn for a visitor its Show-to hides it from` : `${c.title}: nothing was drawn`).toBe(c.row.visibility === undefined)

        // the window takes the section's height, as the editor's iframe does — so every lazy picture is in view
        for (let i = 0; i < 2; i++) {
          await page.evaluate(() => document.fonts.ready)
          const height = await page.evaluate(() => Math.max(240, Math.ceil(document.getElementById('canvas').getBoundingClientRect().height)))
          await page.setViewportSize({ width: viewport.width, height })
          await page.waitForFunction(() => [...document.images].every((img) => img.complete))
        }

        // Story 6.4 (DW-324) — A SPECIMEN IS DRAWN IN THE POOL'S OWN FACES, line by line: Chromium's own record of the
        // faces it drew each line's words with (`CSS.getPlatformFontsForNode`), every one the pool's file — `isCustomFont`,
        // an `@font-face` the document declares — and the line's role's family. The family alone cannot tell: the image
        // installs a system Inter (executed at 6.4's Create: the pool's Fraunces reports `isCustomFont: true`, a fallback
        // `false`). Behind its positive control: a line set in a family the document never declares must be caught.
        if (c.pairing) test.info().annotations.push({ type: 'faces', description: String(await poolFacesOnly(page, c.title)) })

        const missing = !existsSync(join(BASELINES, ...c.snapshot)) && !writes() ? ' — it has no baseline; take one with bash tools/matrix/run-matrix-gate.sh --update' : ''
        const name = `${c.title} — pack ${c.pack}, mode ${c.mode}, viewport ${viewport.name}${c.row.name ? `, ${c.row.name}` : ''}${missing}`
        await expect.soft(drawn ? page.locator('#canvas') : page, name).toHaveScreenshot(c.snapshot)

        // Story 6.1 (FR-F2, FR-G4): a section spans the site width and stays responsive within it, so nothing scrolls
        // sideways — measured after the photograph, so the probe never reaches one, behind its positive control: a probe
        // wider than the viewport must be measured as overflow and removed, or the measure is not a result
        if (drawn) {
          const sideways = await page.evaluate(() => {
            const root = document.documentElement
            const probe = document.createElement('div')
            probe.style.cssText = `width: ${root.clientWidth + 64}px; height: 1px`
            document.body.append(probe)
            const control = root.scrollWidth - root.clientWidth
            probe.remove()
            return { control, overflow: root.scrollWidth - root.clientWidth }
          })
          if (sideways.control <= 0) throw new Error(`${name}: the overflow check's positive control — a probe wider than the viewport — was not measured, so this check is not a result (standing rule 2)`)
          test.info().annotations.push({ type: 'overflow', description: String(sideways.overflow) })
          expect.soft(sideways.overflow, `${name}: the page scrolls sideways by ${sideways.overflow}px — a section is wider than its viewport`).toBe(0)
        }

        // axe in the same page, behind its positive control: a scan that cannot see an alt-less <img> is not a result
        // ponytail: no design draws {{content}} yet; when one does, the scan must stop at the post body's edge (FR-H3/NFR-5)
        await page.addScriptTag({ path: AXE })
        const control = await page.evaluate(async (tags) => {
          const mount = document.getElementById('canvas')
          const probe = document.createElement('img')
          probe.src = 'data:image/gif;base64,R0lGODlhAQABAAAAACw='
          mount.append(probe)
          const found = (await window.axe.run(mount, { runOnly: tags })).violations.some((v) => v.id === 'image-alt')
          probe.remove()
          return found
        }, WCAG)
        if (!control) throw new Error(`${name}: axe's positive control — an <img> with no alt — was not reported, so this scan is not a result (standing rule 2)`)
        const violations = await page.evaluate(async (tags) =>
          (await window.axe.run(document.getElementById('canvas'), { runOnly: tags })).violations.map((v) => ({ rule: v.id, selectors: v.nodes.map((n) => n.target.join(' ')) })), WCAG)
        test.info().annotations.push({ type: 'violations', description: String(violations.length) })
        expect(violations, `${name}: axe at WCAG 2.1 AA\n${violations.map((v) => `  ${v.rule}: ${v.selectors.join(' · ')}`).join('\n')}`).toEqual([])
      })
    }
  })
}
