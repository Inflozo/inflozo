// Story 6.5 — MODE RESOLUTION IN CHROMIUM: the card's "verified on the canvas in all three states", over the harness's
// canvas document (`/app/harness/canvas`, the app's own `/canvas` bytes plus the fixture ring), in the keyboard gate
// (`bash tools/keyboard/run-keyboard-gate.sh`, `pnpm keyboard`) — so in CI's `check` job, before deploy (R-116). Never
// inside `pnpm check`: Vercel's build reruns that with no browser.
//
// TWO PROOFS, each behind its controls:
// - THE TRUTH TABLE: every combination of the device (`prefers-color-scheme`), the owner's pin (`scheme-light` /
//   `scheme-dark` on `<body>`, or none) and the visitor's choice (`data-mode` light / dark / an unknown word / none),
//   under every reference pack, resolves as the owner ruled (R-239) — every per-mode property on `:root` equal to
//   `packTokens`' light or dark map; and with JavaScript off, where nothing can write `data-mode`, the device alone.
// - THE AGREEMENT SWEEP: for every design and fixture on the harness canvas, every mode-scoped control with a choice and
//   every ordered pair of its values (light L, dark K), the THEME's way — the root at L, `data-instance`, and
//   `darkOverrideCss` after the token block — draws every element exactly as the CANVAS's way draws K (re-stamped, as
//   Story 5.6 previews dark), with dark from each input alone; and in light exactly as the canvas draws L. Read at rest and
//   with `:hover` / `:focus-visible` forced through CDP on every element a design styles so — no pointer, so the gate's
//   keyboard-only rule holds (no mouse or tap API appears in this file).
//
// WHAT IT CANNOT PROVE: that Ghost renders the pin as `{{body_class}}` composes it — `tools/probe/record-mode-resolution.py`
// (MEASUREMENTS §69, T1), and a compiled theme's at Story 7.35.

import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { expect, test } from '@playwright/test'

const REPO = fileURLToPath(new URL('../..', import.meta.url))
const CASES = await import(new URL('../matrix/cases.mjs', import.meta.url).href)
const RT = await import(new URL('../../packages/section-runtime/src/index.ts', import.meta.url).href)
const LIB = await import(new URL('../../packages/library/src/index.ts', import.meta.url).href)
const { iconDrawing } = await import(new URL('../../packages/library/src/icons.ts', import.meta.url).href)
const { samples, paywallSamples } = await import(new URL('../../apps/web/lib/controls-review.ts', import.meta.url).href)
const { JSDOM } = createRequire(`${REPO}packages/section-runtime/package.json`)('jsdom')

const CANVAS = '/app/harness/canvas'

/** THE RULED TABLE (R-239, owner, 2026-10-05; Story 6.5's Design Notes, option 1): the owner's pin; on Auto, the visitor's
 *  explicit choice; then the device. An unknown `data-mode` is no choice. This is the oracle the token block is held to —
 *  `MODE_SELECTORS` is the only place the theme writes it. */
const ruled = (device, pin, visitor) =>
  pin === 'scheme-dark' ? 'dark' : pin === 'scheme-light' ? 'light' : visitor === 'dark' || visitor === 'light' ? visitor : device

/** Set the three inputs, and read them back — the class and the attribute as set, and the media query as emulated. */
async function inputs(page, { device, pin, visitor }) {
  await page.emulateMedia({ colorScheme: device })
  return page.evaluate(({ pin, visitor }) => {
    document.body.classList.remove('scheme-light', 'scheme-dark')
    if (pin) document.body.classList.add(pin)
    if (visitor) document.documentElement.setAttribute('data-mode', visitor)
    else document.documentElement.removeAttribute('data-mode')
    return {
      dark: matchMedia('(prefers-color-scheme: dark)').matches,
      pins: [...document.body.classList].filter((c) => c.startsWith('scheme-')),
      visitor: document.documentElement.getAttribute('data-mode'),
    }
  }, { pin, visitor })
}
function held(got, { device, pin, visitor }, where) {
  if (got.dark !== (device === 'dark')) throw new Error(`${where}: the media control — prefers-color-scheme did not report the emulated ${device}, so this run is not a result (standing rule 2)`)
  if (got.pins.join() !== (pin ?? '') || got.visitor !== visitor) throw new Error(`${where}: the inputs did not read back as set — ${JSON.stringify(got)}`)
}

