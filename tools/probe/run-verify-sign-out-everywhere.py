#!/usr/bin/env python3
"""FR-A6's sign-out-everywhere, driven through the real UI on the deployed site and read off the wire.

    python3 tools/probe/run-verify-sign-out-everywhere.py --check   # plumbing only: no browser, no UI
    python3 tools/probe/run-verify-sign-out-everywhere.py           # the whole round trip (Deploy run)

WHY IT EXISTS. Story 2.4 rests entirely on claims about GoTrue, and CLAUDE.md's first standing rule
— cite or execute, never assert — makes each one a hypothesis until it is run: that `scope=local`
ends only the calling session; that `scope=global` ends every one; that a JWT whose session row is
gone is refused AT ONCE with `session_not_found` rather than living until its `exp`; that the
response bouncing such a device carries the cookie deletions; that a magic link still signs in
afterwards, with the 30-day cookie. Each is executed here, against `app.inflozo.com` and the real
Supabase project.

WHAT IT PROVES, each step PASS, FAIL or RECORD, exiting non-zero if any step fails. The steps are
named here in the order the run prints them (a docstring that names fewer than the run prints is a
list gone stale — review, 2026-09-07):

  signed-in-a1   A1 redeemed the link the Python half minted and `/account` rendered
  signed-in-a2   A2, a SECOND real session for the same user in its own browser context, minted only
                 now: its link names A's user id, `/account` is 200, `GET /auth/v1/user` is 200
  control-local  THE CONTROL, AND IT RUNS FIRST OF THE BEHAVIOUR. Two real sessions for one user —
                 A1 in a browser, A2 in a second browser context — and A1 presses the avatar menu's
                 ORDINARY Sign out. A1 must land on `/sign-in?signed-out=1`, and A2 must still be signed in: its
                 access token 200 at `GET /auth/v1/user` and its `/account` still rendering. A run
                 where A2 is signed out here has found the pre-2.4 defect still in place — the
                 library's default scope is `global` — and FAILS. Without this step a green
                 `everywhere` proves nothing: signing every device out is also what the BROKEN
                 build did
  frame          the Sessions button's height, radius, padding, weight, border and hover fill read
                 off the DEPLOYED DOM as computed styles — not a grep of the class attribute,
                 because a class that loses to another class is still in the markup (2.1's review).
                 The geometry is `S12 Billing.dc.html:80`'s own, the colours are the TOKENS, read
                 out of globals.css by the sibling's `tokens_rgb` and never retyped here
  frame-390      the same button at 390, where the column is full width: still 30px, at the row's
                 END, and inside the viewport — the AC's "nothing clipped", measured
  axe-account-closed · axe-account-dialog · axe-signed-out-all
                 axe-core at WCAG 2.1 AA over /account (the card closed, and the confirm open) and
                 over /sign-in?signed-out=all, each at 1440 AND 390, and no horizontal scroll
  dialog-focus   the confirm opens with focus on Cancel (EXPERIENCE.md § Destructive confirms), and
                 Escape, the Cancel button and a click on the backdrop EACH close it — the three
                 closers the AC names, not one of them
  dialog-quiet   NOTHING left the browser while the confirm was open and closed those three ways
  everywhere     the primary pressed: A1 lands on `/sign-in?signed-out=all` with its own sentence,
                 A1's cookies are gone, A1's FORMER token and A2's token BOTH answer
                 `session_not_found` at `GET /auth/v1/user`, and A2's next `/account` lands on
                 `/sign-in` with the bouncing response carrying the session cookies' deletion
  rest-residual  RECORD: A1's revoked token presented DIRECTLY to `GET /rest/v1/profiles` — DW-40's
                 back half, executed on every run rather than asserted: PostgREST checks the
                 signature and `exp`, never the session row, so it still answers 200 until `exp`
  jwt-exp        RECORD: the project's `jwt_exp` off the Management API. DW-40 names the window in
                 which a captured access token would still satisfy PostgREST's signature check, and
                 that number belongs in the ledger as a fact rather than a guess. A RECORD compares
                 with nothing: the ledger's copy is stale the day this prints a different number
  magic-link-after  a fresh magic link for A, redeemed at `/auth/confirm`: it signs in to A's OWN
                 user id — a global sign-out ends sessions, never the account — and the response
                 that lands it carries `Max-Age=2592000`, FR-A6's thirty days

WHAT IT CANNOT PROVE: what the OTHER device is told, because it is told nothing — the guard cannot
tell a revoked session from an absent one, and no frame draws a sentence for it. `everywhere`
asserts the bounce and the cleared cookies, which is the whole of the promised behaviour.

NO KEY IS EVER PRINTED. Keys reach the browser half through its environment, never through argv
(argv is world-readable in `ps`), and every command is recorded by the key's variable NAME.

ONE FIXTURE USER IS CREATED AND DELETED HERE. The Admin-API user count is read before and after —
BEFORE any sweep of strays, so a step that created a user it should not have is reported as the leak
it is rather than tidied away — and a count that could not be read FAILS the run, because it is the
cleanup's control. Any `sign-out-harness-*` user a killed earlier run left behind is swept first.

EVERY MAGIC LINK IS MINTED IMMEDIATELY BEFORE IT IS REDEEMED. GoTrue keeps ONE such token per user,
so minting them up front invalidates all but the last (executed 2026-09-07 by the passkey harness:
the deployed confirm route answered `/sign-in?error=link`). A2's session is therefore minted only
after A1 has redeemed its own.

Playwright and axe-core are resolved from the machine, and the helpers that do it — `Admin`,
`load_env`, `playwright_dir`, `axe_path`, `tokens_rgb` and the fixture sweep — are IMPORTED from
`run-verify-passkeys.py` through `run-verify-email-change.py`'s `_sibling` pattern rather than
copied, so a fix to any lands on all three (propagate, never localise).
"""
import argparse, importlib.util, json, os, re, subprocess, sys, tempfile, time

