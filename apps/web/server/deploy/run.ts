import type { CompiledTheme, CompileInput } from '@inflozo/theme-compiler'
import { ASK_FLAGS } from '@inflozo/library'
import { DEFAULT_LANGUAGE, isRtl } from '@inflozo/library/languages'
import type { Finding, QualityVerdict, Verdict } from '@inflozo/theme-compiler/gate'
import type { RoutesOutcome } from '../../lib/routes-upload.ts'
import {
  ACCOUNT_COMPILES_PER_HOUR, activateAnswer, CANCELLABLE, deployError, DEPLOY_WORDS, HOUR_MS, isMoving, isSnapshotError, overLimit, refusalWords, ROUTES_REASONS, SITE_DEPLOYS_PER_HOUR, snapshotError, thrownCode, uploadAnswer, versionNumber,
  type DeployCode, type DeployError, type DeployStatus, type DeployView, type Locked, type Mode, type PreflightFacts, type RoutesEnding, type SnapshotTiming, type Stage, type Timings,
} from '../../lib/deploy.ts'
import { hostOf } from '../../lib/connect-rule.ts'
import { compareManifests, contentManifest, labelOf, LIVE_COPY_MAX_BYTES, liveCopyPath, liveManifest, type ContentManifest, type DriftCause, type DriftFile, type DriftRecord, type ManifestEntry } from '../../lib/drift.ts'
import type { Snapshot, SnapshotAnswer, SnapshotProgress } from '../snapshot.ts'
import type { ProjectRead } from './project-input.ts'
import { unzipTheme } from './zip.ts'

/**
 * STORY 7.18a — THE DEPLOY'S ONE SHELL (AD-20 with F-075): `start`, `preflight`, `ship`, `activate`, `cancel` and `view`,
 * each over a `DeployIo` handed in — `offerRoutes`' pattern, so this file imports neither the service role nor the
 * chokepoint, and `deploy-run.test.ts` runs every stage, cancel, abandon, stale, retry, binding and routes outcome over a
 * fake. `deploy-io.ts` is the real one. It DECIDES nothing a rule decides: Ghost's answers, the version, the hash, the
 * sentences and the step are `lib/deploy.ts`'s.
 *
 * ONE ROW, TWO INVOCATIONS. Pre-flight moves the `deploy_jobs` row `queued → compiling → checking → awaiting_ship` and stores
 * the artefact on a `deploys` row only when nothing blocks; Ship it resumes THE SAME ROW — re-running `compiling` and
 * `checking` on it only when `inputs_sha256` moved — then `uploading → activating → done`. Every edge writes the stage and
 * `stage_timings`; `cancel_requested` is read between stages; a cancelled or abandoned job leaves no `deploys` row and no
 * object (objects first, AD-29).
 *
 * THE RETRY RULE (AD-20): an infrastructure failure — storage, the database, a thrown chokepoint error that is not Ghost's
 * own answer — is retried once, then the job fails `deploy_infrastructure`. A gate result, a compile refusal and every
 * answer Ghost gives are RESULTS, never retried.
 *
 * STORY 7.25 — THE SITE'S LOCK (AD-19, `server/site-lock.ts` through `io.lock`, keyed on the site's address): Ship it and
 * Re-activate run everything after their first read inside it, so two writers to one Ghost serialize and each decision's read —
 * the link, the free name, the live project — is taken under it (`underLock`). Pre-flight takes none. The two counts are doors
 * the route asks before it hands work on: `siteLimit` at Ship it, `compileBudget` at Run checks.
 */

export type JobRow = {
  id: string
  project_id: string
  user_id: string
  site_id: string
  stage: Stage
  cancel_requested: boolean
  deploy_id: string | null
  error: DeployError | Finding | null
  stage_timings: Timings
  updated_at: string
}

export type DeployRow = {
  id: string
  version: string
  theme_name: string
  status: DeployStatus
  activated: boolean
  artifact_path: string | null
  artifact_bytes: number | null
  gscan: Verdict | null
  quality: QualityVerdict | null
  inputs_sha256: string | null
  activated_at: string | null
  /** Story 7.23a — when Ghost last accepted this version's files (DW-400): written with every upload Ghost takes, by Ship it and by
   *  a Roll back. The list, the prune and the drift baseline order by it */
  accepted_at?: string | null
  /** Story 7.18b — the compile's facts for Pre-flight's warning rows (`preflightFacts`) */
  preflight: PreflightFacts | null
  /** Story 7.21 — FR-J16's content manifest of the stored artefact (`lib/drift.ts`' `contentManifest`); null before it is stored,
   *  and on a deploy made before the story. Written with the artefact, never read back by the poll (`DEPLOY_COLUMNS` leaves it out) */
  content_manifest?: ContentManifest | null
}

/** The chokepoint's `call()`, as much of it as a deploy uses — handed in (`RoutesCall`'s shape). */
export type DeployCall = (args: {
  siteId: string
  method?: string
  path: string
  body?: unknown
  item?: 'theme_upload' | 'theme_activate'
  route: string
}) => Promise<{ ok: boolean; status: number; body: unknown; text: string }>

