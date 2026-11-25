import { DEPLOY_WORDS, fileLabel, SNAPSHOT_WORDS, versionLabel } from './deploy.ts'

/**
 * STORY 7.21 — PRE-DEPLOY DRIFT DETECTION'S ONE RULE (FR-J16, R-287). Pure, like `lib/deploy.ts`: no import from `server/`, no
 * clock, no I/O — so the wizard, `server/deploy/run.ts`, the T1 recorder (`tools/probe/record-drift.mjs`) and `node --test`
 * (`drift.test.ts`) read one rule. The hash is Web Crypto's (`crypto.subtle`), the SHA-256 both Node and the browser hold.
 *
 * ONE HASH RULE ON BOTH SIDES. A content manifest is relative path → SHA-256 of the file's bytes — a text file's UTF-8 — with
 * every CR byte directly before an LF dropped, so a site that rewrote line endings has changed nothing. The same function runs
 * on text and binary files, and on Inflozo's files and the live theme's alike. ZIP BYTES ARE NEVER COMPARED: Ghost re-zips on
 * download (`theme-storage.js` `serve()`), so a byte comparison would cry drift on every deploy.
 *
 * THE FINGERPRINT NEVER ENTERS A FILE (FR-J1). It lives only in `deploys.content_manifest`: a section partial's layer id
 * (`CompiledTheme.sections`, handed out beside the files), else its path. The live theme carries none, so live files are matched
 * to the baseline by path and by content:
 *   - a layer RENAME shows no drift because of the BASELINE — it changes what Inflozo uploads next, never what is on the site;
 *   - the fingerprint NAMES the row: a changed partial is labelled with its layer's name today;
 *   - content identity drops a MOVED file: a removed and an added path with one hash are the same file.
 *
 * TWO MANIFESTS OR NO VERDICT. Drift is asserted only from a stored baseline manifest and a live manifest read in this run; any
 * failure on the live side is a cause (`DriftCause`) and the deploy goes on.
 */

/** One file of a deploy's content manifest. `layer` and `category` are a section partial's (its label's and its icon's). */
export type ManifestEntry = { sha256: string; fingerprint: string; layer?: string; category?: string }
/** `deploys.content_manifest`: relative path → the entry (SCHEMA.sql's comment names the shape) */
export type ContentManifest = Readonly<Record<string, ManifestEntry>>
/** A manifest as the comparison reads it — the live theme's has hashes alone */
export type Hashes = Readonly<Record<string, { sha256: string }>>

/** A file in the drift report: its path (shown in mono beneath), its label (never the raw path for a section partial), and a
 *  section partial's category (D3a's row icon, the Layers row's own) */
export type DriftFile = { path: string; label: string; category?: string }
/** Why the live theme could not be read (D3b). `declined` is `no_token` on a site whose Not now is recorded (R-278) */
export type DriftCause = 'no_token' | 'declined' | 'token_refused' | 'role' | 'missing' | 'unreachable' | 'unreadable'
export const DRIFT_CAUSES: readonly DriftCause[] = ['no_token', 'declined', 'token_refused', 'role', 'missing', 'unreachable', 'unreadable']
/** `stage_timings.drift`: the read in flight, D3c's pass (`since` = the baseline's version), D3a's three lists, or D3b's cause.
 *  `theme` is the bound name that was read — D3b's `missing` words, and the live copy's download name */
export type DriftRecord =
  | { kind: 'reading' }
  | { kind: 'clean'; since: number }
  | { kind: 'found'; since: number; theme: string; changed: DriftFile[]; added: DriftFile[]; removed: DriftFile[]; kept?: false }
  | { kind: 'unverified'; cause: DriftCause; theme: string; status?: number }

// ── the hash ────────────────────────────────────────────────────────────────────────────────────────────────────────

const CR = 0x0d
const LF = 0x0a

/** A file's bytes as both sides hash them: a string's UTF-8, then every CR directly before an LF dropped */
export function normalizedBytes(value: string | Uint8Array): Uint8Array {
  const bytes = typeof value === 'string' ? new TextEncoder().encode(value) : value
  let crs = 0
  for (let i = 0; i < bytes.length - 1; i++) if (bytes[i] === CR && bytes[i + 1] === LF) crs++
  if (crs === 0) return bytes
  const out = new Uint8Array(bytes.length - crs)
  let o = 0
  for (let i = 0; i < bytes.length; i++) {
    if (bytes[i] === CR && bytes[i + 1] === LF) continue
    out[o++] = bytes[i] as number
  }
  return out
}

