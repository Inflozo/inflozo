#!/usr/bin/env python3
"""The passkey ceremony's repeatable control — register, name, rename, revoke, and what a
revoked credential does at sign-in — driven through the real UI on the deployed site.

    python3 tools/probe/run-verify-passkeys.py --check   # plumbing only: no browser, no UI
    python3 tools/probe/run-verify-passkeys.py           # the whole round trip (Deploy run)

WHY IT EXISTS. DW-32 (3) and (4): the round trip and the duplicate refusal were proved by an
improvised harness that lives in no file, so Story 2.2 — which edits the two files carrying the
ceremony — could break either with every check green. DW-33 (1): whether GoTrue rate-limits its
own `/passkeys/authentication/*` is a claim about an external platform, and standing rule 1 says
a claim is a hypothesis until executed.

WHAT IT PROVES, each step PASS or FAIL, and it exits non-zero if any step fails:

  register       Add a passkey through the UI; the admin API lists exactly one for the user
  auto-name      what `friendly_name` the row is BORN with (recorded, not asserted — a virtual
                 authenticator reports the all-zero AAGUID, so `Passkey` is the honest answer
                 and DW-32 (2) stays open for a real one)
  rename         the pencil, a new name, Save; the new name read back OFF THE WIRE
  rename-control THE CONTROL: one character over the platform's ceiling must be REFUSED by the
                 server, with the field's own sentence. The value is set past `maxLength` from
                 script — Playwright's `fill` types through Chromium's editing pipeline and
                 HONOURS `maxlength` (executed 2026-09-07: 121 became 120) — so what is proved is
                 the action's refusal, not the field's. A run whose control passes proves nothing
                 (standing rule 2), so this failing fails the run
  duplicate      DW-32 (4): a second `create()` on the same authenticator — does GoTrue populate
                 `excludeCredentials`, or does the card silently grow a second row?
  revoke-focus   the confirm opens with focus on Cancel (EXPERIENCE.md § Destructive confirms)
  revoke         Remove passkey; the id leaves `GET /passkeys`; the row goes; the SAME SESSION
                 still renders /account — a revoke signs nobody out
  revoked-signin the revoked credential at /sign-in: still signed out AND one of S1a's two
                 sentences on the page (both name the magic link) — a button that did nothing
                 would otherwise pass
  magic-link     a magic link minted AFTER the first was redeemed still signs the user in. Minted
                 then, not up front: GoTrue keeps ONE such token per user, so minting two at the
                 start invalidated the first (executed 2026-09-07 — the deployed confirm route
                 answered `/sign-in?error=link` for it)
  axe-*          axe-core 4.12.1 at WCAG 2.1 AA over /account in three states — the card closed,
                 the rename dialog open, the revoke confirm open. THEY LIVE HERE and not in a
                 scratch script because the two dialog states need a passkey row, a row needs a
                 real WebAuthn registration, and GoTrue's rp.id is `inflozo.com` — so no
                 localhost origin can ever produce one (executed 2026-09-07: Chrome refuses with
                 "The relying party ID is not a registrable domain suffix of ... the current
                 domain"). The deployed site is the only place these three can run
  ratelimit      DW-33 (1): 30 posts to `/passkeys/authentication/options`, the first status ≠ 200

NO KEY IS EVER PRINTED. Keys reach the browser half through its environment, never through argv
(argv is visible in `ps`), and every command is recorded by the key's variable NAME.

THE FIXTURE USER IS CREATED AND DELETED HERE. The Admin-API user count is read before and after,
so a run that leaks a user says so — and a count that could not be read FAILS the run, because it
is the cleanup's control. Any `passkey-harness-*` user a killed earlier run left behind is deleted
first. Cleanup runs even when a step fails.

THE FRAME'S VALUES ARE DERIVED, NOT RETYPED: the hover fills and glyph colours the `frame` step
asserts are read out of `apps/web/app/globals.css` (the token layer, Story 1.3; `DESIGN.md:51`
records `danger-tint` as #FDECEC where S12 draws #FDEBEC — both export values, the token rules),
and the name ceiling out of `account/passkey-name-rule.ts`.

Playwright is not a dependency of this repository — it is resolved from the machine (see
PLAYWRIGHT_DIR below), because this is a Deploy-run tool and not a CI gate.
"""
import argparse, glob, json, os, re, subprocess, sys, tempfile, time, urllib.error, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
APP = 'https://app.inflozo.com'