export type DeployIo = {
  /** the project's compile input and every row it read, owned (`compileInputOf`); null when not the caller's */
  read: (a: { projectId: string; siteId: string; userId: string }) => Promise<ProjectRead | null>
  compile: (input: CompileInput) => CompiledTheme
  gscan: (files: CompiledTheme['files'], major: 5 | 6) => Promise<Verdict>
  quality: (files: CompiledTheme['files'], input: CompileInput) => QualityVerdict
  zip: (files: CompiledTheme['files']) => Uint8Array
  /** `inputsHash(reads, release)` */
  hash: (reads: unknown) => Promise<string>
  jobs: {
    insert: (row: { project_id: string; user_id: string; site_id: string }) => Promise<JobRow>
    read: (id: string, userId: string) => Promise<JobRow | null>
    update: (id: string, userId: string, patch: Partial<JobRow>) => Promise<void>
    /** the same write, only while the row still stands at `from` — true when this call moved it. One Ship it (or one
     *  re-activate) per row: a second press's invocation finds the row already moved and does nothing. */
    claim: (id: string, userId: string, from: Stage, patch: Partial<JobRow>) => Promise<boolean>
    /** this project's jobs to this site resting at `awaiting_ship` — the ones a new Pre-flight abandons — and, since Story 7.25
     *  (DW-373), the ones still at `queued`, `compiling` or `checking`, which it flags as a Cancel does */
    resting: (a: { projectId: string; siteId: string; userId: string }) => Promise<JobRow[]>
  }
  deploys: {
    insert: (row: { project_id: string; user_id: string; site_id: string; version: string; theme_name: string; status: DeployStatus }) => Promise<DeployRow>
    read: (id: string, userId: string) => Promise<DeployRow | null>
    update: (id: string, userId: string, patch: Partial<DeployRow> & { settings_snapshot?: unknown }) => Promise<void>
    remove: (id: string, userId: string) => Promise<void>
    /** every other deploy live on this site is no longer live once this one activates — or, with no `except`, every one: Story
     *  7.23b's Restore original, after which no Inflozo theme is live on the site */
    demote: (a: { siteId: string; userId: string; except?: string }) => Promise<void>
    /** the version the site serves from this project: its last activated deploy's number — while that deploy is still `live`
     *  (Story 7.23b's review: a Restore original demotes it, and the site serves the original then) — or null */
    previous: (a: { projectId: string; siteId: string; userId: string; except?: string }) => Promise<number | null>
    /** R-264 (a): the project whose deploy was activated last on this site and is STILL `live` (Story 7.23b: a restore demotes it),
     *  or null — Inflozo's own record of what is live */
    liveProject: (a: { siteId: string; userId: string }) => Promise<string | null>
    /** Story 7.18b — `config.custom` as this project's latest ACTIVATED deploy to the site shipped it (its `preflight.custom`),
     *  other than `except`; null when there is none or it predates the facts */
    previousCustom: (a: { projectId: string; siteId: string; userId: string; except?: string }) => Promise<Readonly<Record<string, unknown>> | null>
    /** STORY 7.21 — THE DRIFT BASELINE (R-287, Ruled value 1): this project's newest deploy to the site with status `uploaded` or
     *  `live`, by `accepted_at` (Story 7.23a: a Roll back's upload of an OLDER version is the newest accepted), other than `except`
     *  (the job's own) — every upload Ghost accepted is one, because Ghost replaces
     *  every file under a theme's name on each (`storage.js:95-107`). Its version and manifest, or null when there is none */
    baseline: (a: { projectId: string; siteId: string; userId: string; except: string }) => Promise<{ version: string; content_manifest: ContentManifest | null } | null>
  }
  /** Story 7.18b (DW-374) — the project's link as it stands NOW (`projects.linked_site_id` and that site's address, or null when
   *  unlinked), and the job's own site's address — read at Ship it, so a theme only ever goes to the project's current site */
  link: (a: { projectId: string; siteId: string; userId: string }) => Promise<{ now: { id: string; url: string } | null; was: string | null }>
  artifacts: {
    /** STORY 7.22 — an artefact is IMMUTABLE (NFR-4): a put never overwrites an existing key (the store refuses it). `replace` is
     *  the drift check's live copy alone — one fixed key per project × site that each found drift overwrites */
    put: (path: string, bytes: Uint8Array, opts?: { replace?: true }) => Promise<void>
    get: (path: string) => Promise<Uint8Array>
    remove: (path: string) => Promise<void>
  }
  /** STORY 7.22 — the one prune (`server/retention.ts`' `pruneProject`, its real io bound in by `deploy-io.ts`): this project's
   *  stored versions past its plan's cap lose their zip, the rows kept. Called once Ghost accepts an upload, best effort */
  prune: (a: { projectId: string; userId: string }) => Promise<{ pruned: readonly string[]; failed: number }>
  /** claim the frozen name at the first accepted upload (AD-19, VERIFY 30): `ok`, or `taken` on a 23505 whose stored row is
   *  not this name (a concurrent first upload) */
  bind: (a: { projectId: string; siteId: string; userId: string; themeName: string; at: string }) => Promise<'ok' | 'taken'>
  /** FR-C2: the plan refusal marks the site Preview-only (`deploy_error`); an accepted upload clears a `deploy_error` mark */
  capability: (a: { siteId: string; userId: string; refused: boolean }) => Promise<void>
  /** STORY 7.20a — FR-J13's "first upload to a site", per site record (R-278's grain): whether ANY project of the user's has a
   *  binding for the site. `read.bound` is per project × site, so this is a read of its own */
  siteBound: (a: { siteId: string; userId: string }) => Promise<boolean>
  /** STORY 7.20a — the one capture (`server/snapshot.ts`' `captureSnapshot`), its real io bound in by `deploy-io.ts`, so this file
   *  stays off the chokepoint and the service role */
  snapshot: (a: { siteId: string; userId: string; route: string; progress?: (p: SnapshotProgress) => Promise<void> }) => Promise<Snapshot>
  call: DeployCall
  /** STORY 7.21 — the live theme under the bound name, read with the Staff Access Token: `GET themes/{name}/download/` through the
   *  chokepoint (`kind: 'staff'`, `theme_download`'s read budget) — the capture's read (`server/snapshot.ts`' `downloadPath`), not
   *  the capture. It throws the chokepoint's `AdminError` (`credential_missing` where no token is stored) */
  liveTheme: (a: { siteId: string; userId: string; name: string; route: string }) => Promise<SnapshotAnswer>
  /** Story 7.17's step, with the real `ROUTES_IO` bound in */
  offerRoutes: (a: { projectId: string; siteId: string; userId: string; route: string }) => Promise<RoutesOutcome>
  /** `sites.routes_last_offered` — B16's file */
  routesFile: (a: { siteId: string; userId: string }) => Promise<string | null>
  /** the catalog's English for a key — Translations' label, for "The translation of …" */
  english: (key: string) => string | undefined
  /** STORY 7.25 — the site's advisory lock (`server/site-lock.ts`): `run` inside it once held, or `{ held: false }`
   *  when another writer to the same Ghost held it past `LOCK_WAIT_MS` (and `run` never ran) */
  lock: <T>(siteId: string, run: () => Promise<T>) => Promise<Locked<T>>
  /** STORY 7.25 — the two counts' reads, each scoped by `user_id` (the clause that stands in for the RLS the service role bypasses).
   *  ponytail: no index serves either — `deploys (site_id, accepted_at)` and `deploy_jobs (user_id, started_at)` are the upgrade
   *  once a count is measured slow; each reads one account's rows of one hour */
  limits: {
    /** the site record's address and FR-J11's exemption (`sites.deploy_rate_limit_exempt`, server-only), or null when gone */
    site: (a: { siteId: string; userId: string }) => Promise<{ url: string; exempt: boolean } | null>
    /** `deploys.accepted_at` of the record's uploads Ghost accepted since `since` — Ship it's and Roll back's alike; a version's row
     *  carries its LATEST acceptance, so one version put back twice in the hour counts once */
    accepted: (a: { siteId: string; userId: string; since: string }) => Promise<string[]>
    /** `deploy_jobs.started_at` of the account's jobs started since `since`, any site or none — every Pre-flight is a row, none is
     *  deleted while its project stands (a deleted project's jobs go with it: DW-409), and Story 7.26's export rides one */
    started: (a: { userId: string; since: string }) => Promise<string[]>
  }
  now: () => Date
  log: (message: string, fields: Record<string, string | number | undefined>) => void
}

const ROUTE = 'projects/deploy'
/** A moving job not touched for longer than AD-11's 300 s (and a margin) was abandoned by a killed invocation. Story 7.23a's put-back
 *  refuses while a job of the site moved more recently than this (`server/deploy/put-back.ts`). */
export const STALLED_MS = 330_000

class Infra extends Error {}
/** A throw out of the project read that is NOT infrastructure — a stored doc the editor's own door refuses: Inflozo's fault,
 *  said as such (`compile_failed`), never retried. */
class Ours extends Error {
  readonly thrown: unknown
  constructor(thrown: unknown) {
    super('ours')
    this.thrown = thrown
  }
}
/** A throw the shell marks as infrastructure (`project-input.ts`'s `must` sets `infra`): a database answer. */
const isInfra = (e: unknown): boolean => e instanceof Infra || (e as { infra?: unknown } | null)?.infra === true

/** The project read, with AD-20's rule applied to its infrastructure throws only. */
async function readProject(io: DeployIo, at: { projectId: string; siteId: string; userId: string }): Promise<ProjectRead | null> {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      return await io.read(at)
    } catch (e) {
      if (!isInfra(e)) throw new Ours(e)
      io.log('deploy: retrying the project read', { attempt })
    }
  }
  throw new Infra('project read')
}

/** AD-20's rule, once: an infrastructure failure is retried once, then thrown as `Infra`. Story 7.23a's put-back reads its zip
 *  through it too. */
export async function twice<T>(io: Pick<DeployIo, 'log'>, what: string, run: () => Promise<T>): Promise<T> {
  try {
    return await run()
  } catch (first) {
    io.log('deploy: retrying after an infrastructure failure', { what, code: (first as { code?: string } | null)?.code })
    try {
      return await run()
    } catch (again) {
      io.log('deploy: infrastructure failed twice', { what, code: (again as { code?: string } | null)?.code })
      throw new Infra(what)
    }
  }
}

/** A chokepoint call with the same rule: Ghost unreachable and an off-list write are answers (thrown on, never retried);
 *  anything else thrown is infrastructure, retried once. */
export type Called = Awaited<ReturnType<DeployCall>> | { thrown: 'ghost_unreachable' | 'write_not_allowed' | 'deploy_infrastructure' }
export async function callTwice(io: Pick<DeployIo, 'call' | 'log'>, args: Parameters<DeployCall>[0]): Promise<Called> {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      return await io.call(args)
    } catch (e) {
      const code = thrownCode(e)
      if (code !== 'deploy_infrastructure') return { thrown: code }
      io.log('deploy: the call threw', { item: args.item, code: (e as { code?: string } | null)?.code, attempt })
    }
  }
  return { thrown: 'deploy_infrastructure' }
}

/** STORY 7.23a — THE TWO GHOST WRITES, ONCE: Ship it and the History drawer's put-back (`server/deploy/put-back.ts`) send exactly
 *  these. The upload: the stored zip as `file`, named `{theme_name}.zip` — Ghost names a theme by the zip's filename (VERIFY 30), the
 *  frozen name, and reads it under `file` (`themeZip('file')`, 6.58.0 `web/api/endpoints/admin/routes.js:251`; `single('file')`,
 *  5.130.6 `:202`). Read its answer with `uploadAnswer`. */
