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

import {
  byCategory, categoryOf, COMPILE_TARGETS, compilesTo, CUSTOM_TARGET_RE, IMAGE_SIZES, isCompileTarget, isSiteFooter,
  PAGINATED_TARGETS, PAYWALL_TARGET, POST_HEADER, stripCssComments, targetContext,
} from '@inflozo/library'
import type { SectionRegistryEntry } from '@inflozo/library'
import { iconDrawing } from '@inflozo/library/icons'
import { designate, feedQuery, isDesigned, packTokensCss, pageTwoStack, renderTheme, synthesize, UserText, visibleFeed } from '@inflozo/section-runtime'
import type { DocInstance, Pack, ProjectDoc, RuntimeDocument } from '@inflozo/section-runtime'
import { claim, sectionSlug } from './slug.ts'

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
}

/** The site doc's file. */
const SITE_DOC = 'default.hbs'

/** One visible section, rendered — on page 1 of its file, or on page 2 of an archive whose page 2 is designed. */
type Placed = { file: string; page: 1 | 2; instance: DocInstance; entry: SectionRegistryEntry; template: string; partials: Record<string, string> }

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
 *  With no brace left, nothing inside can end `{{!--` early — the lexer ends it at the first `--}}` or `--~}}`. */
const commentPart = (s: string): string => s.replace(/[{}\u0000-\u001f]/g, '').replace(/\s+/g, ' ').trim()

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

/** A Handlebars comment, `{{!-- … --}}` or `{{! … }}` — never read by the size check, because a layer name lands in one. */
const HBS_COMMENT = /\{\{~?!--[^]*?--~?\}\}|\{\{~?![^]*?\}\}/g
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

/** Story 7.1's compile: the template docs, the library, the pack, the assets and the strings, as a Ghost theme's files —
 *  and, since Story 7.2, its `package.json`; since Story 7.3, every standard template, synthesized where untouched. */
export function compileTheme(doc: RuntimeDocument, input: CompileInput): Readonly<Record<string, string>> {
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
  noC0("the pack's CSS", [packTokensCss(input.pack)])
  const perPage = pageSize(input.postsPerPage)
  const pkg = packageJson(input, perPage)
  const { stacks, pageTwos } = stacksOf(input)

  // ── render every visible instance, with ONE UserText — file by file, page 1 before page 2 ─────────────────────────────
  const users = new UserText()
  const placed: Placed[] = []
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
            icons: iconDrawing,
            ...(input.strings === undefined ? {} : { strings: input.strings }),
            users,
            ...(query === undefined ? {} : { feed: { query } }),
          })
        } catch (e) {
          throw new Error(`${where}: ${(e as Error).message}`)
        }
        // a section that renders nothing — a hand-picked feed with nothing picked — contributes no file, no line, no label
        if (out.template !== '') placed.push({ file, page, instance, entry, template: out.template, partials: out.partials })
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
  /** A page's sections, inside the block its target opens; '' when it places none. */
  const pageBody = (file: string, page: 1 | 2): string => {
    const own = placed.filter((p) => p.file === file && p.page === page).map(section)
    if (own.length === 0) return ''
    const block = targetContext(file)?.block
    return block === undefined ? own.join('\n\n') : `{{#${block}}}\n${indent(own.join('\n\n'), '  ')}\n{{/${block}}}`
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
    '    <link rel="stylesheet" href="{{asset "css/screen.css"}}">',
    ...guard.map((l) => `    ${l}`),
    '    {{ghost_head}}',
    '  </head>',
    '  <body class="{{body_class}}">',
    indent(bands.join('\n\n'), '    '),
    '  </body>',
    '</html>',
    '',
  ].join('\n')

  // ── screen.css: the token block first, then each placed design's stylesheet once, in design order ───────────────────
  const designs = [...new Map(placed.map((p) => [p.entry.id, p.entry])).values()].sort(designOrder)
  tree['assets/css/screen.css'] = `${[
    `/* Tokens */\n${tidyCss(packTokensCss(input.pack))}`,
    ...designs.map((e) => `/* ${cssPart(e.categoryTitle)} · ${cssPart(e.name)} */\n${tidyCss(e.css)}`),
  ].join('\n\n')}\n`

  tree['package.json'] = pkg   // JSON.stringify escapes every C0 character, so no user-text marker is in it to substitute

  // ── user text, once, last, over every file; the record in code-unit path order; then the checks over the final text ─
  const out = Object.fromEntries(Object.keys(tree).sort(byCode).map((path) => [path, users.substitute(tree[path] as string)]))
  checkSizes(out)
  checkPageData(out)
  checkPaywallReached(out)
  checkTripleStashes(out)
  return out
}
