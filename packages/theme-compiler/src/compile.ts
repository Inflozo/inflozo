// THEME ASSEMBLY — Story 7.1 (FR-J1, AD-14, §7.4): a project's template docs in, a Ghost theme's files out.
//
// PURE (AD-1, AD-14): the library, the pack, the asset map and the strings are HANDED in, the DOM is a parameter, and the
// answer is a path → text record in code-unit path order. The same input gives the same bytes whatever the key order or
// the order the templates arrive in.
//
// THE PIPELINE'S ORDER IS BINDING (spine § The compile pipeline): every visible section renders through the theme emitter
// (`renderTheme`) — which walks it as annotated HTML, parks expressions as tokens and block helpers as comment markers,
// serializes it to the formatting contract (`format.ts`) and unwraps the markers inside `Tokens.resolve`'s reverse loop —
// with ONE `UserText` shared across the whole compile; then the sections are partitioned into partials; then user text is
// substituted ONCE, LAST, over every file. Hoisting compares sections AFTER substitution by substituting a copy
// (`UserText.substitute` is pure), so the tree itself is substituted exactly once. Handlebars is never parsed, evaluated or
// printed here (FR-J1): this file writes a handful of literal lines around opaque text.
//
// Story 7.2 (FR-J2, DW-335) adds `package.json`, built from what the compile is handed and refused first wherever Ghost's
// checker would refuse it, and checks every `size=` the emitted templates pass against `IMAGE_SIZES`.
//
// Story 7.3 (FR-I1, FR-H2, AD-22, AD-27(d)) makes it compile EVERY standard template, not only the docs it is handed: each
// file's stack is the stored doc passed through `designate`, else `synthesize`'s or `pageTwoStack`'s — the editor's own
// functions, never a table of this file's — and each file is emitted by its class's rule (`stacksOf`). An archive's page 2
// compiles inside `{{#is "paged"}}`, a Post Header on `page.hbs` inside Ghost's page switch, `default.hbs` gains
// `<main id="site-main">` and FR-H2's `noindex` guard, and a designed paywall becomes `partials/content-cta.hbs`.
//
// Story 7.4 (FR-J3, AD-14, AD-18, AD-30) makes the theme carry what it draws with: the pairing's pool woff2 files in
// `assets/fonts/` (bytes, read by the shell), preloaded and faced in `default.hbs`'s head through ONE `{{asset}}` address
// each; each shipped family's licence and Tabler's at the root; and `screen.css` as the token block (AD-18's two Ghost
// font variables, then each section's dark override, none on a Light-only project), the canvas's base, and each placed
// design's sheet cut by `stripCss` to what its placed roots reach. It returns AD-14's reachability record beside the files.
//
// Story 7.5 (FR-J4, FR-G7) makes it carry its scripts, two files of two origins: `assets/js/main.js`, `bundle` of every
// module a placed, visible design declares that has a file (a declared module with no file yet ships at rest, its mount in
// its no-JS state), and — when a designed card has a script of Ghost's — `assets/js/cards.js`, `cardsJs` of those cards,
// with Ghost's licence beside it; `README.md`'s Scripts section; and the two `defer` tags in `default.hbs`'s head. The
// module files and Ghost's card scripts arrive as values the shell read, and `checkThemeJs` and `checkThemeScripts` judge
// the final text as CI and the stress fixture do.
//
// Story 7.6 (FR-J5, AD-38, V1) makes the markup Ghost's: every template whose matrix row opens `{{#post}}` (`post.hbs`,
// `page.hbs`, `custom-{name}.hbs`) wraps its sections in ONE `<article>`, `POST_ARTICLE`, carrying Ghost's `{{post_class}}`
// and the `post-access-*` class Ghost's Casper writes for a visitor without access — no class of Inflozo's (AD-3), and
// none on a design's own element (Question 1, ruled option 1, owner, 2026-10-08). Every `srcset` asks Ghost for WebP
// (`srcsetExpr`, the runtime's one spelling). Two checks join the final ones: `checkGhostMarkup` over the final text —
// Ghost's head, foot and body class in place, `{{post_class}}` only in the article, every `srcset` the theme's own on a
// tag with `sizes`, every `data-portal` a page Portal opens (`PORTAL_PAGE`), no member's own data printed — and
// `checkChromeText` over the tree before user text is substituted, V1: no label typed into a template outside `{{t}}`.

import {
  bundle, byCategory, CARDS_JS_TAG, cardsJs, cardsVersion, categoryOf, checkThemeJs, checkThemeScripts, COMPILE_TARGETS, compilesTo,
  CUSTOM_TARGET_RE, HBS_COMMENT, IMAGE_SIZES, isCompileTarget, isSiteFooter, MAIN_JS_TAG, moduleUnion, PAGINATED_TARGETS, PAYWALL_TARGET,
  PORTAL_PAGE, POST_HEADER, rootClassOf, stripCssComments, targetContext, templateKeyOfFile,
} from '@inflozo/library'
import type { IconLookup, ModuleSources, SectionRegistryEntry } from '@inflozo/library'
import { iconDrawing, TABLER_LICENSE } from '@inflozo/library/icons'
import { faceOf, pairingFaces, pairingFonts, pairingOf, POOL } from '@inflozo/library/packs'
import {
  BASE_CSS, checkChromeLiterals, darkHook, darkOverrideCss, designate, feedQuery, gscanInert, isDesigned, packTokensCss, pageTwoStack, renderTheme,
  resolveControls, sectionKey, srcsetExpr, synthesize, U0, U1, UserText, visibleFeed,
} from '@inflozo/section-runtime'
import type { DocInstance, Pack, PlacedSection, ProjectDoc, RuntimeDocument } from '@inflozo/section-runtime'
import { fontFaceCss } from '@inflozo/section-runtime/fonts'
import { claim, sectionSlug } from './slug.ts'
import { stripCss } from './strip.ts'

export type CompileInput = {
  /** every STORED template doc, by its file — `default.hbs` is the site doc and `partials/content-cta.hbs` the paywall's
   *  (Story 7.18 maps keys with `fileOfKey`). An untouched template has no doc (AD-22) and is synthesized here. Never
   *  `index.hbs`: Home's page 2 is `pageTwo['home.hbs']`. */
  templates: Readonly<Record<string, ProjectDoc>>
  /** page 2's own docs (R-178, R-179), keyed by their PAGE-1 file: `home.hbs` (stored as `index`), `tag.hbs`
   *  (`tag-paged`) and `author.hbs` (`author-paged`) — `pageTwoStack(file, pageOne, pageTwo, library)`'s shape. Story
   *  7.18 maps the keys with `canvasOfPageTwoKey`. */
  pageTwo?: Readonly<Record<string, ProjectDoc>>
  /** the `custom-{name}.hbs` files a route names (Story 7.16): FR-I1's class that keeps shipping when emptied */
  routed?: readonly string[]
  /** the library, handed in (AD-14) — the same entries the editor reads */
  library: (designId: string) => SectionRegistryEntry | undefined
  /** the pack in force, an own pack already resolved */
  pack: Pack
  /** asset id → URL; Story 7.4 points these at bundled files */
  assets: Readonly<Record<string, string>>
  /** `resolveStrings`' output; the catalog's English when omitted */
  strings?: Readonly<Record<string, string>>
  /** `projects.posts_per_page` — `package.json`'s `config.posts_per_page`, and a secondary feed's query is sized by it */
  postsPerPage: number
  /** `package.json`'s identity (Story 7.2): `name` and `version` are Story 7.24's frozen `inflozo-{slug}` and per-deploy
   *  increment, `description` is `projects.name` */
  theme: { name: string; version: string; description: string }
  /** the designed cards — the keys of `project_treatments.card_designs` (Story 7.13); none until then */
  designedCards?: readonly string[]
  /** the pack's pairing (`D1` …, Appendix D §D.c) — `pack.fonts` must be its `pairingFonts` (Story 7.4) */
  pairing: string
  /** a font-pool file's bytes, by its path under `packages/library/fonts/` (`files/<file>`, a family's `licenceFile`),
   *  read by the shell (AD-1): the core reads no file */
  fonts: (path: string) => Uint8Array
  /** `projects.dark_enabled`: false is Light-only — no section hook and no per-section dark rule (AD-30) */
  darkEnabled: boolean
  /** every file of `packages/library/modules/` by module name (`core`, `lightbox`), read by the shell (AD-1) — `main.js`
   *  carries `core` and each declared module found here (Story 7.5) */
  modules: ModuleSources
  /** Ghost's card scripts as `tools/probe/record-cards.py` vendored them, by card name (`audio`, `gallery`, `toggle`,
   *  `video`), and Ghost's licence — `packages/library/orbit-weekly/vendor/`, read by the shell (Story 7.5) */
  ghostCards: { scripts: Readonly<Record<string, string>>; licence: string }
}

