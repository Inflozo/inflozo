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
  rename-control THE CONTROL: 121 characters must be REFUSED by the server. A run whose control
                 passes proves nothing (standing rule 2), so this failing fails the run
  duplicate      DW-32 (4): a second `create()` on the same authenticator — does GoTrue populate
                 `excludeCredentials`, or does the card silently grow a second row?
  revoke-focus   the confirm opens with focus on Cancel (EXPERIENCE.md § Destructive confirms)
  revoke         Remove passkey; the id leaves `GET /passkeys`; the row goes; the SAME SESSION
                 still renders /account — a revoke signs nobody out
  revoked-signin the revoked credential at /sign-in: which of S1a's two sentences appears
  magic-link     the magic link still signs the user in afterwards
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
so a run that leaks a user says so. Cleanup runs even when a step fails.

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
    for line in open(os.path.join(HERE, '.env')):
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
            return e.code, (json.loads(raw) if raw else {})

    def user_count(self):
        """Every user, paged. Small by construction today; the point is before-vs-after."""
        total, page = 0, 1
        while True:
            status, body = self.call('GET', f'/admin/users?page={page}&per_page=200')
            if status != 200:
                return None
            users = body.get('users', [])
            total += len(users)
            if len(users) < 200:
                return total
            page += 1


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
const CONFIRM_2 = process.env.CONFIRM_URL_2

const steps = []
const step = (name, ok, detail) => { steps.push({ name, ok, detail }); return ok }
const record = (name, detail) => steps.push({ name, ok: null, detail })

const admin = async (path) => {
  const r = await fetch(`${SB}/auth/v1${path}`, {
    headers: { apikey: SECRET, Authorization: `Bearer ${SECRET}` },
  })
  return { status: r.status, body: await r.json().catch(() => null) }
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
    step('register', wire.status === 200 && wire.list.length === 1,
         `GET /admin/users/{id}/passkeys -> ${wire.status}, ${wire.list.length} passkey(s)`)
    record('auto-name', `born as friendly_name=${JSON.stringify(wire.list[0] && wire.list[0].friendly_name)}`)
    const id = wire.list[0] && wire.list[0].id

    // ── the frame, MEASURED. `S12 Billing.dc.html:90-91` draws a 28x28 box at radius 8 with a
    //    13px glyph, the pencil over a #F7F5F2 hover and the bin over #FDEBEC. Computed styles
    //    and not a grep of the class attribute: a class that loses to another class is still in
    //    the markup, which is how S1a's button shipped at the wrong weight (2.1's review).
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
      bin.w === 28 && bin.h === 28 && bin.radius === '8px' && bin.glyph === '13',
      `pencil ${JSON.stringify(pencil)} · bin ${JSON.stringify(bin)}`)

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

    // ── rename-control: 121 characters must be refused BY THE SERVER. `fill` sets the value
    //    directly, so `maxLength` does not truncate it and what is proved is the action's own
    //    refusal, not the field's.
    await page.locator('[aria-label^="Rename "]').first().click()
    await page.fill('#rename-passkey', 'x'.repeat(121))
    await page.getByRole('button', { name: 'Save' }).click()
    await page.waitForTimeout(2500)
    const stillOpen = await page.locator('dialog[open] #rename-passkey').count() > 0
    const refusal = await page.locator('#rename-passkey-error').textContent().catch(() => null)
    wire = await passkeys()
    step('rename-control', stillOpen && (wire.list[0] || {}).friendly_name === NEW,
         `dialog still open=${stillOpen}, said ${JSON.stringify(refusal)}, ` +
         `name on the wire unchanged=${(wire.list[0] || {}).friendly_name === NEW}`)
    await page.locator('dialog[open] [data-cancel]').click()

    // ── duplicate (DW-32 (4)): a second create() on the SAME authenticator
    await page.getByRole('button', { name: 'Add a passkey' }).click()
    await page.waitForTimeout(4000)
    const after = await passkeys()
    const caption = await page.locator('#passkeys-caption').textContent().catch(() => null)
    record('duplicate',
      after.list.length === 1
        ? `REFUSED — GoTrue populates excludeCredentials; the card said ${JSON.stringify(caption)}`
        : `NOT refused — ${after.list.length} passkeys now exist; ALREADY_HERE is dead code`)

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
    const gone = !wire.list.some((p) => p.id === id)
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
    const said = await page.locator('p').allTextContents()
    step('revoked-signin', !signedIn,
         `still on ${page.url()}; the page said ${JSON.stringify(
            said.filter((t) => /passkey/i.test(t)))}`)

    // ── the magic link still works
    await page.goto(CONFIRM_2, { waitUntil: 'networkidle' })
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


def run_browser(env_names, cfg):
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
        proc = subprocess.run(['node', script], env=child, capture_output=True, text=True, timeout=600)
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
    first = None
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
            status = 0
        if status != 200 and first is None:
            first = (i + 1, status)
    return first


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
    before = admin.user_count()
    print(f'  users before: {before}')

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
            links = []
            for _ in range(2):
                status, link = admin.call('POST', '/admin/generate_link',
                                          {'type': 'magiclink', 'email': email})
                if status != 200 or not link.get('hashed_token'):
                    print(f'  FAIL  generate_link answered HTTP {status}')
                    return 1
                links.append(f'{APP}/auth/confirm?token_hash={link["hashed_token"]}&type=magiclink')

            steps = run_browser(env, {
                'SB_URL': env['SUPABASE_URL'],
                'SB_SECRET': env['SUPABASE_SECRET_KEY'],
                'FIXTURE_USER_ID': user_id,
                'CONFIRM_URL_1': links[0],
                'CONFIRM_URL_2': links[1],
            })
            for s in steps:
                mark = 'RECORD' if s['ok'] is None else ('PASS' if s['ok'] else 'FAIL')
                print(f'  {mark:6} {s["name"]}: {s["detail"]}')
                if s['ok'] is False:
                    failed = True

            hit = burst(env['SUPABASE_URL'], env['SUPABASE_PUBLISHABLE_KEY'])
            print('  RECORD ratelimit: ' + (
                f'the first status ≠ 200 was {hit[1]} on call {hit[0]} of 30'
                if hit else 'all 30 calls answered 200 — GoTrue did NOT rate-limit this burst'))
    finally:
        status, _ = admin.call('DELETE', f'/admin/users/{user_id}', {})
        after = admin.user_count()
        leaked = before is not None and after is not None and after != before
        print(f'  fixture user deleted (HTTP {status}); users after: {after}')
        if leaked:
            print('  FAIL  the user count did not return to where it started — a user leaked.')
            failed = True

    print('  RESULT: ' + ('FAILED' if failed else 'all steps passed'))
    return 1 if failed else 0


if __name__ == '__main__':
    sys.exit(main())