test('Story 6.5 — the truth table: every combination of device, pin and visitor resolves as the owner ruled (R-239), under every reference pack', async ({ page }) => {
  const DEVICES = ['light', 'dark']
  const PINS = [null, 'scheme-light', 'scheme-dark']
  const VISITORS = [null, 'light', 'dark', 'auto']
  let rows = 0
  for (const pack of CASES.packs()) {
    const tokens = RT.packTokens(CASES.presetPack(pack))
    // the per-mode properties: those whose two maps differ, read off the engine — never a list written here
    const perMode = Object.keys(tokens.light).filter((p) => tokens.light[p] !== tokens.dark[p])
    expect(perMode.length, `${pack}: no property differs by mode`).toBeGreaterThan(0)
    await page.goto(`${CANVAS}?pack=${pack}`)
    // THE CONTROL: with the token block disabled nothing declares --bg-page, so a value read later is the block's
    const off = await page.evaluate(() => {
      const block = document.querySelector('style[data-order="1-tokens"]')
      block.disabled = true
      const v = getComputedStyle(document.documentElement).getPropertyValue('--bg-page').trim()
      block.disabled = false
      return { v, on: getComputedStyle(document.documentElement).getPropertyValue('--bg-page').trim() }
    })
    if (off.v !== '' || off.on === '') throw new Error(`${pack}: the token-block control — --bg-page read ${JSON.stringify(off.v)} with the block disabled and ${JSON.stringify(off.on)} with it on — so this run is not a result`)
    for (const device of DEVICES) for (const pin of PINS) for (const visitor of VISITORS) {
      const where = `${pack} · device ${device} · pin ${pin ?? 'none (Auto)'} · visitor ${visitor ?? 'none'}`
      held(await inputs(page, { device, pin, visitor }), { device, pin, visitor }, where)
      const want = ruled(device, pin, visitor)
      const got = await page.evaluate((names) => Object.fromEntries(names.map((p) => [p, getComputedStyle(document.documentElement).getPropertyValue(p).trim()])), perMode)
      const wrong = perMode.filter((p) => got[p] !== tokens[want][p])
      expect(wrong, `${where}: expected ${want}; these read otherwise — ${wrong.map((p) => `${p} ${got[p]} (want ${tokens[want][p]})`).join(' · ')}`).toEqual([])
      rows++
    }
  }
  test.info().annotations.push({ type: 'truth-table', description: `${rows} combinations` })
  console.log(`      truth table: ${rows} combinations across the reference packs, every one as ruled; controls held — the media query, the inputs read back, the token block off leaves --bg-page empty`)
})

// THE I/O MATRIX'S "JavaScript off" ROW: no script runs, so nothing can write `data-mode` — the device alone decides, in
// CSS. The page carries the pack's block and a script that WOULD choose the other mode: its attribute reading back absent
// is the control that JavaScript was off.
test('Story 6.5 — JavaScript off: the device alone decides, pure CSS, under every reference pack', async ({ browser }) => {
  for (const pack of CASES.packs()) {
    const tokens = RT.packTokens(CASES.presetPack(pack))
    const perMode = Object.keys(tokens.light).filter((p) => tokens.light[p] !== tokens.dark[p])
    for (const device of ['light', 'dark']) {
      const context = await browser.newContext({ javaScriptEnabled: false, colorScheme: device })
      const page = await context.newPage()
      const other = device === 'dark' ? 'light' : 'dark'
      await page.setContent(`<!doctype html><html><head><style>${RT.packTokensCss(CASES.presetPack(pack))}</style></head><body><script>document.documentElement.setAttribute('data-mode', '${other}')</script></body></html>`)
      const got = await page.evaluate((names) => ({
        visitor: document.documentElement.getAttribute('data-mode'),
        dark: matchMedia('(prefers-color-scheme: dark)').matches,
        root: Object.fromEntries(names.map((p) => [p, getComputedStyle(document.documentElement).getPropertyValue(p).trim()])),
      }), perMode)
      await context.close()
      if (got.visitor !== null) throw new Error(`${pack} · ${device}: the page's script ran (data-mode ${got.visitor}), so JavaScript was on and this run is not a result`)
      if (got.dark !== (device === 'dark')) throw new Error(`${pack} · ${device}: the media control — prefers-color-scheme did not report the emulated ${device}`)
      const wrong = perMode.filter((p) => got.root[p] !== tokens[device][p])
      expect(wrong, `${pack} · device ${device}, JavaScript off: these read otherwise — ${wrong.join(' · ')}`).toEqual([])
    }
  }
})