export function sendUpload(io: Pick<DeployIo, 'call' | 'log'>, a: { siteId: string; themeName: string; bytes: Uint8Array; route: string }): Promise<Called> {
  const form = new FormData()
  form.append('file', new Blob([a.bytes as BlobPart], { type: 'application/zip' }), `${a.themeName}.zip`)
  return callTwice(io, { siteId: a.siteId, method: 'POST', path: 'themes/upload/', body: form, item: 'theme_upload', route: a.route })
}
/** …and the activation, `PUT themes/{name}/activate/`. Read its answer with `activateAnswer`. */
export const sendActivate = (io: Pick<DeployIo, 'call' | 'log'>, a: { siteId: string; themeName: string; route: string }): Promise<Called> =>
  callTwice(io, { siteId: a.siteId, method: 'PUT', path: `themes/${encodeURIComponent(a.themeName)}/activate/`, item: 'theme_activate', route: a.route })

/** Is this major one a theme ships to — FR-J8's "version mismatch" otherwise. */
const shipsTo = (version: string | null): 5 | 6 | null => {
  const major = Number(/^(\d+)\./.exec(version ?? '')?.[1])
  return major === 5 || major === 6 ? major : null
}

/** The job's edges: `enter(stage)` closes the stage before (its `ms`) and opens this one. */
function clock(io: DeployIo, job: JobRow) {
  const timings: Timings = { ...(job.stage_timings ?? {}) }
  /** every stage's record by its name — `snapshotting`'s carries the capture's fields beside the same `at` and `ms` */
  const edges = timings as Record<string, { at?: string; ms?: number } | undefined>
  let current: Stage = job.stage
  const close = () => {
    const open = edges[current]
    if (open?.at !== undefined && open.ms === undefined) edges[current] = { ...open, ms: Math.max(0, io.now().getTime() - Date.parse(open.at)) }
  }
  return {
    timings,
    get stage() {
      return current
    },
    async enter(stage: Stage, extra: Partial<JobRow> = {}) {
      close()
      current = stage
      edges[stage] = { at: io.now().toISOString() }
      await twice(io, `stage ${stage}`, () => io.jobs.update(job.id, job.user_id, { stage, stage_timings: { ...timings }, ...extra }))
    },
    /** `enter`, but only off the stage the row was read at: false, and nothing written, when another invocation moved it */
    async claim(stage: Stage, extra: Partial<JobRow> = {}): Promise<boolean> {
      const from = current
      close()
      edges[stage] = { at: io.now().toISOString() }
      const moved = await twice(io, `claim ${stage}`, () => io.jobs.claim(job.id, job.user_id, from, { stage, stage_timings: { ...timings }, ...extra }))
      if (moved) current = stage
      return moved
    },
    /** a stage's own detail — the zip's size on compiling */
    note(stage: Exclude<Stage, 'snapshotting'>, patch: { bytes?: number }) {
      const t = timings[stage]
      if (t !== undefined) timings[stage] = { ...t, ...patch }
    },
    /** STORY 7.20a — the capture's record on its stage: the live theme's name, version and size, `marked`, or `skipped` (a stage
     *  never entered, so no `at`) — written with the next edge */
    snapshot(record: SnapshotTiming) {
      timings.snapshotting = record.skipped ? { skipped: true } : { ...(timings.snapshotting ?? {}), ...record }
    },
    /** …and written at once, while the stage runs (B12a's rows): best effort — a failed write is logged, never the job's failure */
    async progress(record: SnapshotTiming) {
      timings.snapshotting = { ...(timings.snapshotting ?? {}), ...record }
      await io.jobs.update(job.id, job.user_id, { stage_timings: { ...timings } }).catch(() => io.log('deploy: the capture\'s progress was not written', { job: job.id }))
    },
    async end(stage: Stage, extra: Partial<JobRow> = {}) {
      close()
      current = stage
      if (stage !== 'failed' && stage !== 'cancelled' && stage !== 'awaiting_ship' && stage !== 'done') edges[stage] = { at: io.now().toISOString() }
      await twice(io, `stage ${stage}`, () => io.jobs.update(job.id, job.user_id, { stage, stage_timings: { ...timings }, ...extra }))
    },
    routes(ending: RoutesEnding) {
      timings.routes = ending
    },
    /** STORY 7.21 — the drift check's record, riding the next edge as the routes step's does; null removes it (a first deploy, a
     *  baseline with no manifest, a stale re-make starting afresh). `reading` is written AT ONCE, best effort, with `checking`'s
     *  duration closed — so the check row shows done beside "Comparing with your live theme…" — and a failed write is logged,
     *  never the job's failure */
    async drift(record: DriftRecord | null) {
      if (record === null) return void delete timings.drift
      timings.drift = record
      if (record.kind !== 'reading') return
      close()
      await io.jobs.update(job.id, job.user_id, { stage_timings: { ...timings } }).catch(() => io.log('deploy: the drift check\'s start was not written', { job: job.id }))
    },
  }
}
type Clock = ReturnType<typeof clock>

/** The one way a job fails: its envelope stored, the stage `failed`. */
const fail = (c: Clock, error: DeployError | Finding): Promise<void> => c.end('failed', { error })

/** What `clear` needs of the world — the nightly sweep builds no more than this (`app/api/cron/prune-artifacts`) */
export type AbandonIo = {
  deploys: Pick<DeployIo['deploys'], 'read' | 'remove'>
  artifacts: Pick<DeployIo['artifacts'], 'remove'>
  jobs: Pick<DeployIo['jobs'], 'update'>
  log: DeployIo['log']
}

/** A cancelled or abandoned job leaves nothing: the object first, then the `deploys` row (AD-29), then the job's stage. */
async function clear(io: AbandonIo, job: JobRow, c: Clock | null): Promise<void> {
  if (job.deploy_id !== null) {
    const deploy = await twice(io, 'deploy read', () => io.deploys.read(job.deploy_id as string, job.user_id))
    if (deploy?.artifact_path) await twice(io, 'artifact remove', () => io.artifacts.remove(deploy.artifact_path as string))
    if (deploy !== null) await twice(io, 'deploy remove', () => io.deploys.remove(deploy.id, job.user_id))
  }
  if (c === null) await twice(io, 'job cancel', () => io.jobs.update(job.id, job.user_id, { stage: 'cancelled', deploy_id: null }))
  else await c.end('cancelled', { deploy_id: null })
}

/** Between stages: a Cancel the customer pressed stops the work here. */
async function cancelled(io: DeployIo, job: JobRow, c: Clock): Promise<boolean> {
  const fresh = await twice(io, 'job read', () => io.jobs.read(job.id, job.user_id))
  if (fresh?.cancel_requested !== true) return false
  await clear(io, { ...job, deploy_id: fresh.deploy_id }, c)
  return true
}

const errorCtx = (read: ProjectRead | null, siteId: string, detail?: string) => ({
  host: read === null ? '' : hostOf(read.site.url),
  ...(read?.site.ghost_version ? { version: read.site.ghost_version } : {}),
  siteId,
  ...(detail === undefined ? {} : { detail }),
})

/** STORY 7.18b — `deploys.preflight`, from the compiled theme: every `.hbs` file that ships, `config.custom` as the emitted
 *  `package.json` carries it, FR-H2's guarded contexts (`noindex`), and the files that carry a free member ask's flag — the
 *  compile gates every free ask behind it, synthesised ones included (routine call 10). */
export function preflightFacts(theme: Pick<CompiledTheme, 'files' | 'noindex'>): PreflightFacts {
  const text = Object.entries(theme.files).filter((e): e is [string, string] => typeof e[1] === 'string')
  const pkg = theme.files['package.json']
  const custom = typeof pkg === 'string' ? (JSON.parse(pkg) as { config?: { custom?: Record<string, unknown> } }).config?.custom ?? null : null
  return {
    templates: text.map(([f]) => f).filter((f) => f.endsWith('.hbs')),
    custom,
    noindex: [...theme.noindex],
    freeAsks: text.filter(([f, body]) => f.endsWith('.hbs') && body.includes(ASK_FLAGS.free)).map(([f]) => f),
  }
}

/**
 * COMPILING AND CHECKING, on the job's row — Pre-flight's whole work, and Ship it's again when the artefact is stale. Ends
 * with the artefact stored on the `deploys` row and the answer `clean`, or the job failed or cancelled.
 */