/** NFR-2's per-template CSS budget, gzipped at level 9 — the one figure, read by CI's `cssFailures` (tools/pilot-theme.mjs)
 *  and by whatever Story 7.33 and 7.29 measure. */
export const CSS_BUDGET_BYTES = 50 * 1024

/** AD-14's reachability record (Story 7.4): what `screen.css` is made of, and which designs each template reaches —
 *  the CSS budget's one fact. The `@font-face` rules inlined in `default.hbs`'s head are not in it: they are the
 *  pairing's constant, the same on every page, and no placed root reaches or misses them. */
export type CssRecord = {
  /** the Tokens and Base sections, exactly as `screen.css` opens */
  global: string
  /** each placed design's emitted chunk, header comment included, by design id, in design order */
  sheets: Readonly<Record<string, string>>
  /** every emitted root-level template but `default.hbs` → the design ids its page can draw, in design order: the site
   *  doc's, the file's own (both pages) and, on `post.hbs`, `page.hbs` and each `custom-*.hbs`, the paywall's (Ghost
   *  renders it inside `{{content}}`) */
  reach: Readonly<Record<string, readonly string[]>>
}

/** A compiled theme: its files — text, and a font's bytes — in code-unit path order, and AD-14's record. */
/** The scripts' record (Story 7.5's review, 2026-10-08): `bundled` is what `main.js` carries after `core`, and `atRest` each
 *  mounted module with no file yet, whose mounts ship in their no-JS state — both in registry order. CI's warning reads
 *  it rather than re-deriving it, and a deploy surface can say which sections rest. */
export type JsRecord = { bundled: readonly string[]; atRest: readonly string[] }
export type CompiledTheme = { files: Readonly<Record<string, string | Uint8Array>>; css: CssRecord; js: JsRecord }

/** The site doc's file. */
const SITE_DOC = 'default.hbs'

/** One visible section, rendered — on page 1 of its file, or on page 2 of an archive whose page 2 is designed — with its
 *  dark hook when an override of it is in force (Story 7.4). */
type Placed = { file: string; page: 1 | 2; instance: DocInstance; entry: SectionRegistryEntry; template: string; partials: Record<string, string>; key: string; hook?: string }

const byCode = (a: string, b: string): number => (a < b ? -1 : a > b ? 1 : 0)

/** Home: the one page 1 whose page 2 is another FILE, `index.hbs`. */
const HOME = 'home.hbs'
const INDEX = 'index.hbs'
/** The page-1 files a page 2 belongs to: the paginated targets but Home's page 2 itself. */
const PAGE_ONES: readonly string[] = [...PAGINATED_TARGETS].filter((f) => f !== INDEX).sort(byCode)
/** FR-H2's SEO guard names Ghost's own context for each page 2, in this fixed order (`context.js`: `/page/2/` is
 *  `['paged','index']`, `/tag/x/page/2/` is `['paged','tag']`). The guard writes them as ONE comma list, which `helpers/is.js`
 *  splits on `,` and reads as OR (its header: `{{#is "index, paged"}}`; read in source, both majors). Ceiling: `index` is
 *  the main collection's name only while it sits at `/` (`collection-router.js`: `routerName = mainRoute === '/' ? 'index'
 *  : …`) — a Routes Manager project whose main collection moves gets a context of the route's own, which is DW-344's,
 *  Story 7.16's. T1 rendered the single-context form alone (§72: `author`); the comma form is read, not executed. */
const PAGED_CONTEXTS: readonly (readonly [context: string, pageOne: string])[] = [['index', HOME], ['tag', 'tag.hbs'], ['author', 'author.hbs']]
/** The files every theme carries. Ghost refuses a theme without `index.hbs` or `post.hbs` (`GS020-INDEX-REQ`,
 *  `GS020-POST-REQ`, fatal); the archives always ship their default stack. */
const ALWAYS = ['post.hbs', 'tag.hbs', 'author.hbs']
/** Emitted when designed, or when synthesis gives them a section — never empty (Question 1, ruled option 1, owner,
 *  2026-10-06): an untouched one the library leaves with no section is left to Ghost's own fallback until Epic 10. */
const WHEN_FILLED = ['page.hbs', 'error.hbs']
/** Ghost's page switch (`@page`, FR-I1): the one `@page` property a theme may read — gscan 4.49.7 refuses any other
 *  as fatal (GS110-NO-UNKNOWN-PAGE-BUILDER-USAGE: `level: 'error', fatal: true` in its `specs/v5.js`; its MISSING
 *  sibling is an error there but not fatal — MEASUREMENTS §13a's dated note). */
const PAGE_SWITCH = '@page.show_title_and_feature_image'


/** A label part, made safe for a Handlebars comment (AD-36): braces and C0 controls dropped, whitespace collapsed, trimmed.
 *  With no brace left, nothing inside can end `{{!--` early — the lexer ends it at the first `--}}` or `--~}}`. Story 7.7:
 *  gscan's brace-free rules read comments too, so `gscanInert` writes their trigger words inert — the entity stays as
 *  written, since nothing renders a comment. */
const commentPart = (s: string): string => gscanInert(s.replace(/[{}\u0000-\u001f]/g, '').replace(/\s+/g, ' ').trim())

/** A stylesheet header part: `*\/` and C0 controls dropped, whitespace collapsed. `*\/` is dropped until none is left,
 *  because one pass over `**\/\/` leaves a `*\/` behind. */
