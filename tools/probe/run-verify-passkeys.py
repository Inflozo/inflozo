#!/usr/bin/env python3
"""The passkey ceremony's repeatable control — register, name, rename, revoke, and what a
revoked credential does at sign-in — driven through the real UI on the deployed site.

    python3 tools/probe/run-verify-passkeys.py --check   # plumbing only: no browser, no UI
    python3 tools/probe/run-verify-passkeys.py           # the whole round trip (Deploy run) — it
                                                         # turns production's passkeys OFF for seconds

WHY IT EXISTS. DW-32 (3) and (4): the round trip and the duplicate refusal were proved by an
improvised harness that lives in no file, so Story 2.2 — which edits the two files carrying the
ceremony — could break either with every check green. DW-33 (1): whether GoTrue rate-limits its
own `/passkeys/authentication/*` is a claim about an external platform, and standing rule 1 says
a claim is a hypothesis until executed. DW-32 (1) and (2), added by Story 5.24b: the kill switch
stopping a sign-in already half-way through, and the AAGUID's name reaching the row, were each
proved once by hand; and DW-91's half, the sign-in card refusing the keyboard while it waits.

WHAT IT PROVES, each step PASS or FAIL, and it exits non-zero if any step fails:

  register       Add a passkey through the UI; the admin API lists exactly one for the user
  auto-name      the row is BORN `Passkey`: Chromium's virtual authenticator sends the AAGUID
                 01020304-0506-0708-0102-030405060708 — NOT the all-zero one this file and the
                 list's header once said; read off its buffer on a local page at 5.24b's Dev, and
                 `named-aaguid` prints it from production — and the list does not carry it, so the
                 fallback is the one right answer. An ASSERTION since Story 5.24b, and
                 `named-aaguid`'s control — a naming path that took the name from anywhere but the
                 AAGUID would fail here and pass there
  rename         the pencil, a new name, ENTER in the field; the new name read back OFF THE WIRE.
                 The keyboard on purpose: an implicit submission is a click at (0,0) on Save, which
                 the backdrop handler once read as outside the sheet and closed the dialog on
                 (second review, 2026-09-07). The control below keeps the mouse, so both roads run
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
                 sentences (both name the magic link) IN THE CARD'S RED ERROR BANNER — a
                 `role="alert"` with an icon and the `danger-tint` background. The owner's finding
                 1 of 2.2 moved it there out of the grey caption under the button, so reading any
                 <p> would now pass for the very thing he asked to be changed
  magic-link     a magic link minted AFTER the first was redeemed still signs the user in. Minted
                 then, not up front: GoTrue keeps ONE such token per user, so minting two at the
                 start invalidated the first (executed 2026-09-07 — the deployed confirm route
                 answered `/sign-in?error=link` for it)
  named-aaguid   DW-32 (2): Add a passkey with the page's `getAuthenticatorData()` wrapped, so the
                 REAL buffer comes back — as a copy — with bytes 37-52 set to an AAGUID READ out of
                 `lib/passkey-aaguids.ts` (its first entry, never retyped); the row off the wire
                 carries that entry's name. What GoTrue receives is untouched: written in place,
                 the bytes reached `toJSON()`'s `authenticatorData` too (executed at 5.24b's Dev),
                 so the wrapper writes a copy. The revoked credential is cleared from the
                 authenticator first, so the sign-in below can only present this one
  kill-mid-ceremony  DW-32 (1): that passkey signs in with ONLY the finish POST held in the browser
                 (its body carries the credential; the challenge before it goes through), the
                 `passkeys` row is switched off over the pooler, and the POST is let go: S1's
                 switched-off sentence (read out of `sign-in/actions.ts`) in the red banner, still
                 on /sign-in, and no `sb-*-auth-token` cookie. The switch goes back at once
  switch-on      its control: the same press, with the switch back on, signs in
  inert-held     DW-91: inside that hold the card is `inert` and `aria-hidden`, no control in it
                 takes focus, and Tab — pressed once more than the page has stops — never lands in it
  inert-released its control: after the release the same probe finds the controls reachable again.
                 The pair is the whole proof, because this harness runs against production only
  axe-*          axe-core 4.12.1 at WCAG 2.1 AA over /account in three states — the card closed,
                 the rename dialog open, the revoke confirm open. THEY LIVE HERE and not in a
                 scratch script because the two dialog states need a passkey row, a row needs a
                 real WebAuthn registration, and GoTrue's rp.id is `inflozo.com` — so no
                 localhost origin can ever produce one (executed 2026-09-07: Chrome refuses with
                 "The relying party ID is not a registrable domain suffix of ... the current
                 domain"). The deployed site is the only place these three can run
  ratelimit      DW-33 (1): a burst of posts to `/passkeys/authentication/options` WIDER than
                 GoTrue's window, the first status ≠ 200. 30 sat on the window's edge: one run
                 saw 429 on call 12, the next saw thirty 200s and a 60-call burst straight after
                 saw 429 on call 4 (second review, 2026-09-07). Recorded, never asserted

PASSKEYS ARE OFF ON PRODUCTION FOR A FEW SECONDS, from the flip to the restore inside
`kill-mid-ceremony` — the same few seconds Story 2.1's Deploy spent. The row is written over the
pooler (`SUPABASE_DB_POOLER_URL`, the app's own `postgres` driver), because `service_role` may only
SELECT it. The value is READ before anything is created, and that found value is what goes back:
at once inside the step, again in the browser half's `finally`, and again in this file's
`finally`, which reads it back and FAILS the run, printing the one line that fixes it, if it is not
as found. A run that cannot read the row stops before it creates a user.

NO KEY IS EVER PRINTED. Keys reach the browser half through its environment, never through argv
(argv is visible in `ps`), and every command is recorded by the key's variable NAME.

THE FIXTURE USER IS CREATED AND DELETED HERE. The Admin-API user count is read before and after,
so a run that leaks a user says so — and a count that could not be read FAILS the run, because it
is the cleanup's control. Any `passkey-harness-*` user a killed earlier run left behind is deleted
first. Cleanup runs even when a step fails.

THE FRAME'S VALUES ARE DERIVED, NOT RETYPED: the hover fills and glyph colours the `frame` step
asserts are read out of `apps/web/app/globals.css` (the token layer, Story 1.3; `DESIGN.md:51`
records `danger-tint` as #FDECEC where S12 draws #FDEBEC — both export values, the token rules),
the name ceiling out of `account/passkey-name-rule.ts`, the AAGUID and its name out of
`lib/passkey-aaguids.ts`, and the switched-off sentence out of `sign-in/actions.ts`.

Playwright is not a dependency of this repository — it is resolved from the machine (see
PLAYWRIGHT_DIR below), because this is a Deploy-run tool and not a CI gate.
"""
import argparse, glob, json, os, re, subprocess, sys, tempfile, time, urllib.error, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
APP = 'https://app.inflozo.com'
WEB = os.path.join(HERE, '..', '..', 'apps', 'web')
PG_DIR = os.path.abspath(os.path.join(WEB, 'node_modules', 'postgres'))

