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

import { byCategory, COMPILE_TARGETS, compilesTo, isCompileTarget, isSiteFooter, PAYWALL_TARGET, stripCssComments, targetContext } from '@inflozo/library'
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
  /** `projects.posts_per_page` — a secondary feed's query is sized by it */
  postsPerPage: number
}

/** The site doc's file. */
const SITE_DOC = 'default.hbs'

/** One visible section, rendered. */
type Placed = { file: string; instance: DocInstance; entry: SectionRegistryEntry; template: string; partials: Record<string, string> }

const byCode = (a: string, b: string): number => (a < b ? -1 : a > b ? 1 : 0)

/** A label part, made safe for a Handlebars comment (AD-36): braces and C0 controls dropped, whitespace collapsed, trimmed.
 *  With no brace left, nothing inside can end `{{!--` early — the lexer ends it at the first `--}}` or `--~}}`. */
const commentPart = (s: string): string => s.replace(/[{}\u0000-\u001f]/g, '').replace(/\s+/g, ' ').trim()

/** A stylesheet header part: `*\/` and C0 controls dropped, whitespace collapsed. */
const cssPart = (s: string): string => s.replace(/\*\/|[\u0000-\u001f]/g, '').replace(/\s+/g, ' ').trim()

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

/** Story 7.1's compile: the template docs, the library, the pack, the assets and the strings, as a Ghost theme's files. */
export function compileTheme(doc: RuntimeDocument, input: CompileInput): Readonly<Record<string, string>> {
  const files = Object.keys(input.templates).sort(byCode)
  for (const file of files) {
    if (file === PAYWALL_TARGET) throw new Error(`${file}: the paywall's partial is compiled by Story 7.3 (synthesis), not by theme assembly.`)
    if (!isCompileTarget(file)) throw new Error(`${file}: this compile writes no such template — the legal files are ${LEGAL}.`)
  }

  // ── render every visible instance, with ONE UserText ──────────────────────────────────────────────────────────────
  const users = new UserText()
  const placed: Placed[] = []
  for (const file of files) {
    for (const instance of (input.templates[file] as ProjectDoc).instances) {
      if (instance.hidden) continue
      const where = `${file} · ${instance.layerName || instance.designId}`
      const entry = input.library(instance.designId)
      if (entry === undefined) throw new Error(`${where}: the library holds no design "${instance.designId}".`)
      if (!compilesTo(entry.compileTarget, file)) throw new Error(`${where}: ${entry.id} compiles to ${entry.compileTarget.join(', ')}, never to ${file}.`)
      const query = feedQuery(entry, instance, file, input.postsPerPage)
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

  // ── user text, once, last, over every file; and the record in code-unit path order ──────────────────────────────────
  return Object.fromEntries(Object.keys(tree).sort(byCode).map((path) => [path, users.substitute(tree[path] as string)]))
}
