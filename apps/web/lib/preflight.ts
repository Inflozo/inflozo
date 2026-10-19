/* STORY 7.18b — PRE-FLIGHT'S WARNING ROWS (FR-D16, FR-H2, FR-H6, FR-Q6; DW-253, DW-260, DW-297, DW-145's Pre-flight half; 7.10's
 * and 7.11's Questions 2). ONE pure rule module: the facts only the compile knows (`deploys.preflight`, `PreflightFacts`) and
 * the editor's own state after Run checks' flush (its docs, synthesised ones included; the View as records; the members
 * record; the language and the site) in, the ordered rows out. Every row is a WARNING and never blocks: the one blocking
 * row, an unacknowledged right-to-left language, is the server's verdict before compile (`rtl_unacknowledged`).
 *
 * THE ORDER (routine call 13): what changes the live site first, reminders last — RTL, the locale, the untouched words, the
 * members switches, free asks below 5.62, the dropped settings, the changed built-ins, the feed-less archives, the picks,
 * then the pages nobody viewed as every visitor.
 *
 * ONE RULE PER THING (R-170): FR-H6's sentences are `membersNotice`'s, a member ask is `asksIn`'s (through `askStopped`, the
 * panel's own test), FR-H2's archive body is `FEEDLESS`'s, the RTL, locale and untouched words are `TRANSLATION_WORDS`',
 * the visitors are View as's `ROWS`, a setting is named as Ghost names it (`ghostName`), and a page as Theme settings
 * names it (`pageOf`). "Since your last deploy" is this project's latest ACTIVATED deploy to the site (Ghost syncs a
 * theme's settings at activation, per theme name — F2), and Ghost's stored values are never read (routine call 11).
 *
 * THE CANVASES THAT SHIP come from the compile's `templates` through `placeOf`, each with its page 2; Editor cards is never
 * one. Pure (AD-1): no clock, no I/O, no `Intl` but `ownName`'s. */

import { ASK_FLAGS, CONTEXT_MATRIX, type DataBinding, type Listed, NONE_LISTED, type PropDef } from '@inflozo/library'
import { FEED_KEY, feedQuery, isDesigned, untouchedWords, withData, type DocInstance, type ProjectDoc } from '@inflozo/section-runtime'
import { ghostName, RESERVED_SETTING_KEYS } from '@inflozo/section-runtime/custom-settings'
import { isRtl } from '@inflozo/library/languages'
import { FEEDLESS, SLOW_AFTER } from './data-group.ts'
import { placeOf, type PreflightFacts } from './deploy.ts'
import { CANVASES, canvasOfPageTwoKey, canvasOfTemplateKey, fileOf, isRouteCanvas, pageTwoKeyOf, SITE, templateKeyOf, type Canvas } from './editor.ts'
import { adminAt, askStopped, membersNotice } from './paywall.ts'
import type { Members } from './probe-rule.ts'
import { EVERY_PAGE, pageOf } from './theme-settings.ts'
import { ownName, siteLocaleDiffers, TRANSLATION_WORDS, untouchedRows } from './translations.ts'
import { ROWS, unviewed, type Viewed } from './view-as.ts'

/** What a section is read as here — a `SectionRegistryEntry` satisfies it. */
export type PreflightEntry = {
  name: string
  html: string
  contentSchema: Readonly<Record<string, PropDef>>
  dataBindings?: Readonly<Record<string, DataBinding>>
  bindingContext: readonly string[]
}

export type RowKind = 'rtl' | 'mismatch' | 'untouched' | 'members' | 'freeAsks' | 'dropped' | 'builtIn' | 'feedless' | 'picks' | 'unviewed'

/** One warning row, as S8b draws it: collapsed to its title, opened to its body and its list. `canvas` is "Fix in editor"'s
 *  target, on the row or on an item; `link` an address of Ghost's own, opened in a new tab. */
export type PreflightRow = {
  kind: RowKind
  title: string
  body?: string
  items: { text: string; canvas?: Canvas }[]
  canvas?: Canvas
  link?: { words: string; href: string }
}

export type PreflightInput = {
  /** the site's host, as every row names it */
  host: string
  /** the site's name as the Sites card names it (its title, else its host) — `membersNotice`'s sentences say it */
  siteName: string
  /** the site's address, for Ghost admin's links */
  siteUrl: string
  /** `sites.ghost_version` */
  siteVersion: string | null
  /** `site_settings.locale`, as stored */
  siteLocale: string | null
  /** `projects.language` and `rtl_ack_at` */
  language: string
  rtlAckAt: string | null
  /** this deploy's facts (`deploys.preflight`), and `config.custom` as the latest activated deploy to the site shipped it */
  facts: PreflightFacts | null
  previousCustom: Readonly<Record<string, unknown>> | null
  /** FR-H6's record of the member switches (`site_settings.members`), or null — no record warns nothing (R-4) */
  members: Members | null
  /** the editor's docs, by `template_key`, synthesised ones included */
  docs: Readonly<Record<string, ProjectDoc>>
  library: (designId: string) => PreflightEntry | undefined
  viewed: Viewed
  /** the Routes Manager templates' display names, by canvas (`namesOf`) */
  names: Readonly<Record<string, string>>
  postsPerPage: number
  listed?: Listed
  projectId: string
}