HERE = os.path.dirname(os.path.abspath(__file__))
APP = 'https://app.inflozo.com'


def _sibling(name):
    """`run-verify-passkeys` is not an identifier, so it cannot be `import`ed by name."""
    spec = importlib.util.spec_from_file_location(name.replace('-', '_'), os.path.join(HERE, f'{name}.py'))
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


_passkeys = _sibling('run-verify-passkeys')
Admin, load_env = _passkeys.Admin, _passkeys.load_env
playwright_dir, axe_path, tokens_rgb = _passkeys.playwright_dir, _passkeys.axe_path, _passkeys.tokens_rgb

FIXTURE = r'^sign-out-harness-\d+@inflozo\.com$'
# The three the `frame` step asserts, `{key: css token name}`, read out of globals.css by the
# sibling's `tokens_rgb` — never retyped, because a hex written here is how a frame value goes stale.
FRAME_TOKENS = {'surface': 'surface', 'line': 'line', 'paper': 'paper'}
# FR-A6's thirty days, derived from the app's own constant rather than restated (counts are derived).
COOKIES_TS = os.path.join(HERE, '..', '..', 'apps', 'web', 'lib', 'supabase', 'cookies.ts')


def project_ref(url):
    """`https://<ref>.supabase.co` -> `<ref>`, the Management API's project id."""
    found = re.match(r'https://([a-z0-9]+)\.supabase\.co', url)
    if not found:
        sys.exit('  FAIL  SUPABASE_URL is not an https://<ref>.supabase.co URL; the project ref cannot be derived')
    return found.group(1)


def session_max_age():
    """`SESSION_MAX_AGE` out of the app's own cookie writer. The harness must not carry its own
    copy of FR-A6's thirty days: a number written twice is a number that goes stale once."""
    source = open(COOKIES_TS, encoding='utf-8').read()
    found = re.search(r'SESSION_MAX_AGE\s*=\s*([\d_]+)', source)
    if not found:
        sys.exit('  FAIL  SESSION_MAX_AGE is not in lib/supabase/cookies.ts; the harness has no lifetime to assert')
    return int(found.group(1).replace('_', ''))