async function compileAndCheck(io: DeployIo, job: JobRow, c: Clock, existing: DeployRow | null): Promise<{ kind: 'clean'; deploy: DeployRow; read: ProjectRead } | { kind: 'stopped' }> {
  const at = { projectId: job.project_id, siteId: job.site_id, userId: job.user_id }
  // Story 7.21 — a re-made artefact starts with no drift verdict: the last check's record leaves with this first edge, so a
  // re-make that stops before the drift step never shows the old one beside its own findings (Story 7.21's Review)
  await c.drift(null)
  await c.enter('compiling')
  const read = await readProject(io, at)
  if (read === null) {
    await fail(c, { code: 'site_not_found', message: DEPLOY_WORDS.noSite })
    return { kind: 'stopped' }
  }
  const major = shipsTo(read.site.ghost_version)
  if (major === null) {
    await fail(c, deployError('ghost_version_unsupported', errorCtx(read, job.site_id)))
    return { kind: 'stopped' }
  }
  // Story 7.18b (FR-Q6): a right-to-left language ships only once acknowledged — a server verdict, before any compile, so
  // nothing is stored (Translations' Understood writes `rtl_ack_at`)
  if (isRtl(read.input.language ?? DEFAULT_LANGUAGE) && read.rtlAckAt === null) {
    await fail(c, deployError('rtl_unacknowledged', { ...errorCtx(read, job.site_id), projectId: job.project_id }))
    return { kind: 'stopped' }
  }
  // the routing, before any compile (S9b's line, R-261's way out)
  if (read.routing.unreadable) {
    await fail(c, deployError('routes_unreadable', errorCtx(read, job.site_id)))
    return { kind: 'stopped' }
  }
  const problem = read.routing.problems[0]
  if (problem !== undefined) {
    await fail(c, { code: 'routes_invalid', message: DEPLOY_WORDS.routesLine(problem.line, problem.message) })
    return { kind: 'stopped' }
  }

  const version = read.input.theme.version
  let deploy = existing
  if (deploy === null) {
    const made = await twice(io, 'deploy insert', () => io.deploys.insert({
      project_id: job.project_id, user_id: job.user_id, site_id: job.site_id, version, theme_name: read.themeName, status: 'compiling',
    }))
    deploy = made
    job.deploy_id = made.id
    await twice(io, 'job deploy', () => io.jobs.update(job.id, job.user_id, { deploy_id: made.id }))
  } else {
    // a stale artefact is re-made on the same row: the old object goes first
    if (deploy.artifact_path) await twice(io, 'artifact remove', () => io.artifacts.remove(deploy!.artifact_path as string))
    await twice(io, 'deploy reset', () => io.deploys.update(deploy!.id, job.user_id, { status: 'compiling', version, theme_name: read.themeName, artifact_path: null, artifact_bytes: null, gscan: null, quality: null, inputs_sha256: null, preflight: null, content_manifest: null }))
    deploy = { ...deploy, status: 'compiling', version, theme_name: read.themeName, artifact_path: null, artifact_bytes: null, gscan: null, quality: null, inputs_sha256: null, preflight: null, content_manifest: null }
  }
  const hash = await io.hash(read.reads)

  let theme: CompiledTheme
  try {
    theme = io.compile(read.input)
  } catch (e) {
    const error = refusalWords(e, { projectId: job.project_id, names: read.names, english: io.english })
    if (error.code === 'compile_failed') io.log('deploy: the compile threw', { project: job.project_id })
    await twice(io, 'deploy failed', () => io.deploys.update(deploy!.id, job.user_id, { status: 'failed' }))
    await fail(c, error)
    return { kind: 'stopped' }
  }
  const zip = io.zip(theme.files)
  c.note('compiling', { bytes: zip.length })
  if (await cancelled(io, job, c)) return { kind: 'stopped' }

  await c.enter('checking')
  await twice(io, 'deploy checking', () => io.deploys.update(deploy!.id, job.user_id, { status: 'checking' }))
  const gscan = await io.gscan(theme.files, major)
  const quality = io.quality(theme.files, read.input)
  // Story 7.18b — the facts only the compile knows, kept beside the two verdicts (Pre-flight's warning rows read them)
  const preflight = preflightFacts(theme)
  if (await cancelled(io, job, c)) return { kind: 'stopped' }
  if (gscan.blocked || quality.blocked) {
    await twice(io, 'deploy blocked', () => io.deploys.update(deploy!.id, job.user_id, { status: 'failed', gscan, quality, preflight }))
    const first = gscan.errors[0] ?? quality.errors[0] ?? { code: 'theme_check_failed', message: DEPLOY_WORDS.fixErrors(1), level: 'error', fatal: false, refs: [] }
    await fail(c, first as Finding)
    return { kind: 'stopped' }
  }

  // nothing blocks: the artefact is stored, and only now (routine call 6) — with its content manifest (Story 7.21, FR-J16): every
  // file of the zip, hashed, each section partial fingerprinted by its layer's id from the compiler's record beside the files
  const path = `${job.project_id}/${deploy.id}.zip`
  await twice(io, 'artifact put', () => io.artifacts.put(path, zip))
  const content_manifest = await contentManifest(theme.files, theme.sections)
  const patch = { gscan, quality, preflight, artifact_path: path, artifact_bytes: zip.length, inputs_sha256: hash, settings_snapshot: read.site.site_settings ?? null, content_manifest }
  await twice(io, 'deploy stored', () => io.deploys.update(deploy!.id, job.user_id, patch))
  deploy = { ...deploy, ...patch }
  // Story 7.21 — the drift check, still inside `checking`; a Cancel pressed while it read is honoured after it, as today
  await driftStep(io, job, c, read, deploy.id)
  if (await cancelled(io, job, c)) return { kind: 'stopped' }
  return { kind: 'clean', deploy, read }
}

/**
 * STORY 7.21 — THE DRIFT CHECK (FR-J16, D3), inside `checking`, once nothing blocked and the artefact is stored. Its record rides
 * the next edge (`stage_timings.drift`); it never fails the job — every Ghost answer and every unzip failure is a cause and the
 * deploy goes on (D3b). Only our own store and database follow AD-20's retry rule (`twice`).
 *   - NO BINDING (`read.bound`, this project × site): a first deploy — no read and no record. No baseline, or one whose manifest
 *     is null (a deploy made before this story): the same, as a first deploy.
 *   - THE BASELINE is R-287's: the newest upload Ghost accepted from this project to this site (`deploys.baseline`).
 *   - THE LIVE SIDE is the theme under the BOUND name, active or not — the active theme is never read.
 *   - FOUND: the live zip is kept at `{projectId}/live/{siteId}.zip` (overwriting) BEFORE the record, so D3a's Download always has
 *     the zip this check read — unless it is past `LIVE_COPY_MAX_BYTES` (Story 7.22, DW-396): then nothing is put, the record says
 *     `kept: false`, and D3a draws no Download.
 *   - THE READ AND THE COMPARISON are `compareLive`, below — one function since Story 7.23a, shared with the check before a Roll
 *     back (R-291); this step keeps the baseline, the layers' current names, the live copy's key and the record's edges.
 */
async function driftStep(io: DeployIo, job: JobRow, c: Clock, read: ProjectRead, own: string): Promise<void> {
  // no record yet: `compileAndCheck` cleared the last check's at its first edge
  if (read.bound === null) return
  const baseline = await twice(io, 'drift baseline', () => io.deploys.baseline({ projectId: job.project_id, siteId: job.site_id, userId: job.user_id, except: own }))
  if (baseline === null || baseline.content_manifest === null || typeof baseline.content_manifest !== 'object') return
  await c.drift({ kind: 'reading' })
  // each partial by its layer's CURRENT name: the instance its fingerprint names, in the docs this check compiled
  const layers: Record<string, string> = {}
  for (const doc of [...Object.values(read.input.templates), ...Object.values(read.input.pageTwo ?? {})]) {
    for (const i of doc.instances) if (i.layerName.trim() !== '') layers[i.instanceId] = i.layerName
  }
  const answer = await compareLive(io, {
    siteId: job.site_id, userId: job.user_id, theme: read.bound, route: ROUTE, since: versionNumber(baseline.version), manifest: baseline.content_manifest,
    names: { layers, canvases: read.names }, at: { job: job.id },
  })
  if ('bytes' in answer) await twice(io, 'live copy', () => io.artifacts.put(liveCopyPath(job.project_id, job.site_id), answer.bytes, { replace: true }))
  await c.drift(answer.record)
}

/**
 * STORY 7.23a (R-291) — THE ONE COMPARISON both drift checks run: Ship it's (`driftStep`, inside `checking`) and the History
 * drawer's before a Roll back (`server/deploy/put-back.ts`' `checkBeforePutBack`). It reads the theme under the frozen name with
 * the Staff Access Token (`io.liveTheme`) and compares it with the baseline's manifest; it never throws — every Ghost answer and
 * every unzip failure is a cause (D3b), and the deploy or the Roll back goes on:
 *   - a throw: the chokepoint's `credential_missing` is `no_token`, anything else `unreachable`;
 *   - Ghost's 401 `token_refused`, 403 `role`, 400 or 404 `missing` (R-288), anything else `unreachable` with its status;
 *   - a zip that will not unzip: `unreadable`;
 *   - nothing different: D3c's `clean` since the baseline's version;
 *   - else D3a's `found`, each file labelled by `labelOf` — a partial by its layer's CURRENT name where `names` holds it (Ship it
 *     compiled the docs), else by the name the manifest kept (the History check reads no working document).
 * A FOUND drift within `LIVE_COPY_MAX_BYTES` hands back the bytes it read, for the caller to keep under ITS key before it records,
 * so D3a's Download always serves the zip this read; past the size it hands back none and the record says `kept: false` (DW-396).
 * `at` names the caller's row in the logs.
 */