/** Every sentence a warning row says beyond the lists it borrows (the spec's Words, R-170). */
export const PREFLIGHT_WORDS = {
  mismatch: (locale: string, language: string) => `Your Ghost site's language is ${locale}, so visitors see the English wording, not your ${language} labels.`,
  members: (host: string) => `${host} can't take every sign-up your pages ask for`,
  membersItem: (layer: string, canvas: string) => `${layer} on ${canvas}`,
  membersLink: 'Change this in Ghost ↗',
  freeAsks: (host: string) => `Free sign-ups stay hidden on ${host}`,
  freeAsksBody: (version: string) =>
    `It runs Ghost ${version}, and only Ghost ${FREE_SINCE_SHOWN} or later tells a theme that free sign-ups are open. Update Ghost to show them.`,
  dropped: (n: number, host: string) => `Ghost will forget ${n} setting${n === 1 ? '' : 's'} on ${host}`,
  droppedBody: "This version no longer has them, so when it goes live Ghost deletes the value your site's owner chose for each.",
  builtIn: (label: string) => `${label}'s starting value changed`,
  builtInBody: (next: string, host: string, old: string) =>
    `This version starts it at ${next}, but ${host} keeps the value it already holds — ${old}, unless it was changed in Ghost.`,
  designPanel: "Open Ghost's Design panel ↗",
  feedless: (kind: 'Tag' | 'Author') => `${kind} page has no list of posts`,
  picks: (n: number) => `${n} page${n === 1 ? ' loads' : 's load'} more than ${SLOW_AFTER} hand-picked posts`,
  picksBody: 'Every pick is a database query on each visit, counting every hand-picked section the page shows, its header and footer included.',
  picksItem: (canvas: string, total: number) => `${canvas}: ${total} picks`,
  unviewed: 'Not viewed as every visitor',
  unviewedBody: 'These pages ship without anyone looking at them as each visitor. View as, at the top of the editor, shows each one.',
  unviewedItem: (canvas: string, visitors: readonly string[]) => `${canvas}: ${visitors.join(', ')}`,
} as const

/** FR-H6's free ask's flag and the first Ghost that carries it (`matrix.json`, F3) — read, never restated */
const FREE_SINCE = CONTEXT_MATRIX.universal[ASK_FLAGS.free]?.since ?? '5.62.0'
const [FREE_MAJOR, FREE_MINOR] = FREE_SINCE.split('.').map(Number) as [number, number]
const FREE_SINCE_SHOWN = `${FREE_MAJOR}.${FREE_MINOR}`

/** The two built-ins whose START a deploy can change (7.11's Question 2): the dark logo has none (Ghost forbids an image
 *  default). In `RESERVED_SETTING_KEYS`' order. */
const STARTED = RESERVED_SETTING_KEYS.filter((k) => k !== 'dark_logo')

/** A section's queries as the canvas renders them: its design's declared ones folded with its stored Data values
 *  (`withData`), and a secondary feed's own (`feedQuery`). Moved here from `editor.tsx`'s `queriesOf`, so the canvas and
 *  Pre-flight's pick count read one rule. */
export function queriesFor(design: Pick<PreflightEntry, 'dataBindings' | 'bindingContext'>, instance: DocInstance, target: string, postsPerPage: number, listed: Listed = NONE_LISTED): Record<string, DataBinding> {
  const feed = feedQuery(design, instance, target, postsPerPage, listed)
  return { ...withData(design.dataBindings, instance.data), ...(feed === undefined ? {} : { [FEED_KEY]: feed }) }
}

/** P0·5's count, per PAGE (routine call 7): every hand-picked id the canvas's visible sections read, and its header's and
 *  footer's — the site doc's lists load on that page too. A template surface (Paywall, Editor cards) has no site doc. */
