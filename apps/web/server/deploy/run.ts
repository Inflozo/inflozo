import type { CompiledTheme, CompileInput } from '@inflozo/theme-compiler'
import type { Finding, QualityVerdict, Verdict } from '@inflozo/theme-compiler/gate'
import type { RoutesOutcome } from '../../lib/routes-upload.ts'
import {
  activateAnswer, CANCELLABLE, deployError, DEPLOY_WORDS, isMoving, refusalWords, ROUTES_REASONS, thrownCode, uploadAnswer,
  type DeployCode, type DeployError, type DeployStatus, type DeployView, type Mode, type RoutesEnding, type Stage, type Timings,
} from '../../lib/deploy.ts'
import { hostOf } from '../../lib/connect-rule.ts'
import type { ProjectRead } from './project-input.ts'

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
    /** this project's jobs to this site resting at `awaiting_ship` — the ones a new Pre-flight abandons */
    resting: (a: { projectId: string; siteId: string; userId: string }) => Promise<JobRow[]>
  }
  deploys: {
    insert: (row: { project_id: string; user_id: string; site_id: string; version: string; theme_name: string; status: DeployStatus }) => Promise<DeployRow>
    read: (id: string, userId: string) => Promise<DeployRow | null>
    update: (id: string, userId: string, patch: Partial<DeployRow> & { settings_snapshot?: unknown }) => Promise<void>
    remove: (id: string, userId: string) => Promise<void>
    /** every other deploy live on this site is no longer live once this one activates */
    demote: (a: { siteId: string; userId: string; except: string }) => Promise<void>
    /** the version the site serves from this project: its last activated deploy's number, or null */
    previous: (a: { projectId: string; siteId: string; userId: string; except?: string }) => Promise<number | null>
    /** R-264 (a): the project whose deploy was activated last on this site, or null — Inflozo's own record of what is live */
    liveProject: (a: { siteId: string; userId: string }) => Promise<string | null>
  }
  artifacts: {
    put: (path: string, bytes: Uint8Array) => Promise<void>
    get: (path: string) => Promise<Uint8Array>
    remove: (path: string) => Promise<void>
  }
  /** claim the frozen name at the first accepted upload (AD-19, VERIFY 30): `ok`, or `taken` on a 23505 whose stored row is
   *  not this name (a concurrent first upload) */
  bind: (a: { projectId: string; siteId: string; userId: string; themeName: string; at: string }) => Promise<'ok' | 'taken'>
  /** FR-C2: the plan refusal marks the site Preview-only (`deploy_error`); an accepted upload clears a `deploy_error` mark */
  capability: (a: { siteId: string; userId: string; refused: boolean }) => Promise<void>
  call: DeployCall
  /** Story 7.17's step, with the real `ROUTES_IO` bound in */
  offerRoutes: (a: { projectId: string; siteId: string; userId: string; route: string }) => Promise<RoutesOutcome>
  /** `sites.routes_last_offered` — B16's file */
  routesFile: (a: { siteId: string; userId: string }) => Promise<string | null>
  /** the catalog's English for a key — Translations' label, for "The translation of …" */
  english: (key: string) => string | undefined
  now: () => Date
  log: (message: string, fields: Record<string, string | number | undefined>) => void
}

const ROUTE = 'projects/deploy'
/** A moving job not touched for longer than AD-11's 300 s (and a margin) was abandoned by a killed invocation. */
const STALLED_MS = 330_000

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

