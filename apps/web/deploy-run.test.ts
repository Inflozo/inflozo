// Story 7.18a — the deploy's shell (`server/deploy/run.ts`) over a fake io, the spec's I/O matrix row by row: every stage
// edge, cancel, abandon, stale, the retry rule, the binding and the routes step. The real io is `deploy-io.ts`; the
// rule (Ghost's answers, the sentences, the step) is `lib/deploy.ts`'s and has its own test (`deploy.test.ts`).
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { CompileRefusal } from '@inflozo/theme-compiler/refusal'
import type { Finding, QualityVerdict, Verdict } from '@inflozo/theme-compiler/gate'
import { DEPLOY_WORDS, endingOf, stepOf } from './lib/deploy.ts'
import type { RoutesOutcome } from './lib/routes-upload.ts'
import { activate, cancel, preflight, preflightFacts, ship, start, uploadOnlyRefused, view, type DeployIo, type DeployRow, type JobRow } from './server/deploy/run.ts'
import type { ProjectRead } from './server/deploy/project-input.ts'
import type { Snapshot } from './server/snapshot.ts'

const P = '00000000-0000-4000-8000-0000000000aa'
const S = '00000000-0000-4000-8000-0000000000bb'
const U = '00000000-0000-4000-8000-0000000000cc'

const finding = (level: 'error' | 'warning', code = level === 'error' ? 'markup_invalid' : 'contrast_low'): Finding =>
  ({ code, message: `${code} said`, level, fatal: false, refs: ['home.hbs'] })
const verdict = (errors: Finding[] = [], warnings: Finding[] = []): Verdict => ({ major: 6, gscan: '6.4.2', blocked: errors.length > 0, errors, warnings })
const quality = (errors: Finding[] = [], warnings: Finding[] = []): QualityVerdict => ({ blocked: errors.length > 0, errors, warnings })

type Answer = { ok: boolean; status: number; body: unknown; text: string }
const okAnswer = (body: unknown = { themes: [{ name: 'inflozo-notes' }] }): Answer => ({ ok: true, status: 200, body, text: JSON.stringify(body) })
const bad = (status: number, body: unknown = {}, text = JSON.stringify(body)): Answer => ({ ok: false, status, body, text })
const adminError = (code: string) => Object.assign(new Error(code), { name: 'AdminError', code })

/** One world: the rows, the bucket, Ghost's answers and every call made, in order. */
function world(over: {
  read?: () => ProjectRead | null
  compile?: () => unknown
  gscan?: Verdict
  quality?: QualityVerdict
  upload?: Array<Answer | Error>
  activate?: Array<Answer | Error>
  routes?: Array<RoutesOutcome | Error>
  put?: Array<Error | null>
  bind?: 'ok' | 'taken'
  hash?: string[]
  /** the project Inflozo's record says is live on the site; by default this project once it has an activated deploy */
  liveProject?: string | null
  /** Story 7.18b — the project's link as Ship it reads it NOW; by default the job's own site */
  link?: { now: { id: string; url: string } | null; was: string | null }
  /** Story 7.18b — the compiled files (by default two) */
  files?: Record<string, string>
  /** Story 7.20a — whether any project of the user's has a binding for the site; by default YES (not the first upload) */
  siteBound?: boolean
  /** Story 7.20a — the capture's answers in turn (by default a theme captured), and a hook run while it works */
  snapshot?: Array<Snapshot | Error>
  duringSnapshot?: (jobs: Map<string, JobRow>) => void
} = {}) {
  let tick = Date.parse('2026-10-18T10:00:00Z')
  const jobs = new Map<string, JobRow>()
  const deploys = new Map<string, DeployRow & { settings_snapshot?: unknown }>()
  const bucket = new Map<string, Uint8Array>()
  const events: string[] = []
  const calls: { method?: string; path: string; item?: string; body?: unknown }[] = []
  const capability: boolean[] = []
  const bound: string[] = []
  let ids = 0
  const id = () => `00000000-0000-4000-8000-${String(++ids).padStart(12, '0')}`
  const upload = [...(over.upload ?? [okAnswer()])]
  const activations = [...(over.activate ?? [okAnswer()])]
  const routes = [...(over.routes ?? [{ kind: 'uploaded', file: 'routes:\n', sha256: 'x' } as RoutesOutcome])]
  const puts = [...(over.put ?? [])]
  const hashes = [...(over.hash ?? [])]
  const snapshots = [...(over.snapshot ?? [])]
  const captured: string[] = []
  const baseRead = (): ProjectRead => ({
    input: { theme: { name: 'inflozo-notes', version: '1.0.0', description: 'Notes' }, language: 'en' } as ProjectRead['input'],
    reads: { project: 'p' },
    routing: { config: null, unreadable: false, problems: [] },
    site: { url: 'https://ghost6.inflozo.com', ghost_version: '6.58.0', capability: 'full', site_settings: { brand: 1 } },
    version: { n: 1, prev: null },
    themeName: 'inflozo-notes',
    bound: null,
    projectName: 'Notes',
    rtlAckAt: null,
    names: {},
  })
  const io: DeployIo = {
    read: async () => (over.read ?? baseRead)(),
    compile: () => {
      events.push('compile')
      if (over.compile) over.compile()
      return { files: over.files ?? { 'package.json': '{}\n', 'index.hbs': 'x' }, css: {} as never, js: { bundled: [], atRest: [] }, custom: { emitted: [], parked: [] }, noindex: [] }
    },
    gscan: async () => over.gscan ?? verdict(),
    quality: () => over.quality ?? quality(),
    zip: (files) => new TextEncoder().encode(Object.keys(files).join(',')),
    hash: async () => hashes.shift() ?? 'h1',
    jobs: {
      insert: async (row) => {
        const j: JobRow = { id: id(), ...row, stage: 'queued', cancel_requested: false, deploy_id: null, error: null, stage_timings: {}, updated_at: new Date(tick).toISOString() }
        jobs.set(j.id, j)
        return { ...j }
      },
      read: async (jid) => (jobs.has(jid) ? { ...(jobs.get(jid) as JobRow) } : null),
      update: async (jid, _u, patch) => {
        const j = jobs.get(jid) as JobRow
        if (patch.stage !== undefined && patch.stage !== j.stage) events.push(`stage:${patch.stage}`)
        jobs.set(jid, { ...j, ...patch, updated_at: new Date(tick).toISOString() })
      },
      claim: async (jid, _u, from, patch) => {
        const j = jobs.get(jid) as JobRow
        if (j.stage !== from) return false
        if (patch.stage !== undefined && patch.stage !== j.stage) events.push(`stage:${patch.stage}`)
        jobs.set(jid, { ...j, ...patch, updated_at: new Date(tick).toISOString() })
        return true
      },
      resting: async () => [...jobs.values()].filter((j) => j.stage === 'awaiting_ship').map((j) => ({ ...j })),
    },
    deploys: {
      insert: async (row) => {
        const d = { id: id(), version: row.version, theme_name: row.theme_name, status: row.status, activated: false, artifact_path: null, artifact_bytes: null, gscan: null, quality: null, inputs_sha256: null, activated_at: null, preflight: null }
        deploys.set(d.id, d)
        events.push('deploy:insert')
        return { ...d }
      },
      read: async (did) => (deploys.has(did) ? { ...(deploys.get(did) as DeployRow) } : null),
      update: async (did, _u, patch) => {
        deploys.set(did, { ...(deploys.get(did) as DeployRow), ...patch })
      },
      remove: async (did) => {
        events.push('deploy:remove')
        deploys.delete(did)
      },
      demote: async ({ except }) => {
        for (const [k, d] of deploys) if (k !== except && d.status === 'live') deploys.set(k, { ...d, status: 'uploaded' })
      },
      liveProject: async () => (over.liveProject !== undefined ? over.liveProject : [...deploys.values()].some((d) => d.activated) ? P : null),
      previousCustom: async ({ except }) => {
        const live = [...deploys.values()].filter((d) => d.activated && d.id !== except).sort((a, b) => ((a.activated_at ?? '') < (b.activated_at ?? '') ? 1 : -1))[0]
        return live?.preflight?.custom ?? null
      },
      previous: async ({ except }) => {
        const live = [...deploys.values()].filter((d) => d.activated && d.id !== except).sort((a, b) => ((a.activated_at ?? '') < (b.activated_at ?? '') ? 1 : -1))[0]
        return live === undefined ? null : Number(live.version.split('.')[0])
      },
    },
    artifacts: {
      put: async (path, bytes) => {
        const e = puts.shift()
        if (e) throw e
        events.push(`put:${path}`)
        bucket.set(path, bytes)
      },
      get: async (path) => bucket.get(path) as Uint8Array,
      remove: async (path) => {
        events.push('object:remove')
        bucket.delete(path)
      },
    },
    bind: async ({ themeName }) => {
      bound.push(themeName)
      return over.bind ?? 'ok'
    },
    capability: async ({ refused }) => {
      capability.push(refused)
    },
    siteBound: async () => over.siteBound ?? true,
    snapshot: async ({ progress }) => {
      events.push('snapshot')
      over.duringSnapshot?.(jobs)
      const next = snapshots.shift() ?? ({ ok: true, id: 'snap-1', theme: 'casper', version: '5.9.4', bytes: 2_100_000 } as Snapshot)
      if (next instanceof Error) throw next
      if (next.ok && !('marked' in next)) {
        await progress?.({ theme: next.theme, version: next.version })
        await progress?.({ bytes: next.bytes })
      }
      captured.push(next.ok ? ('marked' in next ? 'marked' : next.theme) : next.code)
      return next
    },
    link: async () => over.link ?? { now: { id: S, url: 'https://ghost6.inflozo.com' }, was: 'https://ghost6.inflozo.com' },
    call: async (args) => {
      calls.push(args)
      const next = args.item === 'theme_upload' ? upload.shift() : activations.shift()
      if (next instanceof Error) throw next
      return next ?? okAnswer()
    },
    offerRoutes: async () => {
      events.push('routes')
      const next = routes.shift()
      if (next instanceof Error) throw next
      return next as RoutesOutcome
    },
    routesFile: async () => 'routes:\n  /x/: x\n',
    english: (key) => (key === 'nav.more' ? 'More' : undefined),
    now: () => new Date((tick += 1000)),
    log: () => {},
  }
  return { io, jobs, deploys, bucket, events, calls, capability, bound, captured, baseRead, advance: (ms: number) => (tick += ms) }
}