export function picksOn(canvas: Canvas, docs: Readonly<Record<string, ProjectDoc>>, library: PreflightInput['library'], postsPerPage: number, listed: Listed = NONE_LISTED): number {
  const surface = !isRouteCanvas(canvas) && 'surface' in CANVASES[canvas]
  const pages: [ProjectDoc | undefined, string][] = [[docs[templateKeyOf(canvas)], fileOf(canvas)], ...(surface ? [] : [[docs[SITE.key], SITE.file] as [ProjectDoc | undefined, string]])]
  let n = 0
  for (const [doc, target] of pages) {
    for (const i of doc?.instances ?? []) {
      const design = library(i.designId)
      if (i.hidden || design === undefined) continue
      for (const q of Object.values(queriesFor(design, i, target, postsPerPage, listed))) n += q.ids?.length ?? 0
    }
  }
  return n
}

/** The canvases the compile shipped (`placeOf` over its files), in their order — Editor cards never one. */
export function shippedCanvases(templates: readonly string[], names: Readonly<Record<string, string>> = {}): Canvas[] {
  const out: Canvas[] = []
  for (const file of templates) {
    const canvas = placeOf(file, names)?.canvas ?? null
    if (canvas !== null && canvas !== 'cards' && !out.includes(canvas)) out.push(canvas)
  }
  return out
}

/** A stored key's canvas — the site doc's is Home's, a page 2's its page 1's. */
const canvasOfKey = (key: string): Canvas | null => (key === SITE.key ? 'home' : (canvasOfPageTwoKey(key) ?? canvasOfTemplateKey(key)))

/** `major.minor` of a stored version, or null for one that does not parse. */
const versionOf = (v: string | null): [number, number] | null => {
  const m = /^(\d+)\.(\d+)/.exec((v ?? '').trim())
  return m === null ? null : [Number(m[1]), Number(m[2])]
}

/** `config.custom[key].default`, as JSON prints a value. */
const startOf = (custom: Readonly<Record<string, unknown>> | null, key: string): string | undefined => {
  const d = (custom?.[key] as { default?: unknown } | undefined)?.default
  return d === undefined || d === null ? undefined : String(d)
}

