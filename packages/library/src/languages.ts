// Story 7.12 — FR-Q6's languages: Ghost's own list, Ghost's own rule for a code it does not list, and the script each
// language writes in. ONE list and ONE rule, read by the Translations page, the compiler and the first link alike.
//
// THE LIST IS GHOST'S. Ghost 6.58.0's admin offers Publication Language from the array `fs` of `{code,label}` in
// `core/built/admin/assets/settings-KSWWQanQ.js` (read in source 2026-10-15; the bundle's own text is pinned in
// `../fixtures/ghost-locale/admin-6.58.0.json`'s `languages`, which `languages.test.ts` holds this list equal to), plus
// "Other...", a free code checked by the `ms` validator beside it (pinned in the same fixture's `validator` and run against
// this port).
// Ghost 5.130.6's admin is a free-text field. Ghost's server accepts any non-empty `locale`
// (`default-settings.json`), and its theme i18n reads `locales/<that setting>.json` with NO normalisation
// (`core/frontend/services/theme-engine/i18n/i18n.js:187-199`, both majors) — so a code is stored and emitted exactly,
// case included: `pt-BR` needs `pt-BR.json`, and `de-DE` never reads `de.json`.
//
// Pure under AD-1: no `Intl` here (the language's own name is the app's, `Intl.DisplayNames`, with `label` the fallback).

/** Ghost 6.58.0's Publication Language list, in its order, with its English labels. */
export const LANGUAGES: readonly { readonly code: string; readonly label: string }[] = [
  { code: 'af', label: 'Afrikaans' }, { code: 'ar', label: 'Arabic' }, { code: 'bg', label: 'Bulgarian' },
  { code: 'bn', label: 'Bengali' }, { code: 'bs', label: 'Bosnian' }, { code: 'ca', label: 'Catalan' },
  { code: 'cs', label: 'Czech' }, { code: 'da', label: 'Danish' }, { code: 'de', label: 'German' },
  { code: 'de-CH', label: 'Swiss German' }, { code: 'el', label: 'Greek' }, { code: 'en', label: 'English' },
  { code: 'eo', label: 'Esperanto' }, { code: 'es', label: 'Spanish' }, { code: 'et', label: 'Estonian' },
  { code: 'eu', label: 'Basque' }, { code: 'fa', label: 'Persian/Farsi' }, { code: 'fi', label: 'Finnish' },
  { code: 'fr', label: 'French' }, { code: 'gd', label: 'Gaelic (Scottish)' }, { code: 'he', label: 'Hebrew' },
  { code: 'hi', label: 'Hindi' }, { code: 'hr', label: 'Croatian' }, { code: 'hu', label: 'Hungarian' },
  { code: 'id', label: 'Indonesian' }, { code: 'is', label: 'Icelandic' }, { code: 'it', label: 'Italian' },
  { code: 'ja', label: 'Japanese' }, { code: 'ko', label: 'Korean' }, { code: 'kz', label: 'Kazakh' },
  { code: 'lt', label: 'Lithuanian' }, { code: 'lv', label: 'Latvian' }, { code: 'mk', label: 'Macedonian' },
  { code: 'mn', label: 'Mongolian' }, { code: 'ms', label: 'Malay' }, { code: 'nb', label: 'Norwegian Bokmål' },
  { code: 'ne', label: 'Nepali' }, { code: 'nl', label: 'Dutch' }, { code: 'nn', label: 'Norwegian Nynorsk' },
  { code: 'pa', label: 'Punjabi' }, { code: 'pl', label: 'Polish' }, { code: 'pt', label: 'Portuguese' },
  { code: 'pt-BR', label: 'Portuguese (Brazil)' }, { code: 'ro', label: 'Romanian' }, { code: 'ru', label: 'Russian' },
  { code: 'si', label: 'Sinhala' }, { code: 'sk', label: 'Slovak' }, { code: 'sl', label: 'Slovenian' },
  { code: 'sq', label: 'Albanian' }, { code: 'sr', label: 'Serbian' }, { code: 'sr-Cyrl', label: 'Serbian (Cyrillic)' },
  { code: 'sv', label: 'Swedish' }, { code: 'sw', label: 'Swahili' }, { code: 'ta', label: 'Tamil' },
  { code: 'th', label: 'Thai' }, { code: 'tr', label: 'Turkish' }, { code: 'uk', label: 'Ukrainian' },
  { code: 'ur', label: 'Urdu' }, { code: 'uz', label: 'Uzbek' }, { code: 'vi', label: 'Vietnamese' },
  { code: 'zh', label: 'Chinese' }, { code: 'zh-Hant', label: 'Traditional Chinese' },
]