const begin = async (w: ReturnType<typeof world>) => {
  const job = await start({ projectId: P, siteId: S, userId: U }, w.io)
  await preflight({ jobId: job.id, userId: U }, w.io)
  return w.jobs.get(job.id) as JobRow
}

test('Pre-flight, clean: queued → compiling → checking → awaiting_ship; the deploy holds both verdicts, the artefact, its size, the hash and the settings snapshot', async () => {
  const w = world({ gscan: verdict([], [finding('warning', 'page_switch_unused')]) })
  const job = await begin(w)
  assert.deepEqual(w.events.filter((e) => e.startsWith('stage:')), ['stage:compiling', 'stage:checking', 'stage:awaiting_ship'])
  assert.equal(job.stage, 'awaiting_ship')
  const d = w.deploys.get(job.deploy_id as string) as DeployRow & { settings_snapshot: unknown }
  assert.equal(d.status, 'checking')
  assert.equal(d.version, '1.0.0')
  assert.equal(d.theme_name, 'inflozo-notes')
  assert.equal(d.inputs_sha256, 'h1')
  assert.deepEqual(d.settings_snapshot, { brand: 1 })
  assert.equal(d.gscan?.warnings.length, 1, 'warnings only: as clean, the warning kept')
  assert.equal(d.artifact_path, `${P}/${d.id}.zip`)
  assert.deepEqual(w.bucket.get(d.artifact_path as string), new TextEncoder().encode('package.json,index.hbs'))
  assert.equal(d.artifact_bytes, w.bucket.get(d.artifact_path as string)?.length)
  assert.equal(job.stage_timings.compiling?.bytes, d.artifact_bytes, 'Theme compiled shows the zip\'s size')
  assert.ok((job.stage_timings.compiling?.ms ?? -1) >= 0 && (job.stage_timings.checking?.ms ?? -1) >= 0)
  assert.equal(stepOf(job.stage, job.stage_timings), 'check')
  assert.equal(w.calls.length, 0, 'Pre-flight never calls Ghost')
})

test('a gate error: the job fails on the first blocking finding; the deploy is failed with BOTH verdicts and no artefact', async () => {
  const blocking = finding('error')
  const w = world({ quality: quality([blocking], [finding('warning')]) })
  const job = await begin(w)
  assert.equal(job.stage, 'failed')
  assert.deepEqual(job.error, blocking)
  const d = w.deploys.get(job.deploy_id as string) as DeployRow
  assert.equal(d.status, 'failed')
  assert.ok(d.gscan !== null && d.quality !== null)
  assert.equal(d.artifact_path, null)
  assert.equal(w.bucket.size, 0, 'nothing stored')
  assert.equal(stepOf(job.stage, job.stage_timings), 'check', 'a blocked Pre-flight sits on Check')
})

