// AD-24's ONE TABLE for Ghost's theme checker (Story 7.7, FR-J6): gscan's report on a compiled theme in, a verdict a
// customer can read out. Core (AD-1): pure, no builtin, no clock — `gscan.ts` is the shell that runs the checker.
//
// The reachable shortlist (its spec's § Why the shortlist is these three — every other rule is held off by a check that
// already exists) is said in Inflozo's own sentences: GS110's page switch, `GS100`, and the `package.json` cascade. Every
// other rule is shown in the verbatim format — its code, gscan's rule, the files and messages, a docs link — which is what
// that format is for. Errors block and warnings deploy, after mapping; gscan's recommendations are not part of a verdict,
// because Ghost's own upload answer carries errors and warnings alone. Every field is plain text: gscan's HTML is
// stripped and its entities decoded, and since a message can quote the theme's source, a customer's words among it,
// Story 7.18 renders every field as text. A verdict is plain JSON (`deploys.gscan`, `deploy_jobs.error`), and each
// finding is assignable to `AdminEnvelope` as it stands.

export type Major = 5 | 6
/** What the compile hands the gate: path → text, or a font's bytes (`CompiledTheme['files']`). */
export type ThemeFiles = Readonly<Record<string, string | Uint8Array>>

/** AD-24's envelope (`AdminEnvelope`'s four fields), then gscan's. */
export interface Finding {
  code: string
  message: string
  detail?: string
  action?: string
  /** gscan's code; absent on `theme_check_failed` */
  rule?: string
  level: 'error' | 'warning'
  /** Ghost refuses the upload (422) on any fatal result */
  fatal: boolean
  /** gscan's refs: theme paths, or `styles` */
  refs: string[]
}
export interface Verdict { major: Major; gscan: string; blocked: boolean; errors: Finding[]; warnings: Finding[] }

/** gscan's results as data (`runGscan`'s answer): errors and warnings, recommendations dropped, HTML as gscan wrote it. */
export interface ReportResult {
  code: string
  level: 'error' | 'warning'
  fatal: boolean
  rule: string
  details: string
  failures: { ref: string; message?: string }[]
}
export interface GscanReport { gscan: string; results: ReportResult[] }

const PAGE_SWITCH = 'GS110-NO-MISSING-PAGE-BUILDER-USAGE'
const SETTING_UNUSED = 'GS100-NO-UNUSED-CUSTOM-THEME-SETTING'
const PARSE = 'GS010-PJ-PARSE'
/** gscan's own test for a visibility rule's key (`010-package-json.js:225`, the same file in both pinned checkers). A
 *  rule it does not match makes its `.map` read `null`, and the catch marks every `package.json` rule failed. */
const VISIBILITY_KEY = /[a-zA-Z_][a-zA-Z0-9_.]+:/
/** Ghost's theme docs root, as gscan 6.4.2's specs write it (`docsBaseUrl`, `lib/specs/v6.js:4`) — the fallback's link
 *  where a rule's details carry none. */
export const DOCS_ROOT = 'https://docs.ghost.org/themes/'
const OURS = 'This is ours to fix, not yours, and nothing was sent to your site.'

const ENTITIES: Readonly<Record<string, string>> = { nbsp: ' ', lt: '<', gt: '>', amp: '&', quot: '"', apos: "'" }
/** gscan's HTML as plain text: a `<br>` is a space, every other tag goes, entities decode once, whitespace collapses. */
export const plain = (html: string): string => html
  .replace(/<br\s*\/?>/gi, ' ')
  .replace(/<\/?[a-zA-Z][^>]*>/g, '')
  .replace(/&(#x[0-9a-fA-F]+|#\d+|[a-zA-Z]+);/g, (m, e: string) => (e[0] === '#'
    ? String.fromCodePoint(Number.parseInt(e[1] === 'x' || e[1] === 'X' ? e.slice(2) : e.slice(1), e[1] === 'x' || e[1] === 'X' ? 16 : 10))
    : ENTITIES[e.toLowerCase()] ?? m))
  .replace(/\s+/g, ' ')
  .trim()

const byCode = (a: string, b: string): number => (a < b ? -1 : a > b ? 1 : 0)
const refsOf = (r: ReportResult): string[] => [...new Set(r.failures.map((f) => f.ref))].sort(byCode)

/** The one table, row by row (Story 7.7's spec, § The one mapping). */
function pageSwitch(r: ReportResult, major: Major): Finding {
  // Question 1, ruled option 1 (owner, 2026-10-09): a warning on both majors, never blocking — Ghost 5's checker calls
  // it an error and installs the theme anyway, and the customer is told so
  return {
    code: 'page_switch_unused',
    message: 'The switch that hides a page\'s title and feature image does nothing on this site.',
    detail: `No page template shows a Post header, which is what the switch hides.${major === 5 ? ' Ghost 5\'s own theme check counts this as an error and installs the theme anyway.' : ''}`,
    action: 'To use the switch, add a Post header to your Page template.',
    rule: r.code, level: 'warning', fatal: r.fatal, refs: refsOf(r),
  }
}