/** The language a project starts in and falls back to. */
export const DEFAULT_LANGUAGE = 'en'

/** Ghost's English label for a listed code, else the code itself. */
export const languageLabel = (code: string): string => LANGUAGES.find((l) => l.code === code)?.label ?? code

/** The one sentence a refused code gets (the Other… field's caption, and the action's answer). */
export const LANGUAGE_REFUSAL = 'Enter a language code like pt-BR or sr-Cyrl.'

// Ghost 6.58.0's `ps`: the grandfathered tags its validator accepts whole.
const GRANDFATHERED = new Set(
  'en-gb-oed.i-ami.i-bnn.i-default.i-enochian.i-hak.i-klingon.i-lux.i-mingo.i-navajo.i-pwn.i-tao.i-tay.i-tsu.sgn-be-fr.sgn-be-nl.sgn-ch-de.art-lojban.cel-gaulish.no-bok.no-nyn.zh-guoyu.zh-hakka.zh-min.zh-min-nan.zh-xiang'.split('.'),
)
// the words Ghost's validator refuses as a subtag, so "english" is never a code
const WORDS = ['english', 'french', 'spanish', 'german', 'italian', 'chinese', 'japanese', 'korean', 'russian', 'arabic', 'united', 'states', 'kingdom', 'traditional', 'simplified']

/** Ghost 6.58.0's `ms` rule, ported line for line (`languages.test.ts` runs Ghost's own text beside it): true when Ghost's
 *  admin accepts the trimmed code. */
function ghostAccepts(code: string): boolean {
  const n = code.trim()
  if (n === '') return false
  if (GRANDFATHERED.has(n.toLowerCase())) return true
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/i.test(n)) return false
  const r = n.split('-')
  if ((r[0] as string).toLowerCase() === 'x') {
    if (r.length < 2) return false
    for (let e = 1; e < r.length; e++) if ((r[e] as string).length < 1 || (r[e] as string).length > 8) return false
    return true
  }
  let i = 0
  if (!/^[a-z]{2,3}$/i.test(r[i] as string)) return false
  i += 1
  if (i < r.length && /^[a-z]{4}$/i.test(r[i] as string)) i += 1
  if (i < r.length && /^([a-z]{2}|[0-9]{3})$/i.test(r[i] as string)) i += 1
  while (i < r.length && /^([a-z0-9]{5,8}|[0-9][a-z0-9]{3})$/i.test(r[i] as string)) i += 1
  while (i < r.length && /^[0-9a-wy-z]$/i.test(r[i] as string)) {
    i += 1
    if (i >= r.length || !/^[a-z0-9]{2,8}$/i.test(r[i] as string)) return false
    for (i += 1; i < r.length && /^[a-z0-9]{2,8}$/i.test(r[i] as string);) i += 1
  }
  if (i < r.length && (r[i] as string).toLowerCase() === 'x') {
    i += 1
    if (i >= r.length) return false
    for (; i < r.length; i++) if (!/^[a-z0-9]+$/i.test(r[i] as string)) return false
  }
  if (i !== r.length) return false
  const o = r.findIndex((e) => e.toLowerCase() === 'x')
  for (let e = 0; e < r.length; e++) {
    const s = r[e] as string
    if (!['i', 'x', 'sgn', 'art', 'cel', 'no', 'zh'].includes(s.toLowerCase()) && !(o !== -1 && e > o) && (s.length > 16 || WORDS.includes(s.toLowerCase()))) return false
  }
  return true
}

/** A code Inflozo stores and names a locale file after, or the sentence refusing it. Ghost's own rule, and — because the
 *  code is stored and emitted exactly — never a code with space around it. Every accepted code is `[A-Za-z0-9-]` only,
 *  so no `/`, `\` or `.` ever reaches `locales/<code>.json` (AD-36). */
export function languageRefusal(code: unknown): string | null {
  if (typeof code !== 'string' || code !== code.trim() || !ghostAccepts(code)) return LANGUAGE_REFUSAL
  return null
}

/** google/fonts' own subset names (`METADATA.pb`'s `subsets`), which is how a family declares the scripts it covers. */
export type Script =
  | 'latin' | 'vietnamese' | 'cyrillic' | 'greek' | 'arabic' | 'hebrew' | 'devanagari' | 'bengali' | 'gurmukhi' | 'tamil'
  | 'sinhala' | 'thai' | 'japanese' | 'korean' | 'chinese-simplified' | 'chinese-traditional' | 'thaana' | 'syriac' | 'nko' | 'adlam'

