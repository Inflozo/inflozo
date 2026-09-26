// The style-guide review surface's document — Story 4.4's three fixtures, assembled the way a browser
// will meet them on a customer's site (FR-H3(1), research-ghost-koenig-cards.md §6.6):
//
//   1. inside the wrapper the shipped theme uses — `<main><article class="gh-content">` — because
//      `.kg-width-*` and every scoped selector depend on it;
//   2. the THEME stylesheet first, then a SIMULATED `cards.min.css`, in that order (prd.md §7.4:
//      the theme's stylesheet sits before `{{ghost_head}}`, and Ghost injects its card CSS inside it);
//   3. the four vendored card scripts, so the toggle toggles and the gallery proportions.
//
// It is a whole document, served from its own route into an iframe, for the reason AD-21 gives the
// editing canvas: a post body must not inherit the app's Tailwind reset, and Ghost's card CSS must
// not reach the app's chrome.
//
// Not a core package: this module reads files, which AD-1 forbids there. What it reads is
// `packages/library/orbit-weekly/` — the recorded fixtures through the library's accessors, the
// imagery and Ghost's vendored chunks off disk — and the runtime's reference token stylesheet.

import { readdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { orbitWeekly } from '@inflozo/library'
import { CTA_STYLES } from '@inflozo/section-runtime'

/** Resolved from this module's own address, as `pilots.ts` resolves it (Story 4.11's reason, and its Turbopack caveat):
 *  since Story 5.20 the canvas document carries this module's stylesheets too, and the render matrix builds that
 *  document from the repo root, where the working directory is not `apps/web`. */
const PACKAGES = () => join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..', 'packages')
export const ORBIT_WEEKLY_DIR = () => join(PACKAGES(), 'library', 'orbit-weekly')
const VENDOR = () => join(ORBIT_WEEKLY_DIR(), 'vendor', 'cards')

/** The major this surface previews. T1's, because it is the target the card chunks were vendored from. */
export const PREVIEW_MAJOR: orbitWeekly.Major = '6'

/**
 * THE CARDS THE USER HAS DESIGNED — and today there are none: no card treatment exists before A33
 * (Epic 10, FR-Q7), so the exclude list is empty and the simulated bundle is Ghost's whole chunk set,
 * which is the honest state. Nothing here is a list of chunks: the universe is the vendored directory.
 * ponytail: a constant until the first card design lands; A33's placement list replaces it.
 */
export const DESIGNED_CARDS: readonly string[] = []

/** The chunk names Ghost ships, read off the vendored directory — never written down. */
export const chunkUniverse = (kind: 'css' | 'js'): string[] =>
  readdirSync(join(VENDOR(), kind)).filter((f) => f.endsWith(`.${kind}`)).map((f) => f.slice(0, -kind.length - 1)).sort()

/** The simulated `cards.min.css`: exactly the complement of the derived exclude list. */
export function simulatedCardsCss(designed: readonly string[] = DESIGNED_CARDS): { chunks: string[]; css: string } {
  const chunks = orbitWeekly.simulatedChunks(chunkUniverse('css'), designed)
  return { chunks, css: chunks.map((c) => readFileSync(join(VENDOR(), 'css', `${c}.css`), 'utf8')).join('\n') }
}

/** The card behaviour scripts — excluding a card drops its JS with its CSS (FR-Q7), and the canvas
 *  loads them either way so a designed card still behaves (FR-H3(1), step 4). */
export const cardScripts = (): { chunks: string[]; js: string } => {
  const chunks = chunkUniverse('js')
  return { chunks, js: chunks.map((c) => readFileSync(join(VENDOR(), 'js', `${c}.js`), 'utf8')).join('\n') }
}

/** Every `https://orbit-weekly.example/images/<name>.svg` in a recording, pointed at the SVG itself as a
 *  data URI. The recorded bytes carry the reserved origin; this is the one place it is mapped, and
 *  the mapping touches a URL and nothing else. Media and file URLs are left alone — no media is
 *  bundled, so a player renders its chrome and plays nothing. */
export function withImages(html: string): string {
  const origin = orbitWeekly.ORBIT_WEEKLY_ORIGIN.replace(/[.]/g, '\\.')
  const seen = new Map<string, string>()   // a handful of files named dozens of times: read each once
  return html.replace(new RegExp(`${origin}/images/([a-z0-9-]+\\.svg)`, 'g'), (_, name: string) => {
    let uri = seen.get(name)
    if (uri === undefined) {
      uri = `data:image/svg+xml;base64,${readFileSync(join(ORBIT_WEEKLY_DIR(), 'images', name)).toString('base64')}`
      seen.set(name, uri)
    }
    return uri
  })
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/**
 * THE THEME STYLESHEET — a stand-in. No Post Content design exists before A25 is authored (Epic 10), so
 * this is the least a theme must carry for the fixture to be read at all: the Comfortable 720 measure
 * (A25 Spec :105 — C4's 880 is the canvas's number, not the theme's), the wide and full breakouts every
 * theme owns regardless of `card_assets`, and prose type. It consumes the reference tokens and nothing
 * else, as a design's CSS must.
 */
export const THEME_CSS = `
*,*::before,*::after{box-sizing:border-box}
html{background:var(--bg-page);color:var(--text-body);font-family:var(--font-body);-webkit-text-size-adjust:100%}
body{margin:0;font-size:1.0625rem;line-height:1.7}
img,svg,video,iframe{max-width:100%}
a{color:var(--link-color);text-decoration:var(--link-decoration)}
.gh-canvas,.gh-content{display:grid;grid-template-columns:[full-start] minmax(var(--space-gutter),1fr) [wide-start] minmax(0,calc((var(--site-width) - 720px)/2)) [main-start] min(720px,calc(100% - var(--space-gutter)*2)) [main-end] minmax(0,calc((var(--site-width) - 720px)/2)) [wide-end] minmax(var(--space-gutter),1fr) [full-end]}
.gh-canvas>*,.gh-content>*{grid-column:main-start/main-end;margin:0;min-width:0}
.gh-content>*+*{margin-top:1.5em}
.gh-content>.kg-width-wide{grid-column:wide-start/wide-end}
.gh-content>.kg-width-full{grid-column:full-start/full-end}
.gh-content>.kg-width-full img{width:100%}
.kg-content-wide>div{width:100%;max-width:var(--site-width);margin:0 auto;padding:0 var(--space-gutter)}
.kg-image{display:block;margin:0 auto;height:auto}
figcaption{margin-top:.75em;padding:0 var(--space-gutter);text-align:center;font-size:.8125rem;color:var(--text-muted)}
.gh-content h2,.gh-content h3,.gh-head h1{font-family:var(--font-heading);line-height:1.15;letter-spacing:-.02em}
.gh-content>h2{margin-top:2em;font-size:1.75rem}
.gh-content>h3{margin-top:1.75em;font-size:1.3rem}
.gh-content>p:first-child::first-letter{float:left;margin:.08em .12em 0 0;font-family:var(--font-heading);font-size:calc(var(--drop-cap-ratio)*1.7em);line-height:.8}
.gh-content>blockquote:not([class]){margin-left:0;padding:.2em 0 .2em 1.25em;border-left:3px solid var(--accent);font-family:var(--font-heading);font-size:1.3rem;line-height:1.45}
.gh-content ul,.gh-content ol{padding-left:1.4em}
.gh-content li+li{margin-top:.4em}
.gh-content code{font-family:ui-monospace,Menlo,monospace;font-size:.88em;padding:.12em .36em;border-radius:4px;background:var(--plate)}
.gh-content pre{overflow-x:auto;padding:1.1em 1.25em;border-radius:var(--radius-control);background:var(--bg-contrast);color:var(--text-on-contrast);font-size:.85rem;line-height:1.6}
.gh-content pre code{padding:0;background:none;color:inherit}
.gh-content table{width:100%;border-collapse:collapse;font-size:.9rem;display:block;overflow-x:auto}
.gh-content th,.gh-content td{padding:.6em .8em;border-bottom:1px solid var(--border-hairline);text-align:left}
.gh-content hr{border:0;border-top:1px solid var(--border-hairline)}
.kg-embed-card{display:flex;flex-direction:column;align-items:center}
.kg-embed-card iframe{width:100%;height:auto;aspect-ratio:16/9;border:0}
.gh-head{padding-top:3.5rem}
.gh-head>*+*{margin-top:.9rem}
.gh-head h1{font-size:clamp(2rem,5vw,2.75rem)}
.gh-meta,.gh-byline small{font-size:.8125rem;color:var(--text-muted)}
.gh-meta b{color:var(--accent);text-transform:uppercase;letter-spacing:.04em}
.gh-byline{display:flex;gap:.75rem;align-items:center}
.gh-byline img{width:36px;height:36px;border-radius:50%}
.gh-byline span{display:flex;flex-direction:column;line-height:1.3}
.gh-excerpt{font-size:1.15rem;color:var(--text-muted)}
.gh-feature{grid-column:full-start/full-end;margin:2rem 0 2.5rem}
.gh-feature img{display:block;width:100%;max-height:520px;object-fit:cover}
.gh-section{padding:3.5rem 0 1rem}
.gh-section>h2{font-family:var(--font-heading);font-size:1.4rem;margin-bottom:1.25rem}
.inflozo-review{grid-column:main-start/main-end;margin:4.5rem 0 1.5rem;padding-top:1rem;border-top:2px solid var(--text-body);font:600 .75rem/1.4 ui-monospace,Menlo,monospace;letter-spacing:.04em;text-transform:uppercase;color:var(--text-muted)}
.inflozo-variant{grid-column:wide-start/wide-end;margin-top:3rem!important;padding-top:.6rem;border-top:1px dashed var(--border-hairline);font:500 .75rem/1.4 ui-monospace,Menlo,monospace;color:var(--text-muted)}
.inflozo-variant+*{margin-top:1rem}
`

/**
 * STORY 5.20 — THE PAYWALL CANVAS'S STYLESHEET: a post body as a customer's site meets it, in `{{ghost_head}}`'s order —
 * the theme stand-in above, the simulated `cards.min.css`, then Ghost's own CTA stylesheet (`tpl/styles.js`, recorded on
 * both majors as MEASUREMENTS §54 and held equal by `contract.test.ts`), which is what draws Ghost's own box. The canvas
 * document carries it DISABLED and the Paywall canvas's paint enables it, so no other canvas is touched (`pilots.ts`).
 */
export const surfaceCss = (): string => `${THEME_CSS}\n${simulatedCardsCss().css}\n${CTA_STYLES}`

function head(title: string): string {
  const tokens = readFileSync(join(PACKAGES(), 'section-runtime', 'reference-tokens.css'), 'utf8')
  const cards = simulatedCardsCss()
  const accent = orbitWeekly.site().accent_color
  return `<!doctype html><html lang="en" data-mode="light"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>${esc(title)}</title>` +
    `<style data-order="1-tokens">${tokens}</style>` +
    `<style data-order="2-theme">${THEME_CSS}</style>` +
    // {{ghost_head}}'s order (research §2.4): cards.min.css, then Ghost's accent custom property
    `<style data-order="3-cards.min.css" data-chunks="${cards.chunks.join(' ')}">${cards.css}</style>` +
    `<style data-order="4-ghost-accent">:root{--ghost-accent-color:${accent}}</style></head>`
}

function scripts(nonce: string): string {
  const { chunks, js } = cardScripts()
  // Portal un-hides every `[data-lexical-signup-form]` on load when members are enabled — the signup
  // card renders `display: none` and waits for it (read in portal.min.js, 2026-09-13). The canvas has
  // no Portal, so it does the one thing Portal does to the body, and nothing else.
  const portal = `document.querySelectorAll('[data-lexical-signup-form]').forEach(function(e){e.style.display=''});`
  // the iframe is sized to its document, so the review page scrolls once rather than twice
  const fit = `(function(){var f=window.frameElement;if(!f)return;var s=function(){f.style.height=document.documentElement.scrollHeight+'px'};new ResizeObserver(s).observe(document.body);addEventListener('load',s);s()})();`
  const open = `document.querySelectorAll('[data-open-toggle] + .kg-toggle-card').forEach(function(e){e.setAttribute('data-kg-toggle-state','open')});`
  return `<script nonce="${esc(nonce)}">${portal}${open}</script>` +
    `<script nonce="${esc(nonce)}" data-chunks="${chunks.join(' ')}">${js}</script>` +
    `<script nonce="${esc(nonce)}">${fit}</script>`
}

function postHead(p: orbitWeekly.PostRow, withTitle = true): string {
  if (!withTitle) return ''
  const a = p.primary_author
  const date = String(p.published_at).slice(0, 10)
  // "Issue 118" is C4's own header line (`C Post Body.dc.html:1710`), drawn here because the frame
  // draws it; no design binds to an issue number, so it is not a dataset field.
  return `<header class="gh-canvas gh-head">` +
    `<div class="gh-meta"><b>${esc(p.primary_tag?.name ?? '')}</b> · Issue 118 · <time datetime="${date}">${date}</time></div>` +
    `<h1>${esc(p.title)}</h1><p class="gh-excerpt">${esc(String(p['custom_excerpt'] ?? ''))}</p>` +
    `<div class="gh-byline">${a?.profile_image ? `<img src="${a.profile_image}" alt="">` : ''}<span><strong>${esc(a?.name ?? '')}</strong><small>${p['reading_time']} min read · ${p.visibility === 'public' ? 'Public' : 'Members'}</small></span></div>` +
    `<figure class="gh-feature"><img src="${p['feature_image']}" alt="${esc(String(p['feature_image_alt'] ?? ''))}">` +
    `${p['feature_image_caption'] ? `<figcaption>${esc(String(p['feature_image_caption']))}</figcaption>` : ''}</figure></header>`
}

/** The article view: fixture 1 on its post, fixture 2 in both states, fixture 3 in both of the
 *  `show_title_and_feature_image` states. */
export function articleDocument(nonce: string): string {
  const major = PREVIEW_MAJOR
  const post = orbitWeekly.subject('post')
  const page = orbitWeekly.subject('page')
  const count = orbitWeekly.commentCount()
  const body =
    `<main>` +
    postHead(post) +
    `<article class="gh-content">${orbitWeekly.styleGuideBody(major)}</article>` +
    `<div class="gh-canvas"><p class="inflozo-review">Fixture 2 · {{comments}} · signed in</p></div>` +
    `<section class="gh-canvas gh-section"><h2>${count} comments</h2>${orbitWeekly.commentsFixture('member')}</section>` +
    `<div class="gh-canvas"><p class="inflozo-review">Fixture 2 · {{comments}} · signed out</p></div>` +
    `<section class="gh-canvas gh-section"><h2>${count} comments</h2>${orbitWeekly.commentsFixture('signedout')}</section>` +
    `<div class="gh-canvas"><p class="inflozo-review">Fixture 3 · page.hbs · @page.show_title_and_feature_image on</p></div>` +
    postHead(page, page['show_title_and_feature_image'] === true) +
    `<article class="gh-content">${orbitWeekly.styleGuidePageBody(major)}</article>` +
    `<div class="gh-canvas"><p class="inflozo-review">Fixture 3 · page.hbs · @page.show_title_and_feature_image off</p></div>` +
    `<article class="gh-content">${orbitWeekly.styleGuidePageBody(major)}</article>` +
    `</main>`
  return `${head('Style-guide fixture')}<body>${withImages(body)}${scripts(nonce)}</body></html>`
}

/** The variation sheet: every variant, labelled, from the same recording run as the article. */
export function variationsDocument(nonce: string): string {
  const labels = new Map(orbitWeekly.variants().map((v) => [v.id, v.label]))
  const parts = orbitWeekly.blocks(PREVIEW_MAJOR, 'variations').flatMap((b) => {
    const label = `<p class="inflozo-variant" data-variant="${esc(String(b.id))}">${esc(labels.get(String(b.id)) ?? '')}</p>`
    // the renderer has one toggle state; the open one is what toggle.js sets on a click, shown here
    // on the SAME recorded bytes rather than on anything written by hand
    const opened = b.id === 'toggle'
      ? `<p class="inflozo-variant" data-variant="toggle-open" data-open-toggle>toggle · open, as toggle.js leaves it after a click (the same recording)</p>${b.html}`
      : ''
    return [label, b.html, opened]
  })
  return `${head('Variation sheet')}<body><main><article class="gh-content">${withImages(parts.join(''))}</article></main>${scripts(nonce)}</body></html>`
}