const cssPart = (s: string): string => {
  let out = s.replace(/[\u0000-\u001f]/g, '')
  for (let next = out.replace(/\*\//g, ''); next !== out; next = out.replace(/\*\//g, '')) out = next
  return out.replace(/\s+/g, ' ').trim()
}

/** AD-36, every new sink: the compile's other inputs — the strings, the asset URLs and the pack's CSS — may carry no C0
 *  character, since the formatter's `KEEP_NL` and the runtime's tokens are C0 characters and `Tokens.resolve` would
 *  turn one into a line break or an expression. A design file is held to the same rule by `control-character`. */
const C0 = /[\u0000-\u0009\u000b\u000c\u000e-\u001f]/   // a tab included (Question 2): the theme carries none
const noC0 = (what: string, values: Iterable<string>): void => {
  for (const v of values) if (C0.test(v)) throw new Error(`${what} carries a control character, which the theme compiler refuses (AD-36): ${JSON.stringify(v.slice(0, 40))}`)
}

// ── package.json (Story 7.2, FR-J2) ──────────────────────────────────────────────────────────────────────────────────

/** FR-J13's marker (DW-335): `"inflozo": true`, top level, written last — what Story 7.20 gates restore scope on. It survives
 *  a renamed package, sits outside Ghost's `config` namespace, and carries no id, hash or date. */
export const THEME_MARKER = 'inflozo'
/** The three named marks `package.json` may carry — FR-J10's `name`, the ruled `author` and the marker — and the only bytes
 *  the fingerprint scan exempts. One list, so a fourth mark cannot land in one scanner and miss another. */
export const THEME_MARKS: readonly string[] = ['name', 'author', THEME_MARKER]

/** Question 3, ruled option 1 (owner, 2026-10-06): Inflozo writes and maintains the theme's code. */
const AUTHOR = { name: 'Inflozo', email: 'hello@inflozo.com' }

/** gscan's own name rule (GS010-PJ-NAME-LC, -NAME-HY, both errors). */
const THEME_NAME_RE = /^([a-z0-9]+-)*[a-z0-9]+$/
/** MAJOR.MINOR.PATCH in plain digits — a strict subset of what gscan's `semver.valid` accepts (GS010-PJ-VERSION-SEM). */
const VERSION_RE = /^(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)$/
/** Every card Ghost 5.130.6 and 6.58.0 ship is named within it, and Ghost 5 splices the names into a file glob
 *  (`css/!(a|b).css`), where `|`, `(`, `)` and `*` are syntax (AD-36, every new sink). */
const CARD_RE = /^[a-z0-9_]+$/

const shown = (v: unknown): string => (typeof v === 'string' ? JSON.stringify(v) : String(v))

/** `config.posts_per_page`: an integer, never a string — `"12"` is GS010-PJ-CONF-PPP-INT, an error. FR-H2's 1–100 clamp is a
 *  secondary feed's alone (`feedBase`), so the main feed's page size is not clamped. */
function pageSize(v: unknown): number {
  // a number, or a JavaScript caller's digit string — never `true` (which `Number` reads as 1) or an array
  const n = typeof v === 'number' || typeof v === 'string' ? Math.trunc(Number(v)) : NaN
  if (!Number.isFinite(n) || n < 1) throw new Error(`package.json: posts_per_page ${shown(v)} is no page size — it must be a whole number of at least 1 (GS010-PJ-CONF-PPP-INT).`)
  return n
}

/** FR-J2's file: the refusals first, then the keys in Casper's and Source's order (a conditional key is omitted, never
 *  moved), then the marker. The user's words reach it through `JSON.stringify` alone (AD-36). `config.custom` is not
 *  written here: Question 1, ruled option 1 — Stories 7.10 and 7.11 add it, each with the template lines that read it. */
function packageJson(input: CompileInput, perPage: number): string {
  const { name, version, description } = input.theme
  if (!THEME_NAME_RE.test(name)) throw new Error(`package.json: the theme name ${shown(name)} must match ${THEME_NAME_RE.source} (GS010-PJ-NAME-LC, GS010-PJ-NAME-HY).`)
  if (!VERSION_RE.test(version)) throw new Error(`package.json: the theme version ${shown(version)} must be MAJOR.MINOR.PATCH in plain digits (GS010-PJ-VERSION-SEM).`)
  for (const card of input.designedCards ?? []) {
    if (!CARD_RE.test(card)) throw new Error(`package.json: the designed card ${shown(card)} is no Ghost card name — card names use only the characters ${CARD_RE.source.slice(1, -2)}, because Ghost 5 splices them into a file glob (AD-36).`)
  }
  const cards = [...new Set(input.designedCards ?? [])].sort(byCode)
  return `${JSON.stringify({
    name,
    description,
    version,
    engines: { ghost: '>=5.0.0' },   // NFR-7's floor, stated; never `ghost-api` (FR-J1)
    author: AUTHOR,
    keywords: ['ghost-theme'],
    config: {
      posts_per_page: perPage,
      image_sizes: Object.fromEntries(Object.entries(IMAGE_SIZES).map(([key, width]) => [key, { width }])),
      // Question 2, ruled option 1: Ghost 5 reads an empty `exclude` as no card at all (`css/!().css` matches nothing)
      card_assets: cards.length === 0 ? true : { exclude: cards },
    },
    [THEME_MARKER]: true,
  }, null, 2)}\n`
}

/** A mustache, and a `size=` hash argument inside one. Only mustaches are read: a design's `data-headline-size="large"`
 *  and a customer's typed `size="huge"` are HTML, never an argument (user braces ship as entities). The value must be
 *  double-quoted, as the spec writes it (`size="m"`). Ceiling: a mustache ends at the first `}}`, so a `}}` inside a quoted
 *  hash string would hide what follows it — no design writes one, and `HELPERS.img_url` refuses the size at render anyway. */
const MUSTACHE = /\{\{[^]*?\}\}/g
const SIZE_ARG = /(?<![\w-])size=("([^"]*)"|[^\s}]*)/g

/** Every template's mustaches, comments never read: `[path, mustache]`. */
const mustaches = (files: Readonly<Record<string, string>>): [string, string][] =>
  Object.entries(files).filter(([path]) => path.endsWith('.hbs')).flatMap(([path, body]) => [...body.replace(HBS_COMMENT, '').matchAll(MUSTACHE)].map((m): [string, string] => [path, m[0]]))

/** FR-J2: every `size=` an emitted template passes is an `image_sizes` key — with any other, Ghost silently serves the
 *  original picture. `HELPERS.img_url` refuses one at render; this is the backstop over the final text. */
export function checkSizes(files: Readonly<Record<string, string>>): void {
  for (const [path, mustache] of mustaches(files)) {
    for (const m of mustache.matchAll(SIZE_ARG)) {
      if (m[2] === undefined || !Object.hasOwn(IMAGE_SIZES, m[2])) {
        throw new Error(`${path}: ${m[0]} is no image size — a size must be one of package.json's image_sizes keys, in double quotes: ${Object.keys(IMAGE_SIZES).join(', ')}.`)
      }
    }
  }
}

/** `@page` and anything after it but the page switch itself: a bare `@page`, another property, or a path below the switch
 *  — what gscan's `lint-no-unknown-page-properties` refuses. */
const OTHER_PAGE_DATA = /@page\b(?!\.show_title_and_feature_image(?![\w.[\/]))/

/** Story 7.3 (FR-I1): no emitted template reads any `@page` property but the page switch — gscan 4.49.7 refuses one as
 *  fatal (GS110-NO-UNKNOWN-PAGE-BUILDER-USAGE). Mustaches only, as `checkSizes` reads them. */
export function checkPageData(files: Readonly<Record<string, string>>): void {
  for (const [path, mustache] of mustaches(files)) {
    if (OTHER_PAGE_DATA.test(mustache)) throw new Error(`${path}: ${mustache} reads @page beyond ${PAGE_SWITCH}, the one @page property a Ghost theme may read (GS110-NO-UNKNOWN-PAGE-BUILDER-USAGE, fatal on gscan 4.49.7).`)
  }
}

/** Story 7.3: Ghost uses the theme's `partials/content-cta.hbs` only when gscan's `partials` list is non-empty — the
 *  partials invoked from a file OUTSIDE `partials/` (`checks/005-template-compile.js`, `theme-engine/active.js`, read in
 *  both majors). An explicit `{{> "content-cta"}}` would print the paywall twice, so none is written; this asserts the
 *  list cannot be empty instead. */
export function checkPaywallReached(files: Readonly<Record<string, string>>): void {
  if (!(PAYWALL_TARGET in files)) return
  if (mustaches(files).some(([path, m]) => !path.startsWith('partials/') && /^\{\{~?>/.test(m))) return
  throw new Error(`${PAYWALL_TARGET}: no template outside partials/ invokes a partial, so Ghost would never register the theme's partials and would show its own paywall instead of this one.`)
}

/** AD-5: one triple-stash, `{{{body}}}` in `default.hbs` — and its second exception, `{{{html}}}` as the paywall
 *  partial's first line and nowhere else (Question 2, ruled option 1, owner, 2026-10-06), checked on every compile.
 *  Opens and closes are counted apart, so a `}}}` abutting a mustache (AD-5's rule 2) is refused here too; this is the
 *  ONE spelling of the rule — `tools/pilot-theme.mjs`'s `themeFailures` calls it rather than counting again. */
export function checkTripleStashes(files: Readonly<Record<string, string>>): void {
  for (const [path, body] of Object.entries(files)) {
    if (!path.endsWith('.hbs')) continue
    const found = Math.max(body.match(/\{\{~?\{/g)?.length ?? 0, body.match(/\}~?\}\}/g)?.length ?? 0)
    const allowed = path === SITE_DOC ? body.includes('{{{body}}}') : path === PAYWALL_TARGET && body.startsWith('{{{html}}}\n')
    if (found > (allowed ? 1 : 0)) throw new Error(`${path}: a triple-stash AD-5 does not allow — a theme carries {{{body}}} in default.hbs and {{{html}}} as ${PAYWALL_TARGET}'s first line, and no other.`)
  }
}

// ── Ghost's markup (Story 7.6, FR-J5, AD-38, V1) ─────────────────────────────────────────────────────────────────────

/** The article every template whose matrix row opens `{{#post}}` wraps its sections in — the block's first line, with
 *  `</article>` its last. Inside `{{#post}}` `this` is the post, so Ghost's `{{post_class}}` prints `post`, `tag-<slug>`
 *  per tag, `featured` and `no-image` where each applies (`helpers/post_class.js`, identical in 5.0.0, 5.130.6 and
 *  6.58.0; its `page` branch reads `this.page`, which no post or page carries since Ghost 3's `type` — executed on T1
 *  6.58.0 at Story 7.6's review: a page's article is `post`, never `page`), and `access` is false only for a visitor who may not read it (`post-gating.js`), who also gets Casper's
 *  `post-access-{visibility}`. Ghost's classes only (AD-3): the canvas draws no article, and no design selects on it.
 *  The ONE spelling — the compile, `checkGhostMarkup`, the tests and the recorder all read it. */
export const POST_ARTICLE = '<article class="{{post_class}}{{#unless access}} post-access-{{visibility}}{{/unless}}">'

/** A template's text with its Handlebars comments taken out — Ghost never prints one, and a layer name lands in one. */
const uncommented = (files: Readonly<Record<string, string>>): [string, string][] =>
  Object.entries(files).filter(([path]) => path.endsWith('.hbs')).map(([path, body]) => [path, body.replace(HBS_COMMENT, '')])

/** A mustache naming the helper or path `name` first, as `{{name}}` or `{{~ name …}}`. */
const names = (mustache: string, name: string): boolean => new RegExp(String.raw`^\{\{~?\s*${name}\b`).test(mustache)

/** The raw-text bodies of `<style>` and `<script>`, emptied — CSS and JavaScript are not markup. */
const RAW_TEXT = /(<(style|script)\b[^>]*>)[^]*?(<\/\2\s*>)/gi

/** Every start tag in a template's text: its name and its attributes, lower-cased, each value as written ('' for a bare
 *  one). Each mustache is parked first, so a quote inside one (`size="xs"`) cannot end an attribute; a mustache standing
 *  where an attribute name would (`{{#if x}}sizes="…"{{/if}}`) is taken out of the name. A customer's own words never
 *  form a start tag: their `<` ships as `&lt;` (AD-4, AD-5). */
function startTags(text: string): { name: string; attrs: Map<string, string> }[] {
  const parked: string[] = []
  const park = text.replace(RAW_TEXT, '$1$3').replace(MUSTACHE, (m) => `\u0001${parked.push(m) - 1}\u0002`)
  const unpark = (v: string): string => v.replace(/\u0001(\d+)\u0002/g, (_, i: string) => parked[Number(i)] as string)
  const out: { name: string; attrs: Map<string, string> }[] = []
  for (const tag of park.matchAll(/<([A-Za-z][A-Za-z0-9-]*)((?:\s+[^\s"'>/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'=<>`]+))?)*)\s*\/?>/g)) {
    const attrs = new Map<string, string>()
    for (const a of (tag[2] ?? '').matchAll(/([^\s"'>/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g)) {
      const name = (a[1] as string).replace(/\u0001\d+\u0002/g, '').toLowerCase()
      if (name !== '') attrs.set(name, unpark(a[2] ?? a[3] ?? a[4] ?? ''))
    }
    out.push({ name: (tag[1] as string).toLowerCase(), attrs })
  }
  return out
}

/** The index of the nearest line from `from`, stepping by `step`, that holds more than whitespace; -1 when none does. */
const nonBlank = (lines: readonly string[], from: number, step: 1 | -1): number => {
  for (let i = from; i >= 0 && i < lines.length; i += step) if ((lines[i] as string).trim() !== '') return i
  return -1
}

/**
 * Story 7.6 — FR-J5 and AD-38 over a theme's FINAL text (the customer's words substituted), `.hbs` files only, Handlebars
 * comments out first. Each sentence names its file; `[]` when the markup is Ghost's:
 *   1. `{{ghost_head}}` and `{{ghost_foot}}` each appear once in the theme, in `default.hbs` — never in another file — the
 *      head's as the last line before `</head>`, so Ghost's own styles and the site's code injection come after the
 *      theme's stylesheet (AD-18), and the foot's as the last line before `</body>`;
 *   2. `{{body_class}}` appears once, in `default.hbs`, opening `<body>`'s `class` (a later story may add classes after it);
 *   3. `{{post_class}}` appears only in `POST_ARTICLE`, which is the first line inside every `{{#post}}`, whose last line
 *      is `</article>`;
 *   4. every `srcset` is `srcsetExpr` of the path its first candidate names, on a tag that carries `sizes` — without one
 *      the browser assumes the full viewport and fetches the largest file (NFR-2 (1));
 *   5. every `data-portal` names a page both majors' Portal opens (`PORTAL_PAGE`), each mustache in it read as an id;
 *   6. a mustache that names `@member` is a block helper's condition (`{{#…}}`, `{{^…}}`, `{{else …}}`) and never a
 *      value or a hash argument — a hash STRING holding one (`filter="author:{{@member.id}}"`, AD-36's vector) included
 *      (AD-38: Ghost caches a member page publicly by tier, MEASUREMENTS §31b). Ceiling: a block that changes context
 *      over a `@member` value (`{{#with}}`, `{{#foreach}}`) prints its fields without naming `@member` again — the
 *      runtime refuses every `@member` binding first (`contexts.ts`), so no design writes one.
 * Rules 1 and 2's line rules read `default.hbs` when it is among the files; their counts read every file, so a design's
 * own text (CI's every-design row) carries none of the three.
 */
export function checkGhostMarkup(files: Readonly<Record<string, string>>): string[] {
  const out: string[] = []
  const hbs = uncommented(files)
  // ── 1 and 2: Ghost's head, foot and body class — default.hbs's, once each, nowhere else ──
  for (const name of ['ghost_head', 'ghost_foot', 'body_class']) {
    for (const [path, body] of hbs) {
      const found = [...body.matchAll(MUSTACHE)].filter((m) => names(m[0], name)).length
      const want = path === SITE_DOC ? 1 : 0
      if (found !== want) out.push(`${path}: {{${name}}} appears ${found} time${found === 1 ? '' : 's'} — a theme carries it once, in ${SITE_DOC}, and in no other file.`)
    }
  }
  const site = hbs.find(([path]) => path === SITE_DOC)?.[1]
  if (site !== undefined) {
    const lines = site.split('\n')
    for (const [helper, close, why] of [
      ['{{ghost_head}}', '</head>', "so Ghost's own styles and the site's code injection come after the theme's stylesheet (AD-18)"],
      ['{{ghost_foot}}', '</body>', "so Ghost's scripts and the site's footer injection come last"],
    ] as const) {
      const at = lines.findIndex((l) => l.trim() === close)
      const last = at === -1 ? -1 : nonBlank(lines, at - 1, -1)
      if (last === -1 || (lines[last] as string).trim() !== helper) out.push(`${SITE_DOC}: ${helper} is not the last line before ${close} — it belongs there, ${why}.`)
    }
    const body = startTags(site).filter((t) => t.name === 'body')
    if (body.length !== 1 || !(body[0]?.attrs.get('class') ?? '').startsWith('{{body_class}}')) out.push(`${SITE_DOC}: <body>'s class does not open with {{body_class}} — Ghost writes each template's class there (home-template, post-template, tag-template tag-<slug> …).`)
  }
  for (const [path, body] of hbs) {
    // ── 3: {{post_class}} only in POST_ARTICLE, the first line inside every {{#post}}, with </article> its last ──
    const lines = body.split('\n')
    const admitted = new Set<number>()
    lines.forEach((line, i) => {
      if (/\{\{~?#\s*post\b/.test(line)) {
        const next = nonBlank(lines, i + 1, 1)
        if (next === -1 || (lines[next] as string).trim() !== POST_ARTICLE) out.push(`${path}: the first line inside {{#post}} is not ${POST_ARTICLE} — every post's page sits in Ghost's article (FR-J5).`)
        else admitted.add(next)
      }
      if (/\{\{~?\/\s*post\b/.test(line)) {
        const prev = nonBlank(lines, i - 1, -1)
        if (prev === -1 || (lines[prev] as string).trim() !== '</article>') out.push(`${path}: the last line inside {{#post}} is not </article> — POST_ARTICLE closes where the post's block does.`)
      }
    })
    lines.forEach((line, i) => {
      if (admitted.has(i)) return
      for (const m of line.matchAll(MUSTACHE)) if (/(?<![\w.@-])post_class\b/.test(m[0])) out.push(`${path}: ${m[0]} outside ${POST_ARTICLE} — Ghost's post classes go on the post's own article, and on no other element.`)
    })
    // ── 4 and 5: pictures and Portal, read from start tags alone ──
    for (const tag of startTags(body)) {
      const set = tag.attrs.get('srcset')
      if (set !== undefined) {
        // a bundled picture's srcset, composed from its rendition set, is Story 7.29's — it widens this rule then
        const path0 = /^\{\{img_url\s+([^\s}]+)/.exec(set)?.[1]
        let want: string | undefined
        try { want = path0 === undefined ? undefined : srcsetExpr(path0) } catch { want = undefined }
        if (want !== set) out.push(`${path}: <${tag.name}> srcset="${set}" is not the theme's own — a srcset is srcsetExpr's: one {{img_url}} per image_sizes key, each asking for WebP.`)
        if (!tag.attrs.has('sizes')) out.push(`${path}: <${tag.name}> carries a srcset and no sizes — without sizes the browser assumes the full viewport width and fetches the largest file (NFR-2 (1)).`)
      }
      const portal = tag.attrs.get('data-portal')
      if (portal !== undefined && !PORTAL_PAGE.test(portal.replace(MUSTACHE, 'x'))) {
        out.push(`${path}: data-portal="${portal}" is no page Portal opens — Portal would open its default page instead (signup, signin, account, account/plans, support … — PORTAL_PAGE).`)
      }
    }
    // ── 6: no member's own data printed (AD-38) ──
    for (const m of body.matchAll(MUSTACHE)) {
      const mustache = m[0]
      if (!/@member\b/.test(mustache)) continue
      const condition = /^\{\{~?\s*(?:#|\^|else\b)/.test(mustache)
      if (!condition || /=[^}]*@member\b/.test(mustache)) out.push(`${path}: ${mustache} prints a member's own data — a page Ghost caches by tier would show it to the next visitor (AD-38). @member may only be a block helper's condition: {{#if @member}}, {{#if @member.paid}}.`)
    }
  }
  return out
}

/**
 * Story 7.6 — V1 at compile (appendix H1 §7): the compile's `tree` BEFORE user text is substituted, `.hbs` files only.
 * Taken out of each template, in this order: Handlebars comments, `<style>` and `<script>` bodies, every mustache (triple
 * ones first), and every user-text marker `U0<n>U1` — the emission record that tells a customer's words from a typed
 * label. What is left goes to the runtime's `checkChromeLiterals`: a letter or digit left in a text node, or in an `alt`,
 * `title`, `placeholder` or `aria-label`, is a label typed into the template that no customer can translate. Render-time
 * V1 already holds every section, so this holds the compiler's own lines and every later story's. Each sentence names
 * its file; `[]` when every label goes through `{{t}}`.
 *
 * Found at Story 7.6's Dev: render-time V1 exempts text under a `data-bind` or `data-prop` element, but FR-H8's text
 * default (`fallback`) ships that element's AUTHORED English as a literal when the value is empty — `{{#if title}}{{title}}
 * {{else}}Title{{/if}}` for a binding, and the authored text itself for an emptied prop. This check refuses both. No library
 * design has one today (each text binding hides), so the pilots compile; a customer who empties a fallback-mode prop (A22
 * #1's heading, A4 #13's headline) makes the compile throw. The owner ruled such a text HIDDEN, on the canvas and in the
 * theme alike, built by Story 7.18, the compiler's first product caller (Story 7.6's Question 2, 2026-10-08, DW-349).
 */
export function checkChromeText(doc: RuntimeDocument, files: Readonly<Record<string, string>>): string[] {
  const marker = new RegExp(`${U0}\\d+${U1}`, 'g')
  return Object.entries(files).filter(([path]) => path.endsWith('.hbs')).flatMap(([path, body]) => {
    const bare = body.replace(HBS_COMMENT, '').replace(RAW_TEXT, '$1$3').replace(/\{\{~?\{[^]*?\}~?\}\}/g, '').replace(MUSTACHE, '').replace(marker, '')
    return checkChromeLiterals(doc, bare).map((literal) => `${path}: ${literal} is a label typed into the template, which no customer can translate — it reaches a theme only through {{t}} (V1, FR-Q6).`)
  })
}

/** Rule 7: `{{!-- {Layer name} · {Category} · {Design} --}}` — the layer name its file is slugged from, or the design's
 *  name where the layer has none. */
const boundary = (p: Placed): string =>
  `{{!-- ${commentPart(p.instance.layerName) || commentPart(p.entry.name)} · ${commentPart(p.entry.categoryTitle)} · ${commentPart(p.entry.name)} --}}`

/** A stylesheet's own text, tidied: comments stripped by the validator's scan, trailing whitespace trimmed, at most one
 *  blank line in a row, none at either end. */
const tidyCss = (css: string): string =>
  stripCssComments(css).split('\n').map((l) => l.trimEnd()).join('\n').replace(/\n{3,}/g, '\n\n').replace(/^\n+|\n+$/g, '')

/** Design order: category number, then design number. */
const designOrder = (a: SectionRegistryEntry, b: SectionRegistryEntry): number =>
  byCategory(a.category, b.category) || Number(a.id.split('/')[1]) - Number(b.id.split('/')[1])

/** The legal files, for the refusal that names them. */
const LEGAL = `${COMPILE_TARGETS.filter((f) => f !== INDEX).join(', ')} and custom-{name}.hbs`

/** A file's directory under `partials/sections/`: its name without `.hbs`, the paywall's `partials/` prefix dropped. */
const stemOf = (file: string): string => file.replace(/^partials\//, '').replace(/\.hbs$/, '')

/** One file to emit: its page-1 stack, and its page-2 stack when an archive's page 2 is designed (the split). */
type Stack = { file: string; pageOne: readonly DocInstance[]; pageTwo?: readonly DocInstance[] }

/**
 * STORY 7.3 — WHAT EACH FILE COMPILES FROM, and whether it is emitted (FR-I1; the spec's Design Notes table). Every stored
 * doc passes `designate` first, with the file it renders at (Home's page 2 at `index.hbs`), so a doc written before the
 * main-feed rule compiles with the main feed the canvas shows. A file is UNTOUCHED when it has no doc or a doc with no
 * instance (`isDesigned`, AD-22); hiding is not emptying, so a doc whose every section is hidden is designed and is never
 * re-synthesized. The stacks are `synthesize`'s and `pageTwoStack`'s — never a table of this file's (AD-27(d)).
 *
 * Also returns each page 2's stack, which FR-H2's guard reads.
 */
function stacksOf(input: CompileInput): { stacks: Stack[]; pageTwos: Readonly<Record<string, readonly DocInstance[]>> } {
  const library = input.library
  const stored = (file: string): ProjectDoc | undefined => {
    const d = input.templates[file]
    return d === undefined ? undefined : designate(d, file, library)
  }
  const storedTwo = (pageOne: string): ProjectDoc | undefined => {
    const d = input.pageTwo?.[pageOne]
    return d === undefined ? undefined : designate(d, pageOne === HOME ? INDEX : pageOne, library)
  }
  const designed = (d: ProjectDoc | undefined): d is ProjectDoc => d !== undefined && isDesigned(d)
  const own = (file: string): readonly DocInstance[] => {
    const d = stored(file)
    return designed(d) ? d.instances : synthesize(file, library).instances
  }
  const pageTwos = Object.fromEntries(PAGE_ONES.map((f) => [f, pageTwoStack(f, stored(f), storedTwo(f), library).instances]))

  const stacks: Stack[] = [
    { file: SITE_DOC, pageOne: stored(SITE_DOC)?.instances ?? [] },
    // `/` renders `home.hbs` else `index.hbs` (`templates.js:67`): an untouched pair IS the generic feed, written once
    ...(designed(stored(HOME)) || designed(storedTwo(HOME)) ? [{ file: HOME, pageOne: own(HOME) }] : []),
    { file: INDEX, pageOne: pageTwos[HOME] as readonly DocInstance[] },
    ...ALWAYS.map((file) => ({ file, pageOne: own(file), ...(PAGE_ONES.includes(file) && designed(storedTwo(file)) ? { pageTwo: pageTwos[file] } : {}) })),
    ...WHEN_FILLED.map((file) => ({ file, pageOne: own(file) })).filter((s) => s.pageOne.length > 0),
  ]
  // a custom template ships when designed or when a route names it; `private.hbs` and the paywall when designed
  const routed = new Set(input.routed ?? [])
  const conditional = [...new Set([...Object.keys(input.templates).filter((f) => CUSTOM_TARGET_RE.test(f)), ...routed, 'private.hbs', PAYWALL_TARGET])]
  for (const file of conditional) {
    const d = stored(file)
    if (designed(d) || routed.has(file)) stacks.push({ file, pageOne: d?.instances ?? [] })
  }
  return { stacks: stacks.sort((a, b) => byCode(a.file, b.file)), pageTwos }
}

// ── fonts and licences (Story 7.4, FR-J3, Appendix D §D.a rule 6, §D.b) ──────────────────────────────────────────────

/** A pool file's name — the only pool text that reaches a theme path or an `{{asset}}` expression (AD-36). */
const POOL_FILE_RE = /^[a-z0-9-]+\.woff2$/
const SLUG_RE = /^[a-z0-9-]+$/

/** A licence's own words with only its whitespace tidied — line endings, trailing spaces, one final newline — so it meets
 *  the formatting contract's rule 1 and says exactly what its authors wrote. Every licence the theme ships passes it: each
 *  font family's, and Ghost's beside `cards.js` (Story 7.5). */
export const tidyLicence = (text: string): string => `${text.replace(/\r\n?/g, '\n').replace(/[ \t]+$/gm, '').replace(/\n+$/, '')}\n`

const fontWords = (f: Pack['fonts']): string => `${f.heading.family} with ${f.body.family}`

/** The pairing's pool files as `assets/fonts/` (the pool's own bytes, names and subsets — nothing subset, re-encoded or
 *  renamed), each shipped family's licence at the root, and `default.hbs`'s head lines: a preload of each distinct roman
 *  face's `latin` file (§D.a rule 6 — italics and `latin-ext` are fetched only by a page that needs them) and the faces'
 *  `<style>`, both through one `{{asset}}` address per file, so the preload is the fetch (Ghost's `?v=`). */
function themeFonts(input: CompileInput): { files: Record<string, Uint8Array>; licences: Record<string, string>; head: string[] } {
  const want = pairingFonts(input.pairing)
  const got = input.pack.fonts
  const same = got.heading.family === want.heading.family && got.heading.capHeight === want.heading.capHeight &&
    got.body.family === want.body.family && got.body.capHeight === want.body.capHeight && got.body.tabular === want.body.tabular
  if (!same) throw new Error(`fonts: the pack draws ${fontWords(got)}, and its pairing ${input.pairing} is ${fontWords(want)} — a pack's fonts are its pairing's, so the theme ships the faces the pack names.`)
  const files: Record<string, Uint8Array> = {}
  const licences: Record<string, string> = {}
  const faces = pairingFaces(input.pairing)
  for (const f of faces.flatMap((face) => face.files)) {
    if (!POOL_FILE_RE.test(f.file)) throw new Error(`fonts: the pool file ${JSON.stringify(f.file)} is no font file name the theme writes (${POOL_FILE_RE.source}).`)
    const bytes = input.fonts(`files/${f.file}`)
    if (!(bytes instanceof Uint8Array) || bytes.length !== f.bytes) throw new Error(`fonts: files/${f.file} read ${bytes instanceof Uint8Array ? bytes.length : 'no'} bytes, and the pool records ${f.bytes} — a short or changed read is refused, never shipped.`)
    files[`assets/fonts/${f.file}`] = new Uint8Array(bytes)
  }
  for (const family of [...new Set(faces.map((face) => face.family))]) {
    const record = Object.hasOwn(POOL.families, family) ? POOL.families[family] : undefined
    if (record === undefined || !SLUG_RE.test(record.slug)) throw new Error(`fonts: the pool records no licence for ${family}.`)
    // held as the font read is (review, 2026-10-08): a licence the pool names has words, so an empty or non-byte read is refused
    const raw = input.fonts(record.licenceFile)
    if (!(raw instanceof Uint8Array) || raw.length === 0) throw new Error(`fonts: ${record.licenceFile} read ${raw instanceof Uint8Array ? 'no' : 'no bytes and no'} licence text — ${family}'s licence ships with its files, so a missing read is refused.`)
    licences[`LICENSE-${record.slug}.txt`] = tidyLicence(new TextDecoder().decode(raw))
  }
  const pairing = pairingOf(input.pairing)
  const preloads = [...new Set([pairing.heading, pairing.body].map((role) => {
    const latin = role.faces.map(faceOf).find((face) => face.style === 'normal')?.files.find((f) => f.subset === 'latin')
    if (latin === undefined) throw new Error(`fonts: ${input.pairing}'s ${role.family} has no roman latin file to preload.`)
    return latin.file
  }))]
  const asset = (file: string): string => `{{asset "fonts/${file}"}}`
  return {
    files,
    licences,
    head: [
      ...preloads.map((file) => `<link rel="preload" href="${asset(file)}" as="font" type="font/woff2" crossorigin>`),
      '<style>',
      ...fontFaceCss(input.pairing, (f) => asset(f.file)).split('\n').map((l) => `  ${l}`),
      '</style>',
    ],
  }
}

/** Story 7.1's compile: the template docs, the library, the pack, the assets and the strings, as a Ghost theme's files —
 *  and, since Story 7.2, its `package.json`; since Story 7.3, every standard template, synthesized where untouched; since
 *  Story 7.4, its fonts, licences and stripped stylesheet, with AD-14's record; since Story 7.5, its scripts and README;
 *  since Story 7.6, Ghost's article around each post's sections, WebP candidates and the markup checks. */
export function compileTheme(doc: RuntimeDocument, input: CompileInput): CompiledTheme {
  for (const file of Object.keys(input.templates).sort(byCode)) {
    if (file === INDEX) throw new Error(`${file}: Home's page 2 is handed in as pageTwo['${HOME}'], never as a template — ${INDEX} is compiled from it.`)
    if (!isCompileTarget(file)) throw new Error(`${file}: this compile writes no such template — the legal files are ${LEGAL}.`)
  }
  for (const file of Object.keys(input.pageTwo ?? {}).sort(byCode)) {
    if (!PAGE_ONES.includes(file)) throw new Error(`pageTwo['${file}']: only a paginated page 1 has a page 2 — page 2 is handed in under ${PAGE_ONES.join(', ')}.`)
  }
  for (const file of [...(input.routed ?? [])].sort(byCode)) {
    if (!CUSTOM_TARGET_RE.test(file)) throw new Error(`routed '${file}': a route names a custom template, custom-{name}.hbs, and never another file.`)
  }
  noC0('a string', Object.values(input.strings ?? {}))
  noC0('an asset URL', Object.values(input.assets))
  const tokens = packTokensCss(input.pack, { ghostFonts: true })
  noC0("the pack's CSS", [tokens])
  const perPage = pageSize(input.postsPerPage)
  const pkg = packageJson(input, perPage)
  const fonts = themeFonts(input)
  noC0('a licence', Object.values(fonts.licences))
  // Story 7.5: the scripts the theme ships are read by the shell, so each is held to the same rule before it is copied
  const sorted = (o: Readonly<Record<string, string>>): string[] => Object.keys(o).sort(byCode).map((k) => o[k] as string)
  noC0('a module source', sorted(input.modules))
  noC0('a card script', sorted(input.ghostCards.scripts))
  noC0("Ghost's licence", [input.ghostCards.licence])
  // the designed cards Ghost has a script for (a callout has none): cards.js carries exactly these, or ships not at all
  const scripted = [...new Set(input.designedCards ?? [])].filter((c) => Object.hasOwn(input.ghostCards.scripts, c)).sort(byCode)
  const cards = scripted.length === 0 ? undefined : { js: cardsJs(scripted, input.ghostCards.scripts), version: cardsVersion(scripted, input.ghostCards.scripts) }
  const { stacks, pageTwos } = stacksOf(input)

  // ── render every visible instance, with ONE UserText — file by file, page 1 before page 2 ─────────────────────────────
  const users = new UserText()
  const placed: Placed[] = []
  // Story 7.4 (R-26): Tabler's licence ships when a placed section draws an icon — the lookup records each drawing it gives
  let drew = false
  const icons: IconLookup = (name) => {
    const drawing = iconDrawing(name)
    if (drawing !== undefined) drew = true
    return drawing
  }
  let drewAny = false
  // Story 7.4 (DW-331): each hook, with the section that holds it, so a collision is refused naming both
  const hooks = new Map<string, string>()
  for (const { file, pageOne, pageTwo } of stacks) {
    for (const [page, instances] of [[1, pageOne], [2, pageTwo ?? []]] as const) {
      for (const instance of instances) {
        if (instance.hidden) continue
        const at = page === 2 ? `${file} (page 2)` : file
        const entry = input.library(instance.designId)
        if (entry === undefined) throw new Error(`${at} · ${instance.layerName || instance.designId}: the library holds no design "${instance.designId}".`)
        // an empty layer name is reported as the design's name, as the boundary comment and the slug fall back to it
        const where = `${at} · ${instance.layerName || entry.name}`
        if (!compilesTo(entry.compileTarget, file)) throw new Error(`${where}: ${entry.id} compiles to ${entry.compileTarget.join(', ')}, never to ${file}.`)
        const query = feedQuery(entry, instance, file, perPage)
        // the place it fills, as the editor keys it (`templateKeyOfFile`); a hook only while an override changes its dark
        // look, and none at all on a Light-only project (AD-30)
        const key = sectionKey(templateKeyOfFile(file, page === 2), instance.instanceId)
        const hook = input.darkEnabled ? darkHook(entry, instance, key) : undefined
        drew = false
        let out: ReturnType<typeof renderTheme>
        try {
          out = renderTheme(doc, entry.html, {
            target: file,
            content: instance.content,
            schema: entry.contentSchema,
            controlSchema: entry.controlSchema,
            universals: entry.universals,
            controls: instance.controls,
            data: instance.data,
            ...(entry.dataBindings === undefined ? {} : { dataBindings: entry.dataBindings }),
            visibility: instance.memberVisibility,
            assets: input.assets,
            icons,
            ...(input.strings === undefined ? {} : { strings: input.strings }),
            users,
            ...(query === undefined ? {} : { feed: { query } }),
            ...(hook === undefined ? {} : { instance: hook }),
          })
        } catch (e) {
          throw new Error(`${where}: ${(e as Error).message}`)
        }
        // a section that renders nothing — a hand-picked feed with nothing picked — contributes no file, no line, no label
        if (out.template !== '') {
          if (hook !== undefined) {
            // refused by name before `darkOverrideCss`, so the customer reads layer names, never keys (Story 7.18 shows it)
            const named = `"${instance.layerName || entry.name}" in ${at}`
            const met = hooks.get(hook)
            if (met !== undefined) throw new Error(`Two sections share a hidden name, so neither one's dark look can ship: ${met} and ${named}. Delete one of them and add it again — it gets a new name.`)
            hooks.set(hook, named)
          }
          placed.push({ file, page, instance, entry, template: out.template, partials: out.partials, key, ...(hook === undefined ? {} : { hook }) })
          drewAny ||= drew
        }
      }
    }
  }

  const tree: Record<string, string> = {}

  // ── Ghost-sourced repeats: one file per name, however many placements ───────────────────────────────────────────────
  const repeatOwner = new Map<string, { id: string; identity: string }>()
  for (const p of placed) {
    for (const name of Object.keys(p.partials).sort(byCode)) {
      const body = p.partials[name] as string
      const identity = users.substitute(body)
      const had = repeatOwner.get(name)
      if (had !== undefined && had.identity !== identity) {
        throw new Error(`partials/${name}.hbs: ${had.id} and ${p.entry.id} both declare data-partial "${name}" with different bodies — a library defect (tools/check-snapshots.mjs refuses one name twice).`)
      }
      if (had === undefined) repeatOwner.set(name, { id: p.entry.id, identity })
      tree[`partials/${name}.hbs`] = `${body}\n`
    }
  }

  // ── partition: one file per distinct section, hoisted to shared/ when it is on two templates ──────────────────────────
  // Identity is the text AFTER substitution, computed on a copy; groups are visited in placement order (file, then page,
  // then position), which is exactly the order R2-10's collision rule hands names out in, in every directory.
  const groups = new Map<string, Placed[]>()
  for (const p of placed) {
    const identity = users.substitute(p.template)
    groups.set(identity, [...(groups.get(identity) ?? []), p])
  }
  const taken = new Map<string, Set<string>>()
  const invocation = new Map<Placed, string>()
  for (const group of groups.values()) {
    const first = group[0] as Placed
    const dir = new Set(group.map((p) => p.file)).size > 1 ? 'shared' : stemOf(first.file)
    const name = claim(taken.get(dir) ?? taken.set(dir, new Set()).get(dir) as Set<string>, sectionSlug(first.instance.layerName, first.entry))
    tree[`partials/sections/${dir}/${name}.hbs`] = `${first.template}\n`
    for (const p of group) invocation.set(p, `{{> "sections/${dir}/${name}"}}`)
  }
  const indent = (text: string, by: string): string => text.split('\n').map((l) => (l === '' ? l : `${by}${l}`)).join('\n')
  /** One section: its label and invocation — on `page.hbs`, a Post Header's inside Ghost's page switch (FR-I1), so the
   *  page builder's "show title and feature image" turns it off. Nothing else is guarded, on any file. */
  const section = (p: Placed): string => {
    const own = `${boundary(p)}\n${invocation.get(p) as string}`
    return p.file === 'page.hbs' && categoryOf(p.entry.id) === POST_HEADER ? `{{#if ${PAGE_SWITCH}}}\n${indent(own, '  ')}\n{{/if}}` : own
  }
  /** A page's sections, inside the block its target opens — and, inside `{{#post}}`, inside Ghost's article (Story 7.6,
   *  FR-J5): `POST_ARTICLE` first, the sections one level in, `</article>` last. '' when it places none, so an emptied
   *  post keeps its layout line alone (Story 7.3's rule), with no block and no article. */
  const pageBody = (file: string, page: 1 | 2): string => {
    const own = placed.filter((p) => p.file === file && p.page === page).map(section)
    if (own.length === 0) return ''
    const block = targetContext(file)?.block
    if (block === undefined) return own.join('\n\n')
    const inner = block === 'post' ? `${POST_ARTICLE}\n${indent(own.join('\n\n'), '  ')}\n</article>` : own.join('\n\n')
    return `{{#${block}}}\n${indent(inner, '  ')}\n{{/${block}}}`
  }

  // ── the page templates: the layout line, then each section; a designed archive page 2 inside {{#is "paged"}} ───────────
  for (const { file, pageTwo } of stacks) {
    if (file === SITE_DOC) continue
    const one = pageBody(file, 1)
    // Ghost adds `paged` to the context from page 2 on, never on page 1 (`context.js`, both majors)
    const two = pageTwo === undefined ? '' : pageBody(file, 2)
    const body = pageTwo === undefined || (one === '' && two === '')
      ? one
      : ['{{#is "paged"}}', ...(two === '' ? [] : [indent(two, '  ')]), ...(one === '' ? [] : ['{{else}}', indent(one, '  ')]), '{{/is}}'].join('\n')
    // the paywall is a partial Ghost's `{{content}}` runs in place of the post, so it prints the free preview itself —
    // `{{{html}}}`, AD-5's second exception (Question 2, ruled option 1, owner, 2026-10-06) — and has no layout line
    if (file === PAYWALL_TARGET) tree[file] = body === '' ? '{{{html}}}\n' : `{{{html}}}\n\n${body}\n`
    else tree[file] = body === '' ? '{{!< default}}\n' : `{{!< default}}\n\n${body}\n`
  }

  // ── default.hbs: always, the site doc's headers before <main> and its footers after (the canvas's own order) ───────────
  const site = placed.filter((p) => p.file === SITE_DOC)
  const bands = [
    ...site.filter((p) => !isSiteFooter(p.entry.id)).map(section),
    // Story 7.3 (DW-150, §7.4): `<main>` wraps `{{{body}}}` alone, once — Story 9.1's skip link lands on `#site-main`
    '<main id="site-main">\n  {{{body}}}\n</main>',
    ...site.filter((p) => isSiteFooter(p.entry.id)).map(section),
    '{{ghost_foot}}',
  ]
  // FR-H2's guard (DW-234, DW-253): a page 2 with no visible feed would repeat page 1, so search engines are told not to
  // index it. `noindex` alone — `{{ghost_head}}` writes the canonical, page 2's pointing at itself
  // (`meta/canonical-url.js`), and a second canonical makes search engines ignore both
  const unlisted = PAGED_CONTEXTS.filter(([, pageOne]) => !(pageTwos[pageOne] ?? []).some(visibleFeed(input.library))).map(([context]) => context)
  const guard = unlisted.length === 0 ? [] : ['{{#is "paged"}}', `  {{#is "${unlisted.join(', ')}"}}`, '    <meta name="robots" content="noindex">', '  {{/is}}', '{{/is}}']
  tree[SITE_DOC] = [
    '<!DOCTYPE html>',
    '<html lang="{{@site.locale}}">',
    '  <head>',
    '    <meta charset="utf-8">',
    '    <meta name="viewport" content="width=device-width, initial-scale=1">',
    '    <title>{{meta_title}}</title>',
    // Story 7.4: the preloads and the faces, each address one `{{asset}}` expression; the `<style>` holds `@font-face`
    // rules only and names no mode, so `screen.css` stays the one file that does (AD-30)
    ...fonts.head.map((l) => `    ${l}`),
    '    <link rel="stylesheet" href="{{asset "css/screen.css"}}">',
    // Story 7.5 (NFR-2 (3)): both scripts `defer`, in the head, so neither holds the page up
    `    ${MAIN_JS_TAG}`,
    ...(cards === undefined ? [] : [`    ${CARDS_JS_TAG}`]),
    ...guard.map((l) => `    ${l}`),
    '    {{ghost_head}}',
    '  </head>',
    '  <body class="{{body_class}}">',
    indent(bands.join('\n\n'), '    '),
    '  </body>',
    '</html>',
    '',
  ].join('\n')

  // ── screen.css (Story 7.4): the token block — the pack's, with AD-18's two Ghost font variables, then each section's
  // dark override, read from the library's UNSTRIPPED sheet — then the canvas's base, then each placed design's sheet
  // once, in design order, cut to the rules its placed roots reach ──────────────────────────────────────────────────────
  const overrides: PlacedSection[] = placed.filter((p) => p.hook !== undefined).map((p) => ({ key: p.key, entry: p.entry, state: p.instance }))
  const global = `/* Tokens */\n${tidyCss(tokens + darkOverrideCss(overrides))}\n\n/* Base */\n${BASE_CSS}`
  const designs = [...new Map(placed.map((p) => [p.entry.id, p.entry])).values()].sort(designOrder)
  const sheets: Record<string, string> = {}
  for (const e of designs) {
    // the roots exactly as `stampControls` writes them, so a forced value is read as the theme ships it
    const roots = placed.filter((p) => p.entry.id === e.id).map((p) => resolveControls(e, p.instance.controls))
    sheets[e.id] = `/* ${cssPart(e.categoryTitle)} · ${cssPart(e.name)} */\n${stripCss(tidyCss(e.css), rootClassOf(e.html), roots)}`
  }
  tree['assets/css/screen.css'] = `${[global, ...designs.map((e) => sheets[e.id] as string)].join('\n\n')}\n`
  // AD-14's record: each emitted root-level template but the shell reaches the site doc's designs, its own (both pages)
  // and, where Ghost's `{{content}}` can print the paywall, the paywall's
  const idsOf = (files: readonly string[]): string[] => designs.filter((e) => placed.some((p) => p.entry.id === e.id && files.includes(p.file))).map((e) => e.id)
  const reach: Record<string, readonly string[]> = {}
  for (const file of Object.keys(tree).filter((f) => f.endsWith('.hbs') && !f.includes('/') && f !== SITE_DOC).sort(byCode)) {
    reach[file] = idsOf([SITE_DOC, file, ...(file === 'post.hbs' || file === 'page.hbs' || CUSTOM_TARGET_RE.test(file) ? [PAYWALL_TARGET] : [])])
  }

  tree['package.json'] = pkg   // JSON.stringify escapes every C0 character, so no user-text marker is in it to substitute
  // R-26: Tabler's MIT licence, verbatim, whenever a placed section draws an icon; each shipped family's beside it — text
  // files of the tree like any other, so the final checks read them too (review, 2026-10-08)
  Object.assign(tree, fonts.licences)
  if (drewAny && Object.hasOwn(tree, 'LICENSE-tabler.txt')) throw new Error("LICENSE-tabler.txt: a font family's licence is already at that name, and Tabler's would overwrite it — the pool's slugs may not be `ghost` or `tabler`.")
  if (drewAny) tree['LICENSE-tabler.txt'] = TABLER_LICENSE

  // ── the scripts (Story 7.5, FR-J4): main.js is `core` and every module a placed, visible design declares that has a
  // file, in registry order — a deleted or everywhere-hidden design takes its names with it, and a declared module with
  // no file yet is left out, so its mount keeps `data-module` and ships at rest in its no-JS state (never a stub: `core`
  // would set `js-enabled` on it). cards.js and Ghost's licence ship only for designed cards that have a script ────────
  const mounted = moduleUnion(placed.map((p) => p.entry))
  const js: JsRecord = { bundled: mounted.filter((n) => Object.hasOwn(input.modules, n)), atRest: mounted.filter((n) => !Object.hasOwn(input.modules, n)) }
  tree['assets/js/main.js'] = bundle(js.bundled, input.modules)
  if (cards !== undefined) {
    // three writers share the root's LICENSE-*.txt namespace (review, 2026-10-08): a family slug of `ghost` or `tabler` would overwrite one silently
    if (Object.hasOwn(tree, 'LICENSE-ghost.txt')) throw new Error("LICENSE-ghost.txt: a font family's licence is already at that name, and Ghost's would overwrite it — the pool's slugs may not be `ghost` or `tabler`.")
    tree['assets/js/cards.js'] = cards.js
    tree['LICENSE-ghost.txt'] = tidyLicence(input.ghostCards.licence)
  }
  tree['README.md'] = [
    '## Scripts',
    '',
    "- `assets/js/main.js` is this theme's own code: a small runtime and one function for each behaviour its sections use. It carries no third-party code.",
    ...(cards === undefined ? [] : [
      `- \`assets/js/cards.js\` is Ghost's own code for these cards: ${scripted.join(' · ')}. It is copied unchanged from Ghost ${cards.version}, under the MIT licence in \`LICENSE-ghost.txt\`. This theme styles those cards itself, which switches off Ghost's own copy of their scripts, so it carries this one.`,
    ]),
    '',
  ].join('\n')

  // ── user text, once, last, over every text file; the record in code-unit path order; then the checks over the final
  // text. A font's bytes are never substituted: `UserText.substitute` is a string `replace` ────────────────────────────
  const text = Object.fromEntries(Object.keys(tree).map((path) => [path, users.substitute(tree[path] as string)]))
  checkSizes(text)
  checkPageData(text)
  checkPaywallReached(text)
  checkTripleStashes(text)
  // Story 7.5: the theme's scripts, judged by the checks CI and the stress fixture run — no script but the two tags, main.js
  // as bundled and cards.js as copied
  const scripts = [...checkThemeJs(text, input.modules, input.ghostCards.scripts), ...checkThemeScripts(text)]
  if (scripts.length > 0) throw new Error(`the theme's scripts: ${scripts.join(' · ')}`)
  // Story 7.6: Ghost's markup over the final text, and V1 over the tree before substitution — where a customer's words are
  // still markers, so a typed label and a customer's text are told apart
  const markup = [...checkGhostMarkup(text), ...checkChromeText(doc, tree)]
  if (markup.length > 0) throw new Error(`the theme's markup: ${markup.join(' · ')}`)
  const all: Record<string, string | Uint8Array> = { ...fonts.files, ...text }
  return { files: Object.fromEntries(Object.keys(all).sort(byCode).map((path) => [path, all[path] as string | Uint8Array])), css: { global, sheets, reach }, js }
}
