import { THEME_MARKER } from '@inflozo/theme-compiler'
import { BACKUP_WORDS, DEPLOY_WORDS, SNAPSHOT_STORAGE, SNAPSHOT_WORDS, type SnapshotCode } from '../lib/deploy.ts'
import { SNAPSHOT_BUCKET, snapshotObjectKey } from '../app/(app)/app/(authed)/account/deletion-rule.ts'

/**
 * STORY 7.20a — THE ONE CAPTURE (FR-J13): the theme live on a site, archived on the site's own record before Inflozo replaces it.
 * Two callers and one rule: the Backup step's Theme Download (`downloadLiveTheme`, `(editor)/actions.ts`) and `ship()` at the
 * site's first upload (`server/deploy/run.ts`, through `deploy-io.ts`' `snapshot` member). `io` is HANDED IN — `routes-upload.ts`'
 * and `staff-token.ts`' pattern — so this file imports neither the service role nor the chokepoint and `snapshot.test.ts` runs
 * every answer over a fake; `server/snapshot-io.ts` is the real one, on `server-wiring.test.ts`' two lists.
 *
 * THE READ (AD-10). `GET themes/` signed with the site's Staff Access Token: the active theme is the entry with `active: true`,
 * and its `package` is the theme's whole `package.json` (both majors). A `package[THEME_MARKER] === true` there is Inflozo's own
 * theme — keyed on the MARKER, never on the name — and nothing is captured or written. With NO token stored, the same list is
 * asked with the Admin key, so B12b prints the site's own answer: Ghost 5's 501 and Ghost 6's 403 are ONE code,
 * `snapshot_needs_token` (VERIFY 9, MEASUREMENTS §15h). A 200 there — a future Ghost lifting the integration allowlist — captures
 * with that key.
 *
 * THE DOWNLOAD. `GET themes/{name}/download/` with the same credential and its own read budget (`READ_TIMEOUT_MS.theme_download`):
 * a direct 200 `application/zip` stream (`theme-storage.js` `serve()`, read in both majors' source; §89 on T1). Only the Owner and
 * an Administrator hold `theme: read`.
 *
 * THE WRITE, OBJECT FIRST (AD-29, AD-32). A NEW object at `site-snapshots/{userId}/{siteId}/{capturedAt}-{name}.zip`, then the
 * site's one row upserted on `site_id` (`storage_path`, `theme_name`, `bytes`, `captured_at` — never `purge_after` or
 * `download_offered_at`, which carry FR-A5's clock), and only then the previous object removed. A row that will not write takes
 * its new object back out, so nothing is half-written; a failed removal of the OLD object is logged and the prefix drains sweep it
 * later. Bytes never pass through a function body to a browser (AD-13): the Theme Download hands back the row's id, and Story
 * 2.5's route signs the object.
 *
 * EXCLUDED FROM QUOTA, EXEMPT FROM PRUNING, KEPT PER SITE RECORD — all by construction: its own table and bucket, keyed on
 * `site_id` with no project key, never `deploys` or `deploy-artifacts`.
 *
 * THE SAVED ORIGINAL IS THE THEME INFLOZO REPLACED MOST RECENTLY (R-284, owner, 2026-10-26, Story 7.20a's Question 5). Every
 * capture replaces the site's one row: the Theme Download whenever the gate shows (a reconnect makes it owed again), and the
 * first upload to a site with no binding — the first upload after every linked project is deleted included. A disconnect,
 * a reconnect or a project's deletion alone never touches it, a marked live theme writes nothing, and Story 7.23's Restore
 * original puts back this one row.
 */

/** The chokepoint's answer, as much of it as the capture reads */
export type SnapshotAnswer = { ok: boolean; status: number; body: unknown; bytes: Uint8Array }
/** The chokepoint's `call()`, as much of it as the capture uses — it throws the chokepoint's `AdminError` (read by its `code`) */
export type SnapshotCall = (args: { siteId: string; path: string; route: string; kind: 'admin' | 'staff'; read?: 'theme_download' }) => Promise<SnapshotAnswer>

