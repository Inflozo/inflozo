/**
 * STORY 7.18a — THE DEPLOY WIZARD'S ONE RULE (R-170: one module decides the stages, the rail, the version, the hash, every
 * answer and every sentence). Pure: no import from `server/`, no clock, no I/O — so the wizard's client bundle, the route,
 * `server/deploy/run.ts` and `node --test` (`deploy.test.ts`) read one rule. The hash is Web Crypto's (`crypto.subtle`),
 * the one SHA-256 both Node and the browser hold.
 *
 * AD-20 with F-075 (2026-09-03): Pre-flight and Ship it are TWO server calls on ONE `deploy_jobs` row — `queued → compiling
 * → checking → awaiting_ship`, then Ship it resumes the same row at `uploading → activating → done`. `deploy_jobs.stage` is
 * in-flight progress and `deploys.status` the durable outcome; the stage table below maps each to the wizard's step.
 *
 * AD-24: every failure is `{ code, message, detail?, action? }`, stored in `deploy_jobs.error`. `href` rides beside
 * `action` (the fix's address — an in-app path or Ghost's own page), as `Finding` rides `rule` and `refs`; Ghost's own text
 * is only ever `detail`, and is rendered as text.
 */

import type { Finding, QualityVerdict, Verdict } from '@inflozo/theme-compiler/gate'
import { refusalOf, type RefusalTag } from '@inflozo/theme-compiler/refusal'
import { SETTING_WORDS } from '@inflozo/section-runtime/custom-settings'
import {
  CANVASES, canvasPath, labelOf, routeCanvasOf, settingsPath, translationsPath, type Canvas, type CanvasKey,
} from './editor.ts'
import { hostOf, keysPath } from './connect-rule.ts'
import { sizeLabel } from './routes-upload.ts'
import { EVERY_PAGE } from './theme-settings.ts'
import { RAIL_WORDS } from './translations.ts'
import type { SwitchSite } from './site-switch.ts'

// ── the stages and the rail ─────────────────────────────────────────────────────────────────────────────────────────

/** `job_stage` (AD-20's F-075 adds `awaiting_ship`, Story 7.18a's Schema). */
export type Stage = 'queued' | 'compiling' | 'checking' | 'awaiting_ship' | 'uploading' | 'activating' | 'done' | 'failed' | 'cancelled'
/** `deploy_status`. */
export type DeployStatus = 'compiling' | 'checking' | 'uploaded' | 'live' | 'failed'

/** THE RAIL'S STEPS, in order — a list Stories 7.19 and 7.20 add their first-deploy steps to (the Safety net, the Backup),
 *  so the rail numbers itself from this and never from a literal. */
export const STEPS = [
  { id: 'destination', label: 'Destination' },
  { id: 'check', label: 'Check' },
  { id: 'ship', label: 'Ship' },
  { id: 'live', label: 'Live' },
] as const
export type Step = (typeof STEPS)[number]['id']

/** The stages a Cancel may stop (FR-J8, AD-20's F-075 — the policy `deploy_jobs_owner_cancel` holds the same three). */
export const CANCELLABLE: readonly Stage[] = ['queued', 'compiling', 'checking']
/** The stages the work is still moving through — the wizard polls while the job is in one. `awaiting_ship` rests. */
export const MOVING: readonly Stage[] = ['queued', 'compiling', 'checking', 'uploading', 'activating']
export const isMoving = (stage: Stage): boolean => MOVING.includes(stage)
/** The stages Esc cannot close the wizard in: once it starts, it finishes. */
export const UNSTOPPABLE: readonly Stage[] = ['uploading', 'activating']

/** What `stage_timings` holds: each stage's start and, once it ends, its duration; compiling records the zip's size, and
 *  Ship it's routes step its outcome (`RoutesEnding`) — NFR-9's structured deploy log, one object per job. */
export type Timing = { at: string; ms?: number; bytes?: number }
export type Timings = Partial<Record<Stage, Timing>> & { routes?: RoutesEnding }

/** THE STAGE → STEP MAP (the spec's stage table). A failure sits on Ship when it happened while shipping (S8d′), and on
 *  Check otherwise (a blocked Pre-flight); a cancelled job is back at Destination. */
export function stepOf(stage: Stage, timings: Timings = {}): Step {
  switch (stage) {
    case 'queued':
    case 'compiling':
    case 'checking':
    case 'awaiting_ship':
      return 'check'
    case 'uploading':
    case 'activating':
      return 'ship'
    case 'done':
      return 'live'
    case 'failed':
      return timings.uploading !== undefined ? 'ship' : 'check'
    case 'cancelled':
      return 'destination'
  }
}

/** The step's number on the rail, from 1, derived from `STEPS`. */
export const stepNumber = (step: Step): number => STEPS.findIndex((s) => s.id === step) + 1

/** The job's ending once it is `done`: Live (activated), D2e (activation asked for and not done) or D2f (Deploy only). */
export function endingOf(stage: Stage, deploy: { activated: boolean } | null, timings: Timings = {}): 'live' | 'notLive' | 'uploadOnly' | null {
  if (stage !== 'done' || deploy === null) return null
  if (deploy.activated) return 'live'
  return timings.activating !== undefined ? 'notLive' : 'uploadOnly'
}

// ── the theme's name and version ────────────────────────────────────────────────────────────────────────────────────

/** FR-J10's version: `{n}.0.0`, n being this project's uploads to this site plus one. */
export const versionOf = (n: number): string => `${n}.0.0`
/** …as the wizard shows it. */
export const versionLabel = (n: number): string => `v${n}`
/** `1.0.0` → 1, the number a stored version names; NaN for anything else. */
export const versionNumber = (version: string): number => (/^(\d+)\.0\.0$/.test(version) ? Number(version.split('.')[0]) : Number.NaN)
/** FR-J10 / AD-19: the theme's name, from the frozen `projects.slug` — and the zip's filename, which is what Ghost names a
 *  theme by (VERIFY 30). The collision suffix is Story 7.24's. */
export const themeNameOf = (slug: string): string => `inflozo-${slug}`