/** SHA-256 in lowercase hex, through Web Crypto */
export async function sha256Hex(bytes: Uint8Array): Promise<string> {
  const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', bytes as BufferSource))
  return [...digest].map((b) => b.toString(16).padStart(2, '0')).join('')
}

const byCode = (a: string, b: string): number => (a < b ? -1 : a > b ? 1 : 0)

/** THE MANIFEST INFLOZO KEEPS for a compiled theme (`deploys.content_manifest`): every file the zip carries, its hash, and its
 *  fingerprint — a section partial's instance id (`sections`, the compiler's record beside the files), else its path */
export async function contentManifest(
  files: Readonly<Record<string, string | Uint8Array>>,
  sections: Readonly<Record<string, { id: string; layer: string; category: string }>>,
): Promise<Record<string, ManifestEntry>> {
  const out: Record<string, ManifestEntry> = {}
  for (const path of Object.keys(files).sort(byCode)) {
    const section = sections[path]
    out[path] = {
      sha256: await sha256Hex(normalizedBytes(files[path] as string | Uint8Array)),
      fingerprint: section?.id ?? path,
      ...(section === undefined ? {} : { layer: section.layer, category: section.category }),
    }
  }
  return out
}

/** THE LIVE THEME'S MANIFEST: its unzipped entries, hashed by the same rule — no fingerprint (FR-J1: none is in a file) */
export async function liveManifest(entries: Readonly<Record<string, Uint8Array>>): Promise<Record<string, { sha256: string }>> {
  const out: Record<string, { sha256: string }> = Object.create(null) // `__proto__` is a path like any other
  for (const path of Object.keys(entries).sort(byCode)) out[path] = { sha256: await sha256Hex(normalizedBytes(entries[path] as Uint8Array)) }
  return out
}

/** THE COMPARISON: the paths whose hash changed, the live paths the baseline lacks, the baseline paths the site lacks — each in
 *  code-unit path order — with a removed and an added path of ONE hash dropped as a pair (a move: identity is content) */
export function compareManifests(baseline: Hashes, live: Hashes): { changed: string[]; added: string[]; removed: string[] } {
  const changed = Object.keys(baseline).filter((p) => Object.hasOwn(live, p) && live[p]?.sha256 !== baseline[p]?.sha256).sort(byCode)
  let added = Object.keys(live).filter((p) => !Object.hasOwn(baseline, p)).sort(byCode)
  const removed: string[] = []
  for (const path of Object.keys(baseline).filter((p) => !Object.hasOwn(live, p)).sort(byCode)) {
    const twin = added.find((a) => live[a]?.sha256 === baseline[path]?.sha256)
    if (twin === undefined) removed.push(path)
    else added = added.filter((a) => a !== twin)
  }
  return { changed, added, removed }
}

// ── the labels ──────────────────────────────────────────────────────────────────────────────────────────────────────

const IMAGE = /\.(png|jpe?g|gif|webp|avif|svg|ico)$/i

/** A FILE'S NAME IN THE REPORT, never its raw path where it is a section partial (Design Notes' table): a partial by its layer's
 *  CURRENT name (`names.layers`, the read docs' instance id → name), else the name the manifest kept; a template by its canvas
 *  (`fileLabel`); every other file Inflozo wrote by its kind word; a file the site gained by the two "didn't write" labels */
export function labelOf(
  file: { path: string; entry?: ManifestEntry },
  kind: 'changed' | 'added' | 'removed',
  names: { layers?: Readonly<Record<string, string>>; canvases?: Readonly<Record<string, string>> } = {},
): string {
  const { path, entry } = file
  const L = DRIFT_WORDS.labels
  if (kind === 'added') return path.endsWith('.hbs') ? L.addedTemplate : L.addedFile
  if (path.startsWith('partials/sections/')) {
    const now = entry === undefined ? undefined : names.layers?.[entry.fingerprint]
    return (now !== undefined && now.trim() !== '' ? now : undefined) ?? entry?.layer ?? L.template
  }
  if (path === 'partials/content-cta.hbs') return fileLabel(path, names.canvases) ?? L.paywall
  if (path.startsWith('partials/') && path.endsWith('.hbs')) return L.shared
  if (path.endsWith('.hbs')) return fileLabel(path, names.canvases) ?? L.template
  if (path === 'package.json') return L.settings
  if (path === 'README.md') return L.readMe
  if (/^locales\/[^/]+\.json$/.test(path)) return L.translations
  if (/^LICEN[CS]E/i.test(path.split('/').at(-1) ?? '')) return L.licence
  if (path.endsWith('.css')) return L.stylesheet
  if (path.endsWith('.js')) return L.script
  if (path.endsWith('.woff2')) return L.font
  if (IMAGE.test(path)) return L.image
  return L.file
}

