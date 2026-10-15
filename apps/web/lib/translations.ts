/* STORY 7.12 — TRANSLATIONS' WORDS AND THE RULES THAT ARE THE APP'S (FR-Q6, B18 as EXPERIENCE.md:747 re-specifies it).
 *
 * Ghost's own rules live in the library: the languages, their scripts and Ghost's code rule (`@inflozo/library/languages`),
 * and FR-Q8's judge of an override (`@inflozo/library/override`, server only — it carries intl-messageformat 5.4.3, which
 * never reaches a browser bundle). This file is what the page, its rail and its client read beside them, and it is
 * BROWSER-SAFE: no judge and no database here. The reads are `(editor)/read.ts`'s (`readTranslations`, `linkedSiteOf`), on
 * the server; every refusal sentence of an override is `OVERRIDE_WORDS`, beside its rule.
 *
 * Every sentence the surface prints is in ONE list (R-170), `TRANSLATION_WORDS`, and D6a's rail is `RAIL_WORDS`. */

import { languageLabel, type Script, SCRIPT_NAMES } from '@inflozo/library/languages'
import { canvasPath, canvasOfPageTwoKey, canvasOfTemplateKey, SITE } from './editor.ts'
import { EVERY_PAGE, pageOf } from './theme-settings.ts'

/** A language's own name, as its speakers write it — "Español", "Deutsch", "Русский", "日本語" — first letter raised (the
 *  CLDR names many in lower case), or Ghost's English label where the runtime knows no name for the code (`kz`). Computed on
 *  the server for the list the page draws, so the two renders never disagree; in the browser only for an Other… code. */
export function ownName(code: string): string {
  let name: string | undefined
  try {
    name = new Intl.DisplayNames([code], { type: 'language' }).of(code)
  } catch {
    name = undefined
  }
  if (name === undefined || name.toLowerCase() === code.toLowerCase()) return languageLabel(code)
  return name.charAt(0).toUpperCase() + name.slice(1)
}

/** One family's coverage of a script, as the runtime's `coverageOf` reports it: its roles in the pairing, its whole faces'
 *  bytes and its latin pair's. Declared here by shape, so the client never imports the font pool (DW-323). */
export type FamilyCoverage = { family: string; roles: readonly ('heading' | 'body')[]; bytes: number; latinBytes: number }
export type Coverage = { covered: readonly FamilyCoverage[]; uncovered: readonly FamilyCoverage[] }

const kb = (bytes: number) => Math.max(1, Math.round(bytes / 1000))
const roleWords = (roles: readonly ('heading' | 'body')[]) =>
  roles.includes('heading') && roles.includes('body') ? 'headings and text' : roles.includes('heading') ? 'headings' : 'text'

const DAY = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })

/** Every sentence Translations prints (R-170: one list). */
export const TRANSLATION_WORDS = {
  title: 'Translations',
  /** B18's sentence, verbatim (`B Missing Surfaces.dc.html:1774`), its folder name set in mono */
  lead: 'Every string your theme prints. English is the default; overrides ship in',
  folder: 'locales/',
  /** the scope (Boundaries' Never): Ghost's own surfaces carry Ghost's own translations */
  scope: "Portal, comments and search are Ghost's own, and use Ghost's translations rather than these.",
  language: 'Language',
  key: 'KEY',
  english: 'ENGLISH DEFAULT',
  /** B18's empty row (`:1792`), and its twin on an English project, where an empty row is the default itself */
  fallsBack: 'Falls back to English',
  usesDefault: 'Uses the default',
  save: 'Save',
  saving: 'Saving…',
  reset: 'Use the default',
  resetting: 'Resetting…',
  other: 'Other…',
  otherLabel: 'Language code',
  /** Appendix G's block — B18's title and its first two sentences; the last clause ("so we do not offer those locales…")
   *  contradicts FR-Q6, which offers an RTL language behind this acknowledgement (the spec's Design Notes) */
  rtlTitle: 'Right-to-left languages are not supported yet',
  rtlBody: 'Our designs are built left-to-right. Arabic, Hebrew and Farsi strings will translate, but the layouts will not mirror.',
  understood: 'Understood',
  acknowledged: (iso: string) => `You acknowledged this on ${DAY.format(new Date(iso))}.`,
  switchTitle: (next: string) => `Switch to ${next}?`,
  switchBody: (next: string, old: string) => `The labels you translated were written in ${old}. They stay, and ship in the ${next} file until you change them.`,
  cancel: 'Cancel',
  switch: 'Switch',
  switching: 'Switching…',
  /** the linked site's own language differs: Ghost reads `locales/<its locale>.json`, exactly */
  mismatch: (locale: string) => `Your Ghost site's language is ${locale}, so visitors see the English wording, not these.`,
  changeIn: (code: string) => `Change it to ${code} in Ghost ↗`,
  /** §D.b, at the moment of choice — per family and role, the whole faces' size from the pool's bytes */
  covers: (f: FamilyCoverage, script: Script) =>
    `${f.family} covers ${SCRIPT_NAMES[script]}: your theme ships its whole faces — about ${kb(f.bytes)} KB of fonts instead of ${kb(f.latinBytes)} KB.`,
  uncovered: (f: FamilyCoverage, script: Script, name: string) =>
    `${f.family} doesn't cover ${SCRIPT_NAMES[script]}, so your site shows ${name} ${roleWords(f.roles)} in each reader's own system font.`,
  /** Question 1, ruled option 1 (owner, 2026-10-15) */
  untouchedTitle: "Starting words you haven't retyped",
  untouchedLead: 'These came with your sections and stay as written until you change them on the canvas.',
  untouchedOn: (layer: string, canvas: string) => `${layer} on ${canvas}:`,
  quoted: (words: readonly string[]) => words.map((w) => `“${w}”`).join(' · '),
  edit: 'Edit',
  loading: 'Loading translations…',
} as const

/** D6a's rail (`D6 Theme Settings Completed.dc.html:41-48`): its first item named as the page is everywhere else (R-170;
 *  D6a's prose says "Site basics"), and — Question 2, ruled option 1 (owner, 2026-10-15) — Ghost's own three sections as
 *  links into the linked site's settings. */
export const RAIL_WORDS = {
  heading: 'SETTINGS',
  label: 'Settings',
  theme: 'Theme settings',
  translations: TRANSLATION_WORDS.title,
  navigation: 'Navigation ↗',
  social: 'Social accounts ↗',
  injection: 'Code injection ↗',
} as const

/** The caption under the language button for `script`: one sentence per family, the covering ones first; none for Latin. */
export const coverageWords = (coverage: Coverage | undefined, script: Script, name: string): string[] =>
  script === 'latin' || coverage === undefined
    ? []
    : [...coverage.covered.map((f) => TRANSLATION_WORDS.covers(f, script)), ...coverage.uncovered.map((f) => TRANSLATION_WORDS.uncovered(f, script, name))]

/** One "Starting words you haven't retyped" row, as the page draws it: the layer, the page it is on, its words, and where
 *  Edit opens — the canvas (a header or footer opens Home, a page 2 its page 1). */
export type UntouchedRow = { id: string; layer: string; canvas: string; words: readonly string[]; href: string }

/** `untouchedWords`' rows for the page, in `pageOf`'s order. */
export function untouchedRows(projectId: string, rows: readonly { key: string; instanceId: string; layer: string; words: readonly string[] }[]): UntouchedRow[] {
  return [...rows]
    .sort((a, b) => pageOf(a.key).rank - pageOf(b.key).rank)
    .map((r) => {
      const page = pageOf(r.key).page
      const canvas = r.key === SITE.key ? 'home' : (canvasOfPageTwoKey(r.key) ?? canvasOfTemplateKey(r.key) ?? 'home')
      return { id: `${r.key}:${r.instanceId}`, layer: r.layer, canvas: page === EVERY_PAGE ? 'every page' : page, words: r.words, href: canvasPath(projectId, canvas) }
    })
}

/** The mismatch notice's condition: a non-English project whose linked site's stored language exists and differs. */
export const siteLocaleDiffers = (language: string, siteLocale: unknown): siteLocale is string =>
  language !== 'en' && typeof siteLocale === 'string' && siteLocale.trim() !== '' && siteLocale !== language
