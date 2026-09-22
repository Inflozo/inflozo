// THE CHROME LAYER INSIDE THE CANVAS DOCUMENT (Story 5.2, the owner's finding of 2026-09-17, amending R-120).
//
// The canvas scrolls on the compositor, a frame ahead of the main thread, so chrome positioned from the editor document
// drew a frame behind the section it followed: 8–15px adrift at a 1200px/s scroll, measured from the compositor's own
// frames (`run-verify-editor.cjs` step 15). Chrome that lives in the canvas document's own scrolling content moves with
// it in the same frame. So the outline boxes, the name tag and the Pro badge are the editor's React elements PORTALLED
// into two shadow roots appended to the canvas `<body>`, outside `#canvas` and outside every section root:
//
//   - `page`, `position: absolute` at the document's origin — it scrolls with the content (a static root's chrome);
//   - `view`, `position: fixed` — it stays with the viewport (a sticky or fixed root's chrome, which does not scroll).
//
// Each host is scaled by 1 / fit, so inside it one unit is one screen pixel: the Kit's 11px tag and ProBadge draw at
// their own size, and R-120's inset box-shadow lines paint 1.00px and 1.50px, as they did outside the frame. The shadow
// root adopts the editor's own stylesheet (Tailwind and the tokens), so nothing is redrawn and nothing leaks into the
// site; the editor's fonts are added to the canvas document under a family name of their own (`inflozo-chrome …`),
// so the site's own `'Inter'` still resolves as it does at rest. Hosts exist only while something is hovered or
// selected: `dropChromeLayers` removes them; the roots' two state marks are the editor's own (`editor.tsx` `mark()`),
// cleared with the hover and the selection, so rest is zero. No script is added.

export type ChromeLayers = { doc: Document; page: ShadowRoot; view: ShadowRoot }

const FAMILY = 'inflozo-chrome '
const sheets = new WeakMap<Document, CSSStyleSheet>()
const fonted = new WeakSet<Document>()

function* rulesOf(list: CSSRuleList): Generator<CSSRule> {
  for (const rule of list) {
    yield rule
    if ('cssRules' in rule && rule.cssRules instanceof CSSRuleList) yield* rulesOf(rule.cssRules)
  }
}

/** The editor document's same-origin stylesheets, as rules. A cross-origin sheet cannot be read and is skipped. */
function* editorRules(): Generator<{ rule: CSSRule; href: string }> {
  for (const sheet of document.styleSheets) {
    let list: CSSRuleList
    try {
      list = sheet.cssRules
    } catch {
      continue
    }
    for (const rule of list) yield { rule, href: sheet.href ?? document.baseURI }
  }
}

/** The editor's stylesheet, constructed in the canvas window (an adopted sheet must belong to its shadow root's document).
 *  `@font-face` does not apply inside a shadow root, and the faces are added document-wide below instead. */
function sheetFor(doc: Document): CSSStyleSheet {
  const had = sheets.get(doc)
  if (had) return had
  const win = doc.defaultView as Window & typeof globalThis
  const text = [...editorRules()]
    .filter(({ rule }) => !(rule instanceof CSSFontFaceRule) && !(rule instanceof CSSImportRule))
    .map(({ rule }) => rule.cssText)
    .join('\n')
  const sheet = new win.CSSStyleSheet()
  sheet.replaceSync(text)
  sheets.set(doc, sheet)
  return sheet
}