test('routing unfit or unreadable, and a Ghost major outside 5–6, block before any compile, with no deploy row', async () => {
  const unfit = world({ read: () => ({ ...unfit.baseRead(), routing: { config: null, unreadable: false, problems: [{ line: 4, at: 'x', message: 'Two routes share /x/.' }] } }) })
  const a = await begin(unfit)
  assert.deepEqual(a.error, { code: 'routes_invalid', message: DEPLOY_WORDS.routesLine(4, 'Two routes share /x/.') })
  const unread = world({ read: () => ({ ...unread.baseRead(), routing: { config: null, unreadable: true, problems: [] } }) })
  assert.equal((await begin(unread)).error?.code, 'routes_unreadable')
  const old = world({ read: () => ({ ...old.baseRead(), site: { ...old.baseRead().site, ghost_version: '4.48.9' } }) })
  const b = await begin(old)
  assert.equal(b.error?.code, 'ghost_version_unsupported')
  assert.equal(b.error?.message, DEPLOY_WORDS.versionUnsupported('ghost6.inflozo.com', '4.48.9'))
  for (const w of [unfit, unread, old]) {
    assert.ok(!w.events.includes('compile') && !w.events.includes('deploy:insert'), 'nothing compiled, no deploy row')
  }
  // the control: 5 and 6 both ship
  const five = world({ read: () => ({ ...five.baseRead(), site: { ...five.baseRead().site, ghost_version: '5.130.6' } }) })
  assert.equal((await begin(five)).stage, 'awaiting_ship')
})

test('a compile refusal: a customer-caused class in its plain words, an unclassified one as our fault with the compile\'s words kept for us — the deploy failed, nothing stored', async () => {
  const theirs = world({ compile: () => { throw new CompileRefusal('cardDesigns', 'card designs: nope') } })
  const a = await begin(theirs)
  assert.equal(a.error?.code, 'compile_refused')
  assert.equal(a.error?.message, DEPLOY_WORDS.cardDesigns)
  assert.equal((theirs.deploys.get(a.deploy_id as string) as DeployRow).status, 'failed')
  const ours = world({ compile: () => { throw new Error('partials/x.hbs: a library defect') } })
  const b = await begin(ours)
  assert.deepEqual(b.error, { code: 'compile_failed', message: DEPLOY_WORDS.ourFault, detail: 'partials/x.hbs: a library defect' })
  assert.equal(ours.bucket.size + theirs.bucket.size, 0)
})

test('an infrastructure failure is retried once (and then succeeds), or fails the job as ours after the second', async () => {
  const once = world({ put: [new Error('storage 503')] })
  assert.equal((await begin(once)).stage, 'awaiting_ship')
  const twice = world({ put: [new Error('storage 503'), new Error('storage 503')] })
  const job = await begin(twice)
  assert.equal(job.stage, 'failed')
  assert.equal(job.error?.code, 'deploy_infrastructure')
  assert.equal(job.error?.message, DEPLOY_WORDS.infrastructure)
  // a gate result is never retried: one gscan run, one quality run
  let runs = 0
  const gated = world({})
  gated.io.gscan = async () => (runs++, verdict([finding('error')]))
  await begin(gated)
  assert.equal(runs, 1)
})

test('Cancel during Checking: the work stops at the next edge, the job is cancelled, and the object then the deploy row are deleted', async () => {
  const w = world({})
  const job = await start({ projectId: P, siteId: S, userId: U }, w.io)
  w.io.gscan = async () => {
    assert.equal(await cancel({ jobId: job.id, userId: U }, w.io), true)
    return verdict()
  }
  await preflight({ jobId: job.id, userId: U }, w.io)
  const after = w.jobs.get(job.id) as JobRow
  assert.equal(after.stage, 'cancelled')
  assert.equal(after.deploy_id, null)
  assert.equal(w.deploys.size, 0, 'no Deploy row')
  assert.equal(w.bucket.size, 0, 'no object')
  assert.equal(stepOf(after.stage), 'destination')
  // a stage past cancelling refuses it
  const done = world({})
  const shipped = await begin(done)
  await ship({ jobId: shipped.id, userId: U, mode: 'activate' }, done.io)
  assert.equal(await cancel({ jobId: shipped.id, userId: U }, done.io), false)
})

test('Cancel once the artefact is stored: the object goes before the row (AD-29)', async () => {
  const w = world({})
  const job = await start({ projectId: P, siteId: S, userId: U }, w.io)
  const put = w.io.artifacts.put
  w.io.artifacts.put = async (path, bytes) => {
    await put(path, bytes)
    await cancel({ jobId: job.id, userId: U }, w.io)
  }
  await preflight({ jobId: job.id, userId: U }, w.io)
  assert.equal(w.jobs.get(job.id)?.stage, 'cancelled')
  const removes = w.events.filter((e) => e === 'object:remove' || e === 'deploy:remove')
  assert.deepEqual(removes, ['object:remove', 'deploy:remove'])
})

test('an abandoned check: a newer Pre-flight cancels the one resting at awaiting_ship and deletes its deploy and object', async () => {
  const w = world({})
  const first = await begin(w)
  assert.equal(first.stage, 'awaiting_ship')
  const second = await begin(w)
  assert.equal(w.jobs.get(first.id)?.stage, 'cancelled')
  assert.equal(w.deploys.has(first.deploy_id as string), false)
  assert.equal(second.stage, 'awaiting_ship')
  assert.equal(w.bucket.size, 1, 'only the newer artefact')
})

test('Ship it, fresh: the stored artefact itself is uploaded (same bytes, `file` named by the theme), then activated; the binding is claimed at the first accepted upload; routes offered; Live', async () => {
  const w = world({})
  const job = await begin(w)
  const stored = w.bucket.get((w.deploys.get(job.deploy_id as string) as DeployRow).artifact_path as string) as Uint8Array
  await ship({ jobId: job.id, userId: U, mode: 'activate' }, w.io)
  const done = w.jobs.get(job.id) as JobRow
  assert.equal(done.stage, 'done')
  assert.equal(w.events.filter((e) => e === 'compile').length, 1, 'one compile per deploy: a fresh artefact is not re-made')
  const [up, act] = w.calls
  assert.equal(up?.method, 'POST')
  assert.equal(up?.path, 'themes/upload/')
  assert.equal(up?.item, 'theme_upload')
  const file = (up?.body as FormData).get('file') as File
  assert.equal(file.name, 'inflozo-notes.zip')
  assert.deepEqual(new Uint8Array(await file.arrayBuffer()), stored, 'Ghost receives the artefact Pre-flight checked')
  assert.equal(act?.method, 'PUT')
  assert.equal(act?.path, 'themes/inflozo-notes/activate/')
  assert.equal(act?.item, 'theme_activate')
  const d = w.deploys.get(job.deploy_id as string) as DeployRow
  assert.equal(d.status, 'live')
  assert.equal(d.activated, true)
  assert.ok(d.activated_at !== null)
  assert.deepEqual(w.bound, ['inflozo-notes'])
  assert.deepEqual(done.stage_timings.routes, { kind: 'live' })
  assert.equal(endingOf(done.stage, d, done.stage_timings), 'live')
  assert.deepEqual(w.capability, [false], 'an accepted upload clears a deploy-error mark')
})