// ── the staleness hash ──────────────────────────────────────────────────────────────────────────────────────────────

/** Canonical JSON: object keys sorted at every depth, so a row read twice hashes alike whatever order Postgres returned
 *  its jsonb keys in (jsonb reorders them). `undefined` is dropped, as JSON drops it. */
export function canonical(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value) ?? 'null'
  if (Array.isArray(value)) return `[${value.map((v) => (v === undefined ? 'null' : canonical(v))).join(',')}]`
  const keys = Object.keys(value as object).filter((k) => (value as Record<string, unknown>)[k] !== undefined).sort()
  return `{${keys.map((k) => `${JSON.stringify(k)}:${canonical((value as Record<string, unknown>)[k])}`).join(',')}}`
}

/** THE STALENESS TEST (routine call 6): SHA-256 over the canonical JSON of every row the compile read, plus the release
 *  (`VERCEL_GIT_COMMIT_SHA` — a library, compiler or pack change arrives with a release). Ship it re-makes the artefact on
 *  the same row only when this moved. */
export async function inputsHash(reads: unknown, release: string): Promise<string> {
  const bytes = new TextEncoder().encode(`${canonical(reads)}\n${release}`)
  const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', bytes))
  return [...digest].map((b) => b.toString(16).padStart(2, '0')).join('')
}

// ── the envelope and the codes (AD-24) ──────────────────────────────────────────────────────────────────────────────

/** Every code a deploy stores (AD-24's new ones), beside a gate's own finding codes. */
export type DeployCode =
  | 'ghost_version_unsupported' | 'routes_invalid' | 'routes_unreadable' | 'compile_refused' | 'compile_failed'
  | 'deploy_infrastructure' | 'ghost_key_refused' | 'deploy_running' | 'ghost_theme_refused' | 'ghost_plan_refused'
  | 'ghost_unavailable' | 'ghost_unreachable' | 'ghost_redirected' | 'theme_too_large' | 'write_not_allowed' | 'site_not_found'
  // Story 7.18b: Ship it re-reads the project's link (DW-374, R-269), and an RTL language blocks until acknowledged (FR-Q6)
  | 'site_changed' | 'site_unlinked' | 'rtl_unacknowledged'

export type DeployError = { code: string; message: string; detail?: string; action?: string; href?: string }

// ── Ghost's answers ─────────────────────────────────────────────────────────────────────────────────────────────────

/** As much of the chokepoint's `CallResult` as the answers read. */
export type GhostAnswer = { ok: boolean; status: number; body: unknown; text: string }

const ghostError = (body: unknown): { type?: string; code?: string; message?: string; context?: string } | undefined => {
  const errors = (body as { errors?: unknown } | null)?.errors
  return Array.isArray(errors) ? (errors[0] as { type?: string; code?: string; message?: string }) : undefined
}

/** Ghost(Pro)'s plan refusal (routine call 12): the limit service's `HostLimitError` (`@tryghost/limit-service`'s
 *  `errors.js`, thrown by `customThemes`' `AllowlistLimit` on upload and on activate — both majors), read in source and
 *  never observed (F7: VERIFY 1–3). */
const isPlanRefusal = (answer: GhostAnswer): boolean => ghostError(answer.body)?.type === 'HostLimitError'
/** Too large (the budget is 7.29's): an HTTP 413 from the server in front of Ghost, or a limit code ending `_TOO_LARGE`. */
const isTooLarge = (answer: GhostAnswer): boolean =>
  answer.status === 413 || /_TOO_LARGE\b/.test(`${ghostError(answer.body)?.code ?? ''} ${ghostError(answer.body)?.type ?? ''}`)

/** Ghost's first message, the one piece of Ghost's text a deploy keeps — as `detail`, never `message`. */
export const ghostDetail = (answer: GhostAnswer): string | undefined => {
  const e = ghostError(answer.body)
  const text = [e?.message, e?.context].filter((t): t is string => typeof t === 'string' && t.trim() !== '').join(' ')
  return text === '' ? undefined : text.slice(0, 500)
}

/** HOW GHOST'S ANSWER TO `POST themes/upload/` READS (F2): 200 carries `themes[0]`; a fatal gscan result is a 422
 *  `ThemeValidationError` and a corrupt zip a 422 `ValidationError` — both ours, since our checks ran first; two concurrent
 *  uploads of one name give one 200 and one 500 `EEXIST … mkdir '/var/…'` (AD-24's signature — never shown); a 401 is the
 *  Admin key refused; the plan's refusal, a 413 or a `_TOO_LARGE` code, a 429/5xx, a 3xx. No failure leaves a half-applied
 *  theme (§25f). ponytail: any other 4xx reads as Ghost's own check refusing — the nearest of the spec's sentences. */
export function uploadAnswer(answer: GhostAnswer): { ok: true; theme: string | null; active: boolean } | { failed: DeployCode; detail?: string } {
  if (answer.ok) {
    const themes = (answer.body as { themes?: { name?: unknown; active?: unknown }[] } | null)?.themes
    const name = Array.isArray(themes) && typeof themes[0]?.name === 'string' ? themes[0].name : null
    // R-264 (b): Ghost replaced the ACTIVE theme's files and made them live at once (`storage.js`' `activateFromAPIOverride`
    // — 6.58.0 `:111-116`, 5.130.6 `:81-86`) and its answer says so; only an explicit `true` is live
    return { ok: true, theme: name, active: Array.isArray(themes) && themes[0]?.active === true }
  }
  if (answer.status === 401) return { failed: 'ghost_key_refused' }
  if (isPlanRefusal(answer)) return { failed: 'ghost_plan_refused' }
  if (isTooLarge(answer)) return { failed: 'theme_too_large' }
  if (answer.status >= 300 && answer.status < 400) return { failed: 'ghost_redirected' }
  if (answer.status >= 500 && /EEXIST/.test(answer.text)) return { failed: 'deploy_running' }
  if (answer.status === 429 || answer.status >= 500) return { failed: 'ghost_unavailable' }
  const detail = ghostDetail(answer)
  return { failed: 'ghost_theme_refused', ...(detail === undefined ? {} : { detail }) }
}