/** THE ROWS, in routine call 13's order. */
export function preflightWarnings(f: PreflightInput): PreflightRow[] {
  const rows: PreflightRow[] = []
  const T = TRANSLATION_WORDS
  const W = PREFLIGHT_WORDS
  const facts = f.facts
  const shipped = facts === null ? null : shippedCanvases(facts.templates, f.names)
  const ships = (key: string) => {
    const canvas = canvasOfKey(key)
    return canvas !== null && shipped !== null && shipped.includes(canvas)
  }
  const pageName = (key: string) => {
    const page = pageOf(key, f.names).page
    return page === EVERY_PAGE ? T.everyPage : page
  }

  // RTL, acknowledged — B18's words and the date (the unacknowledged block is the server's)
  if (f.rtlAckAt !== null && isRtl(f.language)) rows.push({ kind: 'rtl', title: T.rtlTitle, body: `${T.rtlBody} ${T.acknowledged(f.rtlAckAt)}`, items: [] })

  // the locale: Ghost reads `locales/<its locale>.json` exactly, so a site set to another language shows the English
  if (siteLocaleDiffers(f.language, f.siteLocale)) {
    rows.push({ kind: 'mismatch', title: W.mismatch(f.siteLocale, ownName(f.language)), items: [], link: { words: T.changeIn(f.language), href: adminAt(f.siteUrl, 'publication-language') } })
  }

  // DW-145's Pre-flight half (7.12's Question 1): the same list Translations shows
  if (f.language !== 'en') {
    const untouched = untouchedRows(f.projectId, untouchedWords(f.docs, (id) => f.library(id)), f.names)
    if (untouched.length > 0) {
      rows.push({
        kind: 'untouched', title: T.untouchedTitle, body: T.untouchedLead,
        items: untouched.map((u) => ({ text: `${T.untouchedOn(u.layer, u.canvas)} ${T.quoted(u.words)}`, canvas: u.at })),
      })
    }
  }

  // FR-H6 (DW-260): every sentence the site's record gives, beside each placed section whose ask it stops, and the Paywall
  // (only over what the compile shipped: a deploy kept before its facts lists no page it cannot vouch for)
  const notice = membersNotice(f.members, f.siteName)
  if (notice.length > 0 && shipped !== null) {
    const items: PreflightRow['items'] = []
    for (const [key, doc] of orderedByPage(f.docs, f.names)) {
      if (!ships(key)) continue
      if (key === templateKeyOf('paywall')) {
        if (isDesigned(doc)) items.push({ text: CANVASES.paywall.label })
        continue
      }
      for (const i of doc.instances) {
        const entry = f.library(i.designId)
        if (i.hidden || entry === undefined || !askStopped(f.members, entry, i)) continue
        items.push({ text: W.membersItem(i.layerName.trim() || entry.name, pageName(key)) })
      }
    }
    if (items.length > 0) rows.push({ kind: 'members', title: W.members(f.host), body: notice.join(' '), items, link: { words: W.membersLink, href: adminAt(f.siteUrl, 'members') } })
  }

  // DW-297 (Question 2, R-268): the compile keeps a free ask behind `@site.allow_self_signup`, which Ghost below 5.62 lacks
  const version = versionOf(f.siteVersion)
  if (facts !== null && facts.freeAsks.length > 0 && version !== null && version[0] === FREE_MAJOR && version[1] < FREE_MINOR) {
    const items: PreflightRow['items'] = []
    for (const file of facts.freeAsks) {
      const at = placeOf(file, f.names)
      if (at === null || items.some((i) => i.text === at.label)) continue
      items.push({ text: at.label, ...(at.canvas === null ? {} : { canvas: at.canvas }) })
    }
    rows.push({ kind: 'freeAsks', title: W.freeAsks(f.host), body: W.freeAsksBody(`${version[0]}.${version[1]}`), items })
  }

  // 7.10's Question 2: a key the last activated deploy declared and this one does not — Ghost deletes its value at activation
  if (facts !== null && f.previousCustom !== null) {
    const now = facts.custom ?? {}
    const gone = Object.keys(f.previousCustom).filter((k) => !Object.hasOwn(now, k))
    if (gone.length > 0) rows.push({ kind: 'dropped', title: W.dropped(gone.length, f.host), body: W.droppedBody, items: gone.map((k) => ({ text: ghostName(k) })) })
    // 7.11's Question 2: a built-in whose start moved — Ghost keeps the value it already holds
    for (const key of STARTED) {
      const was = startOf(f.previousCustom, key)
      const next = startOf(facts.custom, key)
      if (was === undefined || next === undefined || was === next) continue
      rows.push({ kind: 'builtIn', title: W.builtIn(ghostName(key)), body: W.builtInBody(next, f.host, was), items: [], link: { words: W.designPanel, href: adminAt(f.siteUrl, 'design') } })
    }
  }

  // FR-H2 (DW-253): a Tag or Author page with no list of posts, as the guard read it
  if (facts !== null) {
    for (const [context, kind] of [['tag', 'Tag'], ['author', 'Author']] as const) {
      if (facts.noindex.includes(context)) rows.push({ kind: 'feedless', title: W.feedless(kind), body: FEEDLESS(kind), items: [], canvas: context })
    }
  }

  if (shipped !== null) {
    // FR-H2 (DW-253): more than P0·5's 25 picks on one page
    const heavy = shipped
      .map((c) => ({ canvas: c, total: picksOn(c, f.docs, f.library, f.postsPerPage, f.listed) }))
      .filter((p) => p.total > SLOW_AFTER)
    if (heavy.length > 0) {
      rows.push({ kind: 'picks', title: W.picks(heavy.length), body: W.picksBody, items: heavy.map((p) => ({ text: W.picksItem(pageName(templateKeyOf(p.canvas)), p.total), canvas: p.canvas })) })
    }
    // FR-D16: every shipped page — and its page 2 — whose record lacks a visitor; a page never opened lacks all three (routine call 8)
    const pages = shipped.flatMap((c) => [templateKeyOf(c), ...(pageTwoKeyOf(c) === null ? [] : [pageTwoKeyOf(c) as string])])
    const missing = pages
      .sort((a, b) => pageOf(a, f.names).rank - pageOf(b, f.names).rank)
      .map((key) => ({ key, visitors: unviewed(f.viewed[key] ?? []) }))
      .filter((p) => p.visitors.length > 0)
    if (missing.length > 0) {
      rows.push({
        kind: 'unviewed', title: W.unviewed, body: W.unviewedBody,
        items: missing.map((p) => ({ text: W.unviewedItem(pageName(p.key), p.visitors.map((v) => ROWS[v].title)), canvas: canvasOfKey(p.key) ?? 'home' })),
      })
    }
  }
  return rows
}

/** The docs in Theme settings' page order — the site doc, then each canvas with its page 2 after it. */
const orderedByPage = (docs: Readonly<Record<string, ProjectDoc>>, names: Readonly<Record<string, string>>): [string, ProjectDoc][] =>
  Object.entries(docs).sort(([a], [b]) => pageOf(a, names).rank - pageOf(b, names).rank)

/** The canvas "Fix in editor" opens from a collapsed row: its own, or its items' when they name one canvas alone. */
export const rowCanvas = (row: PreflightRow): Canvas | null => {
  if (row.canvas !== undefined) return row.canvas
  const all = [...new Set(row.items.flatMap((i) => (i.canvas === undefined ? [] : [i.canvas])))]
  return all.length === 1 ? (all[0] as Canvas) : null
}