# Where Playwright lives. Overridable, because it is outside this repository by construction.
# pnpm hoists nothing, so the real package sits under `.pnpm/<name>@<version>/node_modules/`.
# The glob is deliberate: pinning a version here is the hardcoded-count mistake in another hat.
PLAYWRIGHT_CANDIDATES = [
    os.environ.get('PLAYWRIGHT_DIR', ''),
    '/home/ghost/Dev/BMAD/inflozo/node_modules/playwright',
    '/home/ghost/Dev/BMAD/inflozo/node_modules/.pnpm/playwright@*/node_modules/playwright',
]
AXE_CANDIDATES = [
    os.environ.get('AXE_PATH', ''),
    '/home/ghost/Dev/BMAD/inflozo/node_modules/.pnpm/axe-core@*/node_modules/axe-core/axe.min.js',
]


def load_env():
    """`tools/probe/.env`, by NAME. Values go into subprocess environments and nowhere else."""
    out = {}
    path = os.path.join(HERE, '.env')
    if not os.path.exists(path):
        return out
    for line in open(path):
        m = re.match(r'^([A-Z0-9_]+)=(.*)$', line.rstrip('\n'))
        if m and m.group(2).strip():
            out[m.group(1)] = m.group(2).strip()
    return out


class Admin:
    """GoTrue's admin API over `SUPABASE_SECRET_KEY`. Read and write; nothing is echoed."""

    def __init__(self, url, secret):
        self.url, self.secret = url.rstrip('/'), secret

    def call(self, method, path, body=None):
        req = urllib.request.Request(
            f'{self.url}/auth/v1{path}',
            data=json.dumps(body).encode() if body is not None else None,
            method=method,
            headers={'apikey': self.secret, 'Authorization': f'Bearer {self.secret}',
                     'Content-Type': 'application/json'},
        )
        try:
            with urllib.request.urlopen(req, timeout=45) as r:
                raw = r.read()
                return r.status, (json.loads(raw) if raw else {})
        except urllib.error.HTTPError as e:
            raw = e.read()
            try:
                return e.code, (json.loads(raw) if raw else {})
            except ValueError:
                return e.code, {}
        except (urllib.error.URLError, TimeoutError, ValueError, OSError):
            return 0, {}

    def users(self):
        """Every user, paged until an EMPTY page — not until a short one, because a `per_page`
        GoTrue caps below what was asked would otherwise end the count on page one. `None` if any
        page failed: the caller treats that as a failed control, never as zero."""
        out, page = [], 1
        while True:
            status, body = self.call('GET', f'/admin/users?page={page}&per_page=200')
            if status != 200:
                return None
            users = body.get('users', [])
            if not users:
                return out
            out.extend(users)
            page += 1

    def user_count(self):
        users = self.users()
        return None if users is None else len(users)

    def sweep_stale_fixtures(self):
        """A run killed mid-browser leaves a confirmed `passkey-harness-*` user behind, and the
        next run's before/after count would still balance. Delete them first, and say so."""
        users = self.users() or []
        stale = [u for u in users if re.match(r'^passkey-harness-\d+@inflozo\.com$', u.get('email') or '')]
        for u in stale:
            self.call('DELETE', f'/admin/users/{u["id"]}', {})
        return len(stale)


def resolve(candidates):
    for candidate in candidates:
        if not candidate:
            continue
        for found in sorted(glob.glob(candidate)):
            if os.path.exists(found):
                return found
    return None


def playwright_dir():
    return resolve(PLAYWRIGHT_CANDIDATES)


def axe_path():
    return resolve(AXE_CANDIDATES)


