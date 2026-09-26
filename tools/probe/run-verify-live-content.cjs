#!/usr/bin/env node
/**
 * STORY 5.18 — LIVE CONTENT FROM THE CONNECTED SITE, ON THE DEPLOYED EDITOR, AGAINST REAL GHOSTS (R-82).
 *
 *   env $(grep -E '^(SUPABASE_URL|SUPABASE_SECRET_KEY|VERCEL_TOKEN|VERCEL_TEAM_ID|GHOST5_URL|GHOST5_CONTENT_API_KEY|GHOST5_ADMIN_API_KEY|GHOST5_STAFF_ACCESS_TOKEN|GHOST6_URL|GHOST6_CONTENT_API_KEY)=' tools/probe/.env | xargs) \
 *     node tools/probe/run-verify-live-content.cjs                                     # app.inflozo.com, both majors
 *   … APP_ORIGIN=http://localhost:3000 APP_PREFIX=/app node tools/probe/run-verify-live-content.cjs   # a local build
 *   MAJORS=5 walks one major (5 is T3, 6 is T1); NO_429=1 leaves out the last step — which costs T1 an hour.
 *
 * WHAT IT WALKS — every row of the spec's I/O matrix that has a screen, on BOTH MAJORS: the editor opening on the
 * site's own posts with B9's connected pill; D5e's SOURCE group; Sample content and back, announced and costing no
 * request inside 60 s; the Section Picker's Latest Post card showing the site's newest post; the Link Picker finding
 * the site's own post; the Post canvas's SUBJECT rows led by the style-guide entry, and a chosen post rendering with
 * its own address (DW-230); the Page canvas's own pages; R-193's starting tag and writer; the panel's shortfall note
 * and R-194's **Preview with sample content**, which lands focus on the pill; Home's page 2; and the network cut with
 * `page.route` — THE ONE SIMULATED CONDITION, named as such. Then, on T3's origin: a real 401 from a site row with a
 * wrong key, which must cost exactly ONE request; the three unreadable rows (disconnected, no key, plain http), greyed
 * with their reasons and reading nothing; and an unlinked project, today's editor exactly, reading nothing. LAST, on T1:
 * a real 429, earned the way `record-content-api.py` earns it — 100 reads with a key Ghost never issued, from this
 * machine — and the editor then naming it.
 *
 * ACROSS THE WHOLE WALK: every request to a Ghost origin is counted by key (the Content API key taken out), and no key
 * is asked for twice inside 60 s; no response a Ghost sent carries `html` or `plaintext`; neither the Content API key
 * nor `codeinjection` appears in the canvas's markup; and the page's own policy refuses nothing
 * (`securitypolicyviolation`). The request count of the full walk is recorded — the evidence `REQUEST_CEILING` is
 * generous.
 *
 * STORY 5.20 ADDS, on both majors: the Paywall canvas on the site's OWN content — Ghost's own box in the site's accent,
 * "{n} tiers · {m} free" counted from the site's public tiers read here with the same key (the hidden tier left out), and
 * Tiers in Ghost admin → at the site's own anchor. Then on T3's row, FR-H6's record of the member switches SEEDED to
 * Subscription access "Nobody" through the service key (the record, never the Ghost): C3b's card in R-198's words, the
 * bar's MEMBERS OFF chip, Re-check refused with its sentence and the record unchanged (the row holds no Admin key yet, so
 * the chokepoint has nothing to read with), the Sites notice and its link, and a placed sign-up section's line; the
 * record is put back after. THEN THE REAL SWITCH: T3's Admin key stored for the row through Manage keys (the app's own
 * door, proved by `config/`), the Paywall canvas re-checking as it opens against T3 itself, Subscription access set to
 * Nobody with the staff token for under a minute — the card and the record following Ghost's answer, Re-check pressed
 * and saying so, the Sites notice — then put back, Re-checked back to Ghost's own box, and read back from Ghost.
 *
 * STORY 5.19 ADDS, on both majors: Latest Post printing the newest post's own tag (the recorder found a `{{#get}}` carries
 * none without `include`, MEASUREMENTS §53); the main feed duplicated into a SECONDARY feed, and P0·5's Data group walked
 * over the site's own posts — By tag and By author starting on the fullest, Order and Count, Featured, and three
 * Hand-picked posts moved by ⌥↓ — each drawn exactly as Ghost answers the same filter read here from Node; a Source
 * switch that keeps the tag and the picks and costs no request inside 60 s; and, in the reader's session, the chip
 * still shown while every Data control and every ⋯ is disabled (R-192).
 *
 * EVERY EXPECTATION IS DERIVED — the words from `apps/web/lib/live-content.ts` and `lib/preview-subject.ts`, the site's
 * own posts, tags and writers from the site itself (read here, from Node, with the same key) — and never restated
 * (standing rule 4, R-170). Node 24: it type-strips the `.ts` it reads.
 *
 * ITS OWN THROWAWAY ACCOUNT, site rows and projects, all deleted in a `finally` (the account's delete cascades), with
 * the user count read before and after so a leak is loud. NO KEY IS EVER PRINTED: a URL that carries one is reduced to
 * its key-free form before it is kept, and a check's detail never holds one.
 */
const fs = require('node:fs')
const path = require('node:path')
const { pathToFileURL } = require('node:url')
const { chromium } = require('@playwright/test')

const APP = process.env.APP_ORIGIN || 'https://app.inflozo.com'
const PREFIX = process.env.APP_PREFIX ?? ''
const LOCAL = Boolean(process.env.APP_ORIGIN)
const MAJORS = (process.env.MAJORS || '5,6').split(',').map((m) => m.trim()).filter((m) => m === '5' || m === '6')
const NO_429 = process.env.NO_429 === '1'
const need = ['SUPABASE_URL', 'SUPABASE_SECRET_KEY', ...(LOCAL ? [] : ['VERCEL_TOKEN', 'VERCEL_TEAM_ID']), ...MAJORS.flatMap((m) => [`GHOST${m}_URL`, `GHOST${m}_CONTENT_API_KEY`]),
  // Story 5.20 — T3's real switch: its Admin key goes in through Manage keys, and its Subscription access is flipped with
  // the staff token (the product itself never writes to Ghost's settings)
  ...(MAJORS.includes('5') ? ['GHOST5_ADMIN_API_KEY', 'GHOST5_STAFF_ACCESS_TOKEN'] : [])]
for (const key of need) {
  if (!process.env[key]) { console.error(`${key} is not set — read it from tools/probe/.env into this command's environment`); process.exit(2) }
}
const SB = process.env.SUPABASE_URL.replace(/\/$/, '')
const SECRET = process.env.SUPABASE_SECRET_KEY
const REPO = path.join(__dirname, '..', '..')
const at = (p) => `${APP}${PREFIX}${p}`
const GHOST = Object.fromEntries(MAJORS.map((m) => [m, { origin: new URL(process.env[`GHOST${m}_URL`]).origin, key: process.env[`GHOST${m}_CONTENT_API_KEY`], name: m === '5' ? 'T3' : 'T1' }]))
const KEYS = Object.values(GHOST).map((g) => g.key)
// Story 5.20 — the two T3 credentials the real switch uses are scrubbed from every line as the Content API keys are
if (MAJORS.includes('5')) KEYS.push(process.env.GHOST5_ADMIN_API_KEY, process.env.GHOST5_STAFF_ACCESS_TOKEN)