export async function compareLive(
  io: Pick<DeployIo, 'liveTheme' | 'log'>,
  a: {
    siteId: string; userId: string; theme: string; route: string; since: number; manifest: ContentManifest
    names?: Parameters<typeof labelOf>[2]; at: Record<string, string>
  },
): Promise<{ record: Exclude<DriftRecord, { kind: 'reading' }> } | { record: Extract<DriftRecord, { kind: 'found' }>; bytes: Uint8Array }> {
  const { theme, since, manifest } = a
  const unverified = (cause: DriftCause, status?: number) => ({ record: { kind: 'unverified' as const, cause, theme, ...(status === undefined ? {} : { status }) } })
  let answer: SnapshotAnswer
  try {
    answer = await io.liveTheme({ siteId: a.siteId, userId: a.userId, name: theme, route: a.route })
  } catch (e) {
    const code = (e as { name?: string; code?: string } | null)?.name === 'AdminError' ? (e as { code?: string }).code : undefined
    // a throw that is not the chokepoint's keeps its name and the head of its message, as the unzip's does (Story 7.21's Review)
    const why = code === undefined ? { name: String((e as Error | null)?.name ?? typeof e), why: String((e as Error | null)?.message ?? e).slice(0, 120) } : {}
    io.log('deploy: the live theme was not read', { ...a.at, code, ...why })
    return unverified(code === 'credential_missing' ? 'no_token' : 'unreachable')
  }
  if (!answer.ok) {
    io.log('deploy: Ghost did not hand over the live theme', { ...a.at, status: answer.status })
    // R-288: a theme the site no longer holds is Ghost's 400 "Please select a valid theme." — `getZip`'s one refusal (storage.js:43-50
    // in 6.58.0, :35-42 in 5.130.6; executed on T1, MEASUREMENTS §90); a 404 from anything in front of Ghost is read the same
    const gone = answer.status === 400 || answer.status === 404
    return answer.status === 401 ? unverified('token_refused') : answer.status === 403 ? unverified('role') : gone ? unverified('missing') : unverified('unreachable', answer.status)
  }
  let live: Record<string, { sha256: string }>
  try {
    live = await liveManifest(unzipTheme(answer.bytes))
  } catch (e) {
    io.log('deploy: the live theme could not be read', { ...a.at, why: String((e as Error | null)?.message ?? e).slice(0, 120) })
    return unverified('unreadable')
  }
  const diff = compareManifests(manifest, live)
  if (diff.changed.length + diff.added.length + diff.removed.length === 0) return { record: { kind: 'clean', since } }
  const names = a.names ?? {}
  const kept = (path: string, kind: 'changed' | 'removed'): DriftFile => {
    const entry = manifest[path] as ManifestEntry | undefined
    return { path, label: labelOf({ path, ...(entry === undefined ? {} : { entry }) }, kind, names), ...(entry?.category === undefined ? {} : { category: entry.category }) }
  }
  const record: Extract<DriftRecord, { kind: 'found' }> = {
    kind: 'found', since, theme,
    changed: diff.changed.map((p) => kept(p, 'changed')),
    added: diff.added.map((path) => ({ path, label: labelOf({ path }, 'added', names) })),
    removed: diff.removed.map((p) => kept(p, 'removed')),
  }
  // Story 7.22 (DW-396): a live zip past the store's own size is not kept — a put the store refuses would refuse again on the retry
  // and fail the Pre-flight that found the drift. The record says so, D3a draws no Download, and the Pre-flight goes on
  if (answer.bytes.length > LIVE_COPY_MAX_BYTES) {
    io.log('deploy: the live theme is past the live copy\'s size, not kept', { ...a.at, bytes: answer.bytes.length })
    return { record: { ...record, kept: false } }
  }
  return { record, bytes: answer.bytes }
}

// ── the doors ───────────────────────────────────────────────────────────────────────────────────────────────────────

/** STORY 7.22 (DW-380) — `start()`'s abandon, for the nightly sweep: a check resting at `awaiting_ship` that nothing can ship any
 *  more (its project now links another site, or none) is cancelled and leaves nothing — its object, then its deploy row, then the
 *  job `cancelled`, exactly as a new Pre-flight abandons a resting check on the same site */
export const abandon = (io: AbandonIo, job: JobRow): Promise<void> => clear(io, job, null)

/** A NEW PRE-FLIGHT'S ROW, before any work (AD-20: the row exists from `queued`). Any older check of this project to this
 *  site resting at `awaiting_ship` is ABANDONED first — cancelled, its deploy and object deleted. STORY 7.25 (DW-373): one still
 *  moving through Pre-flight is FLAGGED through `cancel()`, so it stops at its next edge and leaves nothing, exactly as after a
 *  Cancel — never handed back, since its results would be for inputs the customer has just changed. One that reached
 *  `awaiting_ship` between the read and the flag is abandoned as a resting one. A flagged job still counts in the budget, as every
 *  Pre-flight's row does, whether or not it got as far as compiling (the Review, 2026-11-27: one flagged at `queued` never does);
 *  Ship it's stale re-make compiles on its own row again and is not counted twice — the site's limit bounds it. */
export async function start(a: { projectId: string; siteId: string; userId: string }, io: DeployIo): Promise<JobRow> {
  for (const old of await twice(io, 'resting read', () => io.jobs.resting(a))) {
    if (old.stage === 'awaiting_ship') await clear(io, old, null)
    // AD-20: the flag's reads are retried once, as every other read here (the Review, 2026-11-27)
    else if (!(await twice(io, 'flag moving', () => cancel({ jobId: old.id, userId: old.user_id }, io)))) {
      const now = await twice(io, 'job read', () => io.jobs.read(old.id, old.user_id))
      if (now?.stage === 'awaiting_ship') await clear(io, now, null)
    }
  }
  return twice(io, 'job insert', () => io.jobs.insert({ project_id: a.projectId, user_id: a.userId, site_id: a.siteId }))
}

/** PRE-FLIGHT (Run checks): `queued → compiling → checking → awaiting_ship`, the artefact stored only when nothing blocks. */
export async function preflight(a: { jobId: string; userId: string }, io: DeployIo): Promise<void> {
  const job = await firstRead(io, a)
  if (job === null || job.stage !== 'queued') return
  const c = clock(io, job)
  try {
    if (job.cancel_requested) return void (await clear(io, job, c))
    const done = await compileAndCheck(io, job, c, null)
    if (done.kind !== 'clean') return
    await c.end('awaiting_ship')
    // a Cancel that landed after the last edge's read and before this write (the review, 2026-10-19): `cancel` only sets the
    // flag while the row still stands in a cancellable stage, so asked once more here, nothing it set is ever lost
    await cancelled(io, job, c)
  } catch (e) {
    await failInfra(io, job, c, e)
  }
}

/** A door's first read, under AD-20's rule; null when the row is not there or cannot be read twice (a stalled row is
 *  `view`'s to fail, since nothing can be written to a row that cannot be read). */
const firstRead = (io: DeployIo, a: { jobId: string; userId: string }): Promise<JobRow | null> =>
  twice(io, 'job read', () => io.jobs.read(a.jobId, a.userId)).catch(() => null)

/** The last word on a throw no stage answered: infrastructure, said as ours. Never throws itself. */
async function failInfra(io: DeployIo, job: JobRow, c: Clock, e: unknown): Promise<void> {
  io.log('deploy: the job failed', { job: job.id, stage: c.stage, infra: isInfra(e) ? 1 : 0 })
  // a stored doc the editor's door refuses is our fault in the compile's words; anything else is infrastructure
  const error = e instanceof Ours ? refusalWords(e.thrown, { projectId: job.project_id }) : deployError('deploy_infrastructure', { host: '' })
  try {
    await c.end('failed', { error })
  } catch {
    io.log('deploy: the failure could not be written', { job: job.id })
  }
}