// ── every word (D3, `D3 The Drift Report.dc.html`) ──────────────────────────────────────────────────────────────────

/** "both" for two, then "all three" … "all ten"; numerals above (Design Notes) */
const ALL = ['both', 'all three', 'all four', 'all five', 'all six', 'all seven', 'all eight', 'all nine', 'all ten'] as const
/** D3a's foot's rule for what is replaced: "it" for one file, then `ALL`'s words — Story 7.23a's Roll back confirm says its own foot
 *  by the same rule (`HISTORY_WORDS.checkFoot`, R-291) */
export const replacedOf = (n: number): string => (n === 1 ? 'it' : (ALL[n - 2] ?? `all ${n}`))
/** D3a's foot's second sentence, said by the Roll back confirm's foot too */
export const KEEP_EDITS = 'Take a copy of the live theme first if you want to keep those edits.'
/** the sentence every D3b body ends on */
const ANYWAY = 'Shipping anyway.'

/** EVERY WORD D3 SAYS (R-170: one list), as the frame says them but where earlier rulings correct it — "this site" for D3b's "this
 *  project" (R-278) and Manage keys' "Add token" for "Add the token" (R-170). No count of designs or categories, and no digit but
 *  the number of files and a version handed in. */
export const DRIFT_WORDS = {
  // D3a — drift found, the deploy stops
  title: 'Something changed on your site since we last shipped.',
  body: "We compare what's live against what we put there. These files are different — someone edited the theme in Ghost, or another tool did.",
  row: 'Comparing with your live theme',
  chip: (n: number) => (n === 1 ? `${n} file differs` : `${n} files differ`),
  groups: { changed: 'Changed', added: 'Added on your site', removed: 'Removed from your site' },
  foot: (n: number) => `Shipping replaces ${replacedOf(n)} with Inflozo's version${n === 1 ? '' : 's'}. ${KEEP_EDITS}`,
  cancel: DEPLOY_WORDS.cancel,
  download: 'Download the live theme first',
  overwrite: 'Overwrite and ship anyway',
  shipping: DEPLOY_WORDS.shipping,
  // D3b — couldn't verify, the deploy proceeds
  unverified: "Couldn't check whether your live theme changed.",
  causes: {
    no_token: "We need a Staff Access Token from the site Owner or an Administrator to read the live theme, and this site doesn't have one.",
    declined: "You chose to ship without a Staff Access Token on this site, so Inflozo can't read the live theme.",
    // `SNAPSHOT_WORDS.tokenRefused`'s first clause — one sentence for one cause (R-170)
    token_refused: `${SNAPSHOT_WORDS.tokenRefused.split(',')[0]}.`,
    role: "The Staff Access Token stored for this site can't read themes — it needs the site Owner or an Administrator.",
    missing: (host: string, theme: string) => `${host} no longer has ${theme}, the theme Inflozo last put there.`,
    unreachable: (host: string, status?: number) => `${host} didn't hand over the live theme${status === undefined ? '' : ` (${status})`}.`,
    unreadable: (host: string) => `The live theme ${host} handed over couldn't be read.`,
  },
  anyway: ANYWAY,
  addToken: SNAPSHOT_WORDS.addToken,
  // D3c — no drift, one passing row among the others
  clean: (since: number) => `Nothing changed on your site since ${versionLabel(since)}`,
  // while the read runs
  reading: 'Comparing with your live theme…',
  /** Design Notes' labels — a file is never named by its raw path where it is a section partial. "Licence" and "Theme file" are
   *  extrapolated: the table names no kind for a family's licence or for a file of no listed kind */
  labels: {
    template: 'Template',
    paywall: 'Paywall',
    shared: 'Shared part of your sections',
    stylesheet: 'Stylesheet',
    script: 'Script',
    font: 'Font',
    image: 'Image',
    settings: 'Theme settings',
    translations: 'Translations',
    readMe: 'Read me',
    licence: 'Licence',
    file: 'Theme file',
    addedTemplate: "A template Inflozo didn't write",
    addedFile: "A file Inflozo didn't write",
  },
} as const

/** The causes D3b offers Add token on: the token is missing, refused or too weak — never on a recorded Not now (R-278: the decline
 *  is never raised again) and never where a token would change nothing */
export const ADDS_TOKEN: readonly DriftCause[] = ['no_token', 'token_refused', 'role']