/** Each script's name in a sentence ("Inter covers Cyrillic"). */
export const SCRIPT_NAMES: Readonly<Record<Script, string>> = {
  latin: 'Latin', vietnamese: 'Vietnamese', cyrillic: 'Cyrillic', greek: 'Greek', arabic: 'Arabic', hebrew: 'Hebrew',
  devanagari: 'Devanagari', bengali: 'Bengali', gurmukhi: 'Gurmukhi', tamil: 'Tamil', sinhala: 'Sinhala', thai: 'Thai',
  japanese: 'Japanese', korean: 'Korean', 'chinese-simplified': 'Chinese', 'chinese-traditional': 'Traditional Chinese',
  thaana: 'Thaana', syriac: 'Syriac', nko: "N'Ko", adlam: 'Adlam',
}

// An explicit script subtag (ISO 15924) → the script.
const SUBTAG_SCRIPT: Readonly<Record<string, Script>> = {
  latn: 'latin', cyrl: 'cyrillic', grek: 'greek', arab: 'arabic', hebr: 'hebrew', deva: 'devanagari', beng: 'bengali',
  guru: 'gurmukhi', taml: 'tamil', sinh: 'sinhala', thai: 'thai', jpan: 'japanese', kore: 'korean', hans: 'chinese-simplified',
  hant: 'chinese-traditional', thaa: 'thaana', syrc: 'syriac', nkoo: 'nko', adlm: 'adlam',
}

// A primary subtag's default script, where it is not Latin. Ghost's list first, then the right-to-left languages an
// Other… code is likeliest to name. Serbian is Latin (Ghost lists "Serbian" and "Serbian (Cyrillic)" apart), and
// Vietnamese is its own: its tone-marked letters sit outside `latin-ext`, in google/fonts' `vietnamese` subset.
const PRIMARY_SCRIPT: Readonly<Record<string, Script>> = {
  ar: 'arabic', fa: 'arabic', ur: 'arabic', ps: 'arabic', sd: 'arabic', ckb: 'arabic', ug: 'arabic', prs: 'arabic', ks: 'arabic',
  bal: 'arabic', azb: 'arabic',
  he: 'hebrew', yi: 'hebrew',
  dv: 'thaana', syr: 'syriac', nqo: 'nko',
  bg: 'cyrillic', kz: 'cyrillic', kk: 'cyrillic', mk: 'cyrillic', mn: 'cyrillic', ru: 'cyrillic', uk: 'cyrillic', be: 'cyrillic',
  el: 'greek',
  hi: 'devanagari', ne: 'devanagari', mr: 'devanagari', bn: 'bengali', pa: 'gurmukhi', ta: 'tamil', si: 'sinhala', th: 'thai',
  ja: 'japanese', ko: 'korean', zh: 'chinese-simplified',
  vi: 'vietnamese',
}

// Chinese written in Taiwan, Hong Kong and Macau is Traditional when the code names the region and no script (`zh-TW`)
const TRADITIONAL_REGIONS = new Set(['tw', 'hk', 'mo'])

/** The script a language writes in: an explicit script subtag first (`sr-Cyrl`, `zh-Hant` — the subtag right after the
 *  language, where Ghost's rule puts it, so a private-use `en-x-arab` is not one), then Chinese's Traditional regions, else
 *  the primary subtag's default, else Latin. */
export function scriptOf(code: string): Script {
  const [primary = '', second = ''] = code.toLowerCase().split('-')
  if (second.length === 4 && Object.hasOwn(SUBTAG_SCRIPT, second)) return SUBTAG_SCRIPT[second] as Script
  if (primary === 'zh' && TRADITIONAL_REGIONS.has(second)) return 'chinese-traditional'
  return Object.hasOwn(PRIMARY_SCRIPT, primary) ? (PRIMARY_SCRIPT[primary] as Script) : 'latin'
}

const RTL_SCRIPTS: ReadonlySet<Script> = new Set(['arabic', 'hebrew', 'thaana', 'syriac', 'nko', 'adlam'])

/** Appendix G: a right-to-left script. Inflozo mirrors nothing and emits no `dir` — the choice needs the owner's
 *  acknowledgement (`projects.rtl_ack_at`). */
export const isRtl = (code: string): boolean => RTL_SCRIPTS.has(scriptOf(code))

/** A project first linked to a site takes that site's Ghost locale, exactly, when it is a code Inflozo accepts; else `en`. */
export const languageAtLink = (siteLocale: unknown): string =>
  typeof siteLocale === 'string' && languageRefusal(siteLocale) === null ? siteLocale : DEFAULT_LANGUAGE