// ── the agreement sweep ──────────────────────────────────────────────────────────────────────────────────────────────

/** what a dark override may change, read per element */
const PROPS = ['color', 'background-color', 'border-top-color', 'border-right-color', 'border-bottom-color', 'border-left-color', 'outline-color', 'text-decoration-line', 'text-decoration-color', 'box-shadow']

/** Every design and fixture on the harness canvas: the library's designs, the controls ring and the stand-in paywalls —
 *  the route's own lists (`app/harness/canvas/route.ts`). */
const ENTRIES = () => [...CASES.pilotIds().map(CASES.pilot), ...samples(), ...paywallSamples()]

function render(entry, controls, instance) {
  const input = CASES.renderInput(entry, { ...CASES.fixtureRows(entry)[0], controls }, iconDrawing)
  return CASES.renderCanvas(new JSDOM('<body></body>').window.document, entry.html, instance === undefined ? input : { ...input, instance })
}

/** The elements a design styles under :hover or :focus-visible — the compound each pseudo-class sits on, as a selector. */
const forcedTargets = (css) => [...new Set([...css.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/([^\s>+~,(){}]+):(hover|focus-visible)/g)].map((m) => `${m[1].replace(/:[\w-]+(\([^)]*\))?/g, '')}|${m[2]}`))]

// in the page: one reading kept, and each later reading answers only what differs from it
const IN_PAGE = (props) => {
  window.__els = (scope) => { const all = [...document.querySelectorAll('#canvas *')]; if (scope === null) return all; const root = all[scope]; return root ? [root, ...root.querySelectorAll('*')] : [] }
  window.__snap = (scope) => window.__els(scope).map((el) => { const cs = getComputedStyle(el); return props.map((p) => cs.getPropertyValue(p)) })
  window.__keep = (key, scope) => { (window.__kept ??= {})[key] = window.__snap(scope); return [] }
  window.__diff = (key, scope) => {
    const a = window.__kept[key]
    const b = window.__snap(scope)
    if (a === undefined || a.length !== b.length) return [`${a?.length ?? 'no'} elements against ${b.length}`]
    for (let i = 0; i < a.length; i++) for (let j = 0; j < props.length; j++) if (a[i][j] !== b[i][j]) return [`element ${i} (${window.__els(scope)[i].className || window.__els(scope)[i].tagName}) ${props[j]}: ${a[i][j]} → ${b[i][j]}`]
    return []
  }
}