/** The cause D3b shows: the record's, where a missing token on a site with a recorded decline is the decline's own words */
export const causeShown = (cause: DriftCause, declined: boolean): DriftCause => (cause === 'no_token' && declined ? 'declined' : cause)

/** D3b's sentence for a cause alone — the Roll back confirm's D3b row says it without Ship it's "Shipping anyway." (R-291) */
export function causeSentence(cause: DriftCause, ctx: { host: string; theme: string; status?: number }): string {
  const C = DRIFT_WORDS.causes
  return cause === 'missing' ? C.missing(ctx.host, ctx.theme)
    : cause === 'unreachable' ? C.unreachable(ctx.host, ctx.status)
    : cause === 'unreadable' ? C.unreadable(ctx.host)
    : C[cause]
}

/** D3b's body for a cause: its sentence, then "Shipping anyway." */
export const causeBody = (cause: DriftCause, ctx: { host: string; theme: string; status?: number }): string => `${causeSentence(cause, ctx)} ${ANYWAY}`

/** Every file the report names, in its three groups' order */
export const driftCount = (r: Extract<DriftRecord, { kind: 'found' }>): number => r.changed.length + r.added.length + r.removed.length

/** WHAT THE POLITE REGION SAYS for a record, once (UX-DR12): the read starting, D3c's line, D3a's title and count, or D3b's
 *  title and body */
export function driftSaid(record: DriftRecord, ctx: { host: string; declined?: boolean }): string {
  switch (record.kind) {
    case 'reading':
      return DRIFT_WORDS.reading
    case 'clean':
      return `${DRIFT_WORDS.clean(record.since)}.`
    case 'found':
      return `${DRIFT_WORDS.title} ${DRIFT_WORDS.chip(driftCount(record))}.`
    case 'unverified':
      return `${DRIFT_WORDS.unverified} ${causeBody(causeShown(record.cause, ctx.declined === true), { host: ctx.host, theme: record.theme, ...(record.status === undefined ? {} : { status: record.status }) })}`
  }
}

/** STORY 7.22 (DW-396) — THE LARGEST LIVE COPY KEPT: a found drift whose live zip is past this is not put (`kept: false` on its
 *  record) and D3a draws no Download; the Pre-flight goes on. It is the store's own limit: `deploy-artifacts`' `file_size_limit` is
 *  null (as on all four buckets), so the project's storage config governs — `fileSizeLimit` 52428800 bytes (50 MiB), read at Story
 *  7.22's Dev (2026-11-25, the owner's go) with `SUPABASE_ACCESS_TOKEN` from `GET /v1/projects/{ref}/config/storage`. A put past it
 *  was refused twice (`twice()`) and failed the job as ours. Raising it past the store's limit is the owner's call (Ask First).
 *  It is the PACKED zip's size; `server/deploy/zip.ts`' `LIVE_MAX_BYTES` caps the unpacked files and is separate */
export const LIVE_COPY_MAX_BYTES = 52_428_800

/** The live copy D3a's Download serves: one object per project × site in `deploy-artifacts`, overwritten by each found drift —
 *  bounded by construction, drained with the project's prefix at purge. Outside the version count and never listed (Story 7.22):
 *  the prune and the sweep touch only objects a `deploys` row names */
export const liveCopyPath = (projectId: string, siteId: string): string => `${projectId}/live/${siteId}.zip`
/** …its address in the app (`projects/[id]/deploy/live`), for the job that found it */
export const liveDownloadPath = (projectId: string, jobId: string): string => `/projects/${projectId}/deploy/live?job=${encodeURIComponent(jobId)}`
/** …and the name the browser saves it under */
export const liveFileName = (theme: string): string => `${theme}-live.zip`
/** STORY 7.23a (R-291) — THE CHECK BEFORE A ROLL BACK keeps its own live copy, one per project × site beside Ship it's and never Ship
 *  it's key: a Roll back's check must never replace the zip a resting D3a's Download serves (Story 7.22's DW-396 guarantee). Under
 *  `live/` with it, so the nightly sweep and the prune (which touch only objects a `deploys` row names) pass it by and the account
 *  purge drains it with the project's prefix */
export const historyCopyPath = (projectId: string, siteId: string): string => `${projectId}/live/${siteId}-history.zip`
/** …its address in the app (`projects/[id]/history/live`), named by the theme the check read */
export const historyLiveDownloadPath = (projectId: string, theme: string): string => `/projects/${projectId}/history/live?theme=${encodeURIComponent(theme)}`
