#!/usr/bin/env node
// Story 5.1 — the "Pilot sections" project: the editor's fixture for the deployed harness, and ONCE for the owner's own
// account at Deploy (Question 1, ruled option 1, 2026-09-17). Nothing places a section before Story 5.10, so this is
// how a real canvas gets real sections until then; Stories 5.2 to 5.9 reuse it and never seed a second.
//
//   env $(grep -E '^SUPABASE_(URL|SECRET_KEY)=' tools/probe/.env | xargs) node tools/probe/seed-editor-project.mjs --email <address>
//
// Node 24 (type stripping: it reads the app's own `lib/pilots.ts` and `lib/projects.ts`). Keys reach it through
// process.env only and it prints none. It refuses to run without `--email`; there is no help flag, so nothing here
// runs by asking for help (`probe-recorders-ignore-help`). If the account already holds a project of that name it
// prints that project's address and writes nothing, so a repeated Deploy never adds a second one.
//
// What it writes, through the service key: one `projects` row, its slug and style pack made the way `createProject`
// makes them (`projects/actions.ts`: `slugify` → `slugAttempts` against the account's slugs, retried on 23505, and
// `defaultStylePack()`), and three `project_templates` rows — `site` [a1/1], `home` [a4/13, a17/1, a22/1] and `post`
// [a24/1] — each instance at its design's default content and every doc parsed through AD-27's schema before insert.

import { randomUUID } from 'node:crypto'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const REPO = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const load = (rel) => import(pathToFileURL(join(REPO, rel)).href)

/** The harness sets APP_ORIGIN for a local run; the printed address then names that origin, not production. */
export const APP = process.env.APP_ORIGIN || 'https://app.inflozo.com'

/** The fixture, in canvas order. Layer names are "{Category} — {design}", as S4a draws them. */
export const TEMPLATES = {
  site: [['a1/1', 'Header — Rail']],
  home: [['a4/13', 'Hero — Latest Post'], ['a17/1', 'Post Grid — Three Up'], ['a22/1', 'Newsletter — Inline Row']],
  post: [['a24/1', 'Post Header — Centred']],
}

function env(name) {
  const value = process.env[name]
  if (!value) throw new Error(`${name} is not set — read it from tools/probe/.env into this command's environment`)
  return value
}

async function call(path, init = {}) {
  const secret = env('SUPABASE_SECRET_KEY')
  const r = await fetch(`${env('SUPABASE_URL').replace(/\/$/, '')}${path}`, {
    ...init,
    headers: { apikey: secret, Authorization: `Bearer ${secret}`, 'Content-Type': 'application/json', Prefer: 'return=representation', ...(init.headers ?? {}) },
  })
  const text = await r.text()
  let body = null
  try { body = text ? JSON.parse(text) : null } catch { body = text }
  return { status: r.status, body }
}

async function userIdOf(email) {
  for (let page = 1; ; page++) {
    const { status, body } = await call(`/auth/v1/admin/users?page=${page}&per_page=200`)
    if (status !== 200) throw new Error(`the user list answered HTTP ${status}`)
    if (!body.users?.length) throw new Error('no account signs in with that address')
    const user = body.users.find((u) => (u.email ?? '').toLowerCase() === email.toLowerCase())
    if (user) return user.id
  }
}

/** Seeds the project for `email`'s account, or finds the one already there. Returns `{ id, url, created }`. */
export async function seed({ email, name = 'Pilot sections' }) {
  const [{ pilot }, { slugify, slugAttempts }, { defaultStylePack }, { defaultContent, parseDoc }] = await Promise.all([
    load('apps/web/lib/pilots.ts'),
    load('apps/web/lib/projects.ts'),
    load('apps/web/lib/style-pack.ts'),
    load('packages/section-runtime/src/index.ts'),
  ])
  const userId = await userIdOf(email)
  const owned = await call(`/rest/v1/projects?user_id=eq.${userId}&select=id,name,slug`)
  if (owned.status !== 200 || !Array.isArray(owned.body)) throw new Error(`the account's projects answered HTTP ${owned.status}${Array.isArray(owned.body) ? '' : ' with no list'}`)
  const existing = owned.body.find((p) => p.name === name)
  if (existing) return { id: existing.id, url: `${APP}/projects/${existing.id}`, created: false }

  // every doc is built and parsed before anything is written, so a bad fixture writes nothing
  const docs = Object.entries(TEMPLATES).map(([key, instances]) => [key, parseDoc({
    schemaVersion: 1,
    instances: instances.map(([designId, layerName]) => ({
      instanceId: randomUUID(),
      layerName,
      designId,
      content: defaultContent(pilot(designId).contentSchema),
      controls: {},
      data: {},
      darkOverrides: {},
    })),
  }, key)])

  let project = null
  const attempts = slugAttempts(slugify(name), owned.body.map((p) => p.slug))
  for (const slug of attempts) {
    const made = await call('/rest/v1/projects', { method: 'POST', body: JSON.stringify({ user_id: userId, name, slug, style_pack: defaultStylePack() }) })
    if (made.status === 201) { project = made.body[0]; break }
    if (made.body?.code !== '23505') throw new Error(`the project insert answered HTTP ${made.status} (${made.body?.code ?? 'no code'})`)
  }
  if (!project) throw new Error(`${attempts.length} slugs in a row were taken — nothing written`)

  const rows = docs.map(([template_key, doc]) => ({ project_id: project.id, user_id: userId, template_key, doc }))
  const written = await call('/rest/v1/project_templates', { method: 'POST', body: JSON.stringify(rows) })
  if (written.status !== 201) {
    const gone = await call(`/rest/v1/projects?id=eq.${project.id}`, { method: 'DELETE' })
    const removed = gone.status === 200 || gone.status === 204
    throw new Error(`the template insert answered HTTP ${written.status} (${written.body?.code ?? 'no code'}) — ${removed ? 'the project was removed again' : `AND the project ${project.id} could not be removed (HTTP ${gone.status}); delete it by hand`}`)
  }
  return { id: project.id, url: `${APP}/projects/${project.id}`, created: true }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = process.argv.slice(2)
  const at = args.findIndex((a) => a === '--email' || a.startsWith('--email='))
  const email = at === -1 ? '' : args[at].includes('=') ? args[at].slice('--email='.length) : (args[at + 1] ?? '')
  if (!/^[^\s@]+@[^\s@]+$/.test(email)) {
    console.error('refused: --email <the sign-in address of the account to seed> is required, and nothing was written')
    process.exit(2)
  }
  seed({ email }).then(
    ({ url, created }) => console.log(`${created ? 'seeded' : 'already there, nothing written'}: ${url}`),
    (e) => { console.error(`seed failed: ${e.message}`); process.exit(1) },
  )
}