test('two presses of Ship it on one row ship once: the invocation that moves it off awaiting_ship uploads, the other does nothing — and a double re-activate activates once', async () => {
  const w = world({})
  const job = await begin(w)
  await Promise.all([ship({ jobId: job.id, userId: U, mode: 'upload' }, w.io), ship({ jobId: job.id, userId: U, mode: 'upload' }, w.io)])
  assert.equal(w.calls.filter((c) => c.item === 'theme_upload').length, 1, 'one upload for one row')
  assert.equal((w.jobs.get(job.id) as JobRow).stage, 'done')
  await Promise.all([activate({ jobId: job.id, userId: U }, w.io), activate({ jobId: job.id, userId: U }, w.io)])
  assert.equal(w.calls.filter((c) => c.item === 'theme_activate').length, 1, 'one activation for one press, however many arrive')
  assert.equal(w.deploys.get(job.deploy_id as string)?.status, 'live')
  // CONTROL: one press after the other still ships the next row — the claim refuses only a row already moved
  const next = await begin(w)
  await ship({ jobId: next.id, userId: U, mode: 'activate' }, w.io)
  assert.equal(w.calls.filter((c) => c.item === 'theme_upload').length, 2)
})

test('Deploy only: uploaded, not activated, no routes offered — D2f; Re-activate then makes it live and offers routes', async () => {
  const w = world({})
  const job = await begin(w)
  await ship({ jobId: job.id, userId: U, mode: 'upload' }, w.io)
  let done = w.jobs.get(job.id) as JobRow
  const d = w.deploys.get(job.deploy_id as string) as DeployRow
  assert.equal(done.stage, 'done')
  assert.equal(d.status, 'uploaded')
  assert.equal(d.activated, false)
  assert.ok(!w.events.includes('routes'))
  assert.equal(endingOf(done.stage, d, done.stage_timings), 'uploadOnly')
  await activate({ jobId: job.id, userId: U }, w.io)
  done = w.jobs.get(job.id) as JobRow
  assert.equal(w.deploys.get(job.deploy_id as string)?.status, 'live')
  assert.ok(w.events.includes('routes'))
  assert.equal(endingOf(done.stage, w.deploys.get(job.deploy_id as string) as DeployRow, done.stage_timings), 'live')
})

test('activation fails (upload 200, activate 422): uploaded, not live, D2e, no routes — nothing is called failed; a binding already held is not claimed again', async () => {
  const w = world({ activate: [bad(422, { errors: [{ type: 'ValidationError', message: 'no such theme' }] })], read: () => ({ ...w.baseRead(), bound: 'inflozo-notes' }) })
  const job = await begin(w)
  await ship({ jobId: job.id, userId: U, mode: 'activate' }, w.io)
  const done = w.jobs.get(job.id) as JobRow
  assert.equal(done.stage, 'done')
  assert.equal(done.error, null)
  assert.equal(w.deploys.get(job.deploy_id as string)?.status, 'uploaded')
  assert.equal(endingOf(done.stage, w.deploys.get(job.deploy_id as string) as DeployRow, done.stage_timings), 'notLive')
  assert.ok(!w.events.includes('routes'))
  assert.deepEqual(w.bound, [])
})

test('Ghost\'s answers to the upload, each its own code and sentence; Ghost\'s text only ever as detail; the plan refusal marks the site Preview-only', async () => {
  const cases: [Answer | Error, string][] = [
    [bad(401, { errors: [{ type: 'UnauthorizedError' }] }), 'ghost_key_refused'],
    [bad(500, { errors: [{ type: 'InternalServerError', message: "EEXIST: file already exists, mkdir '/var/lib/ghost'" }] }), 'deploy_running'],
    [bad(422, { errors: [{ type: 'ThemeValidationError', message: 'Theme is not compatible' }] }), 'ghost_theme_refused'],
    [bad(403, { errors: [{ type: 'HostLimitError', message: 'Upgrade' }] }), 'ghost_plan_refused'],
    [bad(415, { errors: [{ type: 'UnsupportedMediaTypeError', code: 'COMPRESSED_TOO_LARGE' }] }), 'theme_too_large'],
    [bad(503), 'ghost_unavailable'],
    [bad(301), 'ghost_redirected'],
    [adminError('ghost_unreachable'), 'ghost_unreachable'],
    [adminError('write_not_allowed'), 'write_not_allowed'],
  ]
  for (const [answer, code] of cases) {
    const w = world({ upload: [answer] })
    const job = await begin(w)
    await ship({ jobId: job.id, userId: U, mode: 'activate' }, w.io)
    const failed = w.jobs.get(job.id) as JobRow
    assert.equal(failed.stage, 'failed', code)
    assert.equal(failed.error?.code, code)
    assert.ok(!JSON.stringify(failed.error?.message ?? '').includes('EEXIST'), `${code}: Ghost's text never in the message`)
    assert.equal(stepOf(failed.stage, failed.stage_timings), 'ship', `${code}: S8d′ on Ship`)
    assert.equal(w.deploys.get(job.deploy_id as string)?.status, 'failed')
    assert.equal(w.calls.length, 1, `${code}: a Ghost answer is never retried`)
    assert.deepEqual(w.capability, code === 'ghost_plan_refused' ? [true] : [], code)
    assert.deepEqual(w.bound, [], `${code}: no binding for a refused upload`)
  }
  const refused = world({ upload: [bad(422, { errors: [{ type: 'ThemeValidationError', message: 'Theme is not compatible' }] })] })
  const j = await begin(refused)
  await ship({ jobId: j.id, userId: U, mode: 'activate' }, refused.io)
  assert.equal(refused.jobs.get(j.id)?.error?.detail, 'Theme is not compatible')
})

test('a thrown chokepoint error that is infrastructure is retried once; the key refused at activation fails with the deploy uploaded', async () => {
  const w = world({ upload: [adminError('credential_store_unavailable'), okAnswer()] })
  const job = await begin(w)
  await ship({ jobId: job.id, userId: U, mode: 'activate' }, w.io)
  assert.equal(w.jobs.get(job.id)?.stage, 'done')
  assert.equal(w.calls.filter((c) => c.item === 'theme_upload').length, 2)
  const k = world({ activate: [bad(401)] })
  const kj = await begin(k)
  await ship({ jobId: kj.id, userId: U, mode: 'activate' }, k.io)
  const failed = k.jobs.get(kj.id) as JobRow
  assert.equal(failed.error?.code, 'ghost_key_refused')
  assert.equal(failed.error?.message, DEPLOY_WORDS.keyRefused)
  assert.equal(k.deploys.get(kj.deploy_id as string)?.status, 'uploaded')
})

test('stale at Ship: the same row re-runs compiling and checking, then uploads — or stops as a gate error when it is now blocked', async () => {
  const w = world({ hash: ['h1', 'h2', 'h2'] })
  const job = await begin(w)
  await ship({ jobId: job.id, userId: U, mode: 'activate' }, w.io)
  assert.equal(w.events.filter((e) => e === 'compile').length, 2)
  assert.equal(w.deploys.size, 1, 'the same deploy row')
  const d = w.deploys.get(job.deploy_id as string) as DeployRow
  assert.equal(d.inputs_sha256, 'h2')
  assert.equal(d.status, 'live')
  assert.equal(w.bucket.size, 1, 'the old object replaced')
  let blocked = false
  const v = world({ hash: ['h1', 'h2', 'h2'] })
  v.io.gscan = async () => (blocked ? verdict([finding('error')]) : verdict())
  const vj = await begin(v)
  blocked = true
  await ship({ jobId: vj.id, userId: U, mode: 'activate' }, v.io)
  assert.equal(v.jobs.get(vj.id)?.stage, 'failed')
  assert.equal(v.calls.length, 0, 'nothing uploaded')
})

