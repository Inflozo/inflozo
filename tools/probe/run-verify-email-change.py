#!/usr/bin/env python3
"""FR-A4's email change, driven through the real UI on the deployed site and read back off the wire.

    python3 tools/probe/run-verify-email-change.py --check   # plumbing only: no browser, no UI
    python3 tools/probe/run-verify-email-change.py           # the whole round trip (Deploy run)

WHY IT EXISTS. Every claim Story 2.3 rests on is a claim about GoTrue, and standing rule 1 says a
claim about an external platform is a hypothesis until executed: that a duplicate is refused with
`422 email_exists` BEFORE anything is sent; that `generate_link email_change_new` mints a token the
app's own confirm route can redeem; that redeeming it hands a session to a browser that had none;
that the 429 for a second send names a number `retryAfterFrom` can read. Each is executed here.

WHAT IT PROVES, each step PASS, FAIL or RECORD, exiting non-zero if any step fails:

  in-use-wire    THE CONTROL, and it is read off the wire rather than out of the DOM: A's own
                 access token, `PUT /user {email: B}` -> the status and code GoTrue answers, and
                 A's `email_change_sent_at` compared before and after. "Refused before any
                 verification email is sent" is FR-A4's actual sentence, and this is the only step
                 that can see it. A run where this passes for the wrong reason proves nothing, so
                 a `422` with the sent_at MOVED fails the step as loudly as a 200 would
  frame          the button's height, radius, border and hover fill read off the DEPLOYED DOM —
                 computed styles, not a grep of the class attribute, because a class that loses to
                 another class is still in the markup (2.1's review). The colours are the TOKENS,
                 read out of globals.css; the geometry is `S12 Billing.dc.html:80`'s own
  dialog-focus   the dialog opens with focus on Cancel (EXPERIENCE.md, and `kit/dialog.ts`)
  bad-email      a non-address: NOTHING leaves the browser, and the field says the sign-in sentence
  same           the account's own address, oddly cased: nothing leaves the browser either
  in-use-ui      B's address through the UI: the field's sentence, and sent_at still unmoved
  send           a fresh address: the dialog closes, the info banner names it, and the wire shows
                 `new_email` set, `email_change_sent_at` fresh and `email` STILL THE OLD ONE
  too-soon       the same again inside `smtp_max_frequency`: the Banner with GoTrue's own seconds,
                 nothing sent, sent_at unmoved, and the dialog still open
  confirm        `generate_link email_change_new`, opened in a browser context with NO COOKIES:
                 lands on /account?email=changed SIGNED IN, the green banner names the new address,
                 and the wire shows `email` = the new address with no `new_email` left
  magic-link-new a magic link for the NEW address signs in to the same account — and the user count
                 is unchanged, so it was not a fresh sign-up wearing the same address
  axe-*          axe-core at WCAG 2.1 AA over /account in three states (closed, the dialog open,
                 the pending banner showing) at 1440 AND 390

WHAT IT CANNOT PROVE: that the email arrived. DW-22 — `RESEND_API_KEY` is send-only and no key in
this repository can read Resend's log — so what is asserted is the HAND-OFF (`email_change_sent_at`
moved, or did not), and delivery is step 4 of the owner's manual test.

NO KEY IS EVER PRINTED. Keys reach the browser half through its environment, never through argv
(argv is world-readable in `ps`), and every command is recorded by the key's variable NAME.

TWO FIXTURE USERS ARE CREATED AND DELETED HERE, A and B. The Admin-API user count is read before
and after, so a run that leaks one says so — and a count that could not be read FAILS the run,
because it is the cleanup's control. Any `email-change-harness-*` user a killed earlier run left
behind is swept first, under every suffix the run can leave one under (`-a`, `-b`, `-new`).

Playwright and axe-core are resolved from the machine, and the four helpers that do it — `Admin`,
`load_env`, `playwright_dir`, `axe_path` — are IMPORTED from `run-verify-passkeys.py` rather than
copied, so a fix to either lands on both (propagate, never localise).
"""
import argparse, importlib.util, json, os, re, subprocess, sys, tempfile, time, urllib.error, urllib.request

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
playwright_dir, axe_path, hex_to_rgb = _passkeys.playwright_dir, _passkeys.axe_path, _passkeys.hex_to_rgb