/** SHIP IT: the same row, from `awaiting_ship` — re-made first only when stale — then, at the site's FIRST upload, `snapshotting`
 *  (Story 7.20a, FR-J13: the live theme archived before anything replaces it), then `uploading`, `activating` when Deploy &
 *  activate was chosen, the routes step, and `done`.
 *
 *  STORY 7.20a — THE CAPTURE'S RULE. It runs while no project of the user's has a binding for the job's site (`siteBound`), in
 *  either mode, and re-captures — replacing the site's earlier row — until that first binding exists; after it, no deploy
 *  captures (a disconnect and reconnect keeps both). A capture that does not finish UPLOADS NOTHING: the job rests back at
 *  `awaiting_ship` with the capture's answer in `error` (B12b). `withoutSnapshot` is B12b's Deploy without a snapshot: no
 *  capture, `stage_timings.snapshotting = { skipped: true }`. A Cancel pressed during the capture (B12a's, `CANCELLABLE`) is read
 *  after it and before the upload. Re-activate never captures. */
/*  STORY 7.21 — OVERWRITE ONLY ON THE CUSTOMER'S WORD. A Pre-flight that found drift (`stage_timings.drift`, D3a) ships only with
 *  `overwrite` — the route answers 409 without it, and this asks again: unmoved, it does nothing; after a stale re-make, whose
 *  check runs again, a found drift without it rests the job at `awaiting_ship` with no error (D3a, from the new record). A
 *  hand edit made between Run checks and Ship it is missed when nothing is stale (the spec's ponytail: a second download on every
 *  ship to close a minutes-wide window). */
/*  STORY 7.25 — UNDER THE SITE'S LOCK (`underLock`): the row read for the key, then everything — the row read again, the cancel
 *  check, R-264 (a), the deploy read, DW-374's link re-read, the project read with 7.24's held names, the stale re-make, the
 *  capture, the upload, the bind, the activation and the routes step — unchanged and in order inside it. So a second ship to the
 *  same Ghost (a second project, a second account) reads the first one's binding and re-makes under the next free name, a switch
 *  that came first is seen by the link re-read, and a Roll back waits. */
export async function ship(a: { jobId: string; userId: string; mode: Mode; withoutSnapshot?: boolean; overwrite?: boolean }, io: DeployIo): Promise<void> {
  const job = await firstRead(io, a)
  if (job === null || job.stage !== 'awaiting_ship' || job.deploy_id === null) return
  await underLock(io, job, () => shipHeld(a, io), true)
}

/** Ship it's work, inside the lock: the row read again (a double press's first invocation may have moved it while this one waited) */
async function shipHeld(a: { jobId: string; userId: string; mode: Mode; withoutSnapshot?: boolean; overwrite?: boolean }, io: DeployIo): Promise<void> {
  const job = await firstRead(io, a)
  if (job === null || job.stage !== 'awaiting_ship' || job.deploy_id === null) return
  const at = { projectId: job.project_id, siteId: job.site_id, userId: job.user_id }
  const c = clock(io, job)
  let read: ProjectRead | null = null
  try {
    // a Cancel that reached the row on its way to awaiting_ship is honoured, never shipped over
    if (job.cancel_requested) return void (await clear(io, job, c))
    // R-264 (a), asked again on this invocation: a Deploy only that would go live at once is never uploaded — the job rests
    if (a.mode === 'upload' && (await twice(io, 'live project', () => uploadOnlyRefused(at, io)))) return
    let deploy = await twice(io, 'deploy read', () => io.deploys.read(job.deploy_id as string, job.user_id))
    if (deploy === null || deploy.artifact_path === null) return void (await fail(c, deployError('deploy_infrastructure', { host: '' })))
    // DW-374 (R-269): the project's link, read NOW — a project switched or moved away since its Pre-flight sends nothing, and
    // says which sites. Before the claim, so a refused Ship it leaves no stage it never entered
    const moved = await linkRefusal(io, job)
    if (moved !== null) {
      await twice(io, 'deploy failed', () => io.deploys.update(deploy!.id, job.user_id, { status: 'failed' }))
      return void (await fail(c, moved))
    }
    read = await readProject(io, at)
    if (read === null) return void (await fail(c, { code: 'site_not_found', message: DEPLOY_WORDS.noSite }))
    const stale = (await io.hash(read.reads)) !== deploy.inputs_sha256
    // Story 7.21 — the server is the control: a found drift is never shipped over without the customer's word
    if (!stale && job.stage_timings?.drift?.kind === 'found' && a.overwrite !== true) return
    // Story 7.20a — the site's first upload, per site record: archive the live theme first, unless B12b's Deploy without a
    // snapshot said not to
    const first = !(await twice(io, 'site bound', () => io.siteBound({ siteId: job.site_id, userId: job.user_id })))
    const capture = first && a.withoutSnapshot !== true
    if (first && !capture) c.snapshot({ skipped: true })
    // a re-ship after B12b starts the archive's record afresh: a stale artefact recompiles first, and the failed capture's `at`
    // left standing would name a compile or check failure "Archiving … failed" (the review, 2026-10-26)
    if (capture) delete c.timings.snapshotting
    // one Ship it per row: the invocation that moves it off `awaiting_ship` ships; a second press's finds it moved. A capture's
    // earlier answer (B12b) is cleared by the same write
    if (!(await c.claim(stale ? 'compiling' : capture ? 'snapshotting' : 'uploading', { error: null }))) return
    if (stale) {
      const again = await compileAndCheck(io, job, c, deploy)
      if (again.kind !== 'clean') return
      deploy = again.deploy
      read = again.read
      // Story 7.21 — re-made and re-read: a drift found now, without the customer's word, rests on D3a and ships nothing
      if (c.timings.drift?.kind === 'found' && a.overwrite !== true) return void (await c.end('awaiting_ship', { error: null }))
      await c.enter(capture ? 'snapshotting' : 'uploading')
    }
    if (capture) {
      const got = await io.snapshot({ siteId: job.site_id, userId: job.user_id, route: ROUTE, progress: (p) => c.progress(p) })
      if (!got.ok) {
        // B12a's Cancel, pressed while a capture that then failed was running, is honoured here — left on the row, B12b's next
        // press would find it and clear a Ship it the customer asked for (the review, 2026-10-26)
        if (await cancelled(io, job, c)) return
        // nothing uploaded, nothing bound: the job rests where Ship it found it, with the capture's answer for B12b
        io.log('deploy: the capture did not finish', { job: job.id, code: got.code, status: got.status })
        return void (await c.end('awaiting_ship', { error: snapshotError(got.code, got.request, got.status) }))
      }
      // a marked theme is written at once, as the capture's own progress is — with the next edge alone, B12a's row 2 could
      // never say "No snapshot needed" before S8c took over
      if ('marked' in got) await c.progress({ marked: true })
      else c.snapshot({ theme: got.theme, version: got.version, bytes: got.bytes })
      // B12a's Cancel, read after the capture and before the upload — the row the capture wrote stays (it IS the live theme)
      if (await cancelled(io, job, c)) return
      await c.enter('uploading')
    }
    const bytes = await twice(io, 'artifact get', () => io.artifacts.get(deploy!.artifact_path as string))
    const posted = await sendUpload(io, { siteId: job.site_id, themeName: deploy.theme_name, bytes, route: ROUTE })
    const ctx = errorCtx(read, job.site_id)
    if ('thrown' in posted) {
      await twice(io, 'deploy failed', () => io.deploys.update(deploy!.id, job.user_id, { status: 'failed' }))
      return void (await fail(c, deployError(posted.thrown as DeployCode, ctx)))
    }
    const upload = uploadAnswer(posted)
    if ('failed' in upload) {
      if (upload.failed === 'ghost_plan_refused') await twice(io, 'capability', () => io.capability({ siteId: job.site_id, userId: job.user_id, refused: true }))
      await twice(io, 'deploy failed', () => io.deploys.update(deploy!.id, job.user_id, { status: 'failed' }))
      return void (await fail(c, deployError(upload.failed, { ...ctx, ...(upload.detail === undefined ? {} : { detail: upload.detail }) })))
    }
    // accepted: the name is claimed at the first upload Ghost accepts (deploy-only included), then the deploy is `uploaded`
    if (read.bound === null) {
      const bound = await twice(io, 'bind', () => io.bind({ projectId: job.project_id, siteId: job.site_id, userId: job.user_id, themeName: deploy!.theme_name, at: io.now().toISOString() }))
      if (bound === 'taken') {
        await twice(io, 'deploy failed', () => io.deploys.update(deploy!.id, job.user_id, { status: 'failed' }))
        return void (await fail(c, deployError('deploy_running', ctx)))
      }
    }
    // clearing a refused plan's mark is bookkeeping: Ghost has the theme, so a failed write is logged, never the job's failure
    await twice(io, 'capability', () => io.capability({ siteId: job.site_id, userId: job.user_id, refused: false })).catch(() => io.log('deploy: the capability mark was not cleared', { job: job.id }))
    // R-264 (b): Ghost's answer says the upload is ALREADY live — it replaced the active theme's files under the frozen name
    // and made them live (`storage.js`' `activateFromAPIOverride`) — so the deploy is live, no activation is sent, routes are
    // offered and the ending is Live, whichever mode was chosen
    if (upload.active) return void (await goLive(io, job, c, deploy, true))
    // Story 7.23a (DW-400): Ghost took these files now — the version's place in the list, the prune and the drift baseline
    await twice(io, 'deploy uploaded', () => io.deploys.update(deploy!.id, job.user_id, { status: 'uploaded', activated: false, accepted_at: io.now().toISOString() }))
    await pruneAfter(io, job)
    if (a.mode === 'upload') return void (await c.end('done', { error: null }))
    await activateStep(io, job, c, deploy, read)
  } catch (e) {
    await failInfra(io, job, c, e)
  }
}