/** HOW GHOST'S ANSWER TO `PUT themes/{name}/activate/` READS: a 2xx is live; a 401 and the plan's refusal fail the job
 *  (S8d′); anything else leaves the theme on the site and not live — D2e, `uploaded`, nothing called failed (F3: a missing
 *  theme is a 422; the body of a successful activation is recorded by §86). */
export function activateAnswer(answer: GhostAnswer): { ok: true } | { failed: DeployCode } | { notLive: true; detail?: string } {
  if (answer.ok) return { ok: true }
  if (answer.status === 401) return { failed: 'ghost_key_refused' }
  if (isPlanRefusal(answer)) return { failed: 'ghost_plan_refused' }
  const detail = ghostDetail(answer)
  return { notLive: true, ...(detail === undefined ? {} : { detail }) }
}

/** A thrown chokepoint error, read by its code: no answer is Ghost unreachable, an off-list write is its own code (DW-54's
 *  denied row), and anything else — the store, a missing key, a bad address — is infrastructure, which AD-20 retries once. */
export function thrownCode(thrown: unknown): 'ghost_unreachable' | 'write_not_allowed' | 'deploy_infrastructure' {
  const e = thrown as { name?: string; code?: string } | null
  const code = e?.name === 'AdminError' ? e.code : undefined
  if (code === 'ghost_unreachable') return 'ghost_unreachable'
  if (code === 'write_not_allowed') return 'write_not_allowed'
  return 'deploy_infrastructure'
}

// ── every sentence (the spec's "Words") ─────────────────────────────────────────────────────────────────────────────

const s = (n: number) => (n === 1 ? '' : 's')

/** R-271 (owner, 2026-10-19, Question 5): R-260's check reads the site's NEWEST posts, this many at most, through a reader of
 *  its own — never the canvas's allowance. */
export const POSTS_CHECKED = 2000
/** …as its sentence prints it ("2,000"), locale-free (AD-1) */
const POSTS_CHECKED_WORDS = String(POSTS_CHECKED).replace(/\B(?=(\d{3})+(?!\d))/g, ',')