# Where Playwright lives. Overridable. THE REPOSITORY'S OWN COPY FIRST (Story 5.24d — the grep that ended DW-216, where the
# controls walk reached into another checkout): Playwright and axe have been root devDependencies since Story 4.11, and
# another checkout's copy moves when that checkout does. The old locations stay as fallbacks.
# pnpm hoists nothing, so the real package sits under `.pnpm/<name>@<version>/node_modules/`.
# The glob is deliberate: pinning a version here is the hardcoded-count mistake in another hat.
REPO_MODULES = os.path.abspath(os.path.join(HERE, '..', '..', 'node_modules'))
PLAYWRIGHT_CANDIDATES = [
    os.environ.get('PLAYWRIGHT_DIR', ''),
    os.path.join(REPO_MODULES, '.pnpm', 'playwright@*', 'node_modules', 'playwright'),
    '/home/ghost/Dev/BMAD/inflozo/node_modules/playwright',
    '/home/ghost/Dev/BMAD/inflozo/node_modules/.pnpm/playwright@*/node_modules/playwright',
]
AXE_CANDIDATES = [
    os.environ.get('AXE_PATH', ''),
    os.path.join(REPO_MODULES, 'axe-core', 'axe.min.js'),
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

    def sweep_stale_fixtures(self, pattern=r'^passkey-harness-\d+@inflozo\.com$'):
        """A run killed mid-browser leaves a confirmed `passkey-harness-*` user behind, and the
        next run's before/after count would still balance. Delete them first, and say so.
        `pattern` is the sibling harness's way in (`run-verify-email-change.py`), one sweep for
        both rather than two regexes that drift apart."""
        users = self.users() or []
        stale = [u for u in users if re.match(pattern, u.get('email') or '')]
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
// Story 5.24b's steps, each value read by the Python half out of the app's own files (the docstring)
const AAGUID = process.env.AAGUID
const AAGUID_NAME = process.env.AAGUID_NAME
const OFF_SENTENCE = process.env.OFF_SENTENCE
const FOUND = process.env.PASSKEYS_FOUND === 'true'   // the switch as the parent found it, and what goes back
// The session cookie, whole or in @supabase/ssr's chunks (`.0`, `.1`) — and nothing longer, such as a PKCE
// `-code-verifier`, which is not a session
const SESSION_COOKIE = /^sb-.+-auth-token(\.\d+)?$/

/* THE SWITCH, over the pooler: `service_role` may only SELECT `feature_flags`, so PostgREST cannot flip it. The same
   connection shape the sibling harnesses open (`run-verify-dashboard.py`) — transaction pooler, one connection, no
   prepared statements — through the app's own installed `postgres`. */
const sql = require(process.env.PG_DIR)(process.env.PG_URL, {
  // The CA the app pins (DW-50): a harness that WRITES a production flag verifies who it is talking to (review, 2026-09-29).
  max: 1, prepare: false, ssl: { ca: process.env.DB_CA, rejectUnauthorized: true }, connect_timeout: 10, idle_timeout: 20,
})
const setPasskeys = async (on) =>
  ((await sql`update public.feature_flags set enabled = ${on} where key = 'passkeys' returning enabled`)[0] || {}).enabled

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

/* THE ROW'S NAME, OUT OF ITS BUTTON'S ACCESSIBLE NAME — and since Story 3.9 that name carries the
   DATE as well (DW-36): two passkeys born with the same fallback name gave a screen-reader user
   four buttons reading "Rename Passkey" / "Remove Passkey" twice over, with nothing saying which.
   The label is now `Rename <name>, added <date>`, so every locator here matches the PREFIX and
   every read strips the suffix. This file and `passkeys-card.tsx` change together or this harness
   stops finding rows — which is exactly what DW-36's entry said the one risk was.
   The regex is written out at each site rather than hoisted: three of the four run INSIDE the page
   through `$$eval`/`waitForFunction`, where a module-scope const is not in scope. */
const names = (page) =>
  page.$$eval('[aria-label^="Rename "]', (els) =>
    els.map((e) => e.getAttribute('aria-label').replace(/^Rename /, '').replace(/, added .*$/, '')),
  )

/* DW-91: CAN THE KEYBOARD REACH THE SIGN-IN CARD. The dashboard harness's focus probe (`overlayState`), asked of S1a's
   <form>: whether focus is inside it at all, then each control in it focused in turn — from a blurred start, so a
   control that merely still HOLDS focus is not counted as taking it — and counted when it takes the focus; then Tab
   is pressed once more than the page has stops, and every landing inside the form is counted. `inert` and
   `aria-hidden` are read off the form itself. It reads after two frames: Chromium moves focus off an element made
   inert at its next rendering, not in the task that made it so — probed in that same task, the pressed button still
   held focus, and counted as taking it (executed at 5.24b's Dev on a local page; hence the blur before each try). */
const cardReach = async (page) => {
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))))
  const state = await page.evaluate(() => {
    const form = document.getElementById('email') && document.getElementById('email').form
    if (!form) return null
    const all = 'a[href],button,input,select,textarea,[tabindex]'
    const focusedInside = form.contains(document.activeElement)
    let reachable = 0
    for (const c of form.querySelectorAll(all)) {
      if (document.activeElement) document.activeElement.blur()
      c.focus()
      if (document.activeElement === c) reachable += 1
    }
    if (document.activeElement) document.activeElement.blur()
    return { inert: form.inert, hidden: form.getAttribute('aria-hidden'), focusedInside, reachable,
             stops: document.querySelectorAll(all).length }
  })
  if (!state) return { missing: true }
  let landed = 0
  for (let i = 0; i < state.stops + 2; i++) {
    await page.keyboard.press('Tab')
    landed += await page.evaluate(() => (document.getElementById('email').form.contains(document.activeElement) ? 1 : 0))
  }
  return { ...state, landed }
}