# ── The browser half. Node, because Playwright is Node; one file, so one catalogue row. The
#    admin reads live here too, so the wire can be read BETWEEN two UI steps in one session.
BROWSER_JS = r'''
const { chromium } = require(process.env.PW_DIR)

const APP = process.env.APP_URL
const SB = process.env.SB_URL.replace(/\/$/, '')
const SECRET = process.env.SB_SECRET
const USER_ID = process.env.FIXTURE_USER_ID
const CONFIRM_1 = process.env.CONFIRM_URL_1
const TOKENS = JSON.parse(process.env.TOKENS_RGB)   // { paper, dangerTint, inkSoft, danger } as rgb()
const NAME_MAX = Number(process.env.NAME_MAX)
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

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
// A magic link, minted HERE and only when it is about to be redeemed — see the docstring.
const magicLink = async () => {
  const { status, body } = await admin('/admin/generate_link', {
    method: 'POST', body: JSON.stringify({ type: 'magiclink', email: process.env.FIXTURE_EMAIL }),
  })
  if (status !== 200 || !body || !body.hashed_token) throw new Error(`generate_link answered HTTP ${status}`)
  return `${APP}/auth/confirm?token_hash=${body.hashed_token}&type=magiclink`
}
// The list the app itself reads, read independently over the admin API — the wire, not the DOM.
const passkeys = async () => {
  const { status, body } = await admin(`/admin/users/${USER_ID}/passkeys`)
  const list = Array.isArray(body) ? body : (body && body.passkeys) || []
  return { status, list }
}
// axe-core at WCAG 2.1 AA. `evaluate` and not `addScriptTag`: the app serves a per-session CSP
// with no `unsafe-inline`, which blocks an injected <script> tag; `evaluate` runs in the page's
// own JS world through CDP and is not subject to it.
const AXE_SOURCE = process.env.AXE_PATH ? require('fs').readFileSync(process.env.AXE_PATH, 'utf8') : null
const axe = async (page, label) => {
  if (!AXE_SOURCE) return record(`axe-${label}`, 'axe-core not on this machine — not run')
  await page.evaluate(AXE_SOURCE)
  const r = await page.evaluate(() =>
    window.axe.run(document, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] },
    }))
  step(`axe-${label}`, r.violations.length === 0,
       r.violations.length === 0
         ? 'zero violations at WCAG 2.1 AA'
         : r.violations.map((v) => `${v.id} x${v.nodes.length}`).join(', '))
}

const names = (page) =>
  page.$$eval('[aria-label^="Rename "]', (els) =>
    els.map((e) => e.getAttribute('aria-label').replace(/^Rename /, '')),
  )

;(async () => {
  const browser = await chromium.launch()
  const context = await browser.newContext()
  const page = await context.newPage()

  // The virtual authenticator lives on the browser target, so it survives the sign-out below —
  // which is the whole point of the `revoked-signin` step: the AUTHENTICATOR still holds the
  // credential the server no longer knows.
  const cdp = await context.newCDPSession(page)
  await cdp.send('WebAuthn.enable')
  await cdp.send('WebAuthn.addVirtualAuthenticator', {
    options: {
      protocol: 'ctap2',
      transport: 'internal',
      hasResidentKey: true,
      hasUserVerification: true,
      isUserVerified: true,
      automaticPresenceSimulation: true,
    },
  })

  try {
    // ── sign in with the magic link the Python half minted
    await page.goto(CONFIRM_1, { waitUntil: 'networkidle' })
    await page.goto(`${APP}/account`, { waitUntil: 'networkidle' })
    step('signed-in', await page.locator('h1', { hasText: 'Account' }).count() > 0,
         `landed on ${page.url()}`)

    // ── register
    await page.getByRole('button', { name: 'Add a passkey' }).click()
    await page.waitForSelector('[aria-label^="Rename "]', { timeout: 20000 })
    let wire = await passkeys()
    const id = wire.list[0] && wire.list[0].id
    // The id's SHAPE is asserted because `passkeyIdSchema` (the action's boundary) is `z.uuid()`
    // on the claim that GoTrue mints UUIDs — a claim about a platform, executed here.
    step('register', wire.status === 200 && wire.list.length === 1 && UUID.test(String(id)),
         `GET /admin/users/{id}/passkeys -> ${wire.status}, ${wire.list.length} passkey(s), id is a UUID=${UUID.test(String(id))}`)
    record('auto-name', `born as friendly_name=${JSON.stringify(wire.list[0] && wire.list[0].friendly_name)}`)

    // ── the frame, MEASURED. `S12 Billing.dc.html:90-91` draws a 28x28 box at radius 8 with a
    //    13px glyph, the pencil in ink-soft over a `paper` hover and the bin in danger over a
    //    `danger-tint` hover — asserted against the TOKENS read out of globals.css, because the
    //    token is what the frame is built from (R-74; `danger-tint` is #FDECEC by DESIGN.md:51
    //    where the frame's own pixel is #FDEBEC). Computed styles and not a grep of the class
    //    attribute: a class that loses to another class is still in the markup, which is how
    //    S1a's button shipped at the wrong weight (2.1's review).
    const measure = async (selector) => {
      const el = page.locator(selector).first()
      const box = await el.evaluate((n) => {
        const s = getComputedStyle(n), r = n.getBoundingClientRect(), g = n.querySelector('svg')
        return { w: r.width, h: r.height, radius: s.borderTopLeftRadius, colour: s.color,
                 glyph: g && g.getAttribute('width') }
      })
      await el.hover()
      box.hover = await el.evaluate((n) => getComputedStyle(n).backgroundColor)
      return box
    }
    const pencil = await measure('[aria-label^="Rename "]')
    const bin = await measure('[aria-label^="Remove "]')
    step('frame',
      pencil.w === 28 && pencil.h === 28 && pencil.radius === '8px' && pencil.glyph === '13' &&
      pencil.colour === TOKENS.inkSoft && pencil.hover === TOKENS.paper &&
      bin.w === 28 && bin.h === 28 && bin.radius === '8px' && bin.glyph === '13' &&
      bin.colour === TOKENS.danger && bin.hover === TOKENS.dangerTint,
      `pencil ${JSON.stringify(pencil)} · bin ${JSON.stringify(bin)} · tokens ${JSON.stringify(TOKENS)}`)

    await axe(page, 'card')

    // ── rename
    const NEW = 'Harness MacBook'
    await page.locator('[aria-label^="Rename "]').first().click()
    await page.waitForSelector('dialog[open] #rename-passkey')
    const renameOnCancel = await page.evaluate(() =>
      document.activeElement !== null && document.activeElement.hasAttribute('data-cancel'))
    record('rename-focus', `the rename dialog opens on Cancel = ${renameOnCancel}`)
    await axe(page, 'rename-open')
    await page.fill('#rename-passkey', NEW)
    await page.getByRole('button', { name: 'Save' }).click()
    await page.waitForFunction(
      (n) => [...document.querySelectorAll('[aria-label^="Rename "]')]
        .some((e) => e.getAttribute('aria-label') === `Rename ${n}`),
      NEW, { timeout: 20000 },
    )
    wire = await passkeys()
    step('rename', (wire.list[0] || {}).friendly_name === NEW,
         `friendly_name off the wire = ${JSON.stringify((wire.list[0] || {}).friendly_name)}`)

    // ── rename-control: one over the ceiling must be refused BY THE SERVER. NOT `fill`: it types
    //    through Chromium's editing pipeline and honours `maxlength` (executed 2026-09-07 — 121
    //    became 120 and the control would have failed for the wrong reason). The value is set
    //    from script, past the attribute, so what is proved is the action's own refusal.
    await page.locator('[aria-label^="Rename "]').first().click()
    await page.waitForSelector('dialog[open] #rename-passkey')
    await page.$eval('#rename-passkey', (el, n) => {
      el.value = 'x'.repeat(n)
      el.dispatchEvent(new Event('input', { bubbles: true }))
    }, NAME_MAX + 1)
    const sent = await page.$eval('#rename-passkey', (el) => el.value.length)
    await page.getByRole('button', { name: 'Save' }).click()
    const refusal = await page.locator('#rename-passkey-error').textContent({ timeout: 15000 }).catch(() => null)
    const stillOpen = await page.locator('dialog[open] #rename-passkey').count() > 0
    wire = await passkeys()
    step('rename-control',
         sent === NAME_MAX + 1 && stillOpen && Boolean(refusal) && refusal.includes(String(NAME_MAX)) &&
         (wire.list[0] || {}).friendly_name === NEW,
         `sent ${sent} characters; dialog still open=${stillOpen}; the field said ${JSON.stringify(refusal)}; ` +
         `name on the wire unchanged=${(wire.list[0] || {}).friendly_name === NEW}`)
    await page.locator('dialog[open] [data-cancel]').click()

    // ── duplicate (DW-32 (4)): a second create() on the SAME authenticator
    await page.getByRole('button', { name: 'Add a passkey' }).click()
    // The outcome is a caption (refused) or a second row (not refused); wait for either rather
    // than for a fixed number of seconds, so a slow ceremony is not recorded as a refusal.
    await page.waitForFunction(
      () => document.querySelector('#passkeys-caption') ||
            document.querySelectorAll('[aria-label^="Rename "]').length > 1,
      null, { timeout: 20000 },
    ).catch(() => null)
    const after = await passkeys()
    const caption = await page.locator('#passkeys-caption').textContent().catch(() => null)
    record('duplicate',
      after.list.length === 1
        ? `REFUSED — GoTrue populates excludeCredentials; the card said ${JSON.stringify(caption)}`
        : `NOT refused — ${after.list.length} passkeys now exist; ALREADY_HERE is dead code`)
    // Whatever GoTrue did, the steps below reason about ONE credential: any extra row is removed
    // through the same bin the product draws, so `revoked-signin` cannot pass or fail on a
    // credential the harness never revoked.
    for (const extra of (await names(page)).filter((n) => n !== NEW)) {
      const rows = (await names(page)).length
      await page.locator(`[aria-label="Remove ${extra}"]`).first().click()
      await page.waitForSelector('dialog[open]')
      await page.getByRole('button', { name: 'Remove passkey' }).click()
      await page.waitForFunction((n) => document.querySelectorAll('[aria-label^="Rename "]').length === n,
                                 rows - 1, { timeout: 20000 })
    }

    // ── revoke: focus first, then the act
    await page.locator(`[aria-label="Remove ${NEW}"]`).click()
    await page.waitForSelector('dialog[open]')
    const onCancel = await page.evaluate(() =>
      document.activeElement !== null && document.activeElement.hasAttribute('data-cancel'))
    step('revoke-focus', onCancel, `focus is on the Cancel button = ${onCancel}`)
    await axe(page, 'confirm-open')

    await page.getByRole('button', { name: 'Remove passkey' }).click()
    await page.waitForFunction(
      (n) => ![...document.querySelectorAll('[aria-label^="Rename "]')]
        .some((e) => e.getAttribute('aria-label') === `Rename ${n}`),
      NEW, { timeout: 20000 },
    )
    wire = await passkeys()
    const gone = Boolean(id) && !wire.list.some((p) => p.id === id)
    // The same session must still render /account: a revoke is not a sign-out.
    const reload = await page.goto(`${APP}/account`, { waitUntil: 'networkidle' })
    const sessionHeld = reload.status() === 200 && !page.url().includes('/sign-in')
    step('revoke', gone && sessionHeld,
         `id off the wire=${gone}, list now ${wire.list.length}, ` +
         `same session still on ${page.url()} (${reload.status()})`)
    record('rows-after-revoke', `card shows ${(await names(page)).length} row(s)`)

    // ── the revoked credential at sign-in. The authenticator still holds it.
    await context.clearCookies()
    await page.goto(`${APP}/sign-in`, { waitUntil: 'networkidle' })
    await page.getByRole('button', { name: 'Sign in with a passkey' }).click()
    await page.waitForTimeout(6000)
    const signedIn = !page.url().includes('/sign-in')
    const said = (await page.locator('p').allTextContents()).filter((t) => /passkey/i.test(t))
    // Both of S1a's sentences point at the magic link; a button that did nothing shows neither,
    // and "still on /sign-in" alone would have passed for it.
    const sentence = said.some((t) => /magic link/i.test(t))
    step('revoked-signin', !signedIn && sentence,
         `still on ${page.url()}; S1a's sentence shown=${sentence}; the page said ${JSON.stringify(said)}`)

    // ── the magic link still works — minted NOW, after the first was redeemed (docstring)
    await page.goto(await magicLink(), { waitUntil: 'networkidle' })
    const back = await page.goto(`${APP}/account`, { waitUntil: 'networkidle' })
    step('magic-link', back.status() === 200 && !page.url().includes('/sign-in'),
         `magic link landed on ${page.url()} (${back.status()})`)
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
        script = os.path.join(work, 'passkeys.js')
        open(script, 'w').write(BROWSER_JS)
        # SECRETS GO IN THE ENVIRONMENT, never in argv: argv is world-readable in `ps`.
        child = dict(os.environ, PW_DIR=pw, APP_URL=APP, AXE_PATH=axe_path() or '', **cfg)
        try:
            proc = subprocess.run(['node', script], env=child, capture_output=True, text=True, timeout=600)
        except subprocess.TimeoutExpired:
            return [{'name': 'browser', 'ok': False, 'detail': 'node did not finish inside 600s'}]
    for line in proc.stdout.splitlines():
        if line.startswith('@@RESULT@@'):
            return json.loads(line[len('@@RESULT@@'):])
    print(proc.stdout[-2000:])
    print(proc.stderr[-2000:], file=sys.stderr)
    return [{'name': 'browser', 'ok': False, 'detail': f'node exited {proc.returncode} with no result'}]


def burst(url, publishable, n=30):
    """DW-33 (1). The endpoint `startPasskeySignIn` calls, hit directly with the publishable key —
    the claim under test is GoTrue's OWN limit on `/passkeys/authentication/*`, and going through
    the server action would measure Vercel's egress IP instead of a caller's."""
    first, errors = None, 0
    for i in range(n):
        req = urllib.request.Request(
            f'{url.rstrip("/")}/auth/v1/passkeys/authentication/options',
            data=b'{}', method='POST',
            headers={'apikey': publishable, 'Content-Type': 'application/json'},
        )
        try:
            with urllib.request.urlopen(req, timeout=20) as r:
                status = r.status
        except urllib.error.HTTPError as e:
            status = e.code
        except Exception:
            errors += 1
            continue
        if status != 200 and first is None:
            first = (i + 1, status)
    return first, errors


def hex_to_rgb(hex_colour):
    h = hex_colour.lstrip('#')
    return 'rgb(' + ', '.join(str(int(h[i:i + 2], 16)) for i in (0, 2, 4)) + ')'


def tokens_rgb():
    """The four token values the `frame` step asserts, read out of the token layer as
    `getComputedStyle` will report them. Retyping a hex here is how a frame value goes stale."""
    css = open(os.path.join(HERE, '..', '..', 'apps', 'web', 'app', 'globals.css')).read()
    def token(name):
        return hex_to_rgb(re.search(rf'--color-{name}:\s*(#[0-9A-Fa-f]{{6}})', css).group(1))
    return {'paper': token('paper'), 'dangerTint': token('danger-tint'),
            'inkSoft': token('ink-soft'), 'danger': token('danger')}


def name_max():
    rule = open(os.path.join(HERE, '..', '..', 'apps', 'web', 'app', '(app)', 'app', '(authed)',
                             'account', 'passkey-name-rule.ts')).read()
    return int(re.search(r'PASSKEY_NAME_MAX = (\d+)', rule).group(1))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--check', action='store_true',
                    help='plumbing only: keys present, playwright resolvable, the admin API '
                         'answers a real create-read-delete. No browser and no UI, so it runs '
                         'before the story is deployed.')
    args = ap.parse_args()

    env = load_env()
    needed = ['SUPABASE_URL', 'SUPABASE_SECRET_KEY', 'SUPABASE_PUBLISHABLE_KEY']
    missing = [k for k in needed if not env.get(k)]
    if missing:
        print(f'  FAIL  tools/probe/.env is missing: {", ".join(missing)}')
        return 1

    admin = Admin(env['SUPABASE_URL'], env['SUPABASE_SECRET_KEY'])
    email = f'passkey-harness-{int(time.time())}@inflozo.com'
    swept = admin.sweep_stale_fixtures()
    if swept:
        print(f'  swept {swept} stale passkey-harness-* user(s) an earlier run left behind')
    before = admin.user_count()
    print(f'  users before: {before}')
    if before is None:
        print('  FAIL  the Admin-API user count could not be read, so the cleanup has no control.')
        return 1

    status, created = admin.call('POST', '/admin/users',
                                 {'email': email, 'email_confirm': True})
    if status not in (200, 201) or not created.get('id'):
        print(f'  FAIL  could not create the fixture user: HTTP {status}')
        return 1
    user_id = created['id']
    print(f'  fixture user created ({email})')

    failed = False
    try:
        if args.check:
            pw, axe = playwright_dir(), axe_path()
            print(f'  playwright: {"resolved" if pw else "NOT FOUND"}')
            print(f'  axe-core:   {"resolved" if axe else "NOT FOUND"}')
            status, read = admin.call('GET', f'/admin/users/{user_id}')
            ok = status == 200 and read.get('id') == user_id
            print(f'  {"PASS" if ok else "FAIL"}  admin round trip: create, read back ({status})')
            status, wire = admin.call('GET', f'/admin/users/{user_id}/passkeys')
            print(f'  {"PASS" if status == 200 else "FAIL"}  '
                  f'GET /admin/users/{{id}}/passkeys answers {status} (empty for a new user)')
            failed = not ok or status != 200 or not pw or not axe
        else:
            # ONE link here. The second is minted by the browser half right before it is used:
            # GoTrue keeps one such token per user, so two minted together leave the first dead.
            status, link = admin.call('POST', '/admin/generate_link',
                                      {'type': 'magiclink', 'email': email})
            if status != 200 or not link.get('hashed_token'):
                print(f'  FAIL  generate_link (the first link) answered HTTP {status}')
                return 1

            steps = run_browser({
                'SB_URL': env['SUPABASE_URL'],
                'SB_SECRET': env['SUPABASE_SECRET_KEY'],
                'FIXTURE_USER_ID': user_id,
                'FIXTURE_EMAIL': email,
                'CONFIRM_URL_1': f'{APP}/auth/confirm?token_hash={link["hashed_token"]}&type=magiclink',
                'TOKENS_RGB': json.dumps(tokens_rgb()),
                'NAME_MAX': str(name_max()),
            })
            for s in steps:
                mark = 'RECORD' if s['ok'] is None else ('PASS' if s['ok'] else 'FAIL')
                print(f'  {mark:6} {s["name"]}: {s["detail"]}')
                if s['ok'] is False:
                    failed = True

            hit, errors = burst(env['SUPABASE_URL'], env['SUPABASE_PUBLISHABLE_KEY'])
            print('  RECORD ratelimit: ' + (
                f'the first status ≠ 200 was {hit[1]} on call {hit[0]} of 30'
                if hit else 'every answered call was 200 — GoTrue did NOT rate-limit this burst')
                + (f'; {errors} call(s) raised a network error and are not statuses' if errors else ''))
    finally:
        status, _ = admin.call('DELETE', f'/admin/users/{user_id}', {})
        after = admin.user_count()
        print(f'  fixture user deleted (HTTP {status}); users after: {after}')
        if after is None:
            print('  FAIL  the Admin-API user count could not be read after cleanup — unverified.')
            failed = True
        elif after != before:
            print('  FAIL  the user count did not return to where it started — a user leaked.')
            failed = True

    print('  RESULT: ' + ('FAILED' if failed else 'all steps passed'))
    return 1 if failed else 0


if __name__ == '__main__':
    sys.exit(main())