export const DEPLOY_WORDS = {
  // Ship it and the menu (S4, S4d)
  ship: 'Ship it',
  shipUpdate: 'Ship update',
  options: 'Deploy options',
  opening: 'Opening…',
  activate: 'Deploy & activate',
  activateCaption: (n: number) => `Ship ${versionLabel(n)} and make it live`,
  uploadOnly: 'Deploy only',
  uploadOnlyCaption: (n: number, prev: number | null) =>
    prev === null ? `Upload ${versionLabel(n)}, keep your current theme active` : `Upload ${versionLabel(n)}, keep ${versionLabel(prev)} active`,
  downloadRoutes: 'Download routes.yaml',
  /** R-264 (a): the reason in Deploy only's caption slot (the ▾ row's and S8a's card's) while it is greyed */
  uploadOnlyBlocked: (prev: number, host: string, n: number) =>
    `${versionLabel(prev)} is already live on ${host}, so Ghost would switch to ${versionLabel(n)} the moment it uploads. Use Deploy & activate.`,
  // D8g's words are `LOCK_COPY`'s (`lib/lock.ts`), beside the take-over they reuse — one list for the lock (R-170)
  // Destination
  header: 'Ship it',
  destination: 'Destination',
  connected: 'Connected',
  activateCard: (n: number) => `${versionLabel(n)} goes live the moment it's done.`,
  uploadOnlyCard: (n: number, prev: number | null) =>
    prev === null ? `Upload ${versionLabel(n)}, keep your current theme active for now.` : `Upload ${versionLabel(n)}, keep ${versionLabel(prev)} active for now.`,
  theme: 'Theme',
  chip: (n: number, prev: number | null) => (prev === null ? versionLabel(n) : `${versionLabel(prev)} → ${versionLabel(n)}`),
  runChecks: 'Run checks',
  starting: 'Starting…',
  noSite: "This project isn't linked to a connected Ghost site yet.",
  goToSites: 'Go to Sites',
  // Story 7.18b — Destination's way to another site (S8a `:54`), and to a first one (busy "Opening…", as Ship it's)
  switchSite: 'Switch',
  chooseSite: 'Choose a site',
  /** R-270 (DW-375): under B15's panel, for a site a refused upload marked Preview-only — Run checks stays */
  planRefused: (host: string) =>
    `Ghost(Pro) refused a custom theme on ${host} when you last shipped. If you've upgraded the plan since, run the checks and ship — Ghost's answer clears this.`,
  // Pre-flight (S8b)
  preflightTitle: 'Pre-flight check.',
  preflightBody: 'We compile and test everything before it touches your site.',
  compilingRow: 'Compiling your theme…',
  checkingRow: 'Checking your theme…',
  cancel: 'Cancel',
  cancelling: 'Cancelling…',
  compiled: 'Theme compiled',
  compiledMeta: (ms: number, bytes: number) => `${seconds(ms)}s · ${themeSize(bytes)}`,
  checked: 'Checking your theme (Ghost will love it)',
  checkedMeta: (e: number, w: number) => `${e} error${s(e)} · ${w} warning${s(w)}`,
  passMajor: (major: number) => `Ghost ${major}.x compatible`,
  passTemplates: (stems: readonly string[]) => `Required templates present (${stems.join(', ')})`,
  passHelpers: 'No deprecated helpers',
  pass: 'pass',
  fixInEditor: 'Fix in editor',
  routesValid: 'routes.yaml is valid',
  warningsOnly: "Warnings won't block your deploy.",
  back: 'Back',
  shipping: 'Shipping…',
  // R-260's row
  everyPostListed: 'Every post appears on Home or a collection',
  unlistedOne: (title: string) => `“${title}” appears on no page — not on Home, not in any collection. Its own address still works.`,
  unlistedMany: (titles: readonly string[]) => {
    const shown = titles.slice(0, 5)
    const more = titles.length - shown.length
    return `${titles.length} posts appear on no page — not on Home, not in any collection: ${shown.map((t) => `“${t}”`).join(', ')}${more > 0 ? `, and ${more} more` : ''}. Their own addresses still work.`
  },
  unlistedUnread: (host: string) => `We couldn't read your posts from ${host}, so we couldn't check that every one appears on a page.`,
  /** R-271 (DW-377): while the read is in flight, and the line after a result over the cap */
  postsReading: 'Checking that every post appears on a page…',
  postsCapped: `We checked your newest ${POSTS_CHECKED_WORDS} posts.`,
  // the caption under a greyed Ship it
  fixErrors: (e: number) => (e === 1 ? 'Fix the error above to ship.' : `Fix the ${e} errors above to ship.`),
  routesLine: (line: number, message: string) => `Line ${line}: ${message}`,
  routesBlocked: 'Deploys are blocked until routing is valid — the Ship button explains why.',
  routesUnreadable: "Your saved routing can't be read.",
  routesStartAgain: 'Start again on Routes & Templates',
  /** R-274 (owner, 2026-10-20): the one sentence for unsent work — Run checks' refusal and a switch's alike */
  editsUnsent: "Your latest edits haven't reached Inflozo yet. Try again once they're saved.",
  versionUnsupported: (host: string, version: string) => `Inflozo ships to Ghost 5 and 6. ${host} runs Ghost ${version}.`,
  // Story 7.18b — the RTL block (FR-Q6, a server verdict before compile): the caption under a greyed Ship it, and its way out
  rtlBlocked: 'Acknowledge it in Translations to ship.',
  openTranslations: 'Open Translations',
  // Story 7.18b — Ship it after the project's site changed (DW-374, R-269): nothing is sent, and both sites are named
  siteChanged: (now: string, was: string) => `This project now ships to ${now}, not ${was}, so nothing was sent. Go back and run the checks again.`,
  siteUnlinked: (was: string) => `This project is no longer linked to ${was}, so nothing was sent.`,
  // the compile's refusals in plain words (`refusalWords`)
  cardDesigns: "Your card designs can't be read, so the theme can't be built. Open Editor cards and change any card, or press Reset to Ghost default on one — that saves a readable copy.",
  openCards: 'Open Editor cards',
  unreadSetting: (setting: string, why: string) =>
    `${setting} is in Theme settings, but nothing on your site shows it any more — ${why}. Delete it in Theme settings, or put back what it controlled.`,
  whyUnpicked: 'its hand-picked list has nothing picked',
  whyNoPicture: 'its section has no picture to describe',
  whyShuffled: (section: string) => `${section} now uses a design where it works differently`,
  whyTwice: 'two settings were made for it at the same moment',
  translation: (label: string, sentence: string) => `The translation of "${label}" can't be used: ${sentence}. Fix it in Translations.`,
  language: (code: string) => `Your project's language "${code}" isn't one Ghost accepts. Choose it again in Translations.`,
  staleDesign: (layer: string, canvas: string) => `${layer} on ${canvas} uses a design Inflozo no longer has. Replace it, then ship.`,
  ourFault: "Something in Inflozo went wrong while building your theme. It's our fault, and nothing reached your site.",
  // Shipping (S8c)
  shippingTitle: (n: number) => `Shipping ${versionLabel(n)}…`,
  shippingBody: 'Usually under a minute.',
  uploadingRow: 'Uploading to Ghost',
  activatingRow: (n: number) => `Activating ${versionLabel(n)}`,
  checksPassed: (e: number) => `checks passed · ${e} error${s(e)}`,
  cannotCancel: 'Once it starts, it finishes',
  // Live (S8d)
  liveTitle: 'Live! Your site just got gorgeous.',
  liveChips: (n: number, e: number, w: number, ms: number) => [versionLabel(n), `${e} error${s(e)} · ${w} warning${s(w)}`, `${seconds(ms)}s`],
  viewSite: 'View site ↗',
  newTab: '(opens in a new tab)',
  done: 'Done',
  // routes at the ending
  routesLive: (host: string) => `Your routing is live on ${host}.`,
  routesUnverified: "Ghost took your routing, but we couldn't read it back to confirm it.",
  routesFailed: (reason: string) => `We couldn't send your routing to Ghost: ${reason}. Your theme is live; ship again to retry.`,
  // failure (S8d′)
  stageFailed: (stage: string) => `${stage} failed`,
  keyRefused: 'Ghost said no — this Admin API key no longer works.',
  keyRefusedBody: 'It was regenerated or removed in Ghost Admin. Paste the new key, then ship again.',
  reconnect: 'Reconnect site',
  running: 'Another deploy to this site is already running — try again in a moment.',
  ghostRefused: "Ghost's own theme check refused this theme, which our checks should have caught. It's our fault.",
  plan: "Your Ghost(Pro) plan doesn't accept custom themes — check or upgrade your plan (Publisher or higher).",
  plans: 'Which Ghost plans work? ↗',
  busy: (host: string) => `${host} is busy or down right now. Try again in a few minutes.`,
  unreachable: (host: string) => `We couldn't reach ${host}. Check it's online, then try again.`,
  moved: (host: string) => `${host} now answers at a different address. Reconnect it in Sites.`,
  tooBig: (host: string) => `Your theme is larger than ${host} accepts.`,
  infrastructure: 'Something went wrong on our side before anything reached your site. Try again.',
  close: 'Close',
  // D2e
  notLiveTitle: "Your theme is on your site but isn't live yet.",
  notLiveBody: (n: number, prev: number | null, host: string) =>
    `${versionLabel(n)} uploaded cleanly. Ghost didn't switch to it, so ${host} is still serving ${prev === null ? 'its current theme' : versionLabel(prev)} — nothing on your site changed.`,
  uploadedRow: (bytes: number, ms: number) => `Uploaded to Ghost · ${themeSize(bytes)} · ${seconds(ms)}s`,
  activatingDidnt: (n: number) => `Activating ${versionLabel(n)} · Didn't complete`,
  liveChip: (prev: number | null) => (prev === null ? null : `live: ${versionLabel(prev)}`),
  reactivate: (n: number) => `Re-activate ${versionLabel(n)}`,
  activating: 'Activating…',
  leave: 'Leave it for now',
  // D2f
  uploadOnlyTitle: 'Uploaded. Not live yet.',
  uploadOnlyBody: (n: number, prev: number | null, host: string) =>
    `${versionLabel(n)} is on ${host} and ${prev === null ? 'your current theme' : versionLabel(prev)} is still what readers see. Make it live whenever you are ready.`,
  activatingNotRequested: (n: number) => `Activating ${versionLabel(n)} · Not requested`,
  // announcements (one polite region)
  sayCompiling: 'Compiling your theme.',
  sayChecking: 'Checking your theme.',
  sayChecked: (e: number, w: number) => `Checks finished: ${e} error${s(e)}, ${w} warning${s(w)}.`,
  sayUploading: 'Uploading to Ghost.',
  sayActivating: (n: number) => `Activating ${versionLabel(n)}.`,
} as const