# ── The browser half. Node, because Playwright is Node; one file, so one catalogue row. The
#    admin reads live here too, so the wire can be read BETWEEN two UI steps in one session.
BROWSER_JS = r'''
const { chromium } = require(process.env.PW_DIR)

const APP = process.env.APP_URL
const SB = process.env.SB_URL.replace(/\/$/, '')
const SECRET = process.env.SB_SECRET
const PUBLISHABLE = process.env.SB_PUBLISHABLE
const USER_ID = process.env.FIXTURE_USER_ID
const EMAIL = process.env.FIXTURE_EMAIL
const CONFIRM_1 = process.env.CONFIRM_URL_1
const TOKENS = JSON.parse(process.env.TOKENS_RGB)   // { surface, line, paper } as rgb()
const MGMT = process.env.SB_MGMT_TOKEN              // the Management API's token, for jwt_exp
const REF = process.env.SB_REF
const MAX_AGE = Number(process.env.SESSION_MAX_AGE)

/* `load`, NOT `networkidle`, AND A MINUTE TO DO IT IN — the sibling harness's own finding: the
   FIRST authed render on a cold deployment took longer than Playwright's 30s default, and Deploy
   always meets a fresh deployment. Every step asserts through a locator that waits on its own. */
const NAV_TIMEOUT = 60000

const steps = []
const step = (name, ok, detail) => { steps.push({ name, ok, detail }); return ok }
const record = (name, detail) => steps.push({ name, ok: null, detail })

const admin = async (path, init = {}) => {
  const r = await fetch(`${SB}/auth/v1${path}`, {
    ...init,
    headers: { apikey: SECRET, Authorization: `Bearer ${SECRET}`, 'Content-Type': 'application/json' },
  })
  return { status: r.status, body: await r.json().catch(() => null) }
}

/* A magic link, minted HERE and only when it is about to be redeemed — see the docstring: GoTrue
   keeps ONE per user. `generate_link` answers with the USER it minted for, which is how
   `magic-link-after` tells "signed in to A" from "a fresh sign-up wearing A's address". */
const magicLink = async () => {
  const { status, body } = await admin('/admin/generate_link', {
    method: 'POST', body: JSON.stringify({ type: 'magiclink', email: EMAIL }),
  })
  if (status !== 200 || !body || !body.hashed_token) throw new Error(`generate_link -> HTTP ${status}`)
  return { url: `${APP}/auth/confirm?token_hash=${body.hashed_token}&type=magiclink`, id: body.id }
}

/* WHAT GoTrue SAYS ABOUT A TOKEN, asked with the PUBLISHABLE key — the anon surface a browser
   would use, and the same call `getUser()` makes on every page of the app. This is the whole
   claim of the story: a session that has been revoked is refused HERE, at once, rather than
   living until the JWT's own `exp`. */
const whoami = async (token) => {
  const r = await fetch(`${SB}/auth/v1/user`, {
    headers: { apikey: PUBLISHABLE, Authorization: `Bearer ${token}` },
  })
  const body = await r.json().catch(() => null)
  return { status: r.status, code: (body && (body.error_code || body.code)) || null,
           id: (body && body.id) || null }
}

/* THE SESSION OUT OF A BROWSER CONTEXT'S OWN COOKIE JAR. `@supabase/ssr` writes the session as
   `sb-<ref>-auth-token`, chunked into `.0`, `.1`… when it is long, each value a `base64-`-prefixed
   JSON blob; the app writes them `httpOnly` (`lib/supabase/cookies.ts`), which script cannot read
   but Playwright's cookie jar can. A jar that cannot be parsed THROWS rather than answering null:
   a null token would make every `session_not_found` assertion below pass for the wrong reason. */
const accessTokenOf = async (context, whose) => {
  const parts = (await context.cookies(APP))
    .filter((c) => /^sb-.+-auth-token(\.\d+)?$/.test(c.name))
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))
  if (!parts.length) throw new Error(`${whose} has no Supabase auth cookie — it is not signed in`)
  let raw = parts.map((c) => c.value).join('')
  try { raw = decodeURIComponent(raw) } catch { /* not encoded */ }
  if (raw.startsWith('base64-')) raw = Buffer.from(raw.slice('base64-'.length), 'base64').toString('utf8')
  const session = JSON.parse(raw)
  if (!session.access_token) throw new Error(`${whose}'s cookie carries no access_token`)
  return session.access_token
}

/* THE COOKIE DELETIONS, off the wire. `proxy.ts` calls `getUser()` on every request; when GoTrue
   refuses a revoked session the client clears the session through our own `setAll`, and THAT is
   what makes the other device forget. Read off the responses rather than the jar, because the jar
   afterwards cannot say whether the server did it or the redirect simply never carried them.
   Playwright's `Response.headersArray()` is a PROMISE, and read without `await` it is an object
   with no `.filter` — as committed, the run threw at exactly this step (review, 2026-09-07). */
const deletionCookies = async (response) =>
  (await response.headersArray())
    .filter((h) => h.name.toLowerCase() === 'set-cookie')
    .filter((h) => /^sb-.+-auth-token/.test(h.value) && /Max-Age=0|Expires=Thu, 01 Jan 1970/i.test(h.value))

// axe-core at WCAG 2.1 AA, at BOTH widths — the cards go one column at 390 and a violation that
// only exists there is still a violation. `evaluate` and not `addScriptTag`: the app serves a
// per-session CSP with no `unsafe-inline`, which blocks an injected <script>.
const AXE_SOURCE = process.env.AXE_PATH ? require('fs').readFileSync(process.env.AXE_PATH, 'utf8') : null
const axeAt = async (page, label) => {
  if (!AXE_SOURCE) return record(`axe-${label}`, 'axe-core not on this machine — not run')
  const found = []
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 })
    await page.evaluate(AXE_SOURCE)
    const r = await page.evaluate(() =>
      window.axe.run(document, {
        runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] },
      }))
    for (const v of r.violations) found.push(`${width}: ${v.id} x${v.nodes.length}`)
    // A page that scrolls sideways at 390 is the frame's own collapse gone wrong.
    const wide = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)
    if (wide) found.push(`${width}: horizontal scroll`)
  }
  await page.setViewportSize({ width: 1440, height: 900 })
  step(`axe-${label}`, found.length === 0,
       found.length === 0 ? 'zero violations at WCAG 2.1 AA, 1440 and 390; no horizontal scroll' : found.join(', '))
}

// The row's button and the confirm's primary share their words, so the dialog's is addressed by
// where it is rather than by its name.
const sessionsButton = (page) => page.getByRole('button', { name: 'Sign out everywhere', exact: true }).first()
const confirmPrimary = (page) => page.locator('dialog[open] button[type="submit"]')
const openConfirm = async (page) => {
  await sessionsButton(page).click()
  await page.waitForSelector('dialog[open] #sign-out-everywhere-title')
}

;(async () => {
  const browser = await chromium.launch()
  const a1 = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  a1.setDefaultNavigationTimeout(NAV_TIMEOUT)
  const page = await a1.newPage()

  // Every POST the page makes. "Nothing left the browser" is the promise for a confirm that was
  // opened and cancelled, and counting is the only way to see it.
  let posts = 0
  page.on('request', (r) => { if (r.method() === 'POST') posts += 1 })
  const sent = async (fn) => { const before = posts; await fn(); return posts - before }

  try {
    // ── A1 signs in with the link the Python half minted.
    await page.goto(CONFIRM_1, { waitUntil: 'load' })
    await page.goto(`${APP}/account`, { waitUntil: 'load' })
    step('signed-in-a1', await page.locator('h1', { hasText: 'Account' }).count() > 0,
         `A1 landed on ${page.url()}`)

    // ── A2: A SECOND REAL SESSION for the same user, in its own context, its link minted only
    //    now — the first has been redeemed, and GoTrue keeps one at a time.
    const a2 = await browser.newContext({ viewport: { width: 1440, height: 900 } })
    a2.setDefaultNavigationTimeout(NAV_TIMEOUT)
    const second = await a2.newPage()
    const a2Link = await magicLink()
    await second.goto(a2Link.url, { waitUntil: 'load' })
    const a2Account = await second.goto(`${APP}/account`, { waitUntil: 'load' })
    const a2Token = await accessTokenOf(a2, 'A2')
    const a2Before = await whoami(a2Token)
    step('signed-in-a2',
      a2Link.id === USER_ID && a2Account.status() === 200 && !second.url().includes('/sign-in') &&
      a2Before.status === 200 && a2Before.id === USER_ID,
      `minted for ${a2Link.id === USER_ID ? 'A' : JSON.stringify(a2Link.id)}; /account ${a2Account.status()} ` +
      `at ${second.url()}; GET /user -> ${a2Before.status}`)

    // ── THE CONTROL. The avatar menu's ORDINARY Sign out, on A1 only. The trigger is the sidebar
    //    account row (a popover trigger); the row inside is a submit button named exactly
    //    "Sign out", which the Sessions card's longer label cannot be mistaken for.
    await page.locator('button[popovertarget]').first().click()
    await page.getByRole('button', { name: 'Sign out', exact: true }).click()
    await page.waitForURL(/\/sign-in/, { timeout: 60000 }).catch(() => null)
    const a1Landing = page.url()
    const ordinarySaid = await page.locator('[role="status"]', { hasText: 'signed out' })
      .first().textContent({ timeout: 20000 }).catch(() => null)
    // A2 must be UNTOUCHED — the half of FR-A6 that was false until this story.
    const a2After = await whoami(a2Token)
    const a2Still = await second.goto(`${APP}/account`, { waitUntil: 'load' })
    step('control-local',
      a1Landing.includes('signed-out=1') && (ordinarySaid || '').includes("You’ve been signed out.") &&
      a2After.status === 200 && a2Still.status() === 200 && !second.url().includes('/sign-in'),
      `A1 -> ${a1Landing}, the card said ${JSON.stringify(ordinarySaid)}; ` +
      `A2 GET /user -> ${a2After.status} (${JSON.stringify(a2After.code)}), ` +
      `A2 /account -> ${a2Still.status()} at ${second.url()}`)

    // ── A1 signs back in for the rest of the run.
    const again = await magicLink()
    await page.goto(again.url, { waitUntil: 'load' })
    await page.goto(`${APP}/account`, { waitUntil: 'load' })

    // ── the frame, MEASURED off the deployed DOM. `S12 Billing.dc.html:80`: 30px tall, 0 13px,
    //    radius 10, 12px/500, a `line` border on `surface` with `paper` on hover.
    const button = sessionsButton(page)
    const look = await button.evaluate((n) => {
      const s = getComputedStyle(n), r = n.getBoundingClientRect()
      return { h: Math.round(r.height), radius: s.borderTopLeftRadius, size: s.fontSize,
               weight: s.fontWeight, padding: s.paddingLeft, border: s.borderTopColor,
               bg: s.backgroundColor }
    })
    await button.hover()
    // globals.css's --duration-fast (160ms) animates the fill in; read before it settles and the
    // colour is whatever the transition was passing through (the sibling harness's own note).
    await page.waitForTimeout(220)
    look.hover = await button.evaluate((n) => getComputedStyle(n).backgroundColor)
    step('frame',
      look.h === 30 && look.radius === '10px' && look.size === '12px' && look.weight === '500' &&
      look.padding === '13px' && look.border === TOKENS.line && look.bg === TOKENS.surface &&
      look.hover === TOKENS.paper,
      `${JSON.stringify(look)} vs tokens ${JSON.stringify(TOKENS)}`)

    // ── at 390 the frame draws nothing and the column is full width (`page.tsx`); the button must
    //    still be the frame's 30px, sit at the row's END and lie inside the viewport — the AC's
    //    "nothing clipped", measured rather than hoped (review, 2026-09-07).
    await page.setViewportSize({ width: 390, height: 900 })
    const narrow = await button.evaluate((n) => {
      const b = n.getBoundingClientRect(), row = n.parentElement.getBoundingClientRect()
      return { h: Math.round(b.height), width: Math.round(b.width), right: Math.round(b.right),
               rowRight: Math.round(row.right), viewport: window.innerWidth,
               clipped: b.left < 0 || b.right > window.innerWidth }
    })
    step('frame-390',
      narrow.h === 30 && narrow.width > 0 && !narrow.clipped && Math.abs(narrow.rowRight - narrow.right) <= 1,
      JSON.stringify(narrow))
    await page.setViewportSize({ width: 1440, height: 900 })

    await axeAt(page, 'account-closed')

    // ── the confirm opens on Cancel; Escape, the Cancel button and a click on the backdrop EACH
    //    close it (the AC names all three — the first version proved Escape alone, review,
    //    2026-09-07); and nothing was sent while it was open, all three closers under the one counter.
    const idlePosts = await sent(async () => {
      await openConfirm(page)
      await axeAt(page, 'account-dialog')
      const onCancel = await page.evaluate(() =>
        document.activeElement !== null && document.activeElement.hasAttribute('data-cancel'))
      const closers = {
        escape: () => page.keyboard.press('Escape'),
        cancel: () => page.locator('dialog[open] [data-cancel]').click(),
        // The `::backdrop` is the <dialog> itself for hit-testing, and `kit/dialog.ts` closes on a
        // click whose point lies outside the 460px sheet: the viewport's corner is one.
        backdrop: () => page.mouse.click(4, 4),
      }
      const closedBy = {}
      for (const [name, close] of Object.entries(closers)) {
        if (name !== 'escape') await openConfirm(page)
        await close()
        await page.waitForFunction(() => !document.querySelector('dialog[open]'),
                                   null, { timeout: 10000 }).catch(() => null)
        closedBy[name] = await page.locator('dialog[open]').count() === 0
        // A closer that did not close leaves a modal over the button the next one needs: force it.
        if (!closedBy[name]) await page.evaluate(() => document.querySelector('dialog[open]')?.close())
      }
      step('dialog-focus', onCancel && Object.values(closedBy).every(Boolean),
           `focus was on Cancel = ${onCancel}; closed by ${JSON.stringify(closedBy)}`)
    })
    if (idlePosts !== 0) step('dialog-quiet', false, `${idlePosts} POST(s) left the browser while the confirm was merely open`)
    else step('dialog-quiet', true, 'nothing left the browser while the confirm was open and closed three ways')

    // ── EVERYWHERE. A1's own token is read BEFORE it is revoked: afterwards the cookies are gone
    //    and there would be nothing left to ask GoTrue about.
    const a1Token = await accessTokenOf(a1, 'A1')
    const bounced = []
    second.on('response', (r) => bounced.push(r))
    await openConfirm(page)
    await confirmPrimary(page).click()
    await page.waitForURL(/signed-out=all/, { timeout: 60000 }).catch(() => null)
    const everywhereLanding = page.url()
    const everywhereSaid = await page.locator('[role="status"]', { hasText: 'every device' })
      .first().textContent({ timeout: 20000 }).catch(() => null)
    const a1Cookies = (await a1.cookies(APP)).filter((c) => /^sb-.+-auth-token/.test(c.name))
    const a1Dead = await whoami(a1Token)
    const a2Dead = await whoami(a2Token)
    const from = bounced.length
    const a2Bounced = await second.goto(`${APP}/account`, { waitUntil: 'load' })
    const cleared = (await Promise.all(bounced.slice(from).map(deletionCookies))).flat()
    step('everywhere',
      everywhereLanding.includes('signed-out=all') &&
      (everywhereSaid || '').includes('signed out on every device') &&
      a1Cookies.length === 0 &&
      a1Dead.status !== 200 && a1Dead.code === 'session_not_found' &&
      a2Dead.status !== 200 && a2Dead.code === 'session_not_found' &&
      second.url().includes('/sign-in') && cleared.length > 0,
      `A1 -> ${everywhereLanding}, the card said ${JSON.stringify(everywhereSaid)}; ` +
      `A1 auth cookies left=${a1Cookies.length}; ` +
      `A1's former token -> HTTP ${a1Dead.status} ${JSON.stringify(a1Dead.code)}; ` +
      `A2's token -> HTTP ${a2Dead.status} ${JSON.stringify(a2Dead.code)}; ` +
      `A2 /account -> ${a2Bounced && a2Bounced.status()} at ${second.url()}, ` +
      `${cleared.length} session cookie deletion(s) on the way`)

    // ── DW-40's BACK half, executed rather than asserted: PostgREST checks the signature and `exp`
    //    and never the session row, so the token GoTrue just refused should still be good at
    //    `/rest/v1` until `exp`. A RECORD — the day this answers 401 the residual is closed.
    const rest = await fetch(`${SB}/rest/v1/profiles?select=user_id&limit=1`, {
      headers: { apikey: PUBLISHABLE, Authorization: `Bearer ${a1Token}` },
    })
    record('rest-residual', `A1's revoked token at GET /rest/v1/profiles -> HTTP ${rest.status}` +
      (rest.status === 200 ? ' — still accepted until its exp; DW-40 stands' : ' — refused; DW-40 can close'))

    await axeAt(page, 'signed-out-all')

    // ── DW-40's number, read rather than guessed: how long a captured token would still satisfy
    //    a signature check at PostgREST, which never asks GoTrue whether the session exists. The
    //    `User-Agent` is load-bearing: api.supabase.com sits behind Cloudflare and answers
    //    `403 error code: 1010` to a library's default one — `configure-supabase-auth.py`'s
    //    executed pitfall — so curl's is sent, as there. A 200 whose body carries no integer
    //    `jwt_exp` is SAID, not printed as `undefined seconds` (review, 2026-09-07).
    const config = await fetch(`https://api.supabase.com/v1/projects/${REF}/config/auth`, {
      headers: { Authorization: `Bearer ${MGMT}`, 'User-Agent': 'curl/8.5.0' },
    })
    const auth = await config.json().catch(() => null)
    const jwtExp = config.status === 200 && auth && Number.isInteger(auth.jwt_exp) ? auth.jwt_exp : null
    record('jwt-exp', jwtExp !== null
      ? `jwt_exp = ${jwtExp} seconds (${Math.round(jwtExp / 60)} minutes) — DW-40's window`
      : `jwt_exp NOT read: the Management API answered HTTP ${config.status}` +
        (config.status === 200 ? ' with no integer jwt_exp in the body' : ''))

    // ── and the account is untouched: a fresh magic link signs A back in, with the 30-day cookie
    const afterLink = await magicLink()
    const headers = []   // promises — `headersArray()` again, see `deletionCookies`
    const collect = (r) => headers.push(r.headersArray())
    page.on('response', collect)
    await page.goto(afterLink.url, { waitUntil: 'load' })
    const backOn = await page.goto(`${APP}/account`, { waitUntil: 'load' })
    page.off('response', collect)
    const setCookies = (await Promise.all(headers)).flat().filter((h) => h.name.toLowerCase() === 'set-cookie')
    const thirtyDays = setCookies.filter((h) => /^sb-.+-auth-token/.test(h.value) &&
                                                new RegExp(`Max-Age=${MAX_AGE}\\b`).test(h.value))
    step('magic-link-after',
      afterLink.id === USER_ID && backOn.status() === 200 && !page.url().includes('/sign-in') &&
      thirtyDays.length > 0,
      `minted for ${afterLink.id === USER_ID ? 'A' : JSON.stringify(afterLink.id)}; ` +
      `/account ${backOn.status()} at ${page.url()}; ` +
      `${thirtyDays.length} session cookie(s) carried Max-Age=${MAX_AGE}`)

    await a2.close()
  } catch (error) {
    step('threw', false, String((error && error.message) || error).slice(0, 400))
  } finally {
    await browser.close()
    process.stdout.write('\n@@RESULT@@' + JSON.stringify(steps) + '\n')
  }
})()
'''