/** STORY 7.25 — A DOOR'S WORK UNDER ITS SITE'S LOCK (`io.lock`, keyed on the job's site). Not held within `LOCK_WAIT_MS` — or the
 *  lock not taken at all (no connection: ours) — the row is CLAIMED off the stage it was read at to `failed`, and only when this call
 *  moved it is anything more written: Ship it's deploy `failed` (`failDeploy`); Re-activate's stays `uploaded`. A row another
 *  invocation moved meanwhile (a double press) is left alone. Nothing is sent to Ghost, and the wait is never retried. The work
 *  never throws (each door's own `failInfra` answers), so a throw here is the lock's own. */
async function underLock(io: DeployIo, job: JobRow, work: () => Promise<void>, failDeploy: boolean): Promise<void> {
  let error: DeployError
  try {
    if ((await io.lock(job.site_id, work)).held) return
    io.log('deploy: the site\'s lock was not held in time', { job: job.id })
    error = deployError('deploy_running', { host: '' })
  } catch (e) {
    io.log('deploy: the site\'s lock could not be taken', { job: job.id, code: (e as { code?: string } | null)?.code })
    error = deployError('deploy_infrastructure', { host: '' })
  }
  try {
    const moved = await twice(io, 'lock refusal', () => io.jobs.claim(job.id, job.user_id, job.stage, { stage: 'failed', error }))
    if (moved && failDeploy) await twice(io, 'deploy failed', () => io.deploys.update(job.deploy_id as string, job.user_id, { status: 'failed' }))
  } catch {
    io.log('deploy: the lock\'s refusal could not be written', { job: job.id })
  }
}

/** the hour both counts read, as `since` */
const hourBefore = (now: Date): string => new Date(now.getTime() - HOUR_MS).toISOString()

/** STORY 7.25 — FR-J11 AT SHIP IT: the site record's uploads Ghost accepted in the last hour (`deploys.accepted_at` — Roll backs
 *  included), at `SITE_DEPLOYS_PER_HOUR` refused with the minutes until the next; an exempt record (`deploy_rate_limit_exempt`,
 *  §4's targets) never. Null: Ship it may go. Refused at the route, before any work, so the job keeps resting at `awaiting_ship`
 *  with its checked artefact and Ship it works again once the minutes pass. Per site RECORD, never per address: the exemption and
 *  every scope are per record, and a per-address count would let one account spend another's limit. A read that fails throws
 *  (the route's 502). Re-activate, History's put-back, Restore original and Cancel never ask: they compile nothing, and they are
 *  the way back. */
export async function siteLimit(a: { siteId: string; userId: string }, io: Pick<DeployIo, 'limits' | 'now'>): Promise<DeployError | null> {
  const site = await io.limits.site(a)
  if (site?.exempt === true) return null
  const now = io.now()
  const minutes = overLimit(await io.limits.accepted({ ...a, since: hourBefore(now) }), SITE_DEPLOYS_PER_HOUR, now)
  return minutes === null ? null : deployError('deploy_rate_limited', { host: hostOf(site?.url ?? ''), minutes })
}

/** STORY 7.25 — R-295'S COMPILE BUDGET AT RUN CHECKS: the account's jobs started in the last hour (`deploy_jobs.started_at`, any site
 *  or none), at `ACCOUNT_COMPILES_PER_HOUR` refused with the minutes until the next — and a log line naming the account, so a runaway
 *  is visible. Null: the Pre-flight may start. Billing hygiene, never capacity, and one budget on every plan. A read that fails
 *  throws (the route's 502). Story 7.26's export asks it first, on its own job row. */
export async function compileBudget(a: { userId: string }, io: Pick<DeployIo, 'limits' | 'now' | 'log'>): Promise<DeployError | null> {
  const now = io.now()
  const minutes = overLimit(await io.limits.started({ ...a, since: hourBefore(now) }), ACCOUNT_COMPILES_PER_HOUR, now)
  if (minutes === null) return null
  io.log('deploy: compile budget reached', { user: a.userId, minutes })
  return deployError('compile_budget', { host: '', minutes })
}

/** DW-374 (R-269) — THE PROJECT'S LINK, READ NOW: null while it is still the job's site, else the refusal naming the site the
 *  project now ships to and the one it left (or the one alone, when it is linked to none). Ship it and Re-activate both ask it,
 *  so a theme only ever goes to — or goes live on — the project's current site. */
async function linkRefusal(io: DeployIo, job: JobRow): Promise<DeployError | null> {
  const link = await twice(io, 'link', () => io.link({ projectId: job.project_id, siteId: job.site_id, userId: job.user_id }))
  if (link.now !== null && link.now.id === job.site_id) return null
  const was = hostOf(link.was ?? '')
  return link.now === null ? deployError('site_unlinked', { host: was }) : deployError('site_changed', { host: was, to: hostOf(link.now.url) })
}

/** RE-ACTIVATE (D2e's and D2f's button): the uploaded deploy of a job that ended `done` (or failed at activating), activated.
 *  STORY 7.25: everything after its first read under the site's lock, as Ship it's; not held, the job is `failed` with
 *  `deploy_running` and the deploy stays `uploaded` (D2e's Re-activate still offered). */
export async function activate(a: { jobId: string; userId: string }, io: DeployIo): Promise<void> {
  const job = await firstRead(io, a)
  if (job === null || job.deploy_id === null || (job.stage !== 'done' && job.stage !== 'failed')) return
  // only an UPLOADED deploy is Re-activate's, as `activateHeld` asks again inside: a stray press on a live one, or on a check that
  // failed its gate, is never failed `deploy_running` by a wait it should not have had (the Review, 2026-11-27). A read that fails
  // twice leaves it to the work, which answers it as before
  const deploy = await twice(io, 'deploy read', () => io.deploys.read(job.deploy_id as string, job.user_id)).catch(() => undefined)
  if (deploy !== undefined && deploy?.status !== 'uploaded') return
  await underLock(io, job, () => activateHeld(a, io), false)
}

async function activateHeld(a: { jobId: string; userId: string }, io: DeployIo): Promise<void> {
  const job = await firstRead(io, a)
  if (job === null || job.deploy_id === null || (job.stage !== 'done' && job.stage !== 'failed')) return
  const c = clock(io, job)
  try {
    const deploy = await twice(io, 'deploy read', () => io.deploys.read(job.deploy_id as string, job.user_id))
    if (deploy === null || deploy.status !== 'uploaded') return
    // DW-374 at Re-activate too (the Review, 2026-10-19): a theme goes live only on the project's CURRENT site — never on one
    // another project took since the upload. The theme stays uploaded where it is; nothing is sent
    const moved = await linkRefusal(io, job)
    if (moved !== null) return void (await fail(c, moved))
    const read = await readProject(io, { projectId: job.project_id, siteId: job.site_id, userId: job.user_id })
    if (read === null) return void (await fail(c, { code: 'site_not_found', message: DEPLOY_WORDS.noSite }))
    // one re-activate per row, as one Ship it (above): a double press's second invocation finds it `activating`
    if (!(await c.claim('activating', { error: null }))) return
    await activateStep(io, job, c, deploy, read)
  } catch (e) {
    await failInfra(io, job, c, e)
  }
}

/** `activating`: `PUT themes/{name}/activate/`, then — only once it is live — the routes step (R-254). A refusal that is not
 *  the key's or the plan's leaves the theme uploaded and not live (D2e), and nothing is called failed. */
