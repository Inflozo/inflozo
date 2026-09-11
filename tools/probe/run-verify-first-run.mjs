#!/usr/bin/env node
// Story 3.8's I/O matrix, executed against the DEPLOYED app and the live Supabase (R-82).
//
//   node tools/probe/run-verify-first-run.mjs                       # app.inflozo.com (Review, Deploy)
//   APP_ORIGIN=http://localhost:3100 APP_PREFIX=/app node tools/probe/run-verify-first-run.mjs
//
// Run as `env $(grep -E '^SUPABASE_(URL|SECRET_KEY|PUBLISHABLE_KEY)=' tools/probe/.env | xargs) node …`
// — keys reach it through process.env only and it prints none.
//
// WHY IT EXISTS. `lib/first-run.ts` is pure and under `node --test`, but the two halves of the rule
// meet at RUNTIME: `proxy.ts` writes the query string into a request header and `(dashboard)/layout.tsx`
// reads it, and the 307 depends on that layout sitting above every Suspense boundary. A proxy that stopped
// forwarding the header would send `/?restored=1` to `/start` and swallow the restored sentence; a
// `<Suspense>` added above the layout would turn the 307 back into the ~150ms wrong-skeleton client
// navigation the story measured — and `pnpm check` would be green for both. So this drives the real
// thing, raw HTTP and no browser: a GoTrue fixture account with nothing, then a site row, a disconnected
// site row and a project row, each flipping the answer the way the rule says, with the signed-out
// request as the negative control. It creates and deletes its own account; nothing is left behind.
// Written at Story 3.8's review (2026-09-11) from the verifier's throwaway probe.
const URL_ = process.env.SUPABASE_URL
const SECRET = process.env.SUPABASE_SECRET_KEY
const PUB = process.env.SUPABASE_PUBLISHABLE_KEY
const APP = process.env.APP_ORIGIN || 'https://app.inflozo.com'
// On localhost there is no host split, so the internal prefix is reached directly (`routing.ts`).
const PREFIX = process.env.APP_PREFIX ?? ''
if (!URL_ || !SECRET || !PUB) throw new Error('SUPABASE_URL / SUPABASE_SECRET_KEY / SUPABASE_PUBLISHABLE_KEY must be set')

const ref = new URL(URL_).hostname.split('.')[0]
const results = []
const step = (name, ok, evidence) => { results.push({ name, ok, evidence }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name} — ${evidence}`) }

async function admin(method, path, body) {
  const r = await fetch(`${URL_}/auth/v1${path}`, {
    method, headers: { apikey: SECRET, Authorization: `Bearer ${SECRET}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  const text = await r.text()
  return { status: r.status, body: text ? JSON.parse(text) : null }
}
async function rest(method, path, body) {
  const r = await fetch(`${URL_}/rest/v1${path}`, {
    method, headers: { apikey: SECRET, Authorization: `Bearer ${SECRET}`, 'Content-Type': 'application/json', Prefer: 'return=representation' },
    body: body ? JSON.stringify(body) : undefined,
  })
  const text = await r.text()
  return { status: r.status, body: text ? JSON.parse(text) : null }
}

// @supabase/ssr's cookie shape: `sb-<ref>-auth-token` = 'base64-' + base64url(JSON session), chunked at 3180.
function cookieHeader(session) {
  const value = 'base64-' + Buffer.from(JSON.stringify(session)).toString('base64url')
  const key = `sb-${ref}-auth-token`
  if (value.length <= 3180) return `${key}=${value}`
  const parts = []
  for (let i = 0; i * 3180 < value.length; i++) parts.push(`${key}.${i}=${value.slice(i * 3180, (i + 1) * 3180)}`)
  return parts.join('; ')
}

// Under the internal prefix a bare `/` is `/app` and `/?x` is `/app?x`: Next 308s the trailing slash away.
const at = (path) => (PREFIX ? `${APP}${PREFIX}${path === '/' ? '' : path.replace(/^\/\?/, '?')}` : `${APP}${path}`)

async function get(path, cookie) {
  const r = await fetch(at(path), { redirect: 'manual', headers: cookie ? { Cookie: cookie } : {} })
  return { status: r.status, location: r.headers.get('location'), body: await r.text() }
}