test('Story 6.5 — the agreement sweep: a dark override drawn the theme\'s way equals the canvas\'s way, from each input alone, at rest and under :hover and :focus-visible, under every reference pack', async ({ page }) => {
  test.setTimeout(900_000)
  let cdp
  /** the harness canvas in a reference pack, with the per-section rules in their own <style> after the token block, as
   *  Epic 7's block appends them; transitions off, so a reading never lands mid-way through a design's 160ms change */
  async function open(pack) {
    await page.goto(`${CANVAS}?pack=${pack}`)
    await page.evaluate(IN_PAGE, PROPS)
    await page.evaluate(() => {
      const own = document.createElement('style')
      own.id = 'dark-override'
      document.querySelector('style[data-order="1-tokens"]').after(own)
      const still = document.createElement('style')
      still.textContent = '*,*::before,*::after{transition:none!important;animation:none!important}'
      document.head.append(still)
    })
    cdp = await page.context().newCDPSession(page)
    await cdp.send('DOM.enable')
    await cdp.send('CSS.enable')
  }

  /** draw `markup` under the given inputs and either keep the reading (`__keep`) or diff it against the kept one */
  async function reading(op, key, markup, state, css, targets) {
    held(await inputs(page, state), state, key)
    await page.evaluate(({ markup, css }) => {
      document.getElementById('dark-override').textContent = css
      const mount = document.getElementById('canvas')
      mount.innerHTML = markup
      for (const el of mount.querySelectorAll('[data-module]')) el.classList.add('js-enabled')
    }, { markup, css })
    const said = [...await page.evaluate(([op, key]) => window[op](key, null), [op, `${key}|rest`])].map((d) => `rest — ${d}`)
    const { root } = await cdp.send('DOM.getDocument', { depth: -1 })
    for (const t of targets) {
      const [selector, pseudo] = t.split('|')
      let nodeIds = []
      try { nodeIds = (await cdp.send('DOM.querySelectorAll', { nodeId: root.nodeId, selector: `#canvas ${selector}` })).nodeIds.slice(0, 2) } catch { continue }
      for (const [k, nodeId] of nodeIds.entries()) {
        const index = await page.evaluate(({ selector, k }) => [...document.querySelectorAll('#canvas *')].indexOf(document.querySelectorAll(`#canvas ${selector}`)[k]), { selector, k })
        await cdp.send('CSS.forcePseudoState', { nodeId, forcedPseudoClasses: [pseudo] })
        said.push(...(await page.evaluate(([op, key, index]) => window[op](key, index), [op, `${key}|${t}#${k}`, index])).map((d) => `${selector}:${pseudo} — ${d}`))
        await cdp.send('CSS.forcePseudoState', { nodeId, forcedPseudoClasses: [] })
      }
    }
    return said
  }

  const DARK = [
    { name: 'the device alone', device: 'dark', pin: null, visitor: null },
    { name: 'the visitor alone', device: 'light', pin: null, visitor: 'dark' },
    { name: 'the pin alone', device: 'light', pin: 'scheme-dark', visitor: null },
  ]
  const LIGHT = [
    { name: 'the device alone', device: 'light', pin: null, visitor: null },
    { name: 'the visitor alone', device: 'dark', pin: null, visitor: 'light' },
    { name: 'the pin alone', device: 'dark', pin: 'scheme-light', visitor: null },
  ]
  // the canvas's way: `data-mode` on its <html>, a bare <body> — Story 5.6's preview
  const CANVAS_DARK = { device: 'light', pin: null, visitor: 'dark' }
  const CANVAS_LIGHT = { device: 'light', pin: null, visitor: 'light' }

  let pairs = 0
  let withheldDiffers = 0
  const wrong = []
  const entries = ENTRIES()
  for (const pack of CASES.packs()) {
    await open(pack)
    for (const entry of entries) {
      const targets = forcedTargets(entry.css)
      const choices = Object.entries(LIB.modeScopedOffers(entry.controlSchema, entry.universals)).filter(([, values]) => values.length >= 2)
      for (const [control, values] of choices) for (const L of values) for (const K of values) {
        if (L === K) continue
        const key = `harness:${entry.id}`
        const state = { controls: { [control]: L }, darkOverrides: { [control]: K } }
        const instance = RT.darkHook(entry, state, key)
        if (instance === undefined) throw new Error(`${entry.id} ${control} ${L}→${K}: an override this design offers has no hook`)
        const css = RT.darkOverrideCss([{ key, entry, state }])
        const theme = render(entry, { [control]: L }, instance)
        const at = `${pack} · ${entry.id} · ${control} ${L} → ${K} in dark`
        // DARK: the canvas draws K; the theme draws L plus the block, dark from each input alone
        await reading('__keep', at, render(entry, { [control]: K }), CANVAS_DARK, '', targets)
        for (const input of DARK) for (const d of await reading('__diff', at, theme, input, css, targets)) wrong.push(`${at}, ${input.name}: ${d}`)
        // THE CONTROL: the block withheld, the theme's way must NOT draw K — so the block is what makes the two agree
        if ((await reading('__diff', at, theme, DARK[1], '', targets)).length > 0) withheldDiffers++
        // LIGHT: the canvas draws L; the theme draws L with the block present, from each light input alone
        await reading('__keep', `${at} (light)`, render(entry, { [control]: L }), CANVAS_LIGHT, '', targets)
        for (const input of LIGHT) for (const d of await reading('__diff', `${at} (light)`, theme, input, css, targets)) wrong.push(`${pack} · ${entry.id} · ${control} ${L} in light (override ${K}), ${input.name}: ${d}`)
        pairs++
      }
    }
  }
  if (pairs === 0) throw new Error('the sweep found no mode-scoped control with a choice, so it proves nothing')
  if (withheldDiffers === 0) throw new Error('the withheld-block control: with darkOverrideCss withheld no pair differed, so this sweep is not a result (standing rule 2)')
  test.info().annotations.push({ type: 'agreement', description: `${pairs} ordered pairs · ${withheldDiffers} differ with the block withheld` })
  console.log(`      agreement sweep: ${pairs} ordered pairs across the reference packs, each from three dark and three light inputs; control — ${withheldDiffers} of them differ with the block withheld`)
  expect(wrong, wrong.slice(0, 20).join('\n')).toEqual([])
})