test('a 23505 on the binding that is not this name stops the ship with AD-24\'s running sentence', async () => {
  const w = world({ bind: 'taken' })
  const job = await begin(w)
  await ship({ jobId: job.id, userId: U, mode: 'activate' }, w.io)
  assert.equal(w.jobs.get(job.id)?.error?.code, 'deploy_running')
  assert.equal(w.calls.filter((c) => c.item === 'theme_activate').length, 0)
})

test('the routes step\'s outcomes at the ending: fallback, unverified, failed, kept, and a throw retried once then failed — the theme live in every case', async () => {
  const cases: [Array<RoutesOutcome | Error>, unknown][] = [
    [[{ kind: 'fallback', cause: 'no_token', file: 'f' }], { kind: 'fallback', cause: 'no_token' }],
    [[{ kind: 'failed', code: 'routes_unverified' }], { kind: 'unverified' }],
    [[{ kind: 'failed', code: 'ghost_unavailable' }], { kind: 'failed', reason: 'your site is busy or down' }],
    [[{ kind: 'kept' }], { kind: 'none' }],
    [[new Error('store'), { kind: 'unchanged', file: 'f', sha256: 's' }], { kind: 'live' }],
    [[new Error('store'), new Error('store')], { kind: 'failed', reason: 'something went wrong on our side' }],
  ]
  for (const [routes, ending] of cases) {
    const w = world({ routes })
    const job = await begin(w)
    await ship({ jobId: job.id, userId: U, mode: 'activate' }, w.io)
    const done = w.jobs.get(job.id) as JobRow
    assert.equal(done.stage, 'done')
    assert.deepEqual(done.stage_timings.routes, ending)
    assert.equal(w.deploys.get(job.deploy_id as string)?.status, 'live')
  }
  const f = world({ routes: [{ kind: 'fallback', cause: 'revoked', file: 'f' }] })
  const fj = await begin(f)
  await ship({ jobId: fj.id, userId: U, mode: 'activate' }, f.io)
  assert.equal((await view({ jobId: fj.id, userId: U }, f.io))?.routesFile, 'routes:\n  /x/: x\n', 'B16 is handed its file')
})

test('view: the job and its deploy as the wizard reads them; a moving job no invocation has touched past AD-11\'s budget is failed, never polled for ever', async () => {
  const w = world({})
  const job = await begin(w)
  const seen = await view({ jobId: job.id, userId: U }, w.io)
  assert.equal(seen?.job.stage, 'awaiting_ship')
  assert.equal(seen?.deploy?.version, '1.0.0')
  assert.equal(seen?.previous, null)
  const stuck = await start({ projectId: P, siteId: S, userId: U }, w.io)
  w.advance(400_000)
  const gone = await view({ jobId: stuck.id, userId: U }, w.io)
  assert.equal(gone?.job.stage, 'failed')
  assert.equal(gone?.job.error?.code, 'deploy_infrastructure')
  assert.equal(await view({ jobId: '00000000-0000-4000-8000-999999999999', userId: U }, w.io), null)
})

test('R-264 (b): an upload Ghost answers active (it replaced the live theme) is live at once in BOTH modes — no PUT activate, routes offered, the ending Live', async () => {
  for (const mode of ['upload', 'activate'] as const) {
    const w = world({ upload: [okAnswer({ themes: [{ name: 'inflozo-notes', active: true }] })], liveProject: 'someone-else' })
    const job = await begin(w)
    await ship({ jobId: job.id, userId: U, mode }, w.io)
    const done = w.jobs.get(job.id) as JobRow
    const d = w.deploys.get(job.deploy_id as string) as DeployRow
    assert.equal(done.stage, 'done', mode)
    assert.equal(d.status, 'live', mode)
    assert.equal(d.activated, true, mode)
    assert.ok(d.activated_at !== null, mode)
    assert.deepEqual(w.calls.map((c) => c.item), ['theme_upload'], `${mode}: no separate activation`)
    assert.equal(done.stage_timings.activating, undefined, mode)
    assert.ok(w.events.includes('routes'), `${mode}: routes offered`)
    assert.equal(endingOf(done.stage, d, done.stage_timings), 'live', `${mode}: Live, never D2f`)
  }
  // the control: an answer that does not say active (or says false) is not live — Deploy only ends on D2f
  for (const body of [{ themes: [{ name: 'inflozo-notes', active: false }] }, { themes: [{ name: 'inflozo-notes' }] }]) {
    const w = world({ upload: [okAnswer(body)], liveProject: 'someone-else' })
    const job = await begin(w)
    await ship({ jobId: job.id, userId: U, mode: 'upload' }, w.io)
    const done = w.jobs.get(job.id) as JobRow
    assert.equal(endingOf(done.stage, w.deploys.get(job.deploy_id as string) as DeployRow, done.stage_timings), 'uploadOnly')
  }
})

test('R-264 (a): Deploy only while Inflozo\'s record says this project\'s theme is the live one uploads nothing — the job rests; Deploy & activate, or another project live, goes ahead', async () => {
  const w = world({ liveProject: P })
  const job = await begin(w)
  assert.equal(await uploadOnlyRefused({ projectId: P, siteId: S, userId: U }, w.io), true)
  await ship({ jobId: job.id, userId: U, mode: 'upload' }, w.io)
  assert.equal(w.jobs.get(job.id)?.stage, 'awaiting_ship', 'nothing moved')
  assert.equal(w.calls.length, 0, 'nothing uploaded')
  // Deploy & activate is never blocked
  await ship({ jobId: job.id, userId: U, mode: 'activate' }, w.io)
  assert.equal(w.jobs.get(job.id)?.stage, 'done')
  // the controls: another project's theme live, or none yet — Deploy only is free
  for (const live of ['another-project', null]) {
    const free = world({ liveProject: live })
    const j = await begin(free)
    assert.equal(await uploadOnlyRefused({ projectId: P, siteId: S, userId: U }, free.io), false, String(live))
    await ship({ jobId: j.id, userId: U, mode: 'upload' }, free.io)
    assert.equal(free.calls.length, 1, String(live))
  }
})