function settingUnused(r: ReportResult): Finding {
  // each checker's own wording: 4.49.7 writes `Found unused variables: @custom.a, @custom.b`, 6.4.2 one
  // `config.custom.<k> is declared but never referenced from a template` per key
  const keys = [...new Set(r.failures.flatMap((f) => [...(f.message ?? '').matchAll(/(?:@custom|config\.custom)\.([A-Za-z0-9_]+)/g)].map((m) => m[1] as string)))].sort(byCode)
  return {
    code: 'setting_unused',
    message: `Theme settings declared but used nowhere on your site: ${keys.join(', ')}.`,
    detail: `Ghost refuses a theme setting no template reads. ${OURS}`,
    rule: r.code, level: 'error', fatal: r.fatal, refs: refsOf(r),
  }
}

function verbatim(r: ReportResult): Finding {
  const detail = r.failures.map((f) => (f.message === undefined || plain(f.message) === '' ? f.ref : `${f.ref}: ${plain(f.message)}`)).join('; ')
  const link = /\bhref=["']?([^"'\s>]+)/.exec(r.details)?.[1] ?? DOCS_ROOT
  return {
    code: 'theme_check_rule',
    message: `${r.code}: ${plain(r.rule)}`,
    ...(detail === '' ? {} : { detail }),
    action: `Ghost's guide: ${link}`,
    rule: r.code, level: r.level, fatal: r.fatal, refs: refsOf(r),
  }
}

/** THE CASCADE: an error `GS010-PJ-PARSE` while `package.json` parses. gscan's catch marked every `package.json` rule
 *  failed, so each `GS010-PJ-*` result is dropped and one finding per cause takes their place — each setting whose
 *  `visibility` is not a string, or names no key under gscan's own test. Every other family stays as reported. */
function cascade(parse: ReportResult, pkg: unknown): Finding[] {
  const custom = (pkg as { config?: { custom?: unknown } } | null)?.config?.custom
  const settings = custom !== null && typeof custom === 'object' ? Object.entries(custom as Record<string, unknown>) : []
  const causes = settings
    .map(([key, entry]) => [key, (entry as { visibility?: unknown } | null)?.visibility] as const)
    .filter(([, v]) => Boolean(v) && (typeof v !== 'string' || !VISIBILITY_KEY.test(v)))
    .sort(([a], [b]) => byCode(a, b))
  const base = { code: 'package_check_failed', rule: parse.code, level: 'error' as const, fatal: parse.fatal, refs: refsOf(parse) }
  if (causes.length === 0) {
    const said = plain(parse.failures.map((f) => f.message ?? '').join(' ')).replace(/\.$/, '')
    return [{
      ...base,
      message: 'Ghost\'s theme check failed while reading package.json, which is valid, so it reports every package.json rule as broken.',
      detail: `${said === '' ? 'gscan gave no reason' : said}. Those package.json errors are not real. ${OURS}`,
    }]
  }
  return causes.map(([key, v]) => ({
    ...base,
    message: `Ghost's theme check can't read when theme setting “${key}” should show, so it reports every package.json rule as broken.`,
    detail: `Its rule, “${typeof v === 'string' ? v : JSON.stringify(v)}”, must name a theme setting at least two characters long. Those package.json errors are not real. ${OURS}`,
  }))
}

/** `package.json` as parsed, or `undefined` when it is missing or does not parse (then GS010-PJ-PARSE is real). */
function parsedPackage(files: ThemeFiles): unknown {
  const raw = files['package.json']
  if (raw === undefined) return undefined
  try {
    return JSON.parse(typeof raw === 'string' ? raw : new TextDecoder().decode(raw)) as unknown
  } catch {
    return undefined
  }
}

const order = (a: Finding, b: Finding): number =>
  byCode(a.rule ?? '', b.rule ?? '') || byCode(a.refs[0] ?? '', b.refs[0] ?? '') || byCode(a.message, b.message)

/** gscan's report on `files`, mapped (AD-24). Errors block; warnings deploy. */
export function verdict(report: GscanReport, files: ThemeFiles, major: Major): Verdict {
  const parse = report.results.find((r) => r.code === PARSE && r.level === 'error')
  const pkg = parsedPackage(files)
  const cascaded = parse !== undefined && pkg !== undefined
  const findings: Finding[] = []
  for (const r of report.results) {
    if (cascaded && r.code.startsWith('GS010-PJ-')) continue
    findings.push(r.code === PAGE_SWITCH ? pageSwitch(r, major) : r.code === SETTING_UNUSED ? settingUnused(r) : verbatim(r))
  }
  if (cascaded) findings.push(...cascade(parse, pkg))
  const errors = findings.filter((f) => f.level === 'error').sort(order)
  return { major, gscan: report.gscan, blocked: errors.length > 0, errors, warnings: findings.filter((f) => f.level === 'warning').sort(order) }
}

/** The checker could not answer — it failed, a pin moved, or a path was refused. Never its exception's text: only a
 *  moved pin says more, naming both versions. */
export function failed(major: Major, gscan: string, moved?: { installed: string; pinned: string }): Verdict {
  return {
    major, gscan, blocked: true, warnings: [],
    errors: [{
      code: 'theme_check_failed',
      message: 'We couldn\'t check your theme, so nothing was sent to your site.',
      ...(moved === undefined ? {} : { detail: `gscan ${moved.installed} is installed where ${moved.pinned} is pinned.` }),
      action: 'Try again in a moment.',
      level: 'error', fatal: false, refs: [],
    }],
  }
}