def run_browser(cfg):
    pw = playwright_dir()
    if not pw:
        print('  FAIL  playwright is not on this machine. Set PLAYWRIGHT_DIR to a playwright')
        print('        package directory, or install one; see memory `headless-browser-tooling`.')
        return [{'name': 'browser', 'ok': False, 'detail': 'playwright not resolvable'}]

    with tempfile.TemporaryDirectory() as work:
        script = os.path.join(work, 'sign-out-everywhere.js')
        open(script, 'w').write(BROWSER_JS)
        # SECRETS GO IN THE ENVIRONMENT, never in argv: argv is world-readable in `ps`.
        child = dict(os.environ, PW_DIR=pw, APP_URL=APP, AXE_PATH=axe_path() or '', **cfg)
        try:
            proc = subprocess.run(['node', script], env=child, capture_output=True, text=True, timeout=900)
        except subprocess.TimeoutExpired:
            return [{'name': 'browser', 'ok': False, 'detail': 'node did not finish inside 900s'}]
        except FileNotFoundError:
            return [{'name': 'browser', 'ok': False, 'detail': 'node is not on PATH; Playwright is Node'}]
    for line in proc.stdout.splitlines():
        if line.startswith('@@RESULT@@'):
            return json.loads(line[len('@@RESULT@@'):])
    print(proc.stdout[-2000:])
    print(proc.stderr[-2000:], file=sys.stderr)
    return [{'name': 'browser', 'ok': False, 'detail': f'node exited {proc.returncode} with no result'}]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--check', action='store_true',
                    help='plumbing only: keys present, playwright and axe resolvable, and one real '
                         'admin create-read-delete. No browser and no UI, so it runs before the '
                         'story is deployed.')
    args = ap.parse_args()

    env = load_env()
    # The fourth is the Management API's, for the ONE read that fills DW-40's `jwt_exp`.
    needed = ['SUPABASE_URL', 'SUPABASE_SECRET_KEY', 'SUPABASE_PUBLISHABLE_KEY', 'SUPABASE_ACCESS_TOKEN']
    missing = [k for k in needed if not env.get(k)]
    if missing:
        print(f'  FAIL  tools/probe/.env is missing: {", ".join(missing)}')
        return 1

    admin = Admin(env['SUPABASE_URL'], env['SUPABASE_SECRET_KEY'])
    email = f'sign-out-harness-{int(time.time())}@inflozo.com'

    swept = admin.sweep_stale_fixtures(FIXTURE)
    if swept:
        print(f'  swept {swept} stale sign-out-harness-* user(s) an earlier run left behind')
    users = admin.users()
    if users is None:
        print('  FAIL  the Admin-API user count could not be read, so the cleanup has no control.')
        return 1
    before = len(users)
    print(f'  users before: {before}')

    status, user = admin.call('POST', '/admin/users', {'email': email, 'email_confirm': True})
    if status not in (200, 201) or not user.get('id'):
        print(f'  FAIL  could not create the fixture user: HTTP {status}')
        return 1
    user_id = user['id']
    print('  fixture user A created')

    failed = False
    try:
        if args.check:
            pw, axe = playwright_dir(), axe_path()
            print(f'  playwright: {"resolved" if pw else "NOT FOUND"}')
            print(f'  axe-core:   {"resolved" if axe else "NOT FOUND"}')
            read, back = admin.call('GET', f'/admin/users/{user_id}')
            ok = read == 200 and back.get('id') == user_id
            print(f'  {"PASS" if ok else "FAIL"}  admin round trip: create, read back ({read})')
            print(f'  SESSION_MAX_AGE read from the app: {session_max_age()}')
            failed = not ok or not pw or not axe
        else:
            status, link = admin.call('POST', '/admin/generate_link',
                                      {'type': 'magiclink', 'email': email})
            if status != 200 or not link.get('hashed_token'):
                print(f'  FAIL  generate_link (A1\'s sign-in link) answered HTTP {status}')
                return 1
            steps = run_browser({
                'SB_URL': env['SUPABASE_URL'],
                'SB_SECRET': env['SUPABASE_SECRET_KEY'],
                'SB_PUBLISHABLE': env['SUPABASE_PUBLISHABLE_KEY'],
                'SB_MGMT_TOKEN': env['SUPABASE_ACCESS_TOKEN'],
                'SB_REF': project_ref(env['SUPABASE_URL']),
                'FIXTURE_USER_ID': user_id,
                'FIXTURE_EMAIL': email,
                'CONFIRM_URL_1': f'{APP}/auth/confirm?token_hash={link["hashed_token"]}&type=magiclink',
                'TOKENS_RGB': json.dumps(tokens_rgb(FRAME_TOKENS)),
                'SESSION_MAX_AGE': str(session_max_age()),
            })
            for s in steps:
                mark = 'RECORD' if s['ok'] is None else ('PASS' if s['ok'] else 'FAIL')
                print(f'  {mark:6} {s["name"]}: {s["detail"]}')
                if s['ok'] is False:
                    failed = True
    finally:
        admin.call('DELETE', f'/admin/users/{user_id}', {})
        # The count is compared BEFORE any sweep of strays, so a user a step created by mistake is
        # reported as the leak it is rather than tidied away (the sibling harness's own note).
        after = admin.user_count()
        print(f'  fixture user deleted; users after: {after}')
        if after is None:
            print('  FAIL  the Admin-API user count could not be read after cleanup — unverified.')
            failed = True
        elif after != before:
            print('  FAIL  the user count did not return to where it started — a user leaked.')
            failed = True
        strays = admin.sweep_stale_fixtures(FIXTURE)
        if strays:
            print(f'  FAIL  {strays} stray sign-out-harness-* user(s) existed after cleanup and were swept.')
            failed = True

    print('  RESULT: ' + ('FAILED' if failed else 'all steps passed'))
    return 1 if failed else 0


if __name__ == '__main__':
    sys.exit(main())