/** Ghost's own guide to which plans take custom themes (FR-C2's docs link; S8d′ draws the button and no address). */
export const GHOST_PLANS_HELP = 'https://ghost.org/pricing/'

/** A theme's size as the frames draw it ("2.4 MB"): bytes below a kilobyte, kilobytes to one place below a megabyte, else
 *  megabytes to one place — `sizeLabel`'s rule (`routes-upload.ts`, a `routes.yaml`'s "1.4 KB") stepped once more.
 *  Locale-free (AD-1). */
export const themeSize = (bytes: number): string => (bytes < 1024 * 1024 ? sizeLabel(bytes) : `${(bytes / (1024 * 1024)).toFixed(1)} MB`)

/** Seconds to one place, locale-free (AD-1). */
export const seconds = (ms: number): string => (Math.max(0, ms) / 1000).toFixed(1)

/** The failed stage's name in "{Stage} failed" — S8d′ names S8c's own row ("Uploading to Ghost failed", `S8 Deploy.dc.html`
 *  S8d′), and Pre-flight's rows their stage. */
export const STAGE_NAMES: Readonly<Record<'compiling' | 'checking' | 'uploading' | 'activating', string>> = {
  compiling: 'Compiling',
  checking: 'Checking',
  uploading: DEPLOY_WORDS.uploadingRow,
  activating: 'Activating',
}

/** THE SENTENCE AND THE FIX FOR EACH CODE THIS MODULE OWNS — AD-24's envelope as the wizard stores it. `host` is the site's
 *  host as the wizard names it (`hostOf`), `version` its `ghost_version`, `siteId` for Reconnect. */
export function deployError(code: DeployCode, ctx: { host: string; version?: string; siteId?: string; detail?: string; projectId?: string; to?: string }): DeployError {
  const { host } = ctx
  const with_ = (message: string, extra: Partial<DeployError> = {}): DeployError => ({ code, message, ...(ctx.detail === undefined ? {} : { detail: ctx.detail }), ...extra })
  switch (code) {
    case 'ghost_version_unsupported':
      return with_(DEPLOY_WORDS.versionUnsupported(host, ctx.version ?? 'an unknown version'))
    case 'ghost_key_refused':
      return with_(DEPLOY_WORDS.keyRefused, { detail: DEPLOY_WORDS.keyRefusedBody, action: DEPLOY_WORDS.reconnect, ...(ctx.siteId === undefined ? {} : { href: keysPath(ctx.siteId) }) })
    case 'deploy_running':
      return { code, message: DEPLOY_WORDS.running }
    case 'ghost_theme_refused':
      return with_(DEPLOY_WORDS.ghostRefused)
    case 'ghost_plan_refused':
      return { code, message: DEPLOY_WORDS.plan, action: DEPLOY_WORDS.plans, href: GHOST_PLANS_HELP }
    case 'ghost_unavailable':
      return { code, message: DEPLOY_WORDS.busy(host) }
    case 'ghost_unreachable':
      return { code, message: DEPLOY_WORDS.unreachable(host) }
    case 'ghost_redirected':
      return { code, message: DEPLOY_WORDS.moved(host), action: RAIL_SITES, href: '/sites' }
    case 'theme_too_large':
      return { code, message: DEPLOY_WORDS.tooBig(host) }
    case 'routes_unreadable':
      return { code, message: DEPLOY_WORDS.routesUnreadable, action: DEPLOY_WORDS.routesStartAgain }
    case 'rtl_unacknowledged':
      return { code, message: DEPLOY_WORDS.rtlBlocked, action: DEPLOY_WORDS.openTranslations, ...(ctx.projectId === undefined ? {} : { href: translationsPath(ctx.projectId) }) }
    case 'site_changed':
      return { code, message: DEPLOY_WORDS.siteChanged(ctx.to ?? '', host) }
    case 'site_unlinked':
      return { code, message: DEPLOY_WORDS.siteUnlinked(host) }
    // the off-list write (DW-54), a site that is no longer the caller's, and every infrastructure failure: ours
    default:
      return with_(DEPLOY_WORDS.infrastructure)
  }
}

/** The Sites screen's own name, for Moved's link (R-170: the shell's nav says it). */
const RAIL_SITES = 'Sites'

// ── the compile's refusals, in plain words (DW-353, DW-358) ─────────────────────────────────────────────────────────

/** WHAT A COMPILE REFUSAL SAYS (R-170): a customer-caused class (`REFUSAL`, tagged by the compile) in its plain words with
 *  its link; anything else is the "our fault" sentence, the compile's own message kept as `detail` FOR US — the wizard
 *  never shows a `compile_failed` detail. `english` is the catalog's English for a key (Translations shows it as the
 *  label), `names` the Routes Manager templates' display names. */