export type SnapshotIo = {
  /** the site, the caller's and connected, with whether a Staff Access Token is stored; null when it is not the caller's */
  site: (a: { siteId: string; userId: string }) => Promise<{ staff: boolean } | null>
  call: SnapshotCall
  /** the site's snapshot row as it stands, or null */
  current: (a: { siteId: string; userId: string }) => Promise<{ id: string; storage_path: string } | null>
  /** an object into the `site-snapshots` bucket, by its key (no bucket prefix) */
  put: (key: string, bytes: Uint8Array) => Promise<void>
  /** the site's one row, upserted on `site_id`; answers its id */
  upsert: (row: { user_id: string; site_id: string; storage_path: string; theme_name: string; bytes: number; captured_at: string }) => Promise<string>
  /** an object out of the bucket, by its key */
  remove: (key: string) => Promise<void>
  now: () => Date
  log: (message: string, fields: Record<string, string | number | undefined>) => void
}

export type Snapshot =
  | { ok: true; id: string; theme: string; version: string | null; bytes: number }
  | { ok: true; marked: true }
  | { ok: false; code: SnapshotCode; request: string; status?: number }

/** The two reads, as `call()` is asked them */
export const THEMES_LIST = 'themes/'
export const downloadPath = (name: string): string => `themes/${encodeURIComponent(name)}/download/`
/** …and as B12b names them: the method and the Admin API's own path */
export const requestOf = (path: string): string => `GET /ghost/api/admin/${path}`
/** The store, as B12b names it when it is ours that refused */
export const STORAGE = SNAPSHOT_STORAGE

/** A Ghost theme's name, as a path segment and an object key may carry it: the slug Ghost itself names a theme by */
const SAFE_NAME = /^[a-z0-9][a-z0-9._-]{0,127}$/i

const thrownCode = (thrown: unknown): string | undefined =>
  (thrown as { name?: string } | null)?.name === 'AdminError' ? (thrown as { code?: string }).code : undefined

/** What the capture has learned so far, for B12a's rows while it runs: the live theme, then the zip's size */
export type SnapshotProgress = { theme: string; version: string | null } | { bytes: number }

