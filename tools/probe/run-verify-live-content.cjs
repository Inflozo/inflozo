#!/usr/bin/env node
/**
 * STORY 5.18 — LIVE CONTENT FROM THE CONNECTED SITE, ON THE DEPLOYED EDITOR, AGAINST REAL GHOSTS (R-82).
 *
 *   env $(grep -E '^(SUPABASE_URL|SUPABASE_SECRET_KEY|VERCEL_TOKEN|VERCEL_TEAM_ID|GHOST5_URL|GHOST5_CONTENT_API_KEY|GHOST6_URL|GHOST6_CONTENT_API_KEY)=' tools/probe/.env | xargs) \
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
const need = ['SUPABASE_URL', 'SUPABASE_SECRET_KEY', ...(LOCAL ? [] : ['VERCEL_TOKEN', 'VERCEL_TEAM_ID']), ...MAJORS.flatMap((m) => [`GHOST${m}_URL`, `GHOST${m}_CONTENT_API_KEY`])]
for (const key of need) {
  if (!process.env[key]) { console.error(`${key} is not set — read it from tools/probe/.env into this command's environment`); process.exit(2) }
}
const SB = process.env.SUPABASE_URL.replace(/\/$/, '')
const SECRET = process.env.SUPABASE_SECRET_KEY
const REPO = path.join(__dirname, '..', '..')
const at = (p) => `${APP}${PREFIX}${p}`
const GHOST = Object.fromEntries(MAJORS.map((m) => [m, { origin: new URL(process.env[`GHOST${m}_URL`]).origin, key: process.env[`GHOST${m}_CONTENT_API_KEY`], name: m === '5' ? 'T3' : 'T1' }]))
const KEYS = Object.values(GHOST).map((g) => g.key)

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
    page.on('request', (r) => {
      if (r.method() !== 'GET' || !ghostOrigins().includes(new URL(r.url()).origin)) return
      const id = identity(r.url())
      seen.set(id, [...(seen.get(id) ?? []), { at: Date.now(), request: r, answered: false, session }])
      totalRequests++
    })
    page.on('response', async (r) => {
      if (r.request().method() !== 'GET' || !ghostOrigins().includes(new URL(r.url()).origin)) return
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