test('Re-activate whose PUT fails stays D2e: the deploy stays uploaded, nothing called failed — from D2f too', async () => {
  const w = world({ activate: [bad(422, { errors: [{ type: 'ValidationError', message: 'busy' }] })], liveProject: 'someone-else' })
  const job = await begin(w)
  await ship({ jobId: job.id, userId: U, mode: 'upload' }, w.io)
  assert.equal(endingOf('done', w.deploys.get(job.deploy_id as string) as DeployRow, (w.jobs.get(job.id) as JobRow).stage_timings), 'uploadOnly', 'D2f first')
  await activate({ jobId: job.id, userId: U }, w.io)
  const after = w.jobs.get(job.id) as JobRow
  const d = w.deploys.get(job.deploy_id as string) as DeployRow
  assert.equal(after.stage, 'done')
  assert.equal(after.error, null)
  assert.equal(d.status, 'uploaded')
  assert.equal(d.activated, false)
  assert.equal(endingOf(after.stage, d, after.stage_timings), 'notLive', 'D2e')
  assert.ok(!w.events.includes('routes'), 'no routes offered')
})

/* ── the review (2026-10-19) ─────────────────────────────────────────────────────────────────────────────────────── */

test('a Cancel that lands after the last edge\'s read and before awaiting_ship is written is honoured: the job ends cancelled, nothing left', async () => {
  const w = world({})
  const job = await start({ projectId: P, siteId: S, userId: U }, w.io)
  const update = w.io.jobs.update
  w.io.jobs.update = async (jid, u, patch) => {
    // the press arrives while the row still stands at checking, after compileAndCheck's last look
    if (patch.stage === 'awaiting_ship') assert.equal(await cancel({ jobId: jid, userId: U }, w.io), true)
    await update(jid, u, patch)
  }
  await preflight({ jobId: job.id, userId: U }, w.io)
  assert.equal(w.jobs.get(job.id)?.stage, 'cancelled')
  assert.equal(w.deploys.size, 0, 'no Deploy row')
  assert.equal(w.bucket.size, 0, 'no object')
})

test('Cancel writes its flag only while the row still stands where it was read: a row that moved on to awaiting_ship refuses it', async () => {
  const w = world({})
  const job = await begin(w)
  assert.equal(job.stage, 'awaiting_ship')
  // the control for the conditional: the first read is a stale one, still saying checking
  const read = w.io.jobs.read
  let stale = true
  w.io.jobs.read = async (jid, u) => {
    const row = await read(jid, u)
    if (stale && row !== null) {
      stale = false
      return { ...row, stage: 'checking' }
    }
    return row
  }
  assert.equal(await cancel({ jobId: job.id, userId: U }, w.io), false)
  assert.equal(w.jobs.get(job.id)?.cancel_requested, false, 'nothing written')
})

test('Ship it on a row whose Cancel was set honours the Cancel: nothing uploaded, the job cancelled, its deploy and object gone', async () => {
  const w = world({})
  const job = await begin(w)
  w.jobs.set(job.id, { ...(w.jobs.get(job.id) as JobRow), cancel_requested: true })
  await ship({ jobId: job.id, userId: U, mode: 'activate' }, w.io)
  assert.equal(w.jobs.get(job.id)?.stage, 'cancelled')
  assert.equal(w.calls.length, 0, 'nothing reached Ghost')
  assert.equal(w.deploys.size + w.bucket.size, 0)
})

test('Deploy only\'s re-ask that cannot be read fails the job as ours — it never leaves the wizard waiting on a row that will not move', async () => {
  const w = world({ liveProject: null })
  const job = await begin(w)
  w.io.deploys.liveProject = async () => {
    throw Object.assign(new Error('db'), { infra: true })
  }
  await ship({ jobId: job.id, userId: U, mode: 'upload' }, w.io)
  const after = w.jobs.get(job.id) as JobRow
  assert.equal(after.stage, 'failed')
  assert.equal(after.error?.code, 'deploy_infrastructure')
  assert.equal(w.calls.length, 0, 'nothing uploaded')
})

test('clearing a refused plan\'s mark is bookkeeping: a capability write that fails after Ghost took the theme never fails the ship', async () => {
  const w = world({})
  const job = await begin(w)
  w.io.capability = async () => {
    throw Object.assign(new Error('db'), { infra: true })
  }
  await ship({ jobId: job.id, userId: U, mode: 'activate' }, w.io)
  const after = w.jobs.get(job.id) as JobRow
  assert.equal(after.stage, 'done')
  assert.equal((w.deploys.get(job.deploy_id as string) as DeployRow).status, 'live')
})

/* ── Story 7.18b — the RTL block, the facts, DW-374's link and "since your last deploy" ─────────────────────────────────── */

test('7.18b: an unacknowledged right-to-left language blocks before any compile — no deploy row, the way out to Translations; acknowledged, it checks (the control)', async () => {
  const rtl = world({ read: () => ({ ...rtl.baseRead(), input: { ...rtl.baseRead().input, language: 'ar' } }) })
  const job = await begin(rtl)
  assert.equal(job.stage, 'failed')
  assert.deepEqual(job.error, { code: 'rtl_unacknowledged', message: DEPLOY_WORDS.rtlBlocked, action: DEPLOY_WORDS.openTranslations, href: `/projects/${P}/settings/translations` })
  assert.ok(!rtl.events.includes('compile') && !rtl.events.includes('deploy:insert'), 'nothing compiled, nothing stored')
  const acked = world({ read: () => ({ ...acked.baseRead(), input: { ...acked.baseRead().input, language: 'ar' }, rtlAckAt: '2026-10-19T08:00:00Z' }) })
  assert.equal((await begin(acked)).stage, 'awaiting_ship')  // the Review: it is the DIRECTION that blocks — Hebrew unacknowledged blocks too; German, a left-to-right language with no
  // acknowledgement at all, checks (the control a rule of "anything but English" would fail)
  const he = world({ read: () => ({ ...he.baseRead(), input: { ...he.baseRead().input, language: 'he' } }) })
  assert.equal((await begin(he)).error?.code, 'rtl_unacknowledged')
  const de = world({ read: () => ({ ...de.baseRead(), input: { ...de.baseRead().input, language: 'de' } }) })
  assert.equal((await begin(de)).stage, 'awaiting_ship')
})

test('7.18b: Pre-flight writes the compile\'s facts beside the verdicts — every .hbs, config.custom as emitted, noindex, and the files carrying a free ask', async () => {
  const files = {
    'package.json': JSON.stringify({ name: 'inflozo-notes', config: { posts_per_page: 12, custom: { color_scheme: { type: 'select', default: 'Auto' } } } }),
    'home.hbs': '{{!< default}}{{> "sections/home/news"}}',
    'partials/sections/home/news.hbs': '{{#if @site.allow_self_signup}}<form data-members-form="signup"></form>{{/if}}',
    'assets/css/screen.css': '@site.allow_self_signup',
  }
  const w = world({ files })
  const job = await begin(w)
  const d = w.deploys.get(job.deploy_id as string) as DeployRow
  assert.deepEqual(d.preflight, { templates: ['home.hbs', 'partials/sections/home/news.hbs'], custom: { color_scheme: { type: 'select', default: 'Auto' } }, noindex: [], freeAsks: ['partials/sections/home/news.hbs'] })
  assert.deepEqual(preflightFacts({ files: { 'package.json': '{"config":{}}', 'index.hbs': 'x' }, noindex: ['tag'] }), { templates: ['index.hbs'], custom: null, noindex: ['tag'], freeAsks: [] }, 'no custom, no ask')
})