;(async () => {
  const browser = await chromium.launch()
  const context = await browser.newContext()
  const page = await context.newPage()
  // DW-287 (Story 5.24d): every load waits for `load` and then for its own landmark — never `networkidle`, which a live
  // page does not promise (the controls walk died on one with nothing wrong). The landmark is the App Router having
  // HYDRATED: Next appends its route announcer from an effect, so it exists only once the page's handlers do — what the
  // presses that follow need, and what `networkidle` had been standing in for.
  const land = async (p, url) => {
    const r = await p.goto(url, { waitUntil: 'load' })
    await p.waitForFunction(() => !!document.querySelector('next-route-announcer'), null, { timeout: 30000 })
    return r
  }

  // The virtual authenticator lives on the browser target, so it survives the sign-out below —
  // which is the whole point of the `revoked-signin` step: the AUTHENTICATOR still holds the
  // credential the server no longer knows.
  const cdp = await context.newCDPSession(page)
  await cdp.send('WebAuthn.enable')
  const { authenticatorId } = await cdp.send('WebAuthn.addVirtualAuthenticator', {
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
    await land(page, CONFIRM_1)
    await land(page, `${APP}/account`)
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
    // An assertion since Story 5.24b, and `named-aaguid`'s control (the docstring)
    const born = wire.list[0] && wire.list[0].friendly_name
    step('auto-name', born === 'Passkey',
         `born as friendly_name=${JSON.stringify(born)} — the fallback for an AAGUID the list does not carry`)

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
      // globals.css's --duration-fast (160ms) animates the hover fill in; reading the computed
      // style right after hover() catches the transition at ~0 and sees transparent, not the
      // fill it is animating toward — waiting past the duration reads the settled value instead.
      await page.waitForTimeout(220)
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
    // ENTER, not Save: the implicit submission's click lands at (0,0) (docstring). Recorded so a
    // dialog that closes on the keystroke before the action answers is loud, not silent.
    await page.keyboard.press('Enter')
    const openAfterEnter = await page.locator('dialog[open] #rename-passkey').count() > 0
    record('rename-keyboard', `the rename dialog is still open right after Enter = ${openAfterEnter}`)
    await page.waitForFunction(
      (n) => [...document.querySelectorAll('[aria-label^="Rename "]')]
        .some((e) => e.getAttribute('aria-label').replace(/^Rename /, '').replace(/, added .*$/, '') === n),
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
      await page.locator(`[aria-label^="Remove ${extra},"]`).first().click()
      await page.waitForSelector('dialog[open]')
      await page.getByRole('button', { name: 'Remove passkey' }).click()
      await page.waitForFunction((n) => document.querySelectorAll('[aria-label^="Rename "]').length === n,
                                 rows - 1, { timeout: 20000 })
    }

    // ── revoke: focus first, then the act
    await page.locator(`[aria-label^="Remove ${NEW},"]`).click()
    await page.waitForSelector('dialog[open]')
    const onCancel = await page.evaluate(() =>
      document.activeElement !== null && document.activeElement.hasAttribute('data-cancel'))
    step('revoke-focus', onCancel, `focus is on the Cancel button = ${onCancel}`)
    await axe(page, 'confirm-open')

    await page.getByRole('button', { name: 'Remove passkey' }).click()
    await page.waitForFunction(
      (n) => ![...document.querySelectorAll('[aria-label^="Rename "]')]
        .some((e) => e.getAttribute('aria-label').replace(/^Rename /, '').replace(/, added .*$/, '') === n),
      NEW, { timeout: 20000 },
    )
    wire = await passkeys()
    const gone = Boolean(id) && !wire.list.some((p) => p.id === id)
    // The same session must still render /account: a revoke is not a sign-out.
    const reload = await land(page, `${APP}/account`)
    const sessionHeld = reload.status() === 200 && !page.url().includes('/sign-in')
    step('revoke', gone && sessionHeld,
         `id off the wire=${gone}, list now ${wire.list.length}, ` +
         `same session still on ${page.url()} (${reload.status()})`)
    record('rows-after-revoke', `card shows ${(await names(page)).length} row(s)`)

    // ── the revoked credential at sign-in. The authenticator still holds it.
    await context.clearCookies()
    await land(page, `${APP}/sign-in`)
    await page.getByRole('button', { name: 'Sign in with a passkey' }).click()
    // Wait FOR the banner, not for a clock: a slow ceremony failed the step for timing (second
    // review, 2026-09-07). The 15s is the ceiling, not the wait.
    await page.locator('[role="alert"]', { hasText: /magic link/i }).first()
      .waitFor({ timeout: 15000 }).catch(() => null)
    const signedIn = !page.url().includes('/sign-in')
    // Both of S1a's sentences point at the magic link; a button that did nothing shows neither,
    // and "still on /sign-in" alone would have passed for it.
    //
    // WHERE it is said is now part of the assertion (the owner's finding 1 of 2.2): the card's
    // own error banner at the top, not the 11px grey caption under the button. So the alert is
    // located, and its background is compared to the `danger-tint` TOKEN and its icon looked for
    // — a step that read any <p> would pass for exactly the caption the finding asked to be
    // replaced, which is a control that does not control (standing rule 2).
    const alerts = page.locator('[role="alert"]')
    const said = await alerts.allTextContents()
    const sentence = said.some((t) => /magic link/i.test(t))
    const look = sentence
      ? await alerts.filter({ hasText: /magic link/i }).first().evaluate((el) => ({
          bg: getComputedStyle(el).backgroundColor,
          icon: !!el.querySelector('svg'),
        }))
      : { bg: null, icon: false }
    const red = look.bg === TOKENS.dangerTint && look.icon
    // And NOTHING left in the caption slot under the button: the finding asked for the sentence to
    // move, and a regression that says it in both places would otherwise pass.
    const captionLeft = await page.locator('form p.text-helper-caption', { hasText: /passkey|magic link/i }).count()
    step('revoked-signin', !signedIn && sentence && red && captionLeft === 0,
         `still on ${page.url()}; S1a's sentence in the red banner=${sentence && red}; ` +
         `captions under the button still saying it=${captionLeft}; ` +
         `banner ${JSON.stringify(look)} vs danger-tint ${TOKENS.dangerTint}; ` +
         `the alerts said ${JSON.stringify(said)}`)

    // ── the magic link still works — minted NOW, after the first was redeemed (docstring)
    await land(page, await magicLink())
    const back = await land(page, `${APP}/account`)
    step('magic-link', back.status() === 200 && !page.url().includes('/sign-in'),
         `magic link landed on ${page.url()} (${back.status()})`)

    // ── named-aaguid (DW-32 (2)): the naming path on the authenticator's REAL buffer with only its AAGUID changed —
    //    what a virtual authenticator cannot show, because the AAGUID it sends is one the list does not carry. The
    //    wrapper keeps what it replaced, so the step also says what the authenticator itself sent. It returns a COPY:
    //    `getAuthenticatorData()` hands back the response's own buffer, and bytes written into it in place reach
    //    `toJSON()`'s `authenticatorData` too (executed at 5.24b's Dev on this Chromium), which GoTrue would then
    //    receive beside an attestation that disagrees with it. The revoked credential is cleared first, so the sign-in
    //    below can only present this one.
    await cdp.send('WebAuthn.clearCredentials', { authenticatorId })
    await page.evaluate((hex) => {
      const real = AuthenticatorAttestationResponse.prototype.getAuthenticatorData
      AuthenticatorAttestationResponse.prototype.getAuthenticatorData = function () {
        const bytes = new Uint8Array(real.call(this).slice(0))
        window.__sent = { at: (bytes[32] & 0x40) !== 0,
                          aaguid: [...bytes.slice(37, 53)].map((b) => b.toString(16).padStart(2, '0')).join('') }
        for (let i = 0; i < 16; i++) bytes[37 + i] = parseInt(hex.slice(2 * i, 2 * i + 2), 16)
        return bytes.buffer
      }
    }, AAGUID.replace(/-/g, ''))
    await page.getByRole('button', { name: 'Add a passkey' }).click()
    await page.waitForSelector('[aria-label^="Rename "]', { timeout: 20000 })
    wire = await passkeys()
    const named = wire.list[0] && wire.list[0].friendly_name
    step('named-aaguid', wire.status === 200 && wire.list.length === 1 && named === AAGUID_NAME,
         `the authenticator sent ${JSON.stringify(await page.evaluate(() => window.__sent || null))}; with ${AAGUID} ` +
         `at offset 37 the row off the wire is ${JSON.stringify(named)}, the list's name ${JSON.stringify(AAGUID_NAME)}; ` +
         `${wire.list.length} passkey(s)`)

    // ── kill-mid-ceremony (DW-32 (1)) and the card's `inert` (DW-91). A stale sign-in tab can reach the finish
    //    action after the row is switched off, and the action must refuse it — so THAT passkey signs in with the
    //    finish POST held in the browser, the row goes off, and the POST is let go. Only the finish is held: its body
    //    carries the credential, and the challenge before it goes through. The matcher and the handler are kept,
    //    because `page.unroute` matches them BY REFERENCE (`run-verify-ghost-admin.py`'s `holding`).
    await context.clearCookies()
    await land(page, `${APP}/sign-in`)
    let heard, letGo
    const held = new Promise((r) => { heard = r })
    const released = new Promise((r) => { letGo = r })
    const anyApp = (u) => u.href.startsWith(APP)
    const holdFinish = async (route) => {
      const r = route.request()
      if (r.method() !== 'POST' || !r.headers()['next-action'] || !(r.postData() || '').includes('"credential"')) {
        return route.continue()
      }
      heard()
      await released
      // `.catch`: a request aborted during the hold makes `continue()` throw outside any step (the same reference)
      return route.continue().catch(() => {})
    }
    await page.route(anyApp, holdFinish)
    await page.getByRole('button', { name: 'Sign in with a passkey' }).click()
    const holding = await Promise.race([held.then(() => true), new Promise((r) => setTimeout(() => r(false), 20000))])

    // DW-91, inside the hold: nothing in the card can be reached, by focus or by Tab
    const inside = holding ? await cardReach(page) : { held: false }
    step('inert-held',
         inside.inert === true && inside.hidden === 'true' && inside.focusedInside === false && inside.reachable === 0 &&
         inside.landed === 0,
         `the finish POST held=${holding}; the card ${JSON.stringify(inside)}`)

    // PASSKEYS ARE OFF ON PRODUCTION from here to the restore a few lines down (the docstring)
    // Names in this stretch carry their own prefixes: the one `try` above already declares `said`, `look`,
    // `back` and `after`, and a redeclaration is a SyntaxError that stops the run before its first step.
    const offAt = Date.now()
    const off = holding ? await setPasskeys(false) : null
    letGo()
    const offBanner = page.locator('[role="alert"]', { hasText: OFF_SENTENCE }).first()
    await offBanner.waitFor({ timeout: 15000 }).catch(() => null)
    const offLook = await offBanner.count() > 0
      ? await offBanner.evaluate((el) => ({ bg: getComputedStyle(el).backgroundColor, icon: !!el.querySelector('svg') }))
      : { bg: null, icon: false }
    const offRed = offLook.bg === TOKENS.dangerTint && offLook.icon
    const offUrl = page.url()
    const offTokens = (await context.cookies()).map((c) => c.name).filter((n) => SESSION_COOKIE.test(n))
    const putBack = await setPasskeys(FOUND)
    step('kill-mid-ceremony',
         off === false && offRed && offUrl.includes('/sign-in') && offTokens.length === 0 && putBack === FOUND,
         `switched off=${off === false}; S1's switched-off sentence in the red banner=${offRed} ` +
         `${JSON.stringify(offLook)}; still on ${offUrl}; sb-*-auth-token cookies=${JSON.stringify(offTokens)}; ` +
         `put back to ${putBack} after ${Date.now() - offAt} ms`)

    // DW-91's control: after the release the same probe reaches the card again
    await page.waitForFunction(() => !document.getElementById('email').form.inert, null, { timeout: 5000 }).catch(() => null)
    const releasedCard = await cardReach(page)
    step('inert-released',
         releasedCard.inert === false && releasedCard.hidden === null && releasedCard.reachable > 0 &&
         releasedCard.landed > 0,
         `after the release, the card ${JSON.stringify(releasedCard)}`)

    // DW-32 (1)'s control: the same press, with the switch back on, signs in
    await page.unroute(anyApp, holdFinish)
    await page.getByRole('button', { name: 'Sign in with a passkey' }).click()
    await page.waitForURL((u) => !u.pathname.startsWith('/sign-in'), { timeout: 20000 }).catch(() => null)
    const signedInAgain = (await context.cookies()).some((c) => SESSION_COOKIE.test(c.name))
    step('switch-on', !page.url().includes('/sign-in') && signedInAgain,
         `the same press with the switch back on landed on ${page.url()}; an sb-*-auth-token cookie=${signedInAgain}`)
  } catch (error) {
    step('threw', false, String((error && error.message) || error).slice(0, 400))
  } finally {
    // THE CHILD'S HALF OF THE RESTORE; the parent's `finally` is the other (the docstring)
    const restored = await setPasskeys(FOUND).catch((e) => e.code || e.name)
    if (restored !== FOUND) step('switch-restored', false, `the browser half could not put passkeys back to ${FOUND}: ${restored}`)
    await sql.end({ timeout: 5 }).catch(() => {})
    await browser.close()
    process.stdout.write('\n@@RESULT@@' + JSON.stringify(steps) + '\n')
  }
})()
'''

# THE SWITCH, READ AND PUT BACK FROM THIS SIDE — the parent's half of the restore, and the read that finds the value
# both halves restore. `SET` empty reads; 'true' or 'false' writes and reads back. It prints the value, or the error's
# code: never the connection string.
FLAG_JS = r'''
const sql = require(process.env.PG_DIR)(process.env.PG_URL, { max: 1, prepare: false, ssl: { ca: process.env.DB_CA, rejectUnauthorized: true }, connect_timeout: 10 })
;(async () => {
  const rows = process.env.SET
    ? await sql`update public.feature_flags set enabled = ${process.env.SET === 'true'} where key = 'passkeys' returning enabled`
    : await sql`select enabled from public.feature_flags where key = 'passkeys'`
  process.stdout.write(JSON.stringify(rows.length ? rows[0].enabled : null))
})().catch((e) => process.stdout.write(JSON.stringify({ error: e.code || e.name })))
  .finally(() => sql.end({ timeout: 5 }))
'''


def pinned_ca():
    """The Supabase root the app pins (`db.ts`, DW-50), read out of the source so the harness and the app verify the
    pooler the same way; a harness that writes a production flag over an unverified connection would be the one
    `ssl: 'require'` line DW-50 removed (review, 2026-09-29). Fails loudly if the constant moved."""
    found = re.search(r'const SUPABASE_ROOT_CA = `([^`]+)`', open(os.path.join(WEB, 'server', 'ghost-admin', 'db.ts')).read())
    if not found:
        sys.exit('no SUPABASE_ROOT_CA in apps/web/server/ghost-admin/db.ts')
    return found.group(1)


def passkeys_flag(pg_url, value=None):
    """The `passkeys` row's `enabled` — read, or written to `value` and read back. None if it could not be."""
    child = dict(os.environ, PG_DIR=PG_DIR, PG_URL=pg_url, DB_CA=pinned_ca(), SET='' if value is None else str(value).lower())
    try:
        got = json.loads(subprocess.run(['node', '-e', FLAG_JS], env=child, capture_output=True, text=True,
                                        timeout=60).stdout)
    except (subprocess.TimeoutExpired, ValueError):
        return None
    return got if isinstance(got, bool) else None


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
        child = dict(os.environ, PW_DIR=pw, APP_URL=APP, AXE_PATH=axe_path() or '', PG_DIR=PG_DIR, DB_CA=pinned_ca(), **cfg)
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


BURST = 60


def burst(url, publishable, n=BURST):
    """DW-33 (1). The endpoint `startPasskeySignIn` calls, hit directly with the publishable key —
    the claim under test is GoTrue's OWN limit on `/passkeys/authentication/*`, and going through
    the server action would measure Vercel's egress IP instead of a caller's. WIDER THAN THE WINDOW:
    30 was its edge — executed 2026-09-07, all 200 from the harness and 55 of 60 as 429 a moment
    later — so whether a 30-burst saw the limit depended on what ran before it."""
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


PASSKEY_TOKENS = {'paper': 'paper', 'dangerTint': 'danger-tint', 'inkSoft': 'ink-soft', 'danger': 'danger'}


def tokens_rgb(names=PASSKEY_TOKENS):
    """The token values a `frame` step asserts — `{key: css token name}` — read out of the token
    layer as `getComputedStyle` will report them. Retyping a hex here is how a frame value goes
    stale. The default is this harness's four; `run-verify-email-change.py` passes its own three.
    A token that is not in `globals.css` is a named failure, not a traceback mid-run."""
    css = open(os.path.join(HERE, '..', '..', 'apps', 'web', 'app', 'globals.css')).read()
    def token(name):
        found = re.search(rf'--color-{name}:\s*(#[0-9A-Fa-f]{{6}})', css)
        if not found:
            sys.exit(f'  FAIL  --color-{name} is not in globals.css; the frame step has no token to compare')
        return hex_to_rgb(found.group(1))
    return {key: token(name) for key, name in names.items()}


def name_max():
    rule = open(os.path.join(HERE, '..', '..', 'apps', 'web', 'app', '(app)', 'app', '(authed)',
                             'account', 'passkey-name-rule.ts')).read()
    return int(re.search(r'PASSKEY_NAME_MAX = (\d+)', rule).group(1))


def named_aaguid():
    """`named-aaguid`'s authenticator: the FIRST entry of `lib/passkey-aaguids.ts`, as (aaguid, name). Which entry is
    not the point — only that the name comes out of the list the product itself reads, never retyped here."""
    listed = open(os.path.join(WEB, 'lib', 'passkey-aaguids.ts'), encoding='utf-8').read()
    found = re.search(r"'([0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12})': (\"[^\"]+\")", listed)
    if not found:
        sys.exit('  FAIL  lib/passkey-aaguids.ts carries no entry this harness can read')
    return found.group(1), json.loads(found.group(2))


def off_sentence():
    """What a sign-in says with the switch off — `sign-in/actions.ts`'s `passkeys_off`, read, never retyped."""
    actions = open(os.path.join(WEB, 'app', '(app)', 'app', 'sign-in', 'actions.ts'), encoding='utf-8').read()
    found = re.search(r"passkeys_off: '([^']+)'", actions)
    if not found:
        sys.exit('  FAIL  sign-in/actions.ts no longer declares the passkeys_off sentence')
    return found.group(1)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--check', action='store_true',
                    help='plumbing only: keys present, playwright resolvable, the admin API '
                         'answers a real create-read-delete, and the passkeys row is READ over the '
                         'pooler (never written). No browser and no UI, so it runs before the story '
                         'is deployed.')
    args = ap.parse_args()

    env = load_env()
    needed = ['SUPABASE_URL', 'SUPABASE_SECRET_KEY', 'SUPABASE_PUBLISHABLE_KEY', 'SUPABASE_DB_POOLER_URL']
    missing = [k for k in needed if not env.get(k)]
    if missing:
        print(f'  FAIL  tools/probe/.env is missing: {", ".join(missing)}')
        return 1

    # THE SWITCH, READ BEFORE ANYTHING IS CREATED: `kill-mid-ceremony` turns it off, and this is the value both
    # `finally`s put back (the docstring). Read in `--check` too, which writes nothing to it.
    pooler = env['SUPABASE_DB_POOLER_URL']
    found = passkeys_flag(pooler)
    print(f'  passkeys flag found: {found}')
    if found is None:
        print('  FAIL  the passkeys row could not be read over the pooler (postgres driver at '
              f'{os.path.relpath(PG_DIR)}: {"resolved" if os.path.isdir(PG_DIR) else "NOT FOUND"}), so nothing '
              'could put it back — nothing was created and nothing was switched.')
        return 1
    aaguid, aaguid_name = named_aaguid()
    refusal = off_sentence()

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
            print(f'  named-aaguid will register {aaguid} as {aaguid_name!r}, read out of lib/passkey-aaguids.ts')
            print(f'  kill-mid-ceremony expects {refusal!r}, read out of sign-in/actions.ts')
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
                'PG_URL': pooler,
                'PASSKEYS_FOUND': 'true' if found else 'false',
                'AAGUID': aaguid,
                'AAGUID_NAME': aaguid_name,
                'OFF_SENTENCE': refusal,
            })
            for s in steps:
                mark = 'RECORD' if s['ok'] is None else ('PASS' if s['ok'] else 'FAIL')
                print(f'  {mark:6} {s["name"]}: {s["detail"]}')
                if s['ok'] is False:
                    failed = True

            hit, errors = burst(env['SUPABASE_URL'], env['SUPABASE_PUBLISHABLE_KEY'])
            print('  RECORD ratelimit: ' + (
                f'the first status ≠ 200 was {hit[1]} on call {hit[0]} of {BURST}'
                if hit else 'every answered call was 200 — GoTrue did NOT rate-limit this burst')
                + (f'; {errors} call(s) raised a network error and are not statuses' if errors else ''))
    finally:
        if not args.check:
            # THE PARENT'S HALF OF THE RESTORE: it runs even when the browser half was killed at its ceiling
            back = passkeys_flag(pooler, found)
            print(f'  passkeys flag put back to {found}; read back {back}')
            if back != found:
                print('  FAIL  the passkeys row is NOT as it was found. Put it back over the pooler: '
                      f"update public.feature_flags set enabled = {str(found).lower()} where key = 'passkeys'")
                failed = True
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