export function refusalWords(
  thrown: unknown,
  ctx: { projectId: string; names?: Readonly<Record<string, string>>; english?: (key: string) => string | undefined },
): DeployError {
  const tag: RefusalTag | null = refusalOf(thrown)
  const ours: DeployError = { code: 'compile_failed', message: DEPLOY_WORDS.ourFault, detail: String((thrown as Error | null)?.message ?? thrown).slice(0, 2000) }
  if (tag === null) return ours
  const p = tag.parts
  const refused = (message: string, action?: string, href?: string): DeployError =>
    ({ code: 'compile_refused', message, ...(action === undefined ? {} : { action }), ...(href === undefined ? {} : { href }) })
  const settings = settingsPath(ctx.projectId)
  const place = (file: string | undefined) => (file === undefined ? null : placeOf(file, ctx.names))
  switch (tag.kind) {
    case 'language':
      return refused(DEPLOY_WORDS.language(p['code'] ?? ''), RAIL_WORDS.translations, translationsPath(ctx.projectId))
    case 'translation': {
      const key = p['key'] ?? ''
      return refused(DEPLOY_WORDS.translation(ctx.english?.(key) ?? key, (p['sentence'] ?? '').replace(/\.$/, '')), RAIL_WORDS.translations, translationsPath(ctx.projectId))
    }
    case 'cardDesigns':
      return refused(DEPLOY_WORDS.cardDesigns, DEPLOY_WORDS.openCards, canvasPath(ctx.projectId, 'cards'))
    case 'settingCap':
      return refused(SETTING_WORDS.cap, RAIL_WORDS.theme, settings)
    case 'settingDeleted':
      return refused(SETTING_WORDS.deleted(p['setting'] ?? ''), RAIL_WORDS.theme, settings)
    case 'settingHidden':
      return refused(SETTING_WORDS.hidden(p['setting'] ?? ''), RAIL_WORDS.theme, settings)
    case 'settingChanged':
      return p['section'] === undefined
        ? refused(SETTING_WORDS.changed(p['setting'] ?? ''), RAIL_WORDS.theme, settings)
        : refused(DEPLOY_WORDS.unreadSetting(p['setting'] ?? '', DEPLOY_WORDS.whyShuffled(p['section'])), RAIL_WORDS.theme, settings)
    case 'settingUnread': {
      const why = p['why'] === 'twice' ? DEPLOY_WORDS.whyTwice : p['why'] === 'noPicture' ? DEPLOY_WORDS.whyNoPicture : DEPLOY_WORDS.whyUnpicked
      return refused(DEPLOY_WORDS.unreadSetting(p['setting'] ?? '', why), RAIL_WORDS.theme, settings)
    }
    case 'darkHook':
    case 'staleDesign': {
      // both on a canvas: said with its label, fixed in the editor on that canvas
      const where = place(p['file'])
      const message = tag.kind === 'darkHook'
        ? (where === null ? String((thrown as Error).message) : `${where.label}: ${String((thrown as Error).message)}`)
        : DEPLOY_WORDS.staleDesign(p['layer'] ?? '', where?.label ?? p['file'] ?? '')
      const canvas = where?.canvas ?? null
      return canvas === null ? refused(message) : refused(message, DEPLOY_WORDS.fixInEditor, canvasPath(ctx.projectId, canvas))
    }
  }
}

// ── a theme file, as the editor names it ────────────────────────────────────────────────────────────────────────────

/** A compiled file's place in the editor: its canvas label and the canvas "Fix in editor" opens, or null for a file no
 *  canvas makes (`package.json`, `screen.css`, a locale file, a shared partial). The site doc is "Every page" (Theme
 *  settings' word, R-170), opened on Home; Home's page 2 (`index.hbs`) is "Home page 2". */
export function placeOf(file: string, names: Readonly<Record<string, string>> = {}): { label: string; canvas: Canvas | null } | null {
  const section = /^partials\/sections\/([^/]+)\//.exec(file)
  const stem = section ? section[1] : null
  if (stem === 'shared') return null
  const own = stem === null ? file : stem === 'content-cta' ? 'partials/content-cta.hbs' : `${stem}.hbs`
  if (own === 'default.hbs') return { label: EVERY_PAGE, canvas: 'home' }
  if (own === 'index.hbs') return { label: `${CANVASES.home.label} page 2`, canvas: 'home' }
  const key = (Object.keys(CANVASES) as CanvasKey[]).find((k) => CANVASES[k].file === own)
  if (key !== undefined) return { label: labelOf(key), canvas: key }
  const route = routeCanvasOf(own)
  if (route !== null) return { label: labelOf(route, names), canvas: route }
  return null
}

/** `placeOf`'s label alone — refs[0] as the wizard names it, or null when it is no template. */
export const fileLabel = (file: string, names: Readonly<Record<string, string>> = {}): string | null => placeOf(file, names)?.label ?? null

// ── Pre-flight's rows ───────────────────────────────────────────────────────────────────────────────────────────────

/** The gate's code for a checker that could not run (`gate/verdict.ts`) — Inflozo's failure, never the theme's. */
export const CHECK_FAILED = 'theme_check_failed'

export type CheckRow = {
  level: 'error' | 'warning'
  code: string
  message: string
  detail?: string
  action?: string
  /** refs[0] by its canvas label, or null where refs[0] is no template */
  place: string | null
  /** the canvas "Fix in editor" opens, or null */
  canvas: Canvas | null
}

/** THE CHECKING ROW OVER BOTH GATES (7.7, 7.8): the counts, the three pass lines where they hold, and each finding as a row
 *  — errors first, gscan's before the quality gate's. `required` is `requiredTemplates(library)`. */