test('7.18b (DW-374, R-269): Ship it re-reads the project\'s link — unlinked or moved to another site, nothing is uploaded and both sites are named; an unchanged link ships (the control)', async () => {
  const unlinked = world({ link: { now: null, was: 'https://ghost6.inflozo.com' } })
  const a = await begin(unlinked)
  await ship({ jobId: a.id, userId: U, mode: 'activate' }, unlinked.io)
  const ua = unlinked.jobs.get(a.id) as JobRow
  assert.equal(ua.stage, 'failed')
  assert.deepEqual(ua.error, { code: 'site_unlinked', message: DEPLOY_WORDS.siteUnlinked('ghost6.inflozo.com') })
  assert.equal(unlinked.calls.length, 0, 'nothing uploaded')
  assert.equal(ua.stage_timings.uploading, undefined, 'never entered uploading')
  assert.equal((unlinked.deploys.get(a.deploy_id as string) as DeployRow).status, 'failed')
  const moved = world({ link: { now: { id: '00000000-0000-4000-8000-0000000000dd', url: 'https://blog.example.com' }, was: 'https://ghost6.inflozo.com' } })
  const b = await begin(moved)
  await ship({ jobId: b.id, userId: U, mode: 'activate' }, moved.io)
  assert.deepEqual((moved.jobs.get(b.id) as JobRow).error, { code: 'site_changed', message: DEPLOY_WORDS.siteChanged('blog.example.com', 'ghost6.inflozo.com') })
  assert.equal(moved.calls.length, 0)
  assert.equal(DEPLOY_WORDS.siteChanged('blog.example.com', 'ghost6.inflozo.com'), 'This project now ships to blog.example.com, not ghost6.inflozo.com, so nothing was sent. Go back and run the checks again.')
  const same = world({})
  const c = await begin(same)
  await ship({ jobId: c.id, userId: U, mode: 'activate' }, same.io)
  assert.equal((same.jobs.get(c.id) as JobRow).stage, 'done')
  assert.equal(same.calls.filter((x) => x.item === 'theme_upload').length, 1)
})

test('7.18b (DW-374, the Review): Re-activate re-reads the project\'s link too — unlinked or moved, nothing is activated and the theme stays uploaded; the link unchanged, it activates (the control)', async () => {
  for (const link of [{ now: null, was: 'https://ghost6.inflozo.com' }, { now: { id: '00000000-0000-4000-8000-0000000000dd', url: 'https://blog.example.com' }, was: 'https://ghost6.inflozo.com' }]) {
    const over: Parameters<typeof world>[0] = { liveProject: 'someone-else' }
    const w = world(over)
    const job = await begin(w)
    await ship({ jobId: job.id, userId: U, mode: 'upload' }, w.io)
    const sent = w.calls.length
    // another tab switches the project, or moves its site to another project, while this one rests on D2f
    over.link = link
    await activate({ jobId: job.id, userId: U }, w.io)
    const after = w.jobs.get(job.id) as JobRow
    assert.equal(after.stage, 'failed')
    assert.deepEqual(after.error, link.now === null
      ? { code: 'site_unlinked', message: DEPLOY_WORDS.siteUnlinked('ghost6.inflozo.com') }
      : { code: 'site_changed', message: DEPLOY_WORDS.siteChanged('blog.example.com', 'ghost6.inflozo.com') })
    assert.equal(w.calls.length, sent, 'no activation sent')
    assert.equal((w.deploys.get(job.deploy_id as string) as DeployRow).status, 'uploaded', 'the theme stays uploaded where it is')
    assert.equal(after.stage_timings.activating, undefined, 'never entered activating')
  }
  const same = world({ liveProject: 'someone-else' })
  const job = await begin(same)
  await ship({ jobId: job.id, userId: U, mode: 'upload' }, same.io)
  await activate({ jobId: job.id, userId: U }, same.io)
  assert.equal(same.calls.filter((x) => x.item === 'theme_activate').length, 1)
})

test('7.18b: the view carries the facts and "since your last deploy" — the latest ACTIVATED deploy\'s config.custom, never an uploaded one\'s', async () => {
  const w = world({ files: { 'package.json': JSON.stringify({ config: { custom: { dark_accent_color: { type: 'color', default: '#000001' } } } }), 'home.hbs': 'x' } })
  const first = await begin(w)
  await ship({ jobId: first.id, userId: U, mode: 'activate' }, w.io)
  const second = await begin(w)
  // an uploaded, never-activated deploy between them: it is not "the last deploy" Ghost synced
  const third = await begin(w)
  ;(w.deploys.get(third.deploy_id as string) as DeployRow).preflight = { templates: [], custom: { other: {} }, noindex: [], freeAsks: [] }
  w.deploys.set(third.deploy_id as string, { ...(w.deploys.get(third.deploy_id as string) as DeployRow), status: 'uploaded', activated: false })
  const v = await view({ jobId: third.id, userId: U }, w.io)
  assert.deepEqual(v?.previousCustom, { dark_accent_color: { type: 'color', default: '#000001' } })
  assert.deepEqual(v?.deploy?.preflight?.custom, { other: {} })
  // the control: before any activation there is no "last deploy"
  const fresh = world({})
  const j = await begin(fresh)
  assert.equal((await view({ jobId: j.id, userId: U }, fresh.io))?.previousCustom, null)
  void second
})


/* ── STORY 7.20a — the capture at a site's first upload (FR-J13; B12a, B12b) ── */

test('7.20a: a site\'s FIRST upload archives the live theme before anything is uploaded — snapshotting before uploading, its record on the stage; a site any project has uploaded to does not (the control)', async () => {
  const w = world({ siteBound: false })
  const job = await begin(w)
  await ship({ jobId: job.id, userId: U, mode: 'activate' }, w.io)
  const done = w.jobs.get(job.id) as JobRow
  assert.equal(done.stage, 'done')
  assert.deepEqual(w.events.filter((e) => e.startsWith('stage:') || e === 'snapshot').slice(3), ['stage:snapshotting', 'snapshot', 'stage:uploading', 'stage:activating', 'stage:done'])
  const record = done.stage_timings.snapshotting
  assert.equal(record?.theme, 'casper')
  assert.equal(record?.version, '5.9.4')
  assert.equal(record?.bytes, 2_100_000)
  assert.ok(record?.at !== undefined && (record.ms ?? -1) >= 0, 'a stage of its own, timed')
  assert.equal(w.calls[0]?.item, 'theme_upload', 'the upload comes after the capture')
  assert.equal(stepOf('snapshotting'), 'ship')

  const bound = world({ siteBound: true })
  const again = await begin(bound)
  await ship({ jobId: again.id, userId: U, mode: 'activate' }, bound.io)
  assert.ok(!bound.events.includes('snapshot') && !bound.events.includes('stage:snapshotting'), 'not the first upload: no capture')
  assert.equal((bound.jobs.get(again.id) as JobRow).stage_timings.snapshotting, undefined)
})