FIXTURE = re.compile(r'^email-change-harness-\d+-(a|b|new)@inflozo\.com$')


def frame_tokens():
    """The three the `frame` step asserts, as `getComputedStyle` reports them. Read out of the
    token layer, never retyped — a hex written here is how a frame value goes stale."""
    css = open(os.path.join(HERE, '..', '..', 'apps', 'web', 'app', 'globals.css')).read()
    def token(name):
        return hex_to_rgb(re.search(rf'--color-{name}:\s*(#[0-9A-Fa-f]{{6}})', css).group(1))
    return {'surface': token('surface'), 'line': token('line'), 'paper': token('paper')}


def sweep(admin):
    users = admin.users() or []
    stale = [u for u in users if FIXTURE.match(u.get('email') or '')]
    for u in stale:
        admin.call('DELETE', f'/admin/users/{u["id"]}', {})
    return len(stale)


def gotrue(url, path, key, token=None, body=None, method='POST'):
    """One raw call to GoTrue with the PUBLISHABLE key — the anon surface a browser would use."""
    req = urllib.request.Request(
        f'{url.rstrip("/")}/auth/v1{path}',
        data=json.dumps(body).encode() if body is not None else None,
        method=method,
        headers={'apikey': key, 'Content-Type': 'application/json',
                 **({'Authorization': f'Bearer {token}'} if token else {})},
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
    except (urllib.error.URLError, TimeoutError, ValueError, OSError) as e:
        return 0, {'error': str(e)}


# ── The browser half. Node, because Playwright is Node; one file, so one catalogue row. The
#    admin reads live here too, so the wire can be read BETWEEN two UI steps in one session.
BROWSER_JS = r'''
const { chromium } = require(process.env.PW_DIR)

const APP = process.env.APP_URL
const SB = process.env.SB_URL.replace(/\/$/, '')
const SECRET = process.env.SB_SECRET
const USER_ID = process.env.FIXTURE_USER_ID
const EMAIL_A = process.env.FIXTURE_EMAIL_A
const EMAIL_B = process.env.FIXTURE_EMAIL_B
const EMAIL_NEW = process.env.FIXTURE_EMAIL_NEW
const CONFIRM_1 = process.env.CONFIRM_URL_1
const TOKENS = JSON.parse(process.env.TOKENS_RGB)   // { surface, line, paper } as rgb()

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

/* The pending change as SUPABASE records it — the only store there is; nothing of ours keeps one. */
const wire = async () => {
  const { status, body } = await admin(`/admin/users/${USER_ID}`)
  return { status, email: body && body.email, newEmail: (body && body.new_email) || '',
           sentAt: (body && body.email_change_sent_at) || '' }
}

/* THE TOKEN IS THE ONE IN `action_link`, AND NOT `hashed_token` — for an email change those two
   are DIFFERENT VALUES and only the first redeems. Executed against the live project 2026-09-07:
   `POST /verify {type:'email_change', token_hash: <hashed_token>}` answered `403 otp_expired` on a
   token minted seconds earlier, while the same call with the `token` out of `action_link` answered
   200 and landed the change. GoTrue mints two tokens for a change (current and new) and looks the
   hash up in `one_time_tokens` (`verify.go:658`, `FindUserByOneTimeToken` over
   EmailChangeTokenCurrent and EmailChangeTokenNew); with `mailer_secure_email_change_enabled`
   false only the NEW one is ever stored, and `hashed_token` in this response is the other one.
   The product is unaffected — the email carries `{{ .TokenHash }}`, which GoTrue renders per
   message — but a harness that used `hashed_token` would report a broken confirm route. */
const emailChangeLink = async () => {
  const { status, body } = await admin('/admin/generate_link', {
    method: 'POST',
    body: JSON.stringify({ type: 'email_change_new', email: EMAIL_A, new_email: EMAIL_NEW }),
  })
  const token = body && body.action_link && new URL(body.action_link).searchParams.get('token')
  if (status !== 200 || !token) throw new Error(`generate_link email_change_new -> HTTP ${status}`)
  return `${APP}/auth/confirm?token_hash=${token}&type=email_change`
}
const magicLink = async (address) => {
  const { status, body } = await admin('/admin/generate_link', {
    method: 'POST', body: JSON.stringify({ type: 'magiclink', email: address }),
  })
  if (status !== 200 || !body || !body.hashed_token) throw new Error(`generate_link magiclink -> HTTP ${status}`)
  return `${APP}/auth/confirm?token_hash=${body.hashed_token}&type=magiclink`
}

// axe-core at WCAG 2.1 AA, at BOTH widths — the frame collapses to one column at 390 and a
// violation that only exists there is still a violation. `evaluate` and not `addScriptTag`: the
// app serves a per-session CSP with no `unsafe-inline`, which blocks an injected <script>.
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
  }
  await page.setViewportSize({ width: 1440, height: 900 })
  step(`axe-${label}`, found.length === 0,
       found.length === 0 ? 'zero violations at WCAG 2.1 AA, 1440 and 390' : found.join(', '))
}

const openDialog = async (page) => {
  await page.getByRole('button', { name: 'Change email' }).click()
  await page.waitForSelector('dialog[open] #change-email')
}
// The field's own refusal slot (`kit/input.tsx` gives it `${id}-error`), and the Banner above it.
const fieldError = (page) => page.locator('#change-email-error').textContent().catch(() => null)
const dialogBanner = (page) =>
  page.locator('dialog[open] [role="alert"], dialog[open] [role="status"]').first()
    .textContent().catch(() => null)

;(async () => {
  const browser = await chromium.launch()
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await context.newPage()

  // Every POST the page makes. "Nothing left the browser" is the matrix's own promise for a
  // non-address and for the account's own address, and counting is the only way to see it: a
  // field sentence alone would look identical if the action had been called and had refused.
  let posts = 0
  page.on('request', (r) => { if (r.method() === 'POST') posts += 1 })
  const sent = async (fn) => { const before = posts; await fn(); return posts - before }

  try {
    // ── sign in as A with the magic link the Python half minted
    await page.goto(CONFIRM_1, { waitUntil: 'networkidle' })
    await page.goto(`${APP}/account`, { waitUntil: 'networkidle' })
    step('signed-in', await page.locator('h1', { hasText: 'Account' }).count() > 0,
         `landed on ${page.url()}`)

    // ── the frame, MEASURED off the deployed DOM. `S12 Billing.dc.html:80`: 30px tall, 0 13px,
    //    radius 10, 12px/500, a `line` border on `surface` with `paper` on hover.
    const button = page.getByRole('button', { name: 'Change email' })
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

    await axeAt(page, 'closed')

    // ── the dialog opens on Cancel
    await openDialog(page)
    const onCancel = await page.evaluate(() =>
      document.activeElement !== null && document.activeElement.hasAttribute('data-cancel'))
    step('dialog-focus', onCancel, `focus is on the Cancel button = ${onCancel}`)
    await axeAt(page, 'dialog')

    // ── a non-address: nothing leaves the browser
    const badPosts = await sent(async () => {
      await page.fill('#change-email', 'maya')
      await page.getByRole('button', { name: 'Send link' }).click()
      await page.waitForSelector('#change-email-error', { timeout: 10000 }).catch(() => null)
    })
    const badSaid = await fieldError(page)
    step('bad-email', badPosts === 0 && Boolean(badSaid) && /you@example\.com/.test(badSaid || ''),
         `${badPosts} POST(s); the field said ${JSON.stringify(badSaid)}`)

    // ── the account's own address, in another case: nothing leaves the browser either
    const before = await wire()
    const samePosts = await sent(async () => {
      await page.fill('#change-email', EMAIL_A.toUpperCase())
      await page.getByRole('button', { name: 'Send link' }).click()
      await page.waitForTimeout(1500)
    })
    const sameSaid = await fieldError(page)
    step('same', samePosts === 0 && (sameSaid || '').includes('already your address'),
         `${samePosts} POST(s) for ${EMAIL_A.toUpperCase()}; the field said ${JSON.stringify(sameSaid)}`)

    // ── B's address: this one DOES go, and GoTrue refuses it before sending anything
    const usePosts = await sent(async () => {
      await page.fill('#change-email', EMAIL_B)
      await page.getByRole('button', { name: 'Send link' }).click()
      await page.waitForFunction(
        () => { const e = document.querySelector('#change-email-error')
                return e && /already in use/.test(e.textContent || '') },
        null, { timeout: 20000 }).catch(() => null)
    })
    const useSaid = await fieldError(page)
    const afterUse = await wire()
    step('in-use-ui',
      usePosts > 0 && (useSaid || '').includes('already in use on another account') &&
      afterUse.sentAt === before.sentAt && afterUse.newEmail === before.newEmail,
      `${usePosts} POST(s); the field said ${JSON.stringify(useSaid)}; ` +
      `email_change_sent_at unmoved=${afterUse.sentAt === before.sentAt} ` +
      `(${JSON.stringify(before.sentAt)} -> ${JSON.stringify(afterUse.sentAt)})`)

    // ── a fresh address: the one real send of the run
    await page.fill('#change-email', EMAIL_NEW)
    await page.getByRole('button', { name: 'Send link' }).click()
    await page.waitForFunction(() => !document.querySelector('dialog[open] #change-email'),
                               null, { timeout: 30000 }).catch(() => null)
    const banner = await page.locator('[role="status"]', { hasText: 'We sent a link to' })
      .first().textContent({ timeout: 20000 }).catch(() => null)
    const afterSend = await wire()
    step('send',
      afterSend.newEmail === EMAIL_NEW && afterSend.sentAt !== before.sentAt &&
      afterSend.email === EMAIL_A && Boolean(banner) && (banner || '').includes(EMAIL_NEW),
      `new_email=${JSON.stringify(afterSend.newEmail)}, sent_at moved=${afterSend.sentAt !== before.sentAt}, ` +
      `email still ${JSON.stringify(afterSend.email)}; the card said ${JSON.stringify(banner)}`)

    await axeAt(page, 'pending')

    // ── the same again, inside smtp_max_frequency: GoTrue's 429, and its own number
    await openDialog(page)
    await page.fill('#change-email', EMAIL_NEW)
    await page.getByRole('button', { name: 'Send link' }).click()
    await page.waitForFunction(
      () => { const d = document.querySelector('dialog[open]')
              return d && /a moment ago/.test(d.textContent || '') },
      null, { timeout: 20000 }).catch(() => null)
    const soon = await dialogBanner(page)
    const stillOpen = await page.locator('dialog[open] #change-email').count() > 0
    const afterSoon = await wire()
    const seconds = /in (\d+) seconds/.exec(soon || '')
    step('too-soon',
      stillOpen && Boolean(seconds) && afterSoon.sentAt === afterSend.sentAt,
      `dialog still open=${stillOpen}; the Banner said ${JSON.stringify(soon)}; ` +
      `seconds named=${seconds && seconds[1]}; sent_at unmoved=${afterSoon.sentAt === afterSend.sentAt}`)
    await page.locator('dialog[open] [data-cancel]').click()

    // ── the link's other end, in a browser that has never had a cookie
    const fresh = await browser.newContext({ viewport: { width: 1440, height: 900 } })
    const other = await fresh.newPage()
    // Every URL the redirect chain lands on: the client strips `?email=changed` off the address
    // bar once it has said the sentence, so reading page.url() afterwards would miss it.
    const seen = []
    other.on('framenavigated', (f) => { if (f === other.mainFrame()) seen.push(f.url()) })
    await other.goto(await emailChangeLink(), { waitUntil: 'networkidle' })
    const landed = seen.some((u) => u.includes('/account?email=changed'))
    const green = await other.locator('[role="status"]', { hasText: 'Your email is now' })
      .first().textContent({ timeout: 20000 }).catch(() => null)
    const afterConfirm = await wire()
    step('confirm',
      landed && !other.url().includes('/sign-in') && Boolean(green) && (green || '').includes(EMAIL_NEW) &&
      afterConfirm.email === EMAIL_NEW && !afterConfirm.newEmail,
      `chain ${JSON.stringify(seen)}; the card said ${JSON.stringify(green)}; ` +
      `email on the wire=${JSON.stringify(afterConfirm.email)}, new_email left=${JSON.stringify(afterConfirm.newEmail)}`)

    // ── a magic link for the NEW address signs in to the SAME account
    await fresh.clearCookies()
    await other.goto(await magicLink(EMAIL_NEW), { waitUntil: 'networkidle' })
    const back = await other.goto(`${APP}/account`, { waitUntil: 'networkidle' })
    const shown = await other.locator('section', { hasText: 'Email' }).first().textContent().catch(() => null)
    step('magic-link-new',
      back.status() === 200 && !other.url().includes('/sign-in') && (shown || '').includes(EMAIL_NEW),
      `landed on ${other.url()} (${back.status()}); the Email card reads ${JSON.stringify((shown || '').slice(0, 120))}`)
    await fresh.close()
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
        script = os.path.join(work, 'email-change.js')
        open(script, 'w').write(BROWSER_JS)
        # SECRETS GO IN THE ENVIRONMENT, never in argv: argv is world-readable in `ps`.
        child = dict(os.environ, PW_DIR=pw, APP_URL=APP, AXE_PATH=axe_path() or '', **cfg)
        try:
            proc = subprocess.run(['node', script], env=child, capture_output=True, text=True, timeout=900)
        except subprocess.TimeoutExpired:
            return [{'name': 'browser', 'ok': False, 'detail': 'node did not finish inside 900s'}]
    for line in proc.stdout.splitlines():
        if line.startswith('@@RESULT@@'):
            return json.loads(line[len('@@RESULT@@'):])
    print(proc.stdout[-2000:])
    print(proc.stderr[-2000:], file=sys.stderr)
    return [{'name': 'browser', 'ok': False, 'detail': f'node exited {proc.returncode} with no result'}]


def in_use_wire(env, admin, user_id, email_a, email_b):
    """THE CONTROL, read off the wire. A's own access token, `PUT /user {email: B}`, and A's
    `email_change_sent_at` either side of it — FR-A4's "before any verification email is sent" is
    a claim only this can see. The session is minted the way the app's own confirm route does it:
    a magic link redeemed through `POST /verify` with `token_hash`."""
    url, publishable = env['SUPABASE_URL'], env['SUPABASE_PUBLISHABLE_KEY']
    status, link = admin.call('POST', '/admin/generate_link', {'type': 'magiclink', 'email': email_a})
    if status != 200 or not link.get('hashed_token'):
        return False, f'generate_link for the wire control answered HTTP {status}'

    status, session = gotrue(url, '/verify', publishable,
                             body={'type': 'magiclink', 'token_hash': link['hashed_token']})
    token = session.get('access_token')
    if status != 200 or not token:
        return False, f'POST /verify answered HTTP {status} with no access_token'

    _, before = admin.call('GET', f'/admin/users/{user_id}')
    status, body = gotrue(url, '/user', publishable, token=token, body={'email': email_b}, method='PUT')
    _, after = admin.call('GET', f'/admin/users/{user_id}')

    code = body.get('error_code') or body.get('code')
    moved = (before.get('email_change_sent_at') or '') != (after.get('email_change_sent_at') or '')
    ok = status == 422 and code == 'email_exists' and not moved
    return ok, (f'PUT /user {{email: B}} -> HTTP {status}, code={code!r}; '
                f'email_change_sent_at moved={moved}; new_email now '
                f'{(after.get("new_email") or "")!r}')


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--check', action='store_true',
                    help='plumbing only: keys present, playwright and axe resolvable, and one real '
                         'admin create-read-delete. No browser and no UI, so it runs before the '
                         'story is deployed.')
    ap.add_argument('--to', metavar='ADDRESS',
                    help='send the run\'s ONE real email here instead of the fixture address, so '
                         'a human can read what GoTrue actually sent (DW-22: no key here can). The '
                         'address must not already have an account, or the run proves the refusal '
                         'instead of the send.')
    args = ap.parse_args()

    env = load_env()
    needed = ['SUPABASE_URL', 'SUPABASE_SECRET_KEY', 'SUPABASE_PUBLISHABLE_KEY']
    missing = [k for k in needed if not env.get(k)]
    if missing:
        print(f'  FAIL  tools/probe/.env is missing: {", ".join(missing)}')
        return 1

    admin = Admin(env['SUPABASE_URL'], env['SUPABASE_SECRET_KEY'])
    stamp = int(time.time())
    email_a = f'email-change-harness-{stamp}-a@inflozo.com'
    email_b = f'email-change-harness-{stamp}-b@inflozo.com'
    # The one real send of the run goes to an @inflozo.com address the owner's domain receives;
    # `--to` points it at an inbox a human can open, which is the only way to see the email itself.
    email_new = args.to or f'email-change-harness-{stamp}-new@inflozo.com'

    swept = sweep(admin)
    if swept:
        print(f'  swept {swept} stale email-change-harness-* user(s) an earlier run left behind')
    before = admin.user_count()
    print(f'  users before: {before}')
    if before is None:
        print('  FAIL  the Admin-API user count could not be read, so the cleanup has no control.')
        return 1

    created = []
    for address in (email_a, email_b):
        status, user = admin.call('POST', '/admin/users', {'email': address, 'email_confirm': True})
        if status not in (200, 201) or not user.get('id'):
            for leftover in created:
                admin.call('DELETE', f'/admin/users/{leftover}', {})
            print(f'  FAIL  could not create a fixture user: HTTP {status}')
            return 1
        created.append(user['id'])
    user_id = created[0]
    print('  fixture users A and B created')

    failed = False
    try:
        if args.check:
            pw, axe = playwright_dir(), axe_path()
            print(f'  playwright: {"resolved" if pw else "NOT FOUND"}')
            print(f'  axe-core:   {"resolved" if axe else "NOT FOUND"}')
            status, read = admin.call('GET', f'/admin/users/{user_id}')
            ok = status == 200 and read.get('id') == user_id
            print(f'  {"PASS" if ok else "FAIL"}  admin round trip: create, read back ({status})')
            failed = not ok or not pw or not axe
        else:
            # THE CONTROL FIRST, and off the wire — see `in_use_wire`. It runs before the browser
            # so a UI that never opens still reports FR-A4's own sentence.
            ok, detail = in_use_wire(env, admin, user_id, email_a, email_b)
            print(f'  {"PASS" if ok else "FAIL"}  in-use-wire: {detail}')
            failed = failed or not ok

            status, link = admin.call('POST', '/admin/generate_link',
                                      {'type': 'magiclink', 'email': email_a})
            if status != 200 or not link.get('hashed_token'):
                print(f'  FAIL  generate_link (the browser\'s sign-in link) answered HTTP {status}')
                return 1

            steps = run_browser({
                'SB_URL': env['SUPABASE_URL'],
                'SB_SECRET': env['SUPABASE_SECRET_KEY'],
                'FIXTURE_USER_ID': user_id,
                'FIXTURE_EMAIL_A': email_a,
                'FIXTURE_EMAIL_B': email_b,
                'FIXTURE_EMAIL_NEW': email_new,
                'CONFIRM_URL_1': f'{APP}/auth/confirm?token_hash={link["hashed_token"]}&type=magiclink',
                'TOKENS_RGB': json.dumps(frame_tokens()),
            })
            for s in steps:
                mark = 'RECORD' if s['ok'] is None else ('PASS' if s['ok'] else 'FAIL')
                print(f'  {mark:6} {s["name"]}: {s["detail"]}')
                if s['ok'] is False:
                    failed = True
    finally:
        for leftover in created:
            admin.call('DELETE', f'/admin/users/{leftover}', {})
        # A run that got as far as `confirm` left A wearing the `-new` address; the sweep's regex
        # covers every suffix, so this is belt and braces rather than a second rule.
        sweep(admin)
        after = admin.user_count()
        print(f'  fixture users deleted; users after: {after}')
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