export function checkRows(
  verdicts: { gscan: Verdict | null; quality: QualityVerdict | null },
  major: number,
  required: readonly string[],
  names: Readonly<Record<string, string>> = {},
): { errors: number; warnings: number; passes: string[]; rows: CheckRow[]; blocked: boolean } {
  const g = verdicts.gscan
  const q = verdicts.quality
  const errors: Finding[] = [...(g?.errors ?? []), ...(q?.errors ?? [])]
  const warnings: Finding[] = [...(g?.warnings ?? []), ...(q?.warnings ?? [])]
  const all = [...errors, ...warnings]
  const passes: string[] = []
  // a checker that failed to run (`theme_check_failed`, the gate's own) checked nothing, so nothing passed
  const ran = g !== null && !all.some((f) => f.code === CHECK_FAILED)
  if (ran && g.errors.length === 0) passes.push(DEPLOY_WORDS.passMajor(major))
  if (ran && !all.some((f) => f.code === 'template_missing' || /^GS020-/.test(f.rule ?? ''))) {
    passes.push(DEPLOY_WORDS.passTemplates(required.map((f) => f.replace(/\.hbs$/, ''))))
  }
  if (ran && !all.some((f) => /^GS001-DEPR/.test(f.rule ?? ''))) passes.push(DEPLOY_WORDS.passHelpers)
  const rows = all.map((f): CheckRow => {
    const place = f.refs[0] === undefined ? null : placeOf(f.refs[0], names)
    return {
      level: f.level,
      code: f.code,
      message: f.message,
      ...(f.detail === undefined ? {} : { detail: f.detail }),
      ...(f.action === undefined ? {} : { action: f.action }),
      place: place?.label ?? null,
      canvas: place?.canvas ?? null,
    }
  })
  return { errors: errors.length, warnings: warnings.length, passes, rows, blocked: (g?.blocked ?? false) || (q?.blocked ?? false) }
}

// ── the wire: what the route takes and answers ──────────────────────────────────────────────────────────────────────

export type Mode = 'activate' | 'upload'
export const MODES: readonly Mode[] = ['activate', 'upload']
/** POST `projects/[id]/deploy`'s body. `session` is the tab's lock session (`lib/lock-client.ts`). */
export type DeployIntent = 'preflight' | 'ship' | 'activate' | 'cancel'
export const INTENTS: readonly DeployIntent[] = ['preflight', 'ship', 'activate', 'cancel']
export type DeployRequest = { intent: DeployIntent; session: string; job?: string; mode?: Mode }

/** Routes at the ending — `offerRoutes`' outcome, as the job keeps it (no file: B16 reads `routes_last_offered`). */
export type RoutesEnding =
  | { kind: 'live' }
  | { kind: 'unverified' }
  | { kind: 'fallback'; cause: 'no_token' | 'revoked' | 'role' }
  | { kind: 'failed'; reason: string }
  | { kind: 'none' }

/** WHAT THE EDITOR KNOWS BEFORE ANY JOB, as server truth (`shipStateOf`, below, over `read.ts`' reads): the linked site as Ship it ships to
 *  it, the theme's frozen name, the next version and the one the site serves from this project — for the bar's label, the
 *  ▾ menu's captions and Destination. */
export type ShipState = {
  /** the linked site, when it is CONNECTED (a disconnected one is no site to ship to — Destination says so). Story 7.18b —
   *  with `source` (`capability_source`: `deploy_error` keeps Run checks, R-270) and its stored Ghost `locale` (FR-Q6) */
  site: { id: string; host: string; url: string; version: string | null; capability: 'full' | 'preview_only'; source: string | null; locale: string | null } | null
  /** Story 7.18b — `projects.language` and `rtl_ack_at` (FR-Q6): the switch's language rule and Pre-flight's RTL and locale rows */
  language: string
  rtlAckAt: string | null
  /** `projects.linked_site_id` as stored — a disconnected site included, which `site` is not — so the picker plans a switch from
   *  the link the server reads (the Review, 2026-10-19), and whether the project holds translation overrides (R-134) */
  linkedSiteId: string | null
  overridden: boolean
  /** Story 7.18b — the user's CONNECTED sites, newest first as Sites lists them, each with the other project that links it —
   *  the picker's rows (`lib/site-switch.ts`) */
  sites: readonly SwitchSite[]
  /** the binding's frozen name, or `themeNameOf(slug)` before the first upload */
  themeName: string
  /** this project's uploads to this site plus one */
  n: number
  /** the version the site serves from this project (its last activated deploy), or null — "your current theme" */
  prev: number | null
  /** the project has an uploaded or live deploy to this site — the bar then reads "Ship update" */
  shipped: boolean
  /** R-264 (a): Inflozo's own record says this project's theme is the one live on the site — the site's latest activated
   *  deploy (any project's) is this project's — so a Deploy only would go live the moment it uploads */
  liveHere: boolean
  /** `requiredTemplates(library)`, for Checking's pass line */
  required: readonly string[]
}

/** STORY 7.18a — SHIP IT'S STATE FROM THE STORED ROWS (`ShipState`): the site only while it is connected; the theme's name
 *  the binding froze, else `themeNameOf(slug)`; n = this project's uploads to this site plus one; the version it serves =
 *  its last activated deploy's. A failed read is logged and counted as none — the next Pre-flight counts again on the
 *  server, which is the truth that ships.
 *
 *  STORY 7.18b — EXPORTED AND UNIT-TESTED (DW-378, `read.test.ts`), and it carries what choosing the site needs: the linked
 *  site's `capability_source` and stored Ghost `locale`, the project's language and RTL acknowledgement, and every CONNECTED
 *  site of the user's with the other project that links it (`heldBy`) — the picker's rows. A failed sites read is none, logged:
 *  the picker then offers only Go to Sites, and `switchSite` judges again on the server. */