export async function captureSnapshot(
  args: { siteId: string; userId: string; route: string; progress?: (p: SnapshotProgress) => Promise<void> | void },
  io: SnapshotIo,
): Promise<Snapshot> {
  const { siteId, userId, route } = args
  // B12a's rows are told as the capture learns them — best effort: a progress write that fails never fails the capture
  const tell = async (p: SnapshotProgress) => {
    try {
      await args.progress?.(p)
    } catch {
      io.log('snapshot: the progress was not written', { site: siteId })
    }
  }
  const site = await io.site({ siteId, userId })
  if (site === null) return { ok: false, code: 'snapshot_failed', request: requestOf(THEMES_LIST) }
  const kind = site.staff ? 'staff' : 'admin'

  // the list: the active theme and its package.json
  const listRequest = requestOf(THEMES_LIST)
  let list: SnapshotAnswer
  try {
    list = await io.call({ siteId, path: THEMES_LIST, route, kind })
  } catch (thrown) {
    // a token the flag says is stored but the store no longer holds reads as none — the site's own answer is the next press's
    const code = thrownCode(thrown)
    io.log('snapshot: the list threw', { code })
    return { ok: false, code: code === 'credential_missing' ? 'snapshot_needs_token' : 'snapshot_failed', request: listRequest }
  }
  if (!list.ok) {
    // the ONE code for an unreadable list with no token: Ghost 5's 501 and Ghost 6's 403 (VERIFY 9)
    if (kind === 'admin' && (list.status === 403 || list.status === 501)) return { ok: false, code: 'snapshot_needs_token', request: listRequest, status: list.status }
    if (kind === 'staff' && list.status === 401) return { ok: false, code: 'snapshot_token_refused', request: listRequest, status: list.status }
    return { ok: false, code: 'snapshot_failed', request: listRequest, status: list.status }
  }
  const themes = (list.body as { themes?: unknown } | null)?.themes
  const active = Array.isArray(themes) ? (themes as { name?: unknown; active?: unknown; package?: unknown }[]).find((t) => t?.active === true) : undefined
  const pkg = (active?.package ?? null) as Record<string, unknown> | null
  // FR-J13: Inflozo's own theme is never captured — keyed on the marker, never on the name
  if (pkg !== null && typeof pkg === 'object' && pkg[THEME_MARKER] === true) return { ok: true, marked: true }
  const name = typeof active?.name === 'string' && SAFE_NAME.test(active.name) ? active.name : null
  if (name === null) return { ok: false, code: 'snapshot_failed', request: listRequest, status: list.status }
  const version = typeof pkg?.version === 'string' ? pkg.version : null
  await tell({ theme: name, version })

  // the download, with the same credential and its own read budget
  const path = downloadPath(name)
  const downloadRequest = requestOf(path)
  let zip: SnapshotAnswer
  try {
    zip = await io.call({ siteId, path, route, kind, read: 'theme_download' })
  } catch (thrown) {
    io.log('snapshot: the download threw', { code: thrownCode(thrown) })
    return { ok: false, code: thrownCode(thrown) === 'credential_missing' ? 'snapshot_needs_token' : 'snapshot_failed', request: downloadRequest }
  }
  if (!zip.ok) {
    if (kind === 'staff' && zip.status === 401) return { ok: false, code: 'snapshot_token_refused', request: downloadRequest, status: zip.status }
    return { ok: false, code: 'snapshot_failed', request: downloadRequest, status: zip.status }
  }
  // a zip opens with its local-file header's `PK` — anything else is not the theme, and is never stored as one
  if (zip.bytes.length < 4 || zip.bytes[0] !== 0x50 || zip.bytes[1] !== 0x4b) return { ok: false, code: 'snapshot_failed', request: downloadRequest, status: zip.status }

  await tell({ bytes: zip.bytes.length })

  // the write: the object, then the row, then the old object
  const capturedAt = io.now().toISOString()
  const key = `${userId}/${siteId}/${capturedAt.replace(/[-:.]/g, '')}-${name}.zip`
  const before = await io.current({ siteId, userId }).catch(() => {
    // the capture goes on; the previous object, unread, is left for the prefix drains — said, never silent
    io.log('snapshot: the previous row was not read', { site: siteId })
    return null
  })
  try {
    await io.put(key, zip.bytes)
  } catch (thrown) {
    io.log('snapshot: the object was not stored', { code: (thrown as { code?: string } | null)?.code })
    return { ok: false, code: 'snapshot_failed', request: STORAGE }
  }
  let id: string
  try {
    // the column carries the bucket before the key (`site-snapshots/{userId}/{siteId}/…`); `snapshotObjectKey` is the one strip
    id = await io.upsert({ user_id: userId, site_id: siteId, storage_path: `${SNAPSHOT_BUCKET}/${key}`, theme_name: name, bytes: zip.bytes.length, captured_at: capturedAt })
  } catch (thrown) {
    io.log('snapshot: the row was not written', { code: (thrown as { code?: string } | null)?.code })
    // nothing half-written: the new object comes back out (and if even that fails, the prefix drains sweep it)
    await io.remove(key).catch(() => io.log('snapshot: an unrecorded object was left', { site: siteId }))
    return { ok: false, code: 'snapshot_failed', request: STORAGE }
  }
  const old = before === null ? null : snapshotObjectKey(before.storage_path)
  if (old !== null && old !== key) await io.remove(old).catch(() => io.log('snapshot: the previous object was not removed', { site: siteId }))
  return { ok: true, id, theme: name, version, bytes: zip.bytes.length }
}

/** THE THEME DOWNLOAD'S ANSWER (`downloadLiveTheme`): null when a row was written (the browser follows Story 2.5's route), else
 *  the row's sentence. The capture's own causes first — a token gone meanwhile is B12b's no-token body and a revoked one its
 *  "no longer recognises", whatever Ghost's status — then our store, then Ghost's status, then no answer at all */
export function downloadSaid(got: Snapshot, host: string): string | null {
  if (got.ok) return 'marked' in got ? BACKUP_WORDS.marked : null
  if (got.request === STORAGE) return DEPLOY_WORDS.infrastructure
  if (got.code === 'snapshot_needs_token') return SNAPSHOT_WORDS.noToken
  if (got.code === 'snapshot_token_refused') return SNAPSHOT_WORDS.tokenRefused
  if (got.status !== undefined) return BACKUP_WORDS.downloadFailed(got.status)
  return DEPLOY_WORDS.unreachable(host)
}