/** AD-20's rule, once: an infrastructure failure is retried once, then thrown as `Infra`. */
async function twice<T>(io: DeployIo, what: string, run: () => Promise<T>): Promise<T> {
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
async function callTwice(io: DeployIo, args: Parameters<DeployCall>[0]): Promise<Awaited<ReturnType<DeployCall>> | { thrown: 'ghost_unreachable' | 'write_not_allowed' | 'deploy_infrastructure' }> {
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

/** Is this major one a theme ships to — FR-J8's "version mismatch" otherwise. */
const shipsTo = (version: string | null): 5 | 6 | null => {
  const major = Number(/^(\d+)\./.exec(version ?? '')?.[1])
  return major === 5 || major === 6 ? major : null
}

/** The job's edges: `enter(stage)` closes the stage before (its `ms`) and opens this one. */
function clock(io: DeployIo, job: JobRow) {
  const timings: Timings = { ...(job.stage_timings ?? {}) }
  let current: Stage = job.stage
  const close = () => {
    const open = timings[current]
    if (open !== undefined && open.ms === undefined) timings[current] = { ...open, ms: Math.max(0, io.now().getTime() - Date.parse(open.at)) }
  }
  return {
    timings,
    get stage() {
      return current
    },
    async enter(stage: Stage, extra: Partial<JobRow> = {}) {
      close()
      current = stage
      timings[stage] = { at: io.now().toISOString() }
      await twice(io, `stage ${stage}`, () => io.jobs.update(job.id, job.user_id, { stage, stage_timings: { ...timings }, ...extra }))
    },
    /** `enter`, but only off the stage the row was read at: false, and nothing written, when another invocation moved it */
    async claim(stage: Stage, extra: Partial<JobRow> = {}): Promise<boolean> {
      const from = current
      close()
      timings[stage] = { at: io.now().toISOString() }
      const moved = await twice(io, `claim ${stage}`, () => io.jobs.claim(job.id, job.user_id, from, { stage, stage_timings: { ...timings }, ...extra }))
      if (moved) current = stage
      return moved
    },
    /** a stage's own detail — the zip's size on compiling */
    note(stage: Stage, patch: { bytes?: number }) {
      const t = timings[stage]
      if (t !== undefined) timings[stage] = { ...t, ...patch }
    },
    async end(stage: Stage, extra: Partial<JobRow> = {}) {
      close()
      current = stage
      if (stage !== 'failed' && stage !== 'cancelled' && stage !== 'awaiting_ship' && stage !== 'done') timings[stage] = { at: io.now().toISOString() }
      await twice(io, `stage ${stage}`, () => io.jobs.update(job.id, job.user_id, { stage, stage_timings: { ...timings }, ...extra }))
    },
    routes(ending: RoutesEnding) {
      timings.routes = ending
    },
  }
}
type Clock = ReturnType<typeof clock>

/** The one way a job fails: its envelope stored, the stage `failed`. */
const fail = (c: Clock, error: DeployError | Finding): Promise<void> => c.end('failed', { error })

/** A cancelled or abandoned job leaves nothing: the object first, then the `deploys` row (AD-29), then the job's stage. */
async function clear(io: DeployIo, job: JobRow, c: Clock | null): Promise<void> {
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

/**
 * COMPILING AND CHECKING, on the job's row — Pre-flight's whole work, and Ship it's again when the artefact is stale. Ends
 * with the artefact stored on the `deploys` row and the answer `clean`, or the job failed or cancelled.
 */
async function compileAndCheck(io: DeployIo, job: JobRow, c: Clock, existing: DeployRow | null): Promise<{ kind: 'clean'; deploy: DeployRow; read: ProjectRead } | { kind: 'stopped' }> {
  const at = { projectId: job.project_id, siteId: job.site_id, userId: job.user_id }
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
    await twice(io, 'deploy reset', () => io.deploys.update(deploy!.id, job.user_id, { status: 'compiling', version, theme_name: read.themeName, artifact_path: null, artifact_bytes: null, gscan: null, quality: null, inputs_sha256: null }))
    deploy = { ...deploy, status: 'compiling', version, theme_name: read.themeName, artifact_path: null, artifact_bytes: null, gscan: null, quality: null, inputs_sha256: null }
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
  if (await cancelled(io, job, c)) return { kind: 'stopped' }
  if (gscan.blocked || quality.blocked) {
    await twice(io, 'deploy blocked', () => io.deploys.update(deploy!.id, job.user_id, { status: 'failed', gscan, quality }))
    const first = gscan.errors[0] ?? quality.errors[0] ?? { code: 'theme_check_failed', message: DEPLOY_WORDS.fixErrors(1), level: 'error', fatal: false, refs: [] }
    await fail(c, first as Finding)
    return { kind: 'stopped' }
  }

  // nothing blocks: the artefact is stored, and only now (routine call 6)
  const path = `${job.project_id}/${deploy.id}.zip`
  await twice(io, 'artifact put', () => io.artifacts.put(path, zip))
  const patch = { gscan, quality, artifact_path: path, artifact_bytes: zip.length, inputs_sha256: hash, settings_snapshot: read.site.site_settings ?? null }
  await twice(io, 'deploy stored', () => io.deploys.update(deploy!.id, job.user_id, patch))
  deploy = { ...deploy, ...patch }
  if (await cancelled(io, job, c)) return { kind: 'stopped' }
  return { kind: 'clean', deploy, read }
}

// ── the doors ───────────────────────────────────────────────────────────────────────────────────────────────────────

/** A NEW PRE-FLIGHT'S ROW, before any work (AD-20: the row exists from `queued`). Any older check of this project to this
 *  site resting at `awaiting_ship` is ABANDONED first — cancelled, its deploy and object deleted. */
export async function start(a: { projectId: string; siteId: string; userId: string }, io: DeployIo): Promise<JobRow> {
  for (const old of await twice(io, 'resting read', () => io.jobs.resting(a))) await clear(io, old, null)
  return twice(io, 'job insert', () => io.jobs.insert({ project_id: a.projectId, user_id: a.userId, site_id: a.siteId }))
}

/** PRE-FLIGHT (Run checks): `queued → compiling → checking → awaiting_ship`, the artefact stored only when nothing blocks. */
export async function preflight(a: { jobId: string; userId: string }, io: DeployIo): Promise<void> {
  const job = await io.jobs.read(a.jobId, a.userId)
  if (job === null || job.stage !== 'queued') return
  const c = clock(io, job)
  try {
    if (job.cancel_requested) return void (await clear(io, job, c))
    const done = await compileAndCheck(io, job, c, null)
    if (done.kind === 'clean') await c.end('awaiting_ship')
  } catch (e) {
    await failInfra(io, job, c, e)
  }
}

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

/** SHIP IT: the same row, from `awaiting_ship` — re-made first only when stale — then `uploading`, `activating` when
 *  Deploy & activate was chosen, the routes step, and `done`. */
export async function ship(a: { jobId: string; userId: string; mode: Mode }, io: DeployIo): Promise<void> {
  const job = await io.jobs.read(a.jobId, a.userId)
  if (job === null || job.stage !== 'awaiting_ship' || job.deploy_id === null) return
  const at = { projectId: job.project_id, siteId: job.site_id, userId: job.user_id }
  // R-264 (a), asked again on this invocation: a Deploy only that would go live at once is never uploaded — the job rests
  if (a.mode === 'upload' && (await uploadOnlyRefused(at, io))) return
  const c = clock(io, job)
  let read: ProjectRead | null = null
  try {
    let deploy = await twice(io, 'deploy read', () => io.deploys.read(job.deploy_id as string, job.user_id))
    if (deploy === null || deploy.artifact_path === null) return void (await fail(c, deployError('deploy_infrastructure', { host: '' })))
    read = await readProject(io, at)
    if (read === null) return void (await fail(c, { code: 'site_not_found', message: DEPLOY_WORDS.noSite }))
    const stale = (await io.hash(read.reads)) !== deploy.inputs_sha256
    // one Ship it per row: the invocation that moves it off `awaiting_ship` ships; a second press's finds it moved
    if (!(await c.claim(stale ? 'compiling' : 'uploading'))) return
    if (stale) {
      const again = await compileAndCheck(io, job, c, deploy)
      if (again.kind !== 'clean') return
      deploy = again.deploy
      read = again.read
      await c.enter('uploading')
    }
    const bytes = await twice(io, 'artifact get', () => io.artifacts.get(deploy!.artifact_path as string))
    const form = new FormData()
    // Ghost names the theme by the zip's filename (VERIFY 30) — the frozen name — and reads the file under `file`
    // (`themeZip('file')`, 6.58.0 `web/api/endpoints/admin/routes.js:251`; `single('file')`, 5.130.6 `:202`)
    form.append('file', new Blob([bytes as BlobPart], { type: 'application/zip' }), `${deploy.theme_name}.zip`)
    const posted = await callTwice(io, { siteId: job.site_id, method: 'POST', path: 'themes/upload/', body: form, item: 'theme_upload', route: ROUTE })
    const ctx = errorCtx(read, job.site_id)
    if ('thrown' in posted) {
      await io.deploys.update(deploy.id, job.user_id, { status: 'failed' })
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
    await twice(io, 'capability', () => io.capability({ siteId: job.site_id, userId: job.user_id, refused: false }))
    // R-264 (b): Ghost's answer says the upload is ALREADY live — it replaced the active theme's files under the frozen name
    // and made them live (`storage.js`' `activateFromAPIOverride`) — so the deploy is live, no activation is sent, routes are
    // offered and the ending is Live, whichever mode was chosen
    if (upload.active) return void (await goLive(io, job, c, deploy))
    await twice(io, 'deploy uploaded', () => io.deploys.update(deploy!.id, job.user_id, { status: 'uploaded', activated: false }))
    if (a.mode === 'upload') return void (await c.end('done', { error: null }))
    await activateStep(io, job, c, deploy, read)
  } catch (e) {
    await failInfra(io, job, c, e)
  }
}

/** RE-ACTIVATE (D2e's and D2f's button): the uploaded deploy of a job that ended `done` (or failed at activating), activated. */
export async function activate(a: { jobId: string; userId: string }, io: DeployIo): Promise<void> {
  const job = await io.jobs.read(a.jobId, a.userId)
  if (job === null || job.deploy_id === null || (job.stage !== 'done' && job.stage !== 'failed')) return
  const c = clock(io, job)
  try {
    const deploy = await twice(io, 'deploy read', () => io.deploys.read(job.deploy_id as string, job.user_id))
    if (deploy === null || deploy.status !== 'uploaded') return
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
  const answer = await callTwice(io, { siteId: job.site_id, method: 'PUT', path: `themes/${encodeURIComponent(deploy.theme_name)}/activate/`, item: 'theme_activate', route: ROUTE })
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
 *  other deploy live on the site demoted; then the routes step (R-254) and `done`. */
async function goLive(io: DeployIo, job: JobRow, c: Clock, deploy: DeployRow): Promise<void> {
  const now = io.now().toISOString()
  await twice(io, 'deploy live', () => io.deploys.update(deploy.id, job.user_id, { status: 'live', activated: true, activated_at: now }))
  await twice(io, 'demote', () => io.deploys.demote({ siteId: job.site_id, userId: job.user_id, except: deploy.id }))
  c.routes(await routesStep(io, job))
  await c.end('done', { error: null })
}

/** R-264 (a) — DEPLOY ONLY'S GUARD, as the server asks it: Inflozo's own record says this project's theme is the one live on
 *  the site (the site's latest activated deploy, whichever project made it, is this project's), so an upload under the frozen
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

/** CANCEL: set on a job still in `queued`, `compiling` or `checking` (the policy's three); the work stops at its next edge.
 *  A job still `queued` with no work begun is cleared here. False when the job is past them. */
export async function cancel(a: { jobId: string; userId: string }, io: DeployIo): Promise<boolean> {
  const job = await io.jobs.read(a.jobId, a.userId)
  if (job === null || !CANCELLABLE.includes(job.stage)) return false
  await twice(io, 'cancel', () => io.jobs.update(job.id, job.user_id, { cancel_requested: true }))
  return true
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
      bytes: deploy.artifact_bytes, gscan: deploy.gscan, quality: deploy.quality,
    },
    previous: await io.deploys.previous({ projectId: job.project_id, siteId: job.site_id, userId: job.user_id, ...(deploy === null ? {} : { except: deploy.id }) }),
    routesFile: routes?.kind === 'fallback' ? await io.routesFile({ siteId: job.site_id, userId: job.user_id }) : null,
  }
}