export function shipStateOf(a: {
  projectId: string
  slug: string
  language: string
  rtlAckAt: string | null
  overridden: boolean
  sites: readonly { id?: unknown; title?: unknown; url?: unknown; capability?: unknown; capability_source?: unknown; site_settings?: unknown }[] | null
  linking: readonly { id?: unknown; name?: unknown; linked_site_id?: unknown }[] | null
  siteId: string | null
  site: { url?: unknown; ghost_version?: unknown; capability?: unknown; capability_source?: unknown; disconnected_at?: unknown; site_settings?: unknown } | null
  deploys: readonly { version: unknown; status: unknown; activated: unknown; activated_at: unknown }[] | null
  binding: { theme_name?: unknown } | null
  liveHere: boolean
  required: readonly string[]
}): ShipState {
  if (a.deploys === null) console.error('editorData: the deploys could not be read')
  if (a.sites === null || a.linking === null) console.error('editorData: the sites to choose from could not be read')
  const rows = a.deploys ?? []
  const url = typeof a.site?.url === 'string' ? a.site.url : ''
  const connected = a.siteId !== null && a.site !== null && (a.site.disconnected_at === null || a.site.disconnected_at === undefined) && url !== ''
  const activated = rows
    .filter((r) => r.activated === true && typeof r.activated_at === 'string')
    .sort((x, y) => (String(x.activated_at) < String(y.activated_at) ? 1 : -1))[0]
  const prev = activated === undefined ? NaN : versionNumber(String(activated.version))
  const localeOf = (settings: unknown): string | null => {
    const locale = (settings as { locale?: unknown } | null | undefined)?.locale
    return typeof locale === 'string' && locale.trim() !== '' ? locale : null
  }
  const linking = a.linking ?? []
  const sites: SwitchSite[] = (a.sites ?? []).flatMap((r) => {
    if (typeof r.id !== 'string' || typeof r.url !== 'string' || r.url === '') return []
    const holder = linking.find((p) => p.linked_site_id === r.id && p.id !== a.projectId)
    return [{
      id: r.id, title: typeof r.title === 'string' ? r.title : '', host: hostOf(r.url), url: r.url,
      capability: r.capability === 'preview_only' ? 'preview_only' : 'full',
      source: typeof r.capability_source === 'string' ? r.capability_source : null,
      locale: localeOf(r.site_settings),
      heldBy: holder === undefined || typeof holder.id !== 'string' ? null : { id: holder.id, name: typeof holder.name === 'string' ? holder.name : '' },
    }]
  })
  return {
    site: connected
      ? {
          id: a.siteId as string, host: hostOf(url), url, version: typeof a.site?.ghost_version === 'string' ? a.site.ghost_version : null,
          capability: a.site?.capability === 'preview_only' ? 'preview_only' : 'full',
          source: typeof a.site?.capability_source === 'string' ? a.site.capability_source : null,
          locale: localeOf(a.site?.site_settings),
        }
      : null,
    language: a.language,
    rtlAckAt: a.rtlAckAt,
    linkedSiteId: a.siteId,
    overridden: a.overridden,
    sites,
    themeName: typeof a.binding?.theme_name === 'string' ? a.binding.theme_name : themeNameOf(a.slug),
    n: rows.length + 1,
    prev: Number.isFinite(prev) ? prev : null,
    shipped: rows.length > 0,
    liveHere: connected && a.liveHere,
    required: [...a.required],
  }
}

/** R-264 (a) — DEPLOY ONLY'S GUARD, the one rule the ▾ row, S8a's card and the server ask: while Inflozo's own record says
 *  this project's theme is the one live on the site, an upload under its frozen name (AD-19) replaces the live theme's
 *  files and Ghost makes them live at once (VERIFY-AT-BUILD 74), so Deploy only could not keep v{prev} live. Answers the
 *  caption's sentence while greyed, or null while Deploy only is free (a first deploy, or the site showing another theme). */
export function uploadOnlyBlock(ship: Pick<ShipState, 'liveHere' | 'prev' | 'n' | 'site'> | null | undefined): string | null {
  if (!ship?.liveHere || ship.site === null) return null
  return DEPLOY_WORDS.uploadOnlyBlocked(ship.prev ?? Math.max(1, ship.n - 1), ship.site.host, ship.n)
}

/** STORY 7.18b — `deploys.preflight`: the facts Pre-flight's warning rows need that only the compile knows, kept per deploy so
 *  "since your last deploy" can compare (the column's comment names the shape). Rows are derived at read (`lib/preflight.ts`),
 *  so a word change needs no migration (routine call 12). */
export type PreflightFacts = {
  /** every `.hbs` file that ships, in code order */
  templates: readonly string[]
  /** `config.custom` as the emitted `package.json` carries it, or null when it declares none */
  custom: Readonly<Record<string, unknown>> | null
  /** FR-H2's guarded page-2 contexts (`CompiledTheme.noindex`) */
  noindex: readonly string[]
  /** the files that carry `@site.allow_self_signup` — a free member ask, synthesised asks included (DW-297) */
  freeAsks: readonly string[]
}

/** GET `projects/[id]/deploy?job=`'s answer: the job, its deploy and what the ending reads. */
export type DeployView = {
  job: { id: string; stage: Stage; error: DeployError | Finding | null; timings: Timings; cancelRequested: boolean }
  deploy: {
    version: string
    themeName: string
    status: DeployStatus
    activated: boolean
    bytes: number | null
    gscan: Verdict | null
    quality: QualityVerdict | null
    /** Story 7.18b — the facts only the compile knows (`deploys.preflight`), or null on a deploy made before them */
    preflight: PreflightFacts | null
  } | null
  /** the version the site is serving from this project (its last activated deploy), or null — "your current theme" */
  previous: number | null
  /** Story 7.18b — `config.custom` as this project's latest ACTIVATED deploy to the job's site shipped it (Ghost syncs a
   *  theme's settings at activation, F2), or null: no such deploy, or one made before its facts were kept */
  previousCustom: Readonly<Record<string, unknown>> | null
  /** B16's file, `sites.routes_last_offered`, when the ending is a fallback */
  routesFile: string | null
}

/** Routes' failure reason in the ending's line, per `RoutesFailure` code — Ghost's answer said plainly. The seven are the
 *  owner's approved words (R-265, 2026-10-19, Story 7.18a's Review): the failure screen's own words for the same causes. */
export const ROUTES_REASONS: Readonly<Record<string, string>> = {
  ghost_refused: 'Ghost refused the file',
  ghost_unavailable: 'your site is busy or down',
  ghost_unreachable: "your site didn't answer",
  ghost_redirected: 'your site now answers at a different address',
  routes_invalid: "the routing isn't valid",
  site_not_found: 'the site is no longer connected',
  thrown: 'something went wrong on our side',
}
