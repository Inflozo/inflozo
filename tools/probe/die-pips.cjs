// DW-216 (Story 5.24d) — WHERE THE DIE'S PIPS LAND, measured once for every gate that reads them: the keyboard journey
// (`tools/keyboard/journey.spec.mjs`, ESM, `import diePips from '../probe/die-pips.cjs'`) and both deployed walks
// (`run-verify-editor.cjs` step 88 and `run-verify-controls.cjs`, `require('./die-pips.cjs')`). Each hands it to
// Playwright's `evaluateAll` over the six `.remix-dice__face` elements, so it runs in the page and must stay
// self-contained: no name from this file's scope may appear inside it.
//
// R-164: every pip is a gradient LAYER, and a layer at `background-size: auto` fills the whole face — at which size a
// percentage `background-position` resolves to `(box - layer) x pct` = 0 and all six faces draw ONE centred dot, which
// shipped once and which the owner saw. So it computes where each pip actually lands from the face's box and the layer's
// size, never reading the rule back: `layers` is how many pips a face declares, `distinct` how many different places they
// land in, `box` the face's own size.
module.exports = function diePips(faces) {
  return faces.map((el) => {
    const cs = getComputedStyle(el)
    const box = { w: el.offsetWidth, h: el.offsetHeight }
    const sizes = cs.backgroundSize.split(',').map((v) => v.trim())
    const at = (v, span, layer) => (v.endsWith('%') ? ((span - layer) * parseFloat(v)) / 100 + layer / 2 : parseFloat(v) + layer / 2)
    const centres = cs.backgroundPosition.split(',').map((pair, n) => {
      const [x, y] = pair.trim().split(/\s+/)
      const [sw, sh] = (sizes[n] ?? sizes[0]).split(/\s+/)
      const lw = sw === 'auto' ? box.w : parseFloat(sw)
      const lh = (sh ?? sw) === 'auto' ? box.h : parseFloat(sh ?? sw)
      return `${at(x, box.w, lw).toFixed(2)},${at(y, box.h, lh).toFixed(2)}`
    })
    return { layers: centres.length, distinct: new Set(centres).size, box }
  })
}
