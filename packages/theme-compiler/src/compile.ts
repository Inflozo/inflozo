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

import { byCategory, COMPILE_TARGETS, compilesTo, IMAGE_SIZES, isCompileTarget, isSiteFooter, PAYWALL_TARGET, stripCssComments, targetContext } from '@inflozo/library'
import type { SectionRegistryEntry } from '@inflozo/library'
import { iconDrawing } from '@inflozo/library/icons'
import { feedQuery, packTokensCss, renderTheme, UserText } from '@inflozo/section-runtime'
import type { DocInstance, Pack, ProjectDoc, RuntimeDocument } from '@inflozo/section-runtime'
import { claim, sectionSlug } from './slug.ts'

export type CompileInput = {
  /** every template handed in, by its file — `default.hbs` is the site doc (Story 7.18 maps keys with `fileOfKey`) */
  templates: Readonly<Record<string, ProjectDoc>>
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

/** One visible section, rendered. */
type Placed = { file: string; instance: DocInstance; entry: SectionRegistryEntry; template: string; partials: Record<string, string> }

const byCode = (a: string, b: string): number => (a < b ? -1 : a > b ? 1 : 0)

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
  const n = Math.trunc(Number(v))
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
 *  and a customer's typed `size="huge"` are HTML, never an argument (user braces ship as entities). */
const MUSTACHE = /\{\{[^]*?\}\}/g
const SIZE_ARG = /(?<![\w-])size=("([^"]*)"|[^\s}]*)/g

/** FR-J2: every `size=` an emitted template passes is an `image_sizes` key — with any other, Ghost silently serves the
 *  original picture. `HELPERS.img_url` refuses one at render; this is the backstop over the final text. */
export function checkSizes(files: Readonly<Record<string, string>>): void {
  for (const [path, body] of Object.entries(files)) {
    if (!path.endsWith('.hbs')) continue
    for (const [mustache] of body.replace(HBS_COMMENT, '').matchAll(MUSTACHE)) {
      for (const m of mustache.matchAll(SIZE_ARG)) {
        if (m[2] === undefined || !Object.hasOwn(IMAGE_SIZES, m[2])) {
          throw new Error(`${path}: ${m[0]} is no image size — a size must be one of package.json's image_sizes keys, quoted: ${Object.keys(IMAGE_SIZES).join(', ')}.`)
        }
      }
    }
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
const LEGAL = `${COMPILE_TARGETS.filter((f) => f !== PAYWALL_TARGET).join(', ')} and custom-{name}.hbs`

/** Story 7.1's compile: the template docs, the library, the pack, the assets and the strings, as a Ghost theme's files —
 *  and, since Story 7.2, its `package.json`. */
export function compileTheme(doc: RuntimeDocument, input: CompileInput): Readonly<Record<string, string>> {
  const files = Object.keys(input.templates).sort(byCode)
  for (const file of files) {
    if (file === PAYWALL_TARGET) throw new Error(`${file}: the paywall's partial is compiled by Story 7.3 (synthesis), not by theme assembly.`)
    if (!isCompileTarget(file)) throw new Error(`${file}: this compile writes no such template — the legal files are ${LEGAL}.`)
  }
  noC0('a string', Object.values(input.strings ?? {}))
  noC0('an asset URL', Object.values(input.assets))
  noC0("the pack's CSS", [packTokensCss(input.pack)])
  const perPage = pageSize(input.postsPerPage)
  const pkg = packageJson(input, perPage)

  // ── render every visible instance, with ONE UserText ──────────────────────────────────────────────────────────────
  const users = new UserText()
  const placed: Placed[] = []
  for (const file of files) {
    for (const instance of (input.templates[file] as ProjectDoc).instances) {
      if (instance.hidden) continue
      const entry = input.library(instance.designId)
      if (entry === undefined) throw new Error(`${file} · ${instance.layerName || instance.designId}: the library holds no design "${instance.designId}".`)
      // an empty layer name is reported as the design's name, as the boundary comment and the slug fall back to it
      const where = `${file} · ${instance.layerName || entry.name}`
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
      if (out.template !== '') placed.push({ file, instance, entry, template: out.template, partials: out.partials })
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
  // Identity is the text AFTER substitution, computed on a copy; groups are visited in placement order (file, then
  // position), which is exactly the order R2-10's collision rule hands names out in, in every directory.
  const groups = new Map<string, Placed[]>()
  for (const p of placed) {
    const identity = users.substitute(p.template)
    groups.set(identity, [...(groups.get(identity) ?? []), p])
  }
  const taken = new Map<string, Set<string>>()
  const invocation = new Map<Placed, string>()
  for (const group of groups.values()) {
    const first = group[0] as Placed
    const dir = new Set(group.map((p) => p.file)).size > 1 ? 'shared' : first.file.replace(/\.hbs$/, '')
    const name = claim(taken.get(dir) ?? taken.set(dir, new Set()).get(dir) as Set<string>, sectionSlug(first.instance.layerName, first.entry))
    tree[`partials/sections/${dir}/${name}.hbs`] = `${first.template}\n`
    for (const p of group) invocation.set(p, `{{> "sections/${dir}/${name}"}}`)
  }
  const section = (p: Placed): string => `${boundary(p)}\n${invocation.get(p) as string}`
  const indent = (text: string, by: string): string => text.split('\n').map((l) => (l === '' ? l : `${by}${l}`)).join('\n')

  // ── the page templates: the layout line, then each section inside the block its target opens ────────────────────────
  for (const file of files) {
    if (file === SITE_DOC) continue
    const own = placed.filter((p) => p.file === file).map(section)
    const block = targetContext(file)?.block
    const body = block === undefined ? own.join('\n\n') : `{{#${block}}}\n${indent(own.join('\n\n'), '  ')}\n{{/${block}}}`
    tree[file] = own.length === 0 ? '{{!< default}}\n' : `{{!< default}}\n\n${body}\n`
  }

  // ── default.hbs: always, the site doc's headers before {{{body}}} and its footers after (the canvas's own order) ───────
  const site = placed.filter((p) => p.file === SITE_DOC)
  const bands = [
    ...site.filter((p) => !isSiteFooter(p.entry.id)).map(section),
    '{{{body}}}',
    ...site.filter((p) => isSiteFooter(p.entry.id)).map(section),
    '{{ghost_foot}}',
  ]
  tree[SITE_DOC] = [
    '<!DOCTYPE html>',
    '<html lang="{{@site.locale}}">',
    '  <head>',
    '    <meta charset="utf-8">',
    '    <meta name="viewport" content="width=device-width, initial-scale=1">',
    '    <title>{{meta_title}}</title>',
    '    <link rel="stylesheet" href="{{asset "css/screen.css"}}">',
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

  // ── user text, once, last, over every file; the record in code-unit path order; and every size= checked on it ──────
  const out = Object.fromEntries(Object.keys(tree).sort(byCode).map((path) => [path, users.substitute(tree[path] as string)]))
  checkSizes(out)
  return out
}