const results = []
let fails = 0
const clean = (s) => KEYS.reduce((t, k) => t.split(k).join('<key>'), String(s))
const check = (name, ok, detail = '') => { results.push(clean(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`)); if (!ok) fails++; return ok }
const note = (name, detail) => results.push(clean(`note  ${name} — ${detail}`))

const call = async (base, p, init = {}) => {
  const r = await fetch(`${SB}${base}${p}`, { ...init, headers: { apikey: SECRET, Authorization: `Bearer ${SECRET}`, 'Content-Type': 'application/json', Prefer: 'return=representation', ...(init.headers || {}) } })
  const text = await r.text()
  let body = {}
  try { body = text ? JSON.parse(text) : {} } catch {}
  return { status: r.status, body }
}
const admin = (p, init) => call('/auth/v1', p, init)
const rest = (p, init) => call('/rest/v1', p, init)
const users = async () => {
  const out = []
  for (let page = 1; ; page++) {
    const { status, body } = await admin(`/admin/users?page=${page}&per_page=200`)
    if (status !== 200) return null
    if (!body.users || body.users.length === 0) return out
    out.push(...body.users)
  }
}

/** THE SITE ITSELF, read from Node with the same key — what the canvas must show, never restated here. A success
 *  resets Ghost's failure count; nothing here ever fails on purpose until the last step. */
const ghostRead = async (m, resource, params = {}) => {
  const g = GHOST[m]
  const q = new URLSearchParams({ ...params, key: g.key })
  const r = await fetch(`${g.origin}/ghost/api/content/${resource}/?${q}`, { headers: { 'Accept-Version': 'v5.0' } })
  if (!r.ok) throw new Error(`${g.name} ${resource} answered HTTP ${r.status} — the walk cannot read its own expectations`)
  return r.json()
}

/** A Ghost request, reduced to a key-free identity: the resource and its sorted params, the Content API key taken out. */
const identity = (url) => {
  const u = new URL(url)
  u.searchParams.delete('key')
  u.searchParams.sort()
  return `${u.origin}${u.pathname}?${u.searchParams}`
}
const ghostOrigins = () => Object.values(GHOST).map((g) => g.origin)

/** Story 5.20 — T3's Admin API with the STAFF token, for the one setting the walk flips and puts back (Subscription
 *  access): a short-lived JWT signed as Ghost's own Admin API expects, and never printed. */
const staffJwt = () => {
  const [kid, secret] = process.env.GHOST5_STAFF_ACCESS_TOKEN.split(':')
  const part = (o) => Buffer.from(JSON.stringify(o)).toString('base64url')
  const now = Math.floor(Date.now() / 1000)
  const unsigned = `${part({ alg: 'HS256', typ: 'JWT', kid })}.${part({ iat: now, exp: now + 300, aud: '/admin/' })}`
  return `${unsigned}.${require('node:crypto').createHmac('sha256', Buffer.from(secret, 'hex')).update(unsigned).digest('base64url')}`
}
const ghostAdmin5 = async (method, resource, body) => {
  const r = await fetch(`${GHOST['5'].origin}/ghost/api/admin/${resource}`, {
    method,
    headers: { Authorization: `Ghost ${staffJwt()}`, 'Accept-Version': 'v5.0', 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  if (!r.ok) throw new Error(`T3 admin ${method} ${resource} answered HTTP ${r.status}`)
  return r.json()
}
/** T3's member switches as its Admin settings hold them: the stored access and Ghost's own paid calculation */
const switches5 = async () => {
  const rows = Object.fromEntries((await ghostAdmin5('GET', 'settings/')).settings.map((x) => [x.key, x.value]))
  return { signup_access: rows.members_signup_access, paid_enabled: rows.paid_members_enabled }
}
const setAccess5 = (value) => ghostAdmin5('PUT', 'settings/', { settings: [{ key: 'members_signup_access', value }] })
/** Two readings of the member switches agree — field by field, because the record comes back from `jsonb`, which keeps
 *  its keys in its own order (shorter first), so a `JSON.stringify` of it never equals one built in the other order */
const sameSwitches = (a, b) => a != null && b != null && a.signup_access === b.signup_access && a.paid_enabled === b.paid_enabled

/** Anything under `obj` named one of `names`, deeply — a body field is a body field wherever Ghost nests it. */
const carries = (obj, names) => {
  if (Array.isArray(obj)) return obj.some((x) => carries(x, names))
  if (obj !== null && typeof obj === 'object') return Object.entries(obj).some(([k, v]) => names.includes(k) || carries(v, names))
  return false
}

async function main() {
  if (!LOCAL) {
    const { execSync } = require('node:child_process')
    const dirty = execSync('git status --porcelain -- packages apps tools/probe', { cwd: REPO, encoding: 'utf8' }).trim()
    if (dirty) throw new Error(`packages/, apps/ or tools/probe/ has uncommitted changes, so this checkout is not what ${APP} serves:\n${dirty}`)
    const head = execSync('git rev-parse HEAD', { cwd: REPO, encoding: 'utf8' }).trim()
    const answer = await fetch(`https://api.vercel.com/v13/deployments/${new URL(APP).host}?teamId=${process.env.VERCEL_TEAM_ID}`, { headers: { Authorization: `Bearer ${process.env.VERCEL_TOKEN}` } })
    const served = await answer.json().catch(() => ({}))
    if (!answer.ok) throw new Error(`Vercel answered ${answer.status} for ${new URL(APP).host}: ${served.error?.message ?? 'no message'}`)
    if (served.meta?.githubCommitSha !== head) throw new Error(`${APP} serves ${served.id ?? 'an unreadable deployment'}, built from ${served.meta?.githubCommitSha ?? 'no recorded commit'}, and this checkout is ${head}: push, wait for CI's deploy, then run this`)
    note('deployment', `${served.id} ${served.readyState}, built from ${head.slice(0, 8)} — this checkout's HEAD`)
  } else note('LOCAL RUN', `${APP}${PREFIX} — not a deployed result`)
  note('majors', `${MAJORS.map((m) => GHOST[m].name).join(' · ')}${NO_429 ? ' · the 429 step left out (NO_429=1)' : ''}`)

  // THE APP'S OWN WORDS AND NUMBERS, so nothing below is a second copy of a sentence the owner ruled
  const LIVE = await import(pathToFileURL(path.join(REPO, 'apps/web/lib/live-content.ts')).href)
  const SUBJ = await import(pathToFileURL(path.join(REPO, 'apps/web/lib/preview-subject.ts')).href)
  const OW = await import(pathToFileURL(path.join(REPO, 'packages/library/src/orbit-weekly.ts')).href)
  const { seed } = await import(pathToFileURL(path.join(__dirname, 'seed-editor-project.mjs')).href)
  const W = LIVE.LIVE_WORDS
  const PER_PAGE = OW.postsPerPage()
  // Story 5.19 — the Data group's words and the vocabulary's Source words, each from its one list (R-170)
  const DG = await import(pathToFileURL(path.join(REPO, 'apps/web/lib/data-group.ts')).href)
  const { POST_SOURCE_WORDS: SRC } = await import(pathToFileURL(path.join(REPO, 'packages/library/src/vocabulary.ts')).href)
  const { movedTo } = await import(pathToFileURL(path.join(REPO, 'packages/section-runtime/src/index.ts')).href)
  // Story 5.20 — the Paywall canvas's words and rules, from their one module (R-170)
  const PW = await import(pathToFileURL(path.join(REPO, 'apps/web/lib/paywall.ts')).href)

  const all = await users()
  if (all === null) throw new Error('user list unreadable — no control for the cleanup')
  for (const u of all.filter((x) => /^live-harness-\d+@inflozo\.com$/.test(x.email || ''))) await admin(`/admin/users/${u.id}`, { method: 'DELETE', body: '{}' })
  const before = (await users()).length

  const email = `live-harness-${Date.now()}@inflozo.com`
  let browser = null
  let uid = null
  let totalRequests = 0
  try {
    const made = await admin('/admin/users', { method: 'POST', body: JSON.stringify({ email, email_confirm: true }) })
    uid = made.body.id
    check('fixture — the account is created', made.status === 200 && !!uid, `HTTP ${made.status}`)
    // autosave off: nothing here edits, and a timer's flush has no business racing the reads being counted
    await rest(`/profiles?user_id=eq.${uid}`, { method: 'PATCH', body: JSON.stringify({ autosave_enabled: false }) })

    /** A site row and a project linked to it, both the account's own. The seed is `seed-editor-project.mjs`'s — the
     *  "Pilot sections" shape: site a1/1, Home a4/13 · a17/1 · a22/1, Post a24/1 — under a name of its own. */
    const linked = async (name, site) => {
      let siteId = null
      if (site !== null) {
        const row = await rest('/sites?select=id', { method: 'POST', body: JSON.stringify({ user_id: uid, ...site }) })
        siteId = row.body?.[0]?.id ?? null
        if (row.status !== 201 || !siteId) throw new Error(`the ${name} site row could not be written: HTTP ${row.status}`)
      }
      const project = await seed({ email, name })
      if (siteId !== null) {
        const link = await rest(`/projects?id=eq.${project.id}`, { method: 'PATCH', body: JSON.stringify({ linked_site_id: siteId }) })
        if (link.status !== 200) throw new Error(`the ${name} project could not be linked: HTTP ${link.status}`)
      }
      // Home's post grid is its MAIN FEED, as synthesis marks an untouched Home — the seed predates the flag (5.16)
      const home = await rest(`/project_templates?project_id=eq.${project.id}&template_key=eq.home&select=doc`)
      const doc = home.body?.[0]?.doc
      if (doc) {
        doc.instances = doc.instances.map((i) => (i.designId === 'a17/1' ? { ...i, isMainFeed: true } : i))
        await rest(`/project_templates?project_id=eq.${project.id}&template_key=eq.home`, { method: 'PATCH', body: JSON.stringify({ doc }) })
      }
      return project.id
    }
    const P = {}
    for (const m of MAJORS) P[m] = await linked(`Live ${GHOST[m].name}`, { url: GHOST[m].origin, title: `Ghost${m} (row)`, content_key: GHOST[m].key })
    const anyMajor = MAJORS.includes('5') ? '5' : MAJORS[0]
    // A REAL 401: the same Ghost, with a key it never issued. `sites` is unique on (user, url), so the row names the
    // origin with a trailing slash, which the editor normalises back to the same origin.
    P.refused = await linked('Refused key', { url: `${GHOST[anyMajor].origin}/`, title: 'Refused site', content_key: '0'.repeat(26) })
    P.disconnected = await linked('Disconnected site', { url: 'https://disconnected.inflozo-walk.example', title: 'Gone site', content_key: null, disconnected_at: new Date().toISOString() })
    P.no_key = await linked('Keyless site', { url: 'https://no-key.inflozo-walk.example', title: 'Keyless site', content_key: null })
    P.http = await linked('Plain site', { url: 'http://plain.inflozo-walk.example', title: 'Plain site', content_key: 'a'.repeat(26) })
    P.unlinked = await linked('Unlinked', null)
    check('fixture — projects linked to readable, refused and unreadable sites, and one unlinked control', Object.values(P).every(Boolean))

    const magic = async () => {
      const link = await admin('/admin/generate_link', { method: 'POST', body: JSON.stringify({ type: 'magiclink', email }) })
      if (link.status !== 200 || !link.body.hashed_token) throw new Error(`generate_link answered HTTP ${link.status}`)
      return at(`/auth/confirm?token_hash=${link.body.hashed_token}&type=magiclink`)
    }

    browser = await chromium.launch()
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
    await context.addInitScript(() => {
      window.__violations = []
      document.addEventListener('securitypolicyviolation', (e) => window.__violations.push(`${e.violatedDirective} ${e.blockedURI || 'inline'}`))
    })
    const page = await context.newPage()

    // ── every Ghost request, by key, and every Ghost answer, for a body ──
    /** key → each request made for it: when, and whether Ghost ANSWERED it (a failed read is not in memory, so the next
     *  press asking for it again is the policy, not a second request for a key already held) */
    const seen = new Map()
    const bodies = []
    /** ONE STORE PER EDITOR SESSION: a document load is a new session with an empty cache, so "one request per key" is
     *  asked within a session — which is why the walk moves between canvases with the Template switcher (a soft
     *  navigation, the session kept) and counts a session for every page it loads. */
    let session = 0
    // CONTENT API READS ONLY (Story 5.19's Dev, 2026-09-25): T3 gained pictures stored on Ghost itself — a writer's photo
    // and a post's feature image, which the canvas draws — and an <img> the browser loads is not a read the store makes,
    // nor what "one request per key" or Ghost's per-network limiter (§51) is about
    const contentRead = (url) => ghostOrigins().includes(new URL(url).origin) && new URL(url).pathname.startsWith('/ghost/api/content/')
    page.on('request', (r) => {
      if (r.method() !== 'GET' || !contentRead(r.url())) return
      const id = identity(r.url())
      seen.set(id, [...(seen.get(id) ?? []), { at: Date.now(), request: r, answered: false, session }])
      totalRequests++
    })
    page.on('response', async (r) => {
      if (r.request().method() !== 'GET' || !contentRead(r.url())) return
      const made = (seen.get(identity(r.url())) ?? []).find((x) => x.request === r.request())
      if (made && r.status() === 200) made.answered = true
      try { bodies.push({ id: identity(r.url()), status: r.status(), acao: r.headers()['access-control-allow-origin'] ?? null, body: await r.json() }) } catch {}
    })
    const ghostCount = () => [...seen.values()].reduce((n, times) => n + times.length, 0)

    await page.goto(await magic(), { waitUntil: 'load' })
    check('the account signs in', !page.url().includes('/sign-in'), page.url().replace(/token_hash=[^&]+/, 'token_hash=…'))

    const frameEl = () => page.locator('section[aria-label="Canvas"] iframe')
    const canvasFrame = async () => (await frameEl().elementHandle()).contentFrame()
    /** the canvas painted `key` from `source` — the frame's own marks, written by `paint()` */
    const paintedFrom = (key, source, timeout = 20000) =>
      page.waitForFunction(([k, s]) => {
        const f = document.querySelector('section[aria-label="Canvas"] iframe')
        return f?.dataset.painted === k && f?.dataset.source === s
      }, [key, source], { timeout }).then(() => true, () => false)
    const pill = () => page.evaluate(() => {
      const el = document.getElementById('editor-source')
      if (!el) return null
      const cs = getComputedStyle(el)
      const dot = el.querySelector('[data-dot]')
      return {
        tag: el.tagName,
        source: el.querySelector('[data-source]')?.textContent ?? null,
        cause: el.querySelector('[data-cause]')?.textContent ?? null,
        subject: el.querySelector('[data-subject]')?.textContent ?? null,
        border: cs.borderTopStyle,
        dot: dot ? getComputedStyle(dot).backgroundColor : null,
        dotName: dot?.getAttribute('data-dot') ?? null,
        height: Math.round(el.getBoundingClientRect().height),
      }
    })
    const said = () => page.evaluate(() => document.getElementById('editor-said')?.textContent ?? '')
    const canvasText = async () => (await canvasFrame()).evaluate(() => document.getElementById('canvas')?.textContent?.replace(/\s+/g, ' ') ?? '')
    const canvasHtml = async () => (await canvasFrame()).evaluate(() => document.documentElement.outerHTML)
    const openPill = async () => {
      if (!(await page.evaluate(() => document.getElementById('editor-source-menu')?.matches(':popover-open')))) await page.locator('#editor-source').click()
      await page.waitForTimeout(400)
    }
    const closeMenus = async () => {
      await page.keyboard.press('Escape')
      await page.waitForTimeout(200)
    }
    const menu = () => page.evaluate(() => {
      const m = document.getElementById('editor-source-menu')
      if (!m || !m.matches(':popover-open')) return null
      const row = (name) => {
        const b = m.querySelector(`[data-source-row="${name}"]`)
        return b && { current: b.getAttribute('aria-current'), disabled: b.getAttribute('aria-disabled'), busy: b.getAttribute('aria-busy'), words: b.textContent.replace(/\s+/g, ' ').trim(), describedBy: b.getAttribute('aria-describedby') && document.getElementById(b.getAttribute('aria-describedby'))?.textContent }
      }
      return {
        group: m.querySelector('#editor-source-group')?.textContent ?? null,
        site: row('site'),
        sample: row('sample'),
        rows: [...m.querySelectorAll('[data-subject-row]')].map((r) => ({ slug: r.dataset.subjectRow, name: r.querySelector('[data-name]')?.textContent, meta: r.querySelector('[data-meta]')?.textContent ?? null })),
        capped: m.querySelector('[data-source-capped]')?.textContent ?? null,
        nothing: m.querySelector('[data-source-nothing]')?.textContent ?? null,
        gone: m.querySelector('[data-subject-gone]')?.textContent ?? null,
        disabledAttr: m.querySelectorAll(':disabled').length,
      }
    })
    /** R-98's busy row, WATCHED: every change to the row's attributes or words is recorded from before the press, so
     *  `busySeen` can say what the row said while its read was in flight and what it says once the paint has landed */
    const watchBusy = (selector) => page.evaluate((sel) => {
      const row = document.querySelector(sel)
      window.__busy = { states: [], row }
      const take = () => window.__busy.states.push({
        busy: row.getAttribute('aria-busy'), disabled: row.getAttribute('aria-disabled'), native: row.disabled,
        words: (row.querySelector('[data-name]') ?? row).textContent.replace(/\s+/g, ' ').trim(),
      })
      if (row) new MutationObserver(take).observe(row, { attributes: true, subtree: true, childList: true, characterData: true })
    }, selector)
    const busySeen = () => page.evaluate(() => {
      const { states, row } = window.__busy ?? { states: [], row: null }
      const now = row && { busy: row.getAttribute('aria-busy'), disabled: row.getAttribute('aria-disabled') }
      return { during: states.find((s) => s.busy === 'true') ?? null, after: now, changes: states.length }
    })
    const pickLayer = async (match) => {
      await page.locator('#editor-layers [data-layer-row]').filter({ hasText: match }).first().locator('button').first().click()
      await page.waitForTimeout(500)
    }
    const openGroup = async (title) => {
      const head = page.locator('#editor-controls').getByRole('button', { name: title, exact: true })
      if ((await head.getAttribute('aria-expanded')) !== 'true') await head.click()
      await page.waitForTimeout(250)
    }
    const MOD = process.platform === 'darwin' ? 'Meta' : 'Control'
    const editor = (id, canvas) => at(canvas ? `/projects/${id}/${canvas}` : `/projects/${id}`)
    /** a DOCUMENT LOAD: a new editor session, with a store of its own */
    const open = async (url) => {
      session++
      await page.goto(url, { waitUntil: 'load' })
    }
    /** the Template switcher — a SOFT navigation, so the session and its store are the same (Story 5.5) */
    const switchTo = async (canvas, source = 'site') => {
      await page.locator('#editor-template').click()
      await page.waitForTimeout(300)
      await page.locator(`#editor-template-menu [data-canvas="${canvas}"]`).click()
      return paintedFrom(canvas, source)
    }
    // ── Story 5.19: Layers rows by key with D5c's chip, a row's ⋯ item, P0·5's Data group, and the canvas's post grids ──
    const rows519 = () => page.evaluate(() => [...document.querySelectorAll('#editor-layers [data-layer-row]')].map((r) => ({
      key: r.getAttribute('data-layer-row'), name: r.querySelector('button')?.textContent ?? '', chip: r.querySelector('[data-main-feed-chip]') !== null,
    })))
    const act519 = async (key, label) => {
      await page.locator(`#editor-layers [data-layer-row="${key}"]`).getByRole('button', { name: /^More for / }).click()
      await page.waitForTimeout(250)
      await page.locator(':popover-open').getByRole('button', { name: label, exact: true }).click()
      await page.waitForTimeout(600)
    }
    const data519 = async () => {
      const head = page.locator('#editor-controls button[aria-expanded]').filter({ hasText: /^Data$/ })
      if ((await head.getAttribute('aria-expanded')) !== 'true') await head.click()
      await page.waitForTimeout(250)
      return page.locator('#editor-controls [data-data-group]')
    }
    const source519 = async (word) => {
      await (await data519()).locator('button[id$="-source"]').click()
      await page.waitForTimeout(250)
      await page.locator(':popover-open').getByRole('button', { name: word, exact: true }).click()
    }
    const grids519 = async () => (await canvasFrame()).evaluate(() => [...document.querySelectorAll('#canvas > .a17-1')].map((s) => ({
      titles: [...s.querySelectorAll('.a17-1__post-title')].map((t) => t.textContent.trim()), pager: s.querySelector('.a17-1__pager') !== null,
    })))
    /** read until `test` holds — a site read takes one real round trip — then answer the read, whichever way it went */
    const until519 = async (read, test) => {
      for (let i = 0; i < 60; i++) {
        if (test(await read())) break
        await page.waitForTimeout(250)
      }
      return read()
    }
    const same519 = (a) => (b) => JSON.stringify(a) === JSON.stringify(b)

    for (const m of MAJORS) {
      const g = GHOST[m]
      const tag = `${g.name} (${m}.x)`
      // what the site holds, read here with the same key
      const settings = (await ghostRead(m, 'settings')).settings
      const NAME = settings.title
      const feed = await ghostRead(m, 'posts', { limit: String(PER_PAGE), page: '1', include: 'tags,authors', formats: 'mobiledoc' })
      const feed2 = feed.meta.pagination.pages >= 2 ? await ghostRead(m, 'posts', { limit: String(PER_PAGE), page: '2', formats: 'mobiledoc' }) : null
      const tagsList = (await ghostRead(m, 'tags', { limit: '100', include: 'count.posts', order: 'count.posts desc' })).tags
      const authorsList = (await ghostRead(m, 'authors', { limit: '100', include: 'count.posts', order: 'count.posts desc' })).authors
      const pagesList = (await ghostRead(m, 'pages', { limit: '100', formats: 'mobiledoc' })).pages
      const postsList = await ghostRead(m, 'posts', { limit: '100', formats: 'mobiledoc' })
      const newest = feed.posts[0]
      const startTag = LIVE.startingArchive(tagsList)
      const startAuthor = LIVE.startingArchive(authorsList)

      // ── Home: the site's own content, and B9's connected pill ──
      const t0 = ghostCount()
      await open(editor(P[m]))
      const live = await paintedFrom('home', 'site')
      check(`${tag} — opening a linked, readable project paints the SITE's content`, live, JSON.stringify(await page.evaluate(() => document.querySelector('section[aria-label="Canvas"] iframe')?.dataset ?? null)))
      const words0 = await canvasText()
      // …and NOT the sample's newest post: the control that tells the site's rows from the site's header over sample rows (review, 2026-09-24)
      check(`${tag} — the canvas shows the site's own newest post and its own menu, and not the sample's newest post`,
        words0.includes(newest.title) && (settings.navigation ?? []).every((i) => words0.includes(i.label)) && !words0.includes(OW.posts()[0].title),
        JSON.stringify({ newest: newest.title, menu: (settings.navigation ?? []).map((i) => i.label), sample: OW.posts()[0].title }))
      const p0 = await pill()
      check(`${tag} — B9 connected: "Previewing with: ${NAME}", a SOLID hairline and the mint dot, at R-166's 24px`,
        p0 !== null && p0.source === NAME && p0.border === 'solid' && p0.dotName === 'site' && p0.dot === 'rgb(31, 169, 122)' && p0.height === 24 && p0.tag === 'BUTTON' && p0.cause === null,
        JSON.stringify(p0))
      note(`${tag} — the reads opening the editor cost`, `${ghostCount() - t0} request(s)`)
      const html0 = await canvasHtml()
      check(`${tag} — neither the Content API key nor codeinjection is in the canvas's markup`, !html0.includes(g.key) && !/codeinjection/i.test(html0))

      // ── D5e's SOURCE group, and Sample content and back ──
      // nothing has been edited in this session, so the journal is empty — the control for "a source is not an edit"
      const undoBefore = await page.locator('#editor-undo').getAttribute('aria-disabled')
      await openPill()
      const m0 = await menu()
      check(`${tag} — D5e's SOURCE group on Home: the site row in force, then Sample content (Home is pressable now a site is linked)`,
        m0 !== null && m0.group === W.heading && m0.site?.current === 'true' && m0.site?.words === NAME && m0.sample?.current === null && m0.rows.length === 0,
        JSON.stringify(m0))
      await page.locator('[data-source-row="sample"]').click()
      const toSample = await paintedFrom('home', 'sample')
      const p1 = await pill()
      check(`${tag} — Sample content repaints at once from the bundled data: the pill dashed and grey, announced politely`,
        toSample && p1.source === W.sample && p1.border === 'dashed' && p1.dotName === 'sample' && (await said()) === W.showingSample && (await canvasText()).includes(OW.site().title),
        JSON.stringify({ p1, said: await said() }))
      const t1 = ghostCount()
      await openPill()
      await page.locator('[data-source-row="site"]').click()
      const back = await paintedFrom('home', 'site')
      check(`${tag} — choosing ${NAME} brings the site back, announced — and inside 60 s it costs NO request (every key fresh)`,
        back && (await said()) === W.showing(NAME) && ghostCount() === t1, JSON.stringify({ said: await said(), requests: ghostCount() - t1 }))
      // THE SOURCE IS A VIEW (EXPERIENCE.md:230): the round trip journalled nothing — Undo still has nothing to undo —
      // and nothing was stored: Sample content chosen, then a reload, opens on the site again (FR-C4's default)
      const undoAfter = await page.locator('#editor-undo').getAttribute('aria-disabled')
      await openPill()
      await page.locator('[data-source-row="sample"]').click()
      await paintedFrom('home', 'sample')
      await open(editor(P[m]))
      const reopened = await paintedFrom('home', 'site')
      check(`${tag} — the source is a VIEW: the round trip left nothing to undo, and Sample content chosen before a reload was never stored — the editor reopens on ${NAME}`,
        undoBefore === 'true' && undoAfter === 'true' && reopened, JSON.stringify({ undoBefore, undoAfter, reopened }))

      // ── the Section Picker's cards read the same store ──
      await page.keyboard.press(`${MOD}+k`)
      await page.waitForTimeout(700)
      await page.locator('dialog[open] [role="radio"]').filter({ hasText: /^Heroes/ }).first().click()
      await page.waitForTimeout(500)
      const card = page.frameLocator('dialog[open] iframe[title="Heroes — Latest Post preview"]')
      const cardWords = await card.locator('#canvas').textContent({ timeout: 15000 }).catch(() => null)
      check(`${tag} — the Section Picker's Latest Post card shows the site's own newest post, "${newest.title}"`, (cardWords ?? '').includes(newest.title), (cardWords ?? '').replace(/\s+/g, ' ').slice(0, 160))
      await page.keyboard.press('Escape')
      await page.waitForTimeout(400)

      // ── the Link Picker searches the site's own rows ──
      const target = postsList.posts.find((p) => /[a-z]{5,}/i.test(p.title)) ?? postsList.posts[0]
      const word = (target.title.match(/[A-Za-z]{5,}/) ?? [target.title])[0]
      await pickLayer('Three Up')
      await openGroup('Content')
      const linkButton = page.locator('#editor-controls button[popovertarget$="-link"]').first()
      await linkButton.click()
      await page.waitForTimeout(400)
      const search = page.locator('[popover]:popover-open input[type="search"]').first()
      await search.fill(word)
      await page.waitForTimeout(400)
      const found = await page.evaluate(() => {
        const pop = document.querySelector('[popover]:popover-open')
        const group = [...(pop?.querySelectorAll('[role="group"]') ?? [])].find((g) => /Posts/i.test(g.textContent))
        return [...(group?.querySelectorAll('button') ?? [])].map((b) => b.textContent.replace(/\s+/g, ' ').trim())
      })
      check(`${tag} — the Link Picker's search finds the site's own post "${target.title}" under Posts, client-side`, found.some((t) => t.includes(target.title)), JSON.stringify({ word, found: found.slice(0, 5) }))
      await page.keyboard.press('Escape')
      await page.waitForTimeout(300)

      // ── Post: the style-guide entry first, then the site's posts; a chosen post renders with its own address ──
      check(`${tag} — the Template switcher moves to Post inside the same session, and it paints the site's content`, await switchTo('post'))
      const pp = await pill()
      const guide = SUBJ.subjectOptions(SUBJ.bundledSource(), 'post')[0].title
      check(`${tag} — the Post canvas names the style-guide article on the site's content`, pp.source === NAME && pp.subject === guide, JSON.stringify(pp))
      await openPill()
      const mp = await menu()
      const expectedPosts = Math.min(postsList.posts.length, LIVE.LIST_LIMIT)
      check(`${tag} — D5e's SUBJECT rows: the style-guide entry first, then the site's own ${expectedPosts} posts, dated`,
        mp !== null && mp.rows.length === expectedPosts + 1 && mp.rows[0].name === guide && mp.rows.slice(1).every((r) => /^\d{1,2} [A-Z][a-z]{2} \d{4}$/.test(r.meta ?? '')) &&
        mp.rows.slice(1).map((r) => r.slug).join(' ') === postsList.posts.map((p) => p.slug).join(' '),
        JSON.stringify({ rows: mp?.rows.length, first: mp?.rows[0], capped: mp?.capped }))
      check(`${tag} — the capped line is there exactly where the site holds more posts than the rows in hand`, (mp?.capped !== null) === (postsList.meta.pagination.total > LIVE.LIST_LIMIT), JSON.stringify({ capped: mp?.capped, total: postsList.meta.pagination.total }))
      const pictured = postsList.posts.find((p) => typeof p.feature_image === 'string' && p.feature_image !== '') ?? postsList.posts[0]
      // R-98, OBSERVED RATHER THAN SAMPLED: the row's own attribute and text changes are recorded from BEFORE the press,
      // so a busy state that lasts one real round trip is seen however short it is — no delay is simulated
      await watchBusy(`#editor-source-menu [data-subject-row="${pictured.slug}"]`)
      await page.locator(`#editor-source-menu [data-subject-row="${pictured.slug}"]`).click()
      await page.waitForFunction((t) => document.querySelector('#editor-source [data-subject]')?.textContent === t, pictured.title, { timeout: 15000 }).catch(() => null)
      await page.waitForTimeout(500)
      const busyRow = await busySeen()
      check(`${tag} — R-98: while "${pictured.title}" is read its row says "${W.loading(pictured.title)}", aria-busy and aria-disabled — never disabled — until the paint lands`,
        busyRow.during !== null && busyRow.during.disabled === 'true' && busyRow.during.native === false && busyRow.during.words === W.loading(pictured.title) && busyRow.after?.busy === null,
        JSON.stringify(busyRow))
      const postWords = await canvasText()
      const navCurrent = await (await canvasFrame()).evaluate(() => [...document.querySelectorAll('#canvas .nav-current')].map((el) => el.textContent.trim()))
      check(`${tag} — choosing "${pictured.title}" renders it (DW-230: the header marks no Home on a post's own address)`,
        postWords.includes(pictured.title) && navCurrent.length === 0 && (await pill()).subject === pictured.title,
        JSON.stringify({ navCurrent, subject: (await pill()).subject, said: await said() }))
      await page.waitForTimeout(1000)
      const prefs = await rest(`/project_template_prefs?project_id=eq.${P[m]}&template_key=eq.post&select=preview_subject`)
      check(`${tag} — the choice is stored per canvas with the site's mark — a subject is only ever "gone" from its own source`,
        prefs.body?.[0]?.preview_subject?.source === 'site' && prefs.body?.[0]?.preview_subject?.slug === pictured.slug, JSON.stringify(prefs.body?.[0]?.preview_subject))
      // review (2026-09-24): the mark survives `read.ts`'s round trip — a RELOAD of the Post canvas still previews the
      // chosen post, and says nothing about it being gone (an unmarked subject over the site would fall back silently)
      await open(editor(P[m], 'post'))
      const backOnPost = await paintedFrom('post', 'site')
      await openPill()
      const mr = await menu()
      await closeMenus()
      check(`${tag} — after a reload the Post canvas still previews "${pictured.title}", the mark read back with the row, and no "no longer there"`,
        backOnPost && (await pill()).subject === pictured.title && mr !== null && mr.gone === null, JSON.stringify({ backOnPost, subject: (await pill()).subject, gone: mr?.gone }))

      // ── Page: the site's own pages ──
      await switchTo('page')
      await openPill()
      const mg = await menu()
      check(`${tag} — the Page canvas lists the style-guide page, then the site's own ${pagesList.length} page(s)`,
        mg !== null && mg.rows.length === pagesList.length + 1 && mg.rows.slice(1).map((r) => r.slug).join(' ') === pagesList.map((p) => p.slug).join(' '),
        JSON.stringify(mg?.rows.map((r) => r.name)))
      await closeMenus()

      // ── Tag: R-193's starting tag; a short archive's note and R-194's door ──
      await switchTo('tag')
      check(`${tag} — R-193: untouched, the Tag canvas starts on the site's fullest tag, "${startTag?.name}"`, (await pill()).subject === startTag?.name, JSON.stringify(await pill()))
      const shortTag = [...tagsList].reverse().find((t) => t.count.posts > 0 && t.count.posts < PER_PAGE)
      if (shortTag) {
        await openPill()
        await page.locator(`#editor-source-menu [data-subject-row="${shortTag.slug}"]`).click()
        await page.waitForFunction((t) => document.querySelector('#editor-source [data-subject]')?.textContent === t, shortTag.name, { timeout: 15000 }).catch(() => null)
        await page.waitForTimeout(400)
        await (await canvasFrame()).locator('#canvas > .a17-1').first().click({ position: { x: 20, y: 20 } })
        await page.waitForTimeout(500)
        const noteNow = () => page.evaluate(() => ({ words: document.querySelector('[data-shortfall]')?.textContent?.replace(/\s+/g, ' ').trim() ?? null, button: document.querySelector('[data-shortfall-sample]') !== null }))
        const n1 = await noteNow()
        const expected = LIVE.feedShortfall('tag', shortTag.count.posts, 1, PER_PAGE)
        check(`${tag} — the panel's note: "${expected}", with R-194's button`, n1.words !== null && n1.words.startsWith(expected) && n1.words.includes(W.toSample) && n1.button, JSON.stringify(n1))
        await page.locator('[data-shortfall-sample]').click()
        await paintedFrom('tag', 'sample')
        const focus = await page.evaluate(() => document.activeElement?.id ?? null)
        const n2 = await noteNow()
        check(`${tag} — R-194: one press is the pill's own Sample content row — the sample shows, the pill is dashed and HOLDS THE FOCUS, and the note is gone`,
          (await pill()).source === W.sample && (await pill()).border === 'dashed' && focus === 'editor-source' && n2.words === null && (await said()) === W.showingSample,
          JSON.stringify({ focus, n2, said: await said() }))
        await openPill()
        await page.locator('[data-source-row="site"]').click()
        await paintedFrom('tag', 'site')
        await page.waitForTimeout(400)
        const n3 = await noteNow()
        check(`${tag} — choosing ${NAME} brings the short archive back, and its note with it`, (await pill()).subject === shortTag.name && n3.words !== null && n3.button, JSON.stringify(n3))

        // ── R-192: a session READING ALONG keeps the source, because it is a view. A second context of the same account
        //    opens the same canvas while this one holds the lock (Story 5.17's shape), selects the grid — a view action a
        //    reader keeps — and presses the note's button, which must be live and switch the READER's own canvas ──
        const ctxB = await browser.newContext({ viewport: { width: 1440, height: 900 } })
        try {
          const B = await ctxB.newPage()
          await B.goto(await magic(), { waitUntil: 'load' })
          await B.goto(editor(P[m], 'tag'), { waitUntil: 'load' })
          const bSite = await B.waitForFunction(() => document.querySelector('section[aria-label="Canvas"] iframe')?.dataset.source === 'site', null, { timeout: 30000 }).then(() => true, () => false)
          const reading = await B.evaluate(() => document.getElementById('editor-lock-bar') !== null)
          const bFrame = await (await B.locator('section[aria-label="Canvas"] iframe').elementHandle()).contentFrame()
          await bFrame.locator('#canvas > .a17-1').first().click({ position: { x: 20, y: 20 } })
          await B.waitForTimeout(600)
          const bNote = await B.evaluate(() => {
            const b = document.querySelector('[data-shortfall-sample]')
            return b && { native: b.disabled, aria: b.getAttribute('aria-disabled'), words: document.querySelector('[data-shortfall]')?.textContent?.replace(/\s+/g, ' ').trim() }
          })
          // Story 5.19 — R-192 over the main feed: its chip still shown, every ⋯ disabled (so "Make this the main feed" cannot
          // be reached), and every control of its Data group disabled, the group's header still opening
          const bHead = B.locator('#editor-controls button[aria-expanded]').filter({ hasText: /^Data$/ })
          if ((await bHead.count()) === 1 && (await bHead.getAttribute('aria-expanded')) !== 'true') await bHead.click()
          await B.waitForTimeout(300)
          const bRead = await B.evaluate(() => {
            const controls = [...document.querySelectorAll('#editor-controls [data-data-group] button, #editor-controls [data-data-group] input')]
            return {
              chip: document.querySelector('#editor-layers [data-main-feed-chip]') !== null,
              panelChip: document.getElementById('editor-panel-main-feed')?.textContent ?? null,
              more: [...document.querySelectorAll('#editor-layers button[aria-label^="More for "]')].every((b) => b.matches(':disabled')),
              data: controls.length > 0 && controls.every((c) => c.matches(':disabled')),
              controls: controls.length,
            }
          })
          check(`${tag} — R-192: reading along, the main feed's chip still shows in Layers and at the panel head, while every ⋯ and every Data control is disabled`,
            bRead.chip && bRead.panelChip === DG.MAIN_FEED && bRead.more && bRead.data, JSON.stringify(bRead))
          if (bNote !== null) await B.locator('[data-shortfall-sample]').click()
          const bSample = await B.waitForFunction(() => document.querySelector('section[aria-label="Canvas"] iframe')?.dataset.source === 'sample', null, { timeout: 10000 }).then(() => true, () => false)
          const bFocus = await B.evaluate(() => document.activeElement?.id ?? null)
          check(`${tag} — R-192: in a session READING ALONG (B5a's bar up) the note's "${W.toSample}" is live and switches the reader's own canvas to sample, focus on the pill`,
            bSite && reading && bNote !== null && bNote.native === false && bNote.aria === null && bSample && bFocus === 'editor-source',
            JSON.stringify({ bSite, reading, bNote, bSample, bFocus }))
          // …and the SOURCE group is live there too: the reader chooses the site back
          await B.locator('#editor-source').click()
          await B.waitForTimeout(400)
          const bRow = await B.evaluate(() => { const b = document.querySelector('[data-source-row="site"]'); return b && { aria: b.getAttribute('aria-disabled'), native: b.disabled } })
          await B.locator('[data-source-row="site"]').click()
          const bBack = await B.waitForFunction(() => document.querySelector('section[aria-label="Canvas"] iframe')?.dataset.source === 'site', null, { timeout: 15000 }).then(() => true, () => false)
          check(`${tag} — R-192: …and the reader's SOURCE group is live — ${NAME} chosen back paints the site's content in the reader`, bRow !== null && bRow.aria === null && bRow.native === false && bBack, JSON.stringify({ bRow, bBack }))
        } finally {
          await ctxB.close()
        }
      } else note(`${tag} — the shortfall`, 'the site has no tag with fewer posts than a page holds, so the note is not walked here')

      // ── Author: R-193's starting writer ──
      await switchTo('author')
      check(`${tag} — R-193: untouched, the Author canvas starts on the site's fullest writer, "${startAuthor?.name}"`, (await pill()).subject === startAuthor?.name, JSON.stringify(await pill()))

      // ── THE ONE SIMULATED CONDITION: the network cut with page.route, on a writer not yet read ──
      const other = authorsList.find((a) => a.slug !== startAuthor?.slug)
      if (other) {
        await page.route(`${g.origin}/**`, (r) => r.abort('internetdisconnected'))
        await openPill()
        const saidBefore = await said()
        await page.locator(`#editor-source-menu [data-subject-row="${other.slug}"]`).click()
        await paintedFrom('author', 'sample', 20000)
        await page.waitForTimeout(300)
        const cut = await pill()
        check(`${tag} — (simulated: page.route) a read that does not answer paints sample content THROUGHOUT, and the pill says "${W.cause('unanswered', NAME)}"`,
          cut.source === W.sample && cut.cause === W.cause('unanswered', NAME) && cut.border === 'dashed', JSON.stringify(cut))
        await openPill()
        const mc = await menu()
        // FR-H4's split: ONE failure is silent — nothing is announced, not even the choice the canvas could not show — and
        // the sample's own writer stands in without "no longer there", since the choice's own source never answered
        check(`${tag} — …ONE failure is SILENT: nothing new in #editor-said, no "no longer there" line, and the site row carries "${W.sentence('unanswered', NAME)}"`,
          (await said()) === saidBefore && mc?.gone === null && mc?.site?.describedBy === W.sentence('unanswered', NAME) && mc?.site?.disabled === null,
          JSON.stringify({ before: saidBefore, after: await said(), gone: mc?.gone, site: mc?.site }))
        await page.unroute(`${g.origin}/**`)
        await watchBusy('[data-source-row="site"]')
        await page.locator('[data-source-row="site"]').click()
        const healed = await paintedFrom('author', 'site', 20000)
        await page.waitForTimeout(300)
        const siteBusy = await busySeen()
        check(`${tag} — with the network back, choosing ${NAME} tries again and paints ${other.name}'s own archive, announced "${W.showing(NAME)}"`,
          healed && (await pill()).subject === other.name && (await said()) === W.showing(NAME), JSON.stringify({ pill: await pill(), said: await said() }))
        check(`${tag} — R-98: the SOURCE row says "${W.loading(NAME)}", aria-busy and aria-disabled — never disabled — while that read is in flight`,
          siteBusy.during !== null && siteBusy.during.disabled === 'true' && siteBusy.during.native === false && siteBusy.during.words === W.loading(NAME), JSON.stringify(siteBusy))
      }

      // ── Home's page 2 ──
      if (feed2 !== null) {
        await switchTo('home')
        await pickLayer('Three Up')
        await page.locator('#editor-controls [data-page-row] [role="radio"]').filter({ hasText: '2' }).first().click()
        await page.waitForFunction(() => document.querySelector('section[aria-label="Canvas"] iframe')?.dataset.page === '2', null, { timeout: 15000 }).catch(() => null)
        await page.waitForTimeout(500)
        check(`${tag} — page 2 shows the site's own page 2, from "${feed2.posts[0]?.title}" on`, (await canvasText()).includes(feed2.posts[0]?.title ?? '\u0000'), (await canvasText()).slice(0, 200))
      } else note(`${tag} — page 2`, 'the site\'s feed fits one page, so page 2 is not offered (R-176)')

      // ── (simulated: page.route) THREE FAILED READS IN A ROW: a new session opened with the network cut asks for more
      //    reads than that at once, and must send exactly FAILURES_TO_STOP, one at a time, then stop and NAME it ──
      {
        const rowName = `Ghost${m} (row)`
        await page.route(`${g.origin}/**`, (r) => r.abort('internetdisconnected'))
        const t = ghostCount()
        await open(editor(P[m]))
        await paintedFrom('home', 'sample', 30000)
        await page.waitForTimeout(1500)
        const p = await pill()
        check(`${tag} — (simulated: page.route) ${LIVE.FAILURES_TO_STOP} failed reads in a row STOP reading: exactly ${LIVE.FAILURES_TO_STOP} requests, sample throughout, "${W.cause('failing', rowName)}", and the named sentence said`,
          ghostCount() - t === LIVE.FAILURES_TO_STOP && p.source === W.sample && p.cause === W.cause('failing', rowName) && (await said()) === W.sentence('failing', rowName),
          JSON.stringify({ requests: ghostCount() - t, p, said: await said() }))
        await openPill()
        const mf = await menu()
        check(`${tag} — …the site row is NOT greyed (three failures may be tried again) and carries that sentence; before /settings/ answers the site is named by its row (R-170)`,
          mf?.site?.disabled === null && mf?.site?.describedBy === W.sentence('failing', rowName), JSON.stringify(mf?.site))
        await page.unroute(`${g.origin}/**`)
        await page.locator('[data-source-row="site"]').click()
        check(`${tag} — …and with the network back, choosing the site reads again and paints its content`, await paintedFrom('home', 'site', 30000), JSON.stringify(await pill()))
      }

      // ── STORY 5.19 — P0·5's DATA GROUP OVER THE SITE'S OWN POSTS. The session the step above opened is on Home, reading
      //    the site. Every expected list is Ghost's own answer to the same filter, read here from Node with the same key. ──
      {
        const PPP = (await rest(`/projects?id=eq.${P[m]}&select=posts_per_page`)).body?.[0]?.posts_per_page
        const titles = async (params) => (await ghostRead(m, 'posts', { include: 'tags,authors', formats: 'mobiledoc', ...params })).posts.map((p) => p.title)
        // Latest Post's card: the recorder found a {{#get}} carries no tags without `include` (§53), so the theme now asks.
        // Both test sites' newest post carries no tag (§53's `get_include` row), so the card is first pointed at the
        // site's fullest tag — Latest Post's own Source, By tag — whose newest post carries at least that one
        const startTag519 = DG.optionsOf(tagsList)[0]
        const cardNow = async () => (await canvasFrame()).evaluate(() => ({
          title: document.querySelector('#canvas > .a4-13 .a4-13__title')?.textContent.trim() ?? null,
          tag: document.querySelector('#canvas > .a4-13 .a4-13__tag')?.textContent.trim() ?? null,
        }))
        const hero = (await rows519()).find((r) => /Latest Post/.test(r.name))
        if (hero === undefined) throw new Error(`${g.name}: Home has no Latest Post row, so there is no card to read`)
        await page.locator(`#editor-layers [data-layer-row="${hero.key}"] button`).first().click()
        await page.waitForTimeout(400)
        await source519(SRC.tag)
        const inTag = (await ghostRead(m, 'posts', { filter: `tag:'${startTag519.slug}'`, limit: '1', order: 'published_at desc', include: 'tags,authors', formats: 'mobiledoc' })).posts[0]
        const card = await until519(cardNow, (c) => c.title === inTag?.title)
        check(`${tag} — Latest Post, By tag "${startTag519.name}", prints its newest post's own tag "${inTag?.primary_tag?.name}" — what its {{#get}} now asks Ghost for (include="tags,authors", §53)`,
          card.title === inTag?.title && typeof inTag?.primary_tag?.name === 'string' && card.tag === inTag.primary_tag.name, JSON.stringify(card))
        await source519(SRC.latest)
        const back = await until519(cardNow, (c) => c.title === newest.title)
        check(`${tag} — …and Latest again shows the site's newest post, "${newest.title}"`, back.title === newest.title, JSON.stringify(back))

        // the main feed duplicated: a SECONDARY feed — no chip, no pager — showing the site's newest at the page size
        const before = await rows519()
        const main = before.find((r) => r.chip)
        if (main === undefined) throw new Error(`${g.name}: Home opened with no main feed, so there is no feed to duplicate`)
        await act519(main.key, 'Duplicate')
        const copy = (await rows519()).find((r) => !before.some((b) => b.key === r.key))
        const latest = await titles({ limit: String(PPP), order: 'published_at desc' })
        const two = await until519(grids519, (gs) => gs.length === 2 && same519(latest)(gs[1].titles))
        check(`${tag} — Duplicate on the main feed lands a SECONDARY feed: no chip, no pager, the site's newest ${PPP} as a fixed list`,
          copy !== undefined && !copy.chip && same519([main.key])((await rows519()).filter((r) => r.chip).map((r) => r.key)) && two.map((x) => x.pager).join() === 'true,false' && same519(latest)(two[1]?.titles),
          JSON.stringify({ copy: copy?.key, pagers: two.map((x) => x.pager), drawn: two[1]?.titles.length }))
        await page.locator(`#editor-layers [data-layer-row="${copy?.key}"] button`).first().click()
        await page.waitForTimeout(400)

        // By tag, starting on the fullest (R-193's order over the site's own tags)
        await source519(SRC.tag)
        const byTag = await titles({ filter: `tag:'${startTag519.slug}'`, limit: String(PPP), order: 'published_at desc' })
        const gTag = await until519(grids519, (gs) => same519(byTag)(gs[1]?.titles))
        const tagButton = await (await data519()).locator('button[id$="-tag"]').innerText()
        const tagReadAt = Date.now()
        check(`${tag} — By tag starts on the site's fullest tag, "${startTag519.name}" beside "${DG.postsCount(startTag519.count)}", and draws exactly what Ghost answers for it`,
          tagButton.includes(startTag519.name) && tagButton.includes(DG.postsCount(startTag519.count)) && same519(byTag)(gTag[1]?.titles), JSON.stringify({ tagButton, drawn: gTag[1]?.titles }))
        const d = await data519()
        await d.getByRole('radio', { name: 'Oldest' }).click()
        for (let n = PPP; n > 3; n--) {
          await d.getByRole('button', { name: 'Fewer Count' }).click()
          await page.waitForTimeout(60)
        }
        const tagOld = await titles({ filter: `tag:'${startTag519.slug}'`, limit: '3', order: 'published_at asc' })
        check(`${tag} — Order Oldest and Count 3: the tag's three oldest, as Ghost orders them`, same519(tagOld)((await until519(grids519, (gs) => same519(tagOld)(gs[1]?.titles)))[1]?.titles), JSON.stringify(tagOld))

        // By author, Featured — the Count and Order kept
        const startAuthor519 = DG.optionsOf(authorsList)[0]
        await source519(SRC.author)
        const byAuthor = await titles({ filter: `authors:'${startAuthor519.slug}'`, limit: '3', order: 'published_at asc' })
        check(`${tag} — By author starts on the site's fullest writer, "${startAuthor519.name}", keeping Count and Order`,
          (await (await data519()).locator('button[id$="-author"]').innerText()).includes(startAuthor519.name) && same519(byAuthor)((await until519(grids519, (gs) => same519(byAuthor)(gs[1]?.titles)))[1]?.titles), JSON.stringify(byAuthor))
        await source519(SRC.featured)
        const featured = await titles({ filter: 'featured:true', limit: '3', order: 'published_at asc' })
        check(`${tag} — Featured: the site's featured posts, oldest first, three`, same519(featured)((await until519(grids519, (gs) => same519(featured)(gs[1]?.titles)))[1]?.titles), JSON.stringify(featured))

        // Hand-picked: three from the search over the site's own posts, drawn in the picked order; ⌥↓ moves one
        await source519(SRC.picked)
        for (let n = 0; n < 3; n++) {
          await (await data519()).locator('button[id$="-search"]').click()
          await page.waitForTimeout(300)
          await page.locator(':popover-open ul li button').first().click()
          await page.waitForTimeout(400)
          await closeMenus()
        }
        const picked = DG.searchPosts(postsList.posts.map((p) => ({ id: p.id, title: p.title })), '', []).slice(0, 3).map((p) => p.title)
        const picks = () => data519().then((x) => x.locator('[data-pick] span.truncate').allInnerTexts())
        check(`${tag} — Hand-picked: three of the site's posts from "${DG.SEARCH_POSTS}", drawn exactly in the picked order`,
          same519(picked)(await picks()) && same519(picked)((await until519(grids519, (gs) => same519(picked)(gs[1]?.titles)))[1]?.titles), JSON.stringify({ picks: await picks() }))
        await (await data519()).locator('[data-pick-handle="0"]').focus()
        await page.keyboard.press('Alt+ArrowDown')
        const moved = [picked[1], picked[0], picked[2]]
        const gMoved = await until519(grids519, (gs) => same519(moved)(gs[1]?.titles))
        check(`${tag} — ⌥↓ moves a pick, "${movedTo(1, 3)}" is said, and the canvas redraws in the new order`,
          same519(moved)(gMoved[1]?.titles) && (await (await data519()).locator('[data-picked-list] [aria-live="polite"]').textContent()) === movedTo(1, 3), JSON.stringify(gMoved[1]?.titles))

        // a Source switch loses nothing — and inside 60 s a Source already read costs no request
        // the two queries' OWN keys — a tag filter and an id list: the surfaces (`@site`, the lists) revalidate at a press
        // once they are a minute old, which is the policy and not what a Source switch costs
        const asked519 = () => [...seen.entries()].filter(([id]) => id.startsWith(g.origin) && /filter=(tag|id)%3A/.test(id)).reduce((n, [, made]) => n + made.length, 0)
        const t519 = asked519()
        await source519(SRC.tag)
        const backTag = (await until519(grids519, (gs) => same519(tagOld)(gs[1]?.titles)))[1]?.titles
        await source519(SRC.picked)
        const backPicks = await picks()
        const gBack = await until519(grids519, (gs) => same519(moved)(gs[1]?.titles))
        check(`${tag} — a Source switch keeps the tag and the picks: By tag is its three oldest again, Hand-picked the picks in their moved order`,
          same519(tagOld)(backTag) && same519(moved)(backPicks) && same519(moved)(gBack[1]?.titles), JSON.stringify({ backTag, backPicks }))
        if (Date.now() - tagReadAt < LIVE.FRESH_MS - 5000) {
          check(`${tag} — …and those two switches cost NO request: both queries were read in this session less than ${LIVE.FRESH_MS / 1000} s ago`, asked519() === t519, `${asked519() - t519} request(s)`)
        } else note(`${tag} — the switch's request count`, `${Math.round((Date.now() - tagReadAt) / 1000)} s after the tag was read, past the cache's freshness, so a revalidation is allowed`)
        // Sample content ↔ the site, the I/O matrix's last row: a pick belongs to the source it was chosen from, so on the
        // sample — which holds none of the site's posts — the hand-picked list draws nothing and each picked row says so;
        // back on the site every pick returns in its moved order. Nothing chosen is lost: a source switch stores nothing.
        await openPill()
        await page.locator('[data-source-row="sample"]').click()
        const onSample519 = await paintedFrom('home', 'sample')
        const sampleGrids519 = await until519(grids519, (gs) => gs.length === 1)
        const sampleNotes519 = await (await data519()).locator('[data-pick-note]').allInnerTexts()
        check(`${tag} — on Sample content the hand-picked list draws nothing, its section off the canvas, and each picked row says "${DG.PICK_LACKING('sample')}"`,
          onSample519 && sampleGrids519.length === 1 && sampleNotes519.length === 3 && sampleNotes519.every((n) => n.trim() === DG.PICK_LACKING('sample')),
          JSON.stringify({ onSample519, grids: sampleGrids519.length, sampleNotes519 }))
        await openPill()
        await page.locator('[data-source-row="site"]').click()
        const onSite519 = await paintedFrom('home', 'site')
        const siteGrids519 = await until519(grids519, (gs) => same519(moved)(gs[1]?.titles))
        check(`${tag} — …and back on ${NAME} every pick returns in its moved order, and no picked row carries a note`,
          onSite519 && same519(moved)(siteGrids519[1]?.titles) && same519(moved)(await picks()) && (await (await data519()).locator('[data-pick-note]').count()) === 0,
          JSON.stringify(siteGrids519[1]?.titles))
      }

      // ── Story 5.20: the Paywall canvas on the site's own content ──
      {
        const publicTiers = (await ghostRead(m, 'tiers', { filter: 'visibility:public' })).tiers
        await open(editor(P[m], 'paywall'))
        const onSite520 = await paintedFrom('paywall', 'site')
        const shown520 = await page.evaluate(() => ({
          tiers: document.querySelector('[data-tier-line]')?.textContent ?? null,
          link: document.querySelector('[data-tiers-link]')?.getAttribute('href') ?? null,
          chip: document.querySelector('[data-surface-chip]')?.textContent ?? null,
        }))
        const box520 = await (await canvasFrame()).evaluate(() => ({
          words: document.querySelector('[data-inflozo-box] .gh-post-upgrade-cta')?.textContent.replace(/\s+/g, ' ').trim() ?? null,
          ground: document.querySelector('[data-inflozo-box] .gh-post-upgrade-cta-content')?.getAttribute('style') ?? null,
        }))
        check(`${tag} — the Paywall canvas paints ${NAME}'s own content: Ghost's own box in the site's accent (${settings.accent_color})`,
          onSite520 && /This post is for paying subscribers only Subscribe now/.test(box520.words ?? '') && (box520.ground ?? '').toLowerCase().includes(String(settings.accent_color).toLowerCase()),
          JSON.stringify(box520))
        check(`${tag} — the tier line counts ${NAME}'s PUBLIC tiers ("${PW.tierLine(publicTiers)}"), and Tiers in Ghost admin → opens its own anchor`,
          shown520.tiers === PW.tierLine(publicTiers) && shown520.link === PW.adminAt(g.origin, 'tiers') && shown520.chip === PW.PAYWALL_WORDS.chip,
          JSON.stringify(shown520))
      }

      // ── the whole major: no body on the wire, one request per key inside 60 s, and the policy quiet ──
      const mine = bodies.filter((b) => b.id.startsWith(g.origin))
      check(`${tag} — no answer Ghost sent carried a body — no html and no plaintext, in ${mine.length} answers`, mine.length > 0 && mine.every((b) => !carries(b.body, ['html', 'plaintext'])))
      check(`${tag} — every answer, 401 and 429 included, carries access-control-allow-origin`, mine.every((b) => b.acao === '*'), JSON.stringify(mine.filter((b) => b.acao !== '*').map((b) => b.status)))
      // a key ANSWERED less than a minute before it was asked for again is the violation — a failed read never is
      const tooSoon = [...seen.entries()].filter(([id]) => id.startsWith(g.origin))
        .filter(([, made]) => made.some((x, i) => i > 0 && made[i - 1].answered && made[i - 1].session === x.session && x.at - made[i - 1].at < LIVE.FRESH_MS - 1000))
      check(`${tag} — ONE request per key: no key Ghost answered is asked for again inside ${LIVE.FRESH_MS / 1000} s`, tooSoon.length === 0,
        JSON.stringify(tooSoon.map(([id, made]) => `${new URL(id).pathname}${new URL(id).search.slice(0, 80)} ×${made.length}`)))
      note(`${tag} — the whole walk of this major cost`, `${[...seen.entries()].filter(([id]) => id.startsWith(g.origin)).reduce((n, [, made]) => n + made.length, 0)} request(s) over ${[...seen.keys()].filter((id) => id.startsWith(g.origin)).length} key(s)`)
    }

    // ── Story 5.20: T3's record SEEDED to members off — C3b, the Sites notice, and a placed sign-up section's line ──
    if (MAJORS.includes('5')) {
      const siteRow520 = (await rest(`/sites?user_id=eq.${uid}&url=eq.${encodeURIComponent(GHOST['5'].origin)}&select=id,site_settings`)).body?.[0]
      const NAME5 = (await ghostRead('5', 'settings')).settings.title
      const OFF = { signup_access: 'none', paid_enabled: false }
      const was520 = siteRow520?.site_settings ?? null
      try {
        await rest(`/sites?id=eq.${siteRow520.id}`, { method: 'PATCH', body: JSON.stringify({ site_settings: { ...(was520 ?? {}), members: OFF } }) })
        await open(editor(P['5'], 'paywall'))
        await page.waitForFunction((w) => document.querySelector('[data-paywall-off]')?.textContent.replace(/\s+/g, ' ').includes(w), PW.PAYWALL_WORDS.offBody(NAME5), { timeout: 30000 }).catch(() => null)
        const card520 = await page.evaluate(() => ({
          text: document.querySelector('[data-paywall-off]')?.textContent.replace(/\s+/g, ' ') ?? '',
          chip: document.querySelector('[data-members-off-chip]')?.textContent ?? null,
          admin: document.querySelector('[data-paywall-off] a[target="_blank"]')?.getAttribute('href') ?? null,
        }))
        check(`T3 — members off by the record: C3b's card in R-198's words, its two steps, Open Ghost admin at ${PW.adminAt(GHOST['5'].origin, 'members')}, and MEMBERS OFF in the bar`,
          card520.text.includes(PW.PAYWALL_WORDS.offBody(NAME5)) && card520.text.includes(PW.PAYWALL_WORDS.offStep1) && card520.text.includes(PW.PAYWALL_WORDS.offStep2)
            && card520.admin === PW.adminAt(GHOST['5'].origin, 'members') && card520.chip === PW.PAYWALL_WORDS.offChip, JSON.stringify(card520))
        await page.waitForFunction(() => document.getElementById('paywall-recheck')?.textContent === 'Re-check', null, { timeout: 30000 })
        await watchBusy('#paywall-recheck')
        await page.locator('#paywall-recheck').click()
        await page.waitForFunction(() => /Could not check/.test(document.querySelector('[data-paywall-off] [role="status"]')?.textContent ?? ''), null, { timeout: 30000 }).catch(() => null)
        const busy520 = await busySeen()
        const refused520 = await page.evaluate(() => document.querySelector('[data-paywall-off] [role="status"]')?.textContent ?? null)
        const kept520 = (await rest(`/sites?id=eq.${siteRow520.id}&select=site_settings`)).body?.[0]?.site_settings?.members
        check('T3 — Re-check says "Re-checking…" with aria-busy and never disabled, is refused with its one sentence (no Admin key on this fixture), and leaves the record as it was',
          busy520.during !== null && busy520.during.native !== true && refused520 === PW.PAYWALL_WORDS.refused(NAME5) && sameSwitches(kept520, OFF),
          JSON.stringify({ busy520, refused520, kept520 }))
        // the Sites notice, from the same record
        await page.goto(at('/sites'), { waitUntil: 'load' })
        const notice520 = await page.evaluate(() => [...document.querySelectorAll('[data-members-notice]')].map((n) => ({ text: n.textContent.replace(/\s+/g, ' '), link: n.querySelector('a')?.getAttribute('href') ?? null })))
        const sentence520 = PW.membersNotice(OFF, 'Ghost5 (row)')[0]
        check('T3 — the Sites screen says it too: the members-off sentence and Open Ghost admin at the Membership anchor',
          notice520.some((n) => n.text.includes(sentence520) && n.link === PW.adminAt(GHOST['5'].origin, 'members')), JSON.stringify(notice520))
        // a placed sign-up section on Home — the seed's A22 #1 asks a visitor to join — carries the line at its panel head
        await open(editor(P['5']))
        await paintedFrom('home', 'site')
        await pickLayer('A22')
        const line520 = await page.evaluate(() => document.querySelector('[data-member-ask]')?.textContent ?? null)
        check('T3 — a placed section whose design asks a visitor to join says so at its panel head, in 5.18\'s note shape',
          line520 === PW.PAYWALL_WORDS.ask(NAME5), JSON.stringify(line520))
      } finally {
        if (siteRow520) await rest(`/sites?id=eq.${siteRow520.id}`, { method: 'PATCH', body: JSON.stringify({ site_settings: was520 }) })
      }
      const back520 = (await rest(`/sites?id=eq.${siteRow520?.id}&select=site_settings`)).body?.[0]?.site_settings ?? null
      check('T3 — the record is put back as the walk found it', JSON.stringify(back520) === JSON.stringify(was520), JSON.stringify(back520))
    }

    // ── Story 5.20: T3's REAL SWITCH — Subscription access set to Nobody with the staff token for under a minute, the
    //    Paywall canvas re-checking against Ghost itself, Re-check pressed both ways, and everything put back ──
    // The walk's T3 row is REST-made and holds no Admin key, so the key goes in first through the app's own door, Manage
    // keys (proved by `config/` before Vault holds it): the row then has what a connected site has, and every re-check
    // below is `recheckMembers` → `readMembers` → `call()` → T3's Admin `settings/`, on production. The account's delete
    // at the end takes the key with it (the credentials row cascades, and its trigger drops the Vault secret).
    if (MAJORS.includes('5')) {
      const siteId = (await rest(`/sites?user_id=eq.${uid}&url=eq.${encodeURIComponent(GHOST['5'].origin)}&select=id`)).body?.[0]?.id
      const NAME5 = (await ghostRead('5', 'settings')).settings.title
      const record = async () => (await rest(`/sites?id=eq.${siteId}&select=site_settings`)).body?.[0]?.site_settings?.members ?? null
      /** the record once `ok` holds, polled for up to 30 s — a re-check lands when Ghost has answered the server */
      const recordWhen = async (ok) => {
        for (let i = 0; i < 60; i++) {
          const r = await record()
          if (ok(r)) return r
          await page.waitForTimeout(500)
        }
        return record()
      }
      const saidIs = (words) => page.waitForFunction((w) => document.getElementById('editor-said')?.textContent === w, words, { timeout: 30000 }).then(() => true, () => false)
      const cardSays = (words) => page.waitForFunction((w) => document.querySelector('[data-paywall-off]')?.textContent.replace(/\s+/g, ' ').includes(w), words, { timeout: 30000 }).then(() => true, () => false)

      await page.goto(at(`/sites/keys?site=${siteId}`), { waitUntil: 'load' })
      const keysForm = page.locator('form:has(#keys-admin)')
      await keysForm.locator('#keys-admin').fill(process.env.GHOST5_ADMIN_API_KEY)
      await keysForm.locator('button[type="submit"]').click()
      let present = null
      for (let i = 0; i < 60 && present?.admin !== true; i++) {
        await page.waitForTimeout(500)
        present = (await rest(`/sites?id=eq.${siteId}&select=credentials_present`)).body?.[0]?.credentials_present ?? null
      }
      check('T3 — Manage keys stores the Admin key for the walk\'s own site (proved by config/ first; nothing is written to Ghost)', present?.admin === true, JSON.stringify(present))

      const live = await switches5()
      check(`T3 — the control: members are on before the switch (${JSON.stringify(live)})`, live.signup_access !== 'none', JSON.stringify(live))
      // (1) the Paywall canvas re-checks as it opens: the record becomes T3's own answer, and there is no card
      await open(editor(P['5'], 'paywall'))
      const onOpen = await recordWhen((r) => sameSwitches(r, live))
      check('T3 — opening the Paywall canvas re-checks through the stored key: the record is T3\'s own answer, members on, and no card',
        sameSwitches(onOpen, live) && (await page.locator('[data-paywall-off]').count()) === 0, JSON.stringify(onOpen))

      // (2) Nobody, for under a minute: restored before the last Re-check, and in `finally` whatever happens, and read back
      const offAt = Date.now()
      let restored = false
      try {
        await setAccess5('none')
        const nobody = await switches5()
        check('T3 — Subscription access set to Nobody with the staff token and read back: Ghost\'s paid flag goes false with it', nobody.signup_access === 'none' && nobody.paid_enabled === false, JSON.stringify(nobody))
        await open(editor(P['5'], 'paywall'))
        const cardUp = await cardSays(PW.PAYWALL_WORDS.offBody(NAME5))
        const offRecord = await recordWhen((r) => r?.signup_access === 'none')
        check('T3 — the canvas re-checks as it opens: Ghost answers Nobody, the record follows, and C3b\'s card comes up in R-198\'s words',
          cardUp && sameSwitches(offRecord, nobody), JSON.stringify(offRecord))
        await page.waitForFunction((w) => document.getElementById('paywall-recheck')?.textContent === w, PW.PAYWALL_WORDS.recheck, { timeout: 30000 })
        await watchBusy('#paywall-recheck')
        await page.locator('#paywall-recheck').click()
        const stillOff = await saidIs(PW.PAYWALL_WORDS.stillOff(NAME5))
        const pressOff = await busySeen()
        check('T3 — Re-check says "Re-checking…" with aria-busy and never disabled, then Ghost\'s answer: "Members are still switched off"',
          stillOff && pressOff.during !== null && pressOff.during.native !== true && pressOff.during.words === PW.PAYWALL_WORDS.rechecking, JSON.stringify({ pressOff, said: await said() }))
        // the Sites notice, from the record Ghost's own answer wrote
        await page.goto(at('/sites'), { waitUntil: 'load' })
        await page.getByText(PW.membersNotice(nobody, 'Ghost5 (row)')[0]).first().waitFor({ state: 'visible', timeout: 20000 }).catch(() => null)
        const notices = await page.evaluate(() => [...document.querySelectorAll('[data-members-notice]')].map((n) => n.textContent.replace(/\s+/g, ' ')))
        check('T3 — the Sites screen says members are off, from the record Ghost\'s own answer wrote',
          notices.some((t) => t.includes(PW.membersNotice(nobody, 'Ghost5 (row)')[0])), JSON.stringify(notices))
        // back on the canvas with the card up and its own re-check finished (it speaks while the card is up), T3 is put
        // back, and one press brings Ghost's own box back
        await open(editor(P['5'], 'paywall'))
        const settled = (await cardSays(PW.PAYWALL_WORDS.offBody(NAME5))) && (await saidIs(PW.PAYWALL_WORDS.stillOff(NAME5)))
        await setAccess5(live.signup_access)
        restored = true
        note('T3 — Subscription access was Nobody for', `${Math.round((Date.now() - offAt) / 1000)} s`)
        await page.locator('#paywall-recheck').click()
        const on = await saidIs(PW.PAYWALL_WORDS.on(NAME5))
        const backRecord = await recordWhen((r) => sameSwitches(r, live))
        const boxBack = await (await canvasFrame()).evaluate(() => document.querySelector('[data-inflozo-box] .gh-post-upgrade-cta') !== null).catch(() => false)
        check('T3 — put back and Re-checked: "Members are on", the card gone, Ghost\'s own box back, and the record T3\'s answer again',
          settled && on && (await page.locator('[data-paywall-off]').count()) === 0 && boxBack && sameSwitches(backRecord, live),
          JSON.stringify({ settled, said: await said(), backRecord, boxBack }))
      } finally {
        if (!restored) await setAccess5(live.signup_access)
        const after = await switches5()
        check(`T3 — Subscription access is back to ${live.signup_access}, read back from Ghost`, sameSwitches(after, live), JSON.stringify(after))
      }
    }

    // ── a REAL 401: one request, never retried, named ──
    {
      const t = ghostCount()
      await open(editor(P.refused))
      await paintedFrom('home', 'sample')
      await page.waitForTimeout(1500)
      const p = await pill()
      check('a refused key costs EXACTLY ONE request', ghostCount() - t === 1, `${ghostCount() - t} request(s)`)
      check(`…the pill says "${W.cause('refused', 'Refused site')}" on sample content, and the sentence is announced once`,
        p.source === W.sample && p.cause === W.cause('refused', 'Refused site') && (await said()) === W.sentence('refused', 'Refused site'), JSON.stringify({ p, said: await said() }))
      await openPill()
      const mr = await menu()
      check('…and the site row is GREYED with that sentence — choosing it could only be refused again', mr?.site?.disabled === 'true' && mr?.site?.describedBy === W.sentence('refused', 'Refused site') && mr?.sample?.current === 'true', JSON.stringify(mr))
      await page.locator('[data-source-row="site"]').click({ force: true })
      await page.waitForTimeout(1500)
      check('…and pressing it anyway sends nothing', ghostCount() - t === 1, `${ghostCount() - t} request(s)`)
      await closeMenus()
    }

    // ── the unreadable rows: greyed with their reasons, and NOTHING read ──
    for (const [why, name] of [['disconnected', 'Gone site'], ['no_key', 'Keyless site'], ['http', 'Plain site']]) {
      const outbound = []
      const watch = (r) => { if (!r.url().startsWith(APP) && /ghost\/api\/content/.test(r.url())) outbound.push(identity(r.url())) }
      page.on('request', watch)
      await open(editor(P[why]))
      await paintedFrom('home', 'sample')
      await page.waitForTimeout(800)
      const p = await pill()
      await openPill()
      const mu = await menu()
      page.off('request', watch)
      check(`${why} — the pill says Sample content (dashed) and is PRESSABLE; the site row is greyed with its reason; Sample content is in force; nothing is read`,
        p.tag === 'BUTTON' && p.source === W.sample && p.border === 'dashed' && p.cause === null && mu?.site?.disabled === 'true' &&
        mu?.site?.describedBy === W.unreadable(why, name) && mu?.sample?.current === 'true' && outbound.length === 0 && mu?.disabledAttr === 0,
        JSON.stringify({ p, site: mu?.site, outbound }))
      await closeMenus()
    }

    // ── the control: an unlinked project is today's editor exactly ──
    {
      const t = ghostCount()
      await open(editor(P.unlinked))
      await paintedFrom('home', 'sample')
      await page.waitForTimeout(800)
      const p = await pill()
      check('THE CONTROL — an unlinked project: "Sample content", dashed, not pressable, no SOURCE group, and zero Content API requests',
        p.tag === 'SPAN' && p.source === W.sample && p.border === 'dashed' && (await page.locator('#editor-source-menu').count()) === 0 && ghostCount() === t, JSON.stringify(p))
    }

    const violations = await page.evaluate(() => window.__violations ?? null)
    check('the page\'s own policy refused nothing across the walk — `connect-src \'self\' https:` admits every Ghost', Array.isArray(violations) && violations.length === 0, JSON.stringify(violations))

    // ── LAST, T1 only: a real 429, earned the way the recorder earns it ──
    if (MAJORS.includes('6') && !NO_429) {
      const g = GHOST['6']
      const statuses = {}
      const ok = await fetch(`${g.origin}/ghost/api/content/settings/?key=${g.key}`, { headers: { 'Accept-Version': 'v5.0' } })
      check('429 — the control: T1 answers the real key first, so the count starts from zero', ok.status === 200, `HTTP ${ok.status}`)
      for (let i = 0; i < 100; i++) {
        const r = await fetch(`${g.origin}/ghost/api/content/posts/?limit=1&key=${'0'.repeat(26)}`, { headers: { 'Accept-Version': 'v5.0' } })
        statuses[r.status] = (statuses[r.status] ?? 0) + 1
      }
      note('429 — 100 reads with a key Ghost never issued, from this machine', JSON.stringify(statuses))
      const fresh = await browser.newContext({ viewport: { width: 1440, height: 900 } })
      const second = await fresh.newPage()
      let asked = 0
      second.on('request', (r) => { if (r.method() === 'GET' && new URL(r.url()).origin === g.origin) asked++ })
      await second.goto(await magic(), { waitUntil: 'load' })
      await second.goto(editor(P['6']), { waitUntil: 'load' })
      await second.waitForFunction(() => document.querySelector('section[aria-label="Canvas"] iframe')?.dataset.source === 'sample', null, { timeout: 30000 }).catch(() => null)
      await second.waitForTimeout(1500)
      const p = await second.evaluate(() => ({ source: document.querySelector('#editor-source [data-source]')?.textContent, cause: document.querySelector('#editor-source [data-cause]')?.textContent ?? null, said: document.getElementById('editor-said')?.textContent }))
      const name = (await ghostRead('6', 'settings').catch(() => ({ settings: { title: null } }))).settings.title ?? 'Ghost6 (row)'
      note('429 — earned at', new Date().toISOString())
      check(`429 — the editor meets Ghost's own 429: sample content, "${W.cause('wait', 'Ghost6 (row)')}", named aloud, ONE request`,
        p.source === W.sample && p.cause === W.cause('wait', 'Ghost6 (row)') && p.said === W.sentence('wait', 'Ghost6 (row)') && asked === 1,
        JSON.stringify({ ...p, asked, name }))
      await fresh.close()
    }

    note('the full walk cost', `${totalRequests} Content API request(s) against a ceiling of ${LIVE.REQUEST_CEILING} per session`)
    await context.close()
  } finally {
    if (browser) await browser.close()
    if (uid) {
      const gone = await admin(`/admin/users/${uid}`, { method: 'DELETE', body: '{}' })
      check('the fixture account is deleted', gone.status === 200, `HTTP ${gone.status}`)
    }
    const after = (await users())?.length
    check('no fixture leaked', after === before, `${before} before · ${after} after`)
  }
}

main()
  .then(() => {
    console.log(results.join('\n'))
    console.log(`\n${fails} FAIL, ${results.filter((r) => r.startsWith('PASS')).length} PASS`)
    if (process.env.OUT_FILE) fs.writeFileSync(process.env.OUT_FILE, results.join('\n'))
    process.exit(fails ? 1 : 0)
  })
  .catch((e) => {
    console.log(results.join('\n'))
    console.error('HARNESS ERROR', clean(e && e.stack ? e.stack : e))
    process.exit(2)
  })