async function activateStep(io: DeployIo, job: JobRow, c: Clock, deploy: DeployRow, read: ProjectRead): Promise<void> {
  await c.enter('activating', { error: null })
  const ctx = errorCtx(read, job.site_id)
  const answer = await sendActivate(io, { siteId: job.site_id, themeName: deploy.theme_name, route: ROUTE })
  if ('thrown' in answer) {
    // the theme is on the site whatever happened here — D2e, never "nothing reached your site"
    if (answer.thrown === 'write_not_allowed') return void (await fail(c, deployError('write_not_allowed', ctx)))
    return void (await c.end('done'))
  }
  const activated = activateAnswer(answer)
  if ('failed' in activated) {
    if (activated.failed === 'ghost_plan_refused') await twice(io, 'capability', () => io.capability({ siteId: job.site_id, userId: job.user_id, refused: true }))
    return void (await fail(c, deployError(activated.failed, ctx)))
  }
  if ('notLive' in activated) return void (await c.end('done'))
  await goLive(io, job, c, deploy)
}

/** THE DEPLOY IS LIVE — by its activation, or by Ghost's own answer to the upload (R-264 b): live, activated, stamped; every
 *  other deploy live on the site demoted; then the routes step (R-254) and `done`. `first` is the upload's own answer — the row's
 *  first write as a version, so the prune follows it (Story 7.22); an activation of an `uploaded` row was pruned for at its upload */
async function goLive(io: DeployIo, job: JobRow, c: Clock, deploy: DeployRow, first = false): Promise<void> {
  const now = io.now().toISOString()
  // Story 7.23a (DW-400): live by the upload's own answer is an upload Ghost accepted now; an activation of an `uploaded` row keeps
  // the time its upload was accepted
  await twice(io, 'deploy live', () => io.deploys.update(deploy.id, job.user_id, { status: 'live', activated: true, activated_at: now, ...(first ? { accepted_at: now } : {}) }))
  if (first) await pruneAfter(io, job)
  await twice(io, 'demote', () => io.deploys.demote({ siteId: job.site_id, userId: job.user_id, except: deploy.id }))
  c.routes(await routesStep(io, job))
  await c.end('done', { error: null })
}

/** STORY 7.22 — PRUNE WHEN A VERSION ARRIVES (FR-J7), right after Ghost's acceptance is written (`uploaded`, or `live` by the
 *  upload's own answer): the project's stored versions past its plan's cap lose their zip. Never when a zip is merely stored — a
 *  Pre-flight that never ships must not evict a real version. BEST EFFORT: a failure is logged by code and never the job's; the
 *  nightly sweep (`api/cron/prune-artifacts`) runs the same prune again. */
async function pruneAfter(io: DeployIo, job: JobRow): Promise<void> {
  try {
    const done = await io.prune({ projectId: job.project_id, userId: job.user_id })
    // an irreversible delete leaves its line: ids only (the review, 2026-11-25)
    if (done.pruned.length > 0) io.log('deploy: versions pruned', { job: job.id, deploys: done.pruned.join(',') })
  } catch (e) {
    io.log('deploy: the prune failed', { job: job.id, code: (e as { code?: string } | null)?.code })
  }
}

/** R-264 (a) — DEPLOY ONLY'S GUARD, as the server asks it: Inflozo's own record says this project's theme is the one live on
 *  the site (the site's latest activated deploy that is still `live`, whichever project made it, is this project's — Story
 *  7.23b's Restore original demotes it), so an upload under the frozen
 *  name would go live at once. The route refuses `ship` in mode `upload` while this holds (422), and `ship` re-asks it. */
export async function uploadOnlyRefused(a: { projectId: string; siteId: string; userId: string }, io: DeployIo): Promise<boolean> {
  return (await io.deploys.liveProject({ siteId: a.siteId, userId: a.userId })) === a.projectId
}

/** Story 7.17's step after activation (R-254): its outcome as the ending says it. A chokepoint error that escapes
 *  `offerRoutes` is retried once, then "failed"; the theme stays live either way. */
async function routesStep(io: DeployIo, job: JobRow): Promise<RoutesEnding> {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      return endingOfRoutes(await io.offerRoutes({ projectId: job.project_id, siteId: job.site_id, userId: job.user_id, route: ROUTE }))
    } catch (e) {
      io.log('deploy: the routes step threw', { code: (e as { code?: string } | null)?.code, attempt })
    }
  }
  return { kind: 'failed', reason: ROUTES_REASONS.thrown as string }
}

/** `offerRoutes`' outcome → the ending (no file: B16 reads `routes_last_offered`). */
export function endingOfRoutes(outcome: RoutesOutcome): RoutesEnding {
  switch (outcome.kind) {
    case 'uploaded':
    case 'unchanged':
      return { kind: 'live' }
    case 'fallback':
      return { kind: 'fallback', cause: outcome.cause }
    case 'kept':
      return { kind: 'none' }
    case 'failed':
      return outcome.code === 'routes_unverified' ? { kind: 'unverified' } : { kind: 'failed', reason: ROUTES_REASONS[outcome.code] ?? (ROUTES_REASONS.thrown as string) }
  }
}

/** CANCEL: set on a job still in `queued`, `compiling`, `checking` or `snapshotting` (the policy's four); the work stops at its next edge
 *  (`preflight` asks once more after writing `awaiting_ship`). The flag is written only while the row still stands where it
 *  was read — the service role bypasses the policy's own stage test — and a row that moved on is read again, once. False
 *  when the job is past them. */
export async function cancel(a: { jobId: string; userId: string }, io: DeployIo): Promise<boolean> {
  for (let attempt = 0; attempt < 2; attempt++) {
    const job = await io.jobs.read(a.jobId, a.userId)
    // STORY 7.20a — B12b's Cancel: a job RESTING at `awaiting_ship` with a capture's answer has no work left to stop at an edge,
    // so it is cancelled here — moved off `awaiting_ship` first, so a Ship it racing it finds it gone, then cleared (the object,
    // then the deploy row: AD-29), as a new Pre-flight abandons a resting check. A clean resting check still refuses a Cancel
    // (7.18a: a press that found Checking finished reads the row again, Ship it ready)
    if (job !== null && job.stage === 'awaiting_ship' && isSnapshotError(job.error)) {
      if (await twice(io, 'cancel resting', () => io.jobs.claim(job.id, job.user_id, 'awaiting_ship', { stage: 'cancelled' }))) {
        await clear(io, job, null)
        return true
      }
      continue
    }
    if (job === null || !CANCELLABLE.includes(job.stage)) return false
    if (await twice(io, 'cancel', () => io.jobs.claim(job.id, job.user_id, job.stage, { cancel_requested: true }))) return true
  }
  return false
}

/** THE WIZARD'S READ: the job, its deploy, the version the site serves from this project, and B16's file. A moving job
 *  untouched past AD-11's budget belonged to a killed invocation and is failed here, so no wizard polls for ever. */
export async function view(a: { jobId: string; userId: string }, io: DeployIo): Promise<DeployView | null> {
  let job = await io.jobs.read(a.jobId, a.userId)
  if (job === null) return null
  if (isMoving(job.stage) && io.now().getTime() - Date.parse(job.updated_at) > STALLED_MS) {
    const error = deployError('deploy_infrastructure', { host: '' })
    await io.jobs.update(job.id, job.user_id, { stage: 'failed', error })
    job = { ...job, stage: 'failed', error }
  }
  const deploy = job.deploy_id === null ? null : await io.deploys.read(job.deploy_id, job.user_id)
  const routes = job.stage_timings?.routes
  return {
    job: { id: job.id, stage: job.stage, error: job.error, timings: job.stage_timings ?? {}, cancelRequested: job.cancel_requested },
    deploy: deploy === null ? null : {
      version: deploy.version, themeName: deploy.theme_name, status: deploy.status, activated: deploy.activated,
      bytes: deploy.artifact_bytes, gscan: deploy.gscan, quality: deploy.quality, preflight: deploy.preflight ?? null,
    },
    previous: await io.deploys.previous({ projectId: job.project_id, siteId: job.site_id, userId: job.user_id, ...(deploy === null ? {} : { except: deploy.id }) }),
    // Story 7.18b — "since your last deploy": the latest ACTIVATED deploy to this site, never an uploaded one (Ghost syncs at
    // activation, F2), and never this one
    previousCustom: await io.deploys.previousCustom({ projectId: job.project_id, siteId: job.site_id, userId: job.user_id, ...(deploy === null ? {} : { except: deploy.id }) }),
    routesFile: routes?.kind === 'fallback' ? await io.routesFile({ siteId: job.site_id, userId: job.user_id }) : null,
  }
}