const stamp = Date.now()
const email = `review-3-8-${stamp}@inflozo.com`
const password = Buffer.from(crypto.getRandomValues(new Uint8Array(24))).toString('base64url')
let userId
try {
  const made = await admin('POST', '/admin/users', { email, password, email_confirm: true })
  step('fixture account created (GoTrue admin)', made.status === 200 && !!made.body?.id, `POST /auth/v1/admin/users -> HTTP ${made.status}`)
  userId = made.body?.id
  if (!userId) throw new Error('no user')

  const tok = await fetch(`${URL_}/auth/v1/token?grant_type=password`, {
    method: 'POST', headers: { apikey: PUB, 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }),
  })
  const session = await tok.json()
  step('password grant -> session', tok.status === 200 && !!session.access_token, `POST /auth/v1/token?grant_type=password -> HTTP ${tok.status}`)
  const cookie = cookieHeader(session)

  // Unauthenticated control: no session, no First Run.
  const anon = await get('/')
  step('control: signed-out / goes to sign-in, not /start', anon.status === 307 && /\/sign-in$/.test(anon.location || ''), `GET / (no cookie) -> ${anon.status} ${anon.location}`)

  // 1. First sign-in: bare / -> 307 /start
  const bare = await get('/', cookie)
  step('bare / with empty account -> 307 /start', bare.status === 307 && /\/start$/.test(bare.location || ''), `GET / -> ${bare.status} Location: ${bare.location}`)

  // 2. Query string suppresses the redirect
  for (const q of ['/?restored=1', '/?signed-out-failed=1', '/?q=']) {
    const r = await get(q, cookie)
    const extra = q === '/?restored=1' ? ` restored-sentence:${/restored/i.test(r.body)}` : ''
    step(`${q} -> 200 (dashboard)`, r.status === 200, `GET ${q} -> ${r.status}${extra}`)
  }

  // 3. /start serves the heading and the three doors, Recommended on the first
  const start = await get('/start', cookie)
  const h = start.body
  const idx = (s) => h.indexOf(s)
  const heading = idx("Let&#x27;s make your Ghost site gorgeous.") >= 0 || idx("Let's make your Ghost site gorgeous.") >= 0
  const connect = idx('Connect your Ghost site'), starter = idx('Start from a starter'), blank = idx('Blank canvas')
  const rec = idx('Recommended')
  const recCount = h.split('Recommended').length - 1
  step('/start -> 200', start.status === 200, `GET /start -> ${start.status}`)
  step('/start heading served', heading, `heading found: ${heading}`)
  step('/start three doors in the frame order', connect > 0 && starter > connect && blank > starter, `indexes connect=${connect} starter=${starter} blank=${blank}`)
  step('Recommended on the first card only', rec > 0 && rec < starter && recCount === 1, `Recommended at ${rec}, occurrences=${recCount}`)
  step('/start footer line', idx('You can do all of this later.') > 0, `footer found`)
  step("starter door's reason on the page", idx('Starters aren&#x27;t here yet.') > 0 || idx("Starters aren't here yet.") > 0, 'reason sentence found')
  step('Connect door is a plain anchor to /sites/connect', /<a href="\/sites\/connect"/.test(h), 'anchor found')
  step('/start has no top-bar New project button', !/New project<\/button>|>New project</.test(h.replace(/<dialog[\s\S]*?<\/dialog>/g, '')), 'no New project control outside the dialog')

  // 4. Negative controls through PostgREST with the service key
  const site = await rest('POST', '/sites', { user_id: userId, url: `https://review-${stamp}.example.com` })
  step('site row inserted (PostgREST, service key)', site.status === 201, `POST /rest/v1/sites -> HTTP ${site.status}`)
  const withSite = await get('/', cookie)
  step('site only: bare / -> 200 and S3b, not 307', withSite.status === 200 && /Every great site starts somewhere/.test(withSite.body), `GET / -> ${withSite.status}; S3b sentence: ${/Every great site starts somewhere/.test(withSite.body)}`)
  const startWithSite = await get('/start', cookie)
  step('site only: /start -> 307 / (the reverse guard)', startWithSite.status === 307 && /\/$/.test(startWithSite.location || ''), `GET /start -> ${startWithSite.status} Location: ${startWithSite.location}`)

  const disc = await rest('PATCH', `/sites?id=eq.${site.body[0].id}`, { disconnected_at: new Date().toISOString() })
  step('site row marked disconnected', disc.status === 200, `PATCH /rest/v1/sites -> HTTP ${disc.status}`)
  const discOnly = await get('/', cookie)
  step('disconnected only: bare / -> 307 /start again', discOnly.status === 307 && /\/start$/.test(discOnly.location || ''), `GET / -> ${discOnly.status} ${discOnly.location}`)

  const proj = await rest('POST', '/projects', { user_id: userId, name: 'Review fixture', slug: `review-${stamp}`, style_pack: { preset: 'editorial' } })
  step('project row inserted (PostgREST, service key)', proj.status === 201, `POST /rest/v1/projects -> HTTP ${proj.status}`)
  const withProj = await get('/', cookie)
  step('has a project: bare / -> 200 with the project on the page', withProj.status === 200 && /Review fixture/.test(withProj.body), `GET / -> ${withProj.status}; project name on page: ${/Review fixture/.test(withProj.body)}`)
  const startWithProj = await get('/start', cookie)
  step('has a project: /start -> 307 / (the reverse guard)', startWithProj.status === 307 && /\/$/.test(startWithProj.location || ''), `GET /start -> ${startWithProj.status} Location: ${startWithProj.location}`)
} finally {
  if (userId) {
    const del = await admin('DELETE', `/admin/users/${userId}`, {})
    const left = await rest('GET', `/sites?user_id=eq.${userId}&select=id`)
    const leftP = await rest('GET', `/projects?user_id=eq.${userId}&select=id`)
    step('fixture deleted, rows cascaded', del.status === 200 && left.body?.length === 0 && leftP.body?.length === 0, `DELETE /auth/v1/admin/users -> HTTP ${del.status}; sites left ${left.body?.length}, projects left ${leftP.body?.length}`)
  }
}
console.log(`\n${results.filter((r) => r.ok).length}/${results.length} passed`)
process.exit(results.every((r) => r.ok) ? 0 : 1)