test('7.20a: a capture that does not finish UPLOADS NOTHING — the job rests at awaiting_ship with the capture\'s answer (code, request, status), nothing bound, the deploy still checked', async () => {
  for (const failure of [
    { ok: false, code: 'snapshot_needs_token', request: 'GET /ghost/api/admin/themes/', status: 403 },
    { ok: false, code: 'snapshot_needs_token', request: 'GET /ghost/api/admin/themes/', status: 501 },
    { ok: false, code: 'snapshot_token_refused', request: 'GET /ghost/api/admin/themes/', status: 401 },
    { ok: false, code: 'snapshot_failed', request: 'Storage' },
  ] as Snapshot[]) {
    const w = world({ siteBound: false, snapshot: [failure] })
    const job = await begin(w)
    await ship({ jobId: job.id, userId: U, mode: 'activate' }, w.io)
    const rested = w.jobs.get(job.id) as JobRow
    assert.equal(rested.stage, 'awaiting_ship', JSON.stringify(failure))
    assert.equal(w.calls.length, 0, 'nothing reached Ghost\'s write path')
    assert.deepEqual(w.bound, [], 'nothing bound')
    const f = failure as { code: string; request: string; status?: number }
    assert.deepEqual(rested.error, { code: f.code, message: (rested.error as { message: string }).message, request: f.request, ...(f.status === undefined ? {} : { status: f.status }) })
    assert.equal((w.deploys.get(job.deploy_id as string) as DeployRow).status, 'checking', 'the artefact stays shippable')
  }
})

test('7.20a: after B12b — Deploy without a snapshot skips the capture ({ skipped: true }) and uploads; a re-ship after Add token captures again, the earlier answer cleared', async () => {
  const w = world({ siteBound: false, snapshot: [{ ok: false, code: 'snapshot_needs_token', request: 'GET /ghost/api/admin/themes/', status: 403 }] })
  const job = await begin(w)
  await ship({ jobId: job.id, userId: U, mode: 'activate' }, w.io)
  assert.equal((w.jobs.get(job.id) as JobRow).stage, 'awaiting_ship')
  await ship({ jobId: job.id, userId: U, mode: 'activate', withoutSnapshot: true }, w.io)
  const done = w.jobs.get(job.id) as JobRow
  assert.equal(done.stage, 'done')
  assert.deepEqual(done.stage_timings.snapshotting, { skipped: true })
  assert.equal(done.error, null)
  assert.equal(w.captured.length, 1, 'the second press made no capture')

  const r = world({ siteBound: false, snapshot: [{ ok: false, code: 'snapshot_needs_token', request: 'GET /ghost/api/admin/themes/', status: 403 }] })
  const j = await begin(r)
  await ship({ jobId: j.id, userId: U, mode: 'activate' }, r.io)
  await ship({ jobId: j.id, userId: U, mode: 'activate' }, r.io)
  const shipped = r.jobs.get(j.id) as JobRow
  assert.equal(shipped.stage, 'done')
  assert.deepEqual(r.captured, ['snapshot_needs_token', 'casper'], 'captured on the second press, now with the token')
  assert.equal(shipped.error, null)
})

test('7.20a: a theme carrying the marker is never captured — the stage records `marked` and the upload goes on', async () => {
  const w = world({ siteBound: false, snapshot: [{ ok: true, marked: true }] })
  const job = await begin(w)
  // B12a's row 2 says so only if `marked` is on the row WHILE the stage runs — never first written with the upload's edge
  const update = w.io.jobs.update
  let markedWhile: string | null = null
  w.io.jobs.update = async (jid, u, patch) => {
    const row = w.jobs.get(jid) as JobRow
    if (markedWhile === null && patch.stage_timings?.snapshotting?.marked === true) markedWhile = patch.stage ?? row.stage
    return update(jid, u, patch)
  }
  await ship({ jobId: job.id, userId: U, mode: 'activate' }, w.io)
  const done = w.jobs.get(job.id) as JobRow
  assert.equal(done.stage, 'done')
  assert.equal(done.stage_timings.snapshotting?.marked, true)
  assert.equal(done.stage_timings.snapshotting?.theme, undefined)
  assert.equal(markedWhile, 'snapshotting', '`marked` first reached the row with the upload\'s edge')
})

test('7.20a: B12a\'s Cancel — pressed while the capture runs, read after it and before the upload: nothing uploaded, the job cancelled; at uploading it is refused (the control)', async () => {
  let jobId = ''
  const w = world({ siteBound: false, duringSnapshot: () => void cancel({ jobId, userId: U }, w.io) })
  const job = await begin(w)
  jobId = job.id
  await ship({ jobId: job.id, userId: U, mode: 'activate' }, w.io)
  const after = w.jobs.get(job.id) as JobRow
  assert.equal(after.stage, 'cancelled')
  assert.equal(w.calls.length, 0, 'nothing uploaded')
  assert.deepEqual(w.captured, ['casper'], 'the capture\'s own row stays — it is the live theme')
  const live = world({ siteBound: false })
  const shipping = await begin(live)
  await ship({ jobId: shipping.id, userId: U, mode: 'activate' }, live.io)
  live.jobs.set(shipping.id, { ...(live.jobs.get(shipping.id) as JobRow), stage: 'uploading' })
  assert.equal(await cancel({ jobId: shipping.id, userId: U }, live.io), false)
})

test('7.20a: B12b\'s Cancel cancels a job RESTING at awaiting_ship — its object, then its deploy row, gone', async () => {
  const w = world({ siteBound: false, snapshot: [{ ok: false, code: 'snapshot_failed', request: 'GET /ghost/api/admin/themes/', status: 503 }] })
  const job = await begin(w)
  await ship({ jobId: job.id, userId: U, mode: 'activate' }, w.io)
  assert.equal(await cancel({ jobId: job.id, userId: U }, w.io), true)
  assert.equal((w.jobs.get(job.id) as JobRow).stage, 'cancelled')
  assert.equal(w.deploys.size, 0)
  assert.equal(w.bucket.size, 0)
  const events = w.events.slice(w.events.indexOf('stage:awaiting_ship', w.events.indexOf('snapshot')))
  assert.ok(events.indexOf('object:remove') < events.indexOf('deploy:remove'), 'the object before the row (AD-29)')
})

test('7.20a: Deploy only at a first upload captures exactly as Ship it does; Re-activate never captures', async () => {
  const w = world({ siteBound: false })
  const job = await begin(w)
  await ship({ jobId: job.id, userId: U, mode: 'upload' }, w.io)
  assert.deepEqual(w.captured, ['casper'])
  assert.equal((w.jobs.get(job.id) as JobRow).stage, 'done')
  await activate({ jobId: job.id, userId: U }, w.io)
  assert.deepEqual(w.captured, ['casper'], 're-activate made no capture')
})