const unquote = (s: string) => s.trim().replace(/^(["'])(.*)\1$/, '$2')

/** Every face the editor declares, added to the canvas document under `inflozo-chrome <family>`, loading now. */
function addFonts(doc: Document) {
  if (fonted.has(doc)) return
  fonted.add(doc)
  const win = doc.defaultView as Window & typeof globalThis
  const descriptors: [string, string][] = [
    ['font-style', 'style'], ['font-weight', 'weight'], ['font-stretch', 'stretch'], ['unicode-range', 'unicodeRange'],
    ['font-display', 'display'], ['size-adjust', 'sizeAdjust'], ['ascent-override', 'ascentOverride'],
    ['descent-override', 'descentOverride'], ['line-gap-override', 'lineGapOverride'],
  ]
  for (const { rule, href } of editorRules()) {
    for (const r of rule instanceof CSSFontFaceRule ? [rule] : 'cssRules' in rule && rule.cssRules instanceof CSSRuleList ? [...rulesOf(rule.cssRules)] : []) {
      if (!(r instanceof CSSFontFaceRule)) continue
      const family = unquote(r.style.getPropertyValue('font-family'))
      // a relative url is relative to its stylesheet, never to the canvas document
      const src = r.style.getPropertyValue('src').replace(/url\((["']?)([^"')]+)\1\)/g, (_, _q, url: string) => `url("${new URL(url, href).href}")`)
      const options: FontFaceDescriptors = {}
      for (const [css, key] of descriptors) {
        const value = r.style.getPropertyValue(css)
        if (value) (options as Record<string, string>)[key] = value
      }
      const face = new win.FontFace(`${FAMILY}${family}`, src, options)
      doc.fonts.add(face)
      void face.load().catch(() => undefined)
    }
  }
}

/** The editor's font stacks (`--font-ui` and the rest), with every family it loads renamed to the canvas's copy. */
function fontStacks(): string {
  const root = getComputedStyle(document.documentElement)
  const loaded = new Set([...document.fonts].map((f) => unquote(f.family)))
  return ['--font-ui', '--font-display', '--font-mono']
    .map((name) => {
      const stack = root.getPropertyValue(name).split(',').map((f) => (loaded.has(unquote(f)) ? `"${FAMILY}${unquote(f)}"` : f.trim()))
      return `${name}:${stack.join(', ')};`
    })
    .join('')
}

/** The two hosts, made once per canvas document and reused while chrome shows. */
export function chromeLayers(doc: Document): ChromeLayers {
  addFonts(doc)
  const sheet = sheetFor(doc)
  const stacks = fontStacks()
  const host = (kind: 'page' | 'view') => {
    const el = doc.querySelector<HTMLElement>(`[data-inflozo-chrome="${kind}"]`) ?? doc.createElement('div')
    el.setAttribute('data-inflozo-chrome', kind)
    // `all: initial` so nothing of the site's body is inherited; the rest is the editor body's own type (globals.css)
    el.style.cssText =
      `all:initial;position:${kind === 'page' ? 'absolute' : 'fixed'};left:0;top:0;width:0;height:0;` +
      `z-index:2147483647;pointer-events:none;transform-origin:0 0;line-height:1.5;${stacks}` +
      'font-family:var(--font-ui);-webkit-font-smoothing:antialiased'
    if (!el.isConnected) doc.body.append(el)
    const shadow = el.shadowRoot ?? el.attachShadow({ mode: 'open' })
    shadow.adoptedStyleSheets = [sheet]
    return shadow
  }
  return { doc, page: host('page'), view: host('view') }
}

export function dropChromeLayers(doc: Document) {
  for (const el of doc.querySelectorAll('[data-inflozo-chrome]')) el.remove()
}

/** A sticky or fixed root does not scroll with the content, so its chrome goes in the viewport's layer.
 *  ponytail: read once per render — a sticky root that has not yet reached its stuck position still moves with the
 *  content, and its chrome then trails it by the main thread's frame until it sticks. A root that is sticky at the top of
 *  its canvas (every pilot header) is stuck from the start; per-frame switching is the upgrade if a design needs it. */
export const pinned = (root: HTMLElement) => {
  const position = root.ownerDocument.defaultView?.getComputedStyle(root).position
  return position === 'sticky' || position === 'fixed'
}

/** Places one chrome element over its root, in its host's units (one unit is one screen pixel); writes only on change. */
export function place(el: HTMLElement, root: HTMLElement, fit: number, how: 'fill' | 'top-left' | 'top-right' | 'above' | 'bottom-left') {
  const host = (el.getRootNode() as ShadowRoot).host as HTMLElement | undefined
  if (!host) return
  const transform = `scale(${1 / fit})`
  if (host.style.transform !== transform) host.style.transform = transform
  const h = host.getBoundingClientRect()
  const r = root.getBoundingClientRect()
  // Story 5.15's PAUSED chip is anchored to a MOUNT inside a section, which the design may draw at no size at all
  // (a phone menu at Desktop): an anchor with no box keeps its chip hidden rather than drawn at its corner of nothing
  if (how === 'bottom-left' && r.width === 0 && r.height === 0) {
    if (el.style.visibility !== 'hidden') el.style.visibility = 'hidden'
    return
  }
  const left = (r.left - h.left) * fit
  const top = (r.top - h.top) * fit
  // Story 5.3's pill (P0-1 :138-147): centred 8px above its words, or below them when their top is within 48px of the
  // canvas viewport's top, where it would be cut off
  // kept inside the canvas viewport (the host has no width of its own), as the toolbar is kept inside the window: words
  // at the canvas's edge would put it half off
  const edge = (root.ownerDocument.documentElement.clientWidth - h.left) * fit
  const centre = Math.max(8, Math.min((r.left + r.width / 2 - h.left) * fit - el.offsetWidth / 2, edge - el.offsetWidth - 8))
  const style =
    how === 'above'
      ? { left: `${centre}px`, top: `${r.top * fit < 48 ? (r.bottom - h.top) * fit + 8 : top - 8 - el.offsetHeight}px` }
      : how === 'fill'
      ? { left: `${left}px`, top: `${top}px`, width: `${r.width * fit}px`, height: `${r.height * fit}px` }
      : how === 'top-left'
        ? { left: `${left}px`, top: `${top}px` }
        // Story 5.15: 8px inside the bottom-left corner — a section's top corners are the tag's and the pill's (R-125)
        : how === 'bottom-left'
          ? { left: `${left + 8}px`, top: `${(r.bottom - h.top) * fit - 8 - el.offsetHeight}px` }
          // B10: 8px inside the top-right corner
          : { left: `${(r.right - h.left) * fit - 8 - el.offsetWidth}px`, top: `${top + 8}px` }
  for (const [key, value] of Object.entries(style)) {
    if (el.style.getPropertyValue(key) !== value) el.style.setProperty(key, value)
  }
  if (el.style.visibility !== 'visible') el.style.visibility = 'visible'
}
