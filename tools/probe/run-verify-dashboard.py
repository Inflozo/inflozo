#!/usr/bin/env python3
"""The dashboard's two repeatable controls — the browser-only invariants and the four guards —
driven through the real UI on the deployed site, with every result read back off the pooler.

    python3 tools/probe/run-verify-dashboard.py --check   # plumbing only: no browser, no UI
    python3 tools/probe/run-verify-dashboard.py           # the whole run (Review and Deploy)

WHY IT EXISTS — two ledger entries of the same shape, closed by one harness (Story 3.9).

  DW-16: three of Story 1.5's five executed defects were BROWSER-ONLY — every popover permanently
  on screen because an author `display` beats the user agent's `[popover]:not(:popover-open)` rule,
  every modal flush to the top-left because Preflight resets the UA's centring margin, and no
  confirm opening on Cancel. Each is now a class or a line in a component, and `pnpm lint`,
  `pnpm typecheck`, `pnpm test` and the RLS gate are blind to every one of them: delete `open:`
  from the ⋯ menu and the whole gate stays green while CI publishes a dashboard with three menu
  items loose in every card's tab order.

  DW-20: `atCap`, `matchesName`, `copyName` and `uniqueSlug` are pure and under `node --test`; the
  actions that CALL them are `'use server'` modules `node --test` cannot import, and nothing posts
  to them. Delete the `matchesName` line from `deleteProject`, or invert `atCap` in
  `createProject`, and every check stays green. Each phase's live pass held it, by hand.

  Story 3.9 also closed the branded not-found (DW-17, DW-26, DW-67's page half), and the six
  drawn-but-unbuilt nav destinations are on this screen, so this is where they are read.

WHAT IT PROVES, each step PASS, FAIL or RECORD, and it exits non-zero if any step fails:

  overlays       DW-16: the ⋯ project menu, the New Project Sheet and the account menu are each
                 NOT VISIBLE and NOT IN THE TAB ORDER before their trigger is pressed, and each
                 appears when it is. Its CONTROL is the same measurement AFTER the press — an
                 assertion that something is hidden proves nothing unless the showing is proved too
  centred        DW-16: the modal is CENTRED, not flush to the top-left. Read off the rendered box
                 against the viewport, not off a class name — `m-auto` is the fix and a class list
                 is not a position
  cancel-focus   DW-16: the delete confirm opens with focus on its Cancel button. React leaves no
                 `autofocus` ATTRIBUTE for `showModal()` to find, so this is `kit/dialog.ts`'s own
                 `openOnCancel` and nothing else makes it true
  cap            DW-20: a SECOND project on Free is refused, and `public.projects` still holds one
                 row for that account when the pooler is asked. The count is the assertion; the
                 sentence on screen is the detail
  delete-typed   DW-20: Delete with the WRONG name typed is refused and the row survives; then the
                 right name deletes it. Both halves, because "the delete was refused" is satisfied
                 by a delete that never ran
  cross-rename   DW-20: a SECOND account's project id forged into the rename form writes nothing —
                 the stranger's row is byte-identical afterwards
  cross-delete   DW-20: the same for delete, and the stranger's row is still there
  not-found      STORY 3.9: every drawn-but-unbuilt nav destination and one nonsense URL render
                 INFLOZO'S OWN not-found INSIDE THE SHELL — the sidebar still there, the sentence
                 inside `<main>` — and the HTTP status is RECORDED beside it (DW-67: a route with
                 a skeleton commits 200 before the page runs; the catch-all has none, so it can
                 answer a real 404)
  not-found-status DW-67: every catch-all landing answers a real 404 (asserted since the review)
  not-found-csp  DW-18's app half: an unmatched app URL is now served by a DYNAMIC route carrying
                 the nonce, so the console reports ZERO blocked scripts where it reported ten
  prefetch       DW-17's tail: the two `Failed to load resource` lines a dashboard load used to
                 produce, because `<Link>` prefetches `/sites` and `/assets` and each 404'd
  axe-not-found  axe-core at WCAG 2.1 AA over the in-shell not-found at 1440, 834 and 390

THE FIXTURES. Two throwaway accounts, created here and deleted in a `finally`, with the Admin-API
user count read before and after so a leak is loud. The second exists only to own a row the first
must not be able to touch. Nothing a customer owns is read or written.

NO KEY IS EVER PRINTED. Values reach a subprocess environment and nothing else.
"""

import argparse, json, os, subprocess, sys, tempfile, time, urllib.error, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
APP = 'https://app.inflozo.com'
WEB = os.path.abspath(os.path.join(HERE, '..', '..', 'apps', 'web'))
PG_DIR = os.path.join(WEB, 'node_modules', 'postgres')
PROJECTS = os.path.join(WEB, 'lib', 'projects.ts')
PLAN = os.path.join(WEB, 'lib', 'plan.ts')
NOT_FOUND = os.path.join(WEB, 'lib', 'not-found.ts')
FIRST_RUN = os.path.join(WEB, 'lib', 'first-run.ts')

# `load_env`, `Admin`, `playwright_dir` and `axe_path` are the passkeys harness's, imported rather
# than re-typed — the same reason `run-verify-ghost-admin.py` imports them. A second copy of the
# fixture sweep is a second thing to keep in step.
sys.path.insert(0, HERE)
import importlib.util as _il
_spec = _il.spec_from_file_location('_passkeys', os.path.join(HERE, 'run-verify-passkeys.py'))
_passkeys = _il.module_from_spec(_spec)
_spec.loader.exec_module(_passkeys)
load_env, Admin = _passkeys.load_env, _passkeys.Admin
playwright_dir, axe_path = _passkeys.playwright_dir, _passkeys.axe_path

FIXTURE = 'dashboard-harness'


def app_text():
    """The app's own sentences, EVALUATED from `lib/*.ts` rather than retyped here — the sibling
    harness's idiom exactly. Node strips the types; none of these modules imports anything that
    needs a resolver, so a wording change moves this run with it."""
    script = (
        f"import {{ NAME_MAX, UNTITLED }} from 'file://{PROJECTS}';"
        f"import {{ capSentence }} from 'file://{PLAN}';"
        f"import {{ NOT_FOUND }} from 'file://{NOT_FOUND}';"
        f"import {{ BLANK_DOOR }} from 'file://{FIRST_RUN}';"
        "console.log(JSON.stringify({"
        " untitled: UNTITLED,"
        " name_max: NAME_MAX,"
        " at_cap: capSentence('free'),"
        " not_found_title: NOT_FOUND.title,"
        " not_found_sub: NOT_FOUND.sub,"
        " not_found_home: NOT_FOUND.home,"
        " blank_door: BLANK_DOOR.title }))")
    proc = subprocess.run(['node', '--experimental-strip-types', '--input-type=module', '-e', script],
                          capture_output=True, text=True, timeout=60)
    lines = [l for l in proc.stdout.splitlines() if l.startswith('{')]
    if proc.returncode != 0 or not lines:
        sys.exit("  FAIL  the app's sentences could not be evaluated from lib/{projects,plan,not-found}.ts: "
                 + proc.stderr.strip()[-400:])
    return json.loads(lines[-1])


# ── The browser half. Node, because Playwright is Node; one file, so one catalogue row.
BROWSER_JS = r'''
const { chromium } = require(process.env.PW_DIR)
const postgres = require(process.env.PG_DIR)

const APP = process.env.APP_URL
const SAY = JSON.parse(process.env.SENTENCES)
/* The six destinations the sidebar draws and no epic has built. DERIVED, not listed: the nav lives
   in `components/shell/shell.tsx` and the Python half reads its hrefs out of the rendered page, so
   a seventh added tomorrow is covered without anyone remembering to add it here. */
const UNBUILT = JSON.parse(process.env.UNBUILT)
const USER_ID = process.env.USER_ID
const OTHER_USER_ID = process.env.OTHER_USER_ID

const sql = postgres(process.env.PG_URL, {
  max: 1, prepare: false, ssl: 'require', connect_timeout: 10, idle_timeout: 20,
})

const steps = []
const step = (name, ok, detail) => { steps.push({ name, ok, detail }); return ok }
const record = (name, detail) => steps.push({ name, ok: null, detail })

const projectsOf = (owner) =>
  sql`select id, name, slug, updated_at from public.projects where user_id = ${owner} order by id`
const rowsJson = async (owner) => JSON.stringify(await projectsOf(owner))

/* IS IT ON SCREEN, AND CAN THE KEYBOARD REACH IT — the two halves of DW-16's first defect, and
   the second is the one nobody thinks to ask. A popover that an author `display` keeps painted is
   also in the tab order, which is how three menu items sat in every card's tab stops. */
const overlayState = (page, selector) =>
  page.evaluate((sel) => {
    const el = document.querySelector(sel)
    if (!el) return { missing: true }
    const box = el.getBoundingClientRect()
    const focusables = [...el.querySelectorAll('a[href],button,input,select,textarea,[tabindex]')]
    // `checkVisibility` is the platform's own answer and covers `display:none`, `visibility`,
    // `content-visibility` and the closed-popover state in one question.
    const visible = el.checkVisibility ? el.checkVisibility({ checkVisibilityCSS: true }) : box.width > 0
    let reachable = 0
    for (const f of focusables) { f.focus(); if (document.activeElement === f) reachable += 1 }
    document.activeElement && document.activeElement.blur()
    return { visible, reachable, focusables: focusables.length, w: Math.round(box.width), h: Math.round(box.height) }
  }, selector)

/* POST A FORM PAST THE CLIENT'S COURTESY — the only way to ask DW-20's question of the SERVER.
   The delete confirm's own `onSubmit` calls `preventDefault()` while the typed name does not match,
   and the button is `aria-disabled` until it does. That guard is right and it is not the control:
   the claim is that `deleteProject` RE-CHECKS, so the post has to arrive. A CLONE of the form
   carries every hidden field React put there — the `$ACTION_*` pair included — and carries none of
   React's listeners, so `requestSubmit()` on it is exactly the crafted post a server must refuse.
   It is also what a scripts-off browser sends, which is the other reason this is the faithful shape
   rather than a trick. */
const postForm = (page, selector, patch) =>
  page.evaluate(({ sel, values }) => {
    const form = document.querySelector(sel)
    if (!form) return false
    const clone = form.cloneNode(true)
    clone.style.display = 'none'
    for (const [name, value] of Object.entries(values)) {
      const field = clone.querySelector(`[name="${name}"]`) ||
        clone.querySelector('input[type="text"]')
      if (!field) return false
      field.value = value
    }
    document.body.appendChild(clone)
    clone.requestSubmit()
    return true
  }, { sel: selector, values: patch })

const axeOver = async (page, label, width) => {
  await page.addScriptTag({ path: process.env.AXE_PATH })
  const r = await page.evaluate(() =>
    window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] } }))
  step(`axe-${label}-${width}`, r.violations.length === 0,
       r.violations.length === 0 ? `zero violations at WCAG 2.1 AA, ${width}px`
                                 : r.violations.map((v) => `${v.id} x${v.nodes.length} (${v.impact})`).join(', '))
}

;(async () => {
  const browser = await chromium.launch()
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await context.newPage()
  const consoleErrors = []
  const blocked = []
  /* EVERY POST THIS RUN MAKES, counted. A negative assertion needs a positive control (standing
     rule 2): "the row survived" is also what a post that never left the browser looks like, and
     the clone below submits a form React is not listening to — so whether it reached the server at
     all is a thing to watch rather than assume. */
  const posts = []
  page.on('response', (r) => {
    if (r.request().method() === 'POST') posts.push(`${r.status()} ${new URL(r.url()).pathname}`)
  })
  page.on('console', (m) => {
    const t = m.text()
    if (/Content Security Policy|Refused to (execute|load)/i.test(t)) blocked.push(t.slice(0, 120))
    if (/Failed to load resource/i.test(t)) consoleErrors.push(`${m.location().url}`)
  })

  try {
    await page.goto(process.env.CONFIRM_URL, { waitUntil: 'load' })
    await page.goto(`${APP}/`, { waitUntil: 'load' })
    step('signed-in', page.url().startsWith(`${APP}/`) && !page.url().includes('/sign-in'),
         `landed on ${page.url()}`)

    /* FIRST RUN IS IN THE WAY, and correctly so (Story 3.8): an account with NOTHING is redirected
       from `/` to `/start` and sent back the moment it has anything. A brand-new fixture is exactly
       that account, so the dashboard this harness is about is not reachable until a project exists.
       The BLANK CANVAS door opens the very sheet the dashboard opens — same component, same action
       — so the run goes through the door the customer would. */
    const onStart = page.url().includes('/start')
    let createForm = null
    if (onStart) {
      await page.getByRole('button', { name: SAY.blank_door, exact: false }).first().click()
      await page.waitForSelector('#new-project-sheet[open]', { timeout: 20000 })
      /* THE CREATE FORM'S OWN MARKUP, KEPT — the only moment in this run when it exists. At the
         Free cap the sheet draws D4b's upgrade tile INSTEAD of the form (which is the client's
         refusal, and it is right), so there is nothing left to post and `createProject`'s own
         `atCap` could be deleted with every visible check still green. That is exactly DW-20's
         claim, so the form is stashed here and re-posted at the cap below. Its `$ACTION_*` fields
         are the build's, not the render's, so a stored copy still reaches the same action. */
      createForm = await page.evaluate(() => {
        const f = document.querySelector('#new-project-sheet form')
        return f ? f.outerHTML : null
      })
      await page.locator('#new-project-sheet button[type="submit"]').first().click()
      await page.waitForURL((u) => !u.pathname.endsWith('/start'), { timeout: 30000 }).catch(() => {})
      await page.goto(`${APP}/`, { waitUntil: 'load' })
    }
    record('first-run', onStart
      ? `the new account landed on /start (Story 3.8's First Run) and came through the ` +
        `${JSON.stringify(SAY.blank_door)} door, which opens the same sheet the dashboard opens`
      : 'the new account landed straight on the dashboard — First Run did not claim it')

    // ── prefetch: the console noise DW-17's tail recorded, measured on a plain dashboard load.
    await page.waitForTimeout(2500)
    record('prefetch', consoleErrors.length === 0
      ? 'a dashboard load produced NO `Failed to load resource` line — the <Link> prefetches of ' +
        'the unbuilt destinations now reach a route that exists'
      : `${consoleErrors.length} failed resource(s): ${JSON.stringify(consoleErrors.slice(0, 4))}`)

    // ── overlays, before and after. The project card exists because the account is new and the
    //    dashboard seeds nothing — so one is made through the sheet first, which is also the
    //    sheet's own showing half.
    const sheetSel = '#new-project-sheet'
    const beforeSheet = await overlayState(page, sheetSel)
    await page.getByRole('button', { name: /New project/i }).first().click()
    await page.waitForTimeout(400)
    const afterSheet = await overlayState(page, sheetSel)
    step('overlays-sheet',
         beforeSheet.visible === false && beforeSheet.reachable === 0 &&
         afterSheet.visible === true && afterSheet.reachable > 0,
         `before the press: visible=${beforeSheet.visible}, ${beforeSheet.reachable} of ` +
         `${beforeSheet.focusables} controls focusable; after: visible=${afterSheet.visible}, ` +
         `${afterSheet.reachable} of ${afterSheet.focusables}`)

    // ── centred: the rendered box against the viewport, never a class name.
    const centred = await page.evaluate((sel) => {
      const el = document.querySelector(sel)
      const b = el.getBoundingClientRect()
      return { left: Math.round(b.left), top: Math.round(b.top), w: Math.round(b.width),
               h: Math.round(b.height), vw: window.innerWidth, vh: window.innerHeight }
    }, sheetSel)
    const dx = Math.abs((centred.left + centred.w / 2) - centred.vw / 2)
    const dy = Math.abs((centred.top + centred.h / 2) - centred.vh / 2)
    step('centred', dx <= 2 && dy <= 2 && centred.left > 8 && centred.top > 8,
         `the sheet's box is ${centred.w}x${centred.h} at (${centred.left}, ${centred.top}) in a ` +
         `${centred.vw}x${centred.vh} viewport — off centre by ${dx}px across and ${dy}px down ` +
         `(flush to the top-left, the defect, is (0, 0))`)

    /* The ONE project the Free cap allows already exists — First Run's blank door made it above.
       So this press is the CAP's first proof rather than a create, and the sheet is left closed. */
    await page.keyboard.press('Escape')
    await page.waitForTimeout(300)
    const made = await projectsOf(USER_ID)
    step('created', made.length === 1,
         `${made.length} project row(s) — the Free cap's one, made through the sheet`)

    // ── overlays, the ⋯ menu and the account menu, now that a card exists.
    for (const [label, trigger, sel] of [
      ['menu', 'button[aria-label^="Options for "]', '[popover]'],
      ['account', '[popovertarget="account-menu"]', '#account-menu'],
    ]) {
      const target = label === 'menu'
        ? await page.locator(trigger).first().evaluate((el) => '#' + el.getAttribute('popovertarget'))
        : sel
      const before = await overlayState(page, target)
      await page.locator(trigger).first().click()
      await page.waitForTimeout(300)
      const after = await overlayState(page, target)
      step(`overlays-${label}`,
           before.visible === false && before.reachable === 0 && after.visible === true && after.reachable > 0,
           `${target} before the press: visible=${before.visible}, ${before.reachable} of ` +
           `${before.focusables} controls focusable; after: visible=${after.visible}, ` +
           `${after.reachable} of ${after.focusables}`)
      await page.keyboard.press('Escape')
      await page.waitForTimeout(200)
    }

    // ── cancel-focus: the delete confirm opens with focus on Cancel.
    await page.locator('button[aria-label^="Options for "]').first().click()
    await page.waitForTimeout(300)
    await page.getByRole('button', { name: /^Delete/i }).first().click()
    await page.waitForSelector('dialog[open]', { timeout: 10000 })
    const onCancel = await page.evaluate(() =>
      document.activeElement !== null && document.activeElement.hasAttribute('data-cancel'))
    step('cancel-focus', onCancel, `focus is on the Cancel button when the confirm opens = ${onCancel}`)

    // ── cap: a SECOND project on Free is refused — by the SERVER, not only by the sheet.
    {
      await page.goto(`${APP}/`, { waitUntil: 'load' })
      await page.getByRole('button', { name: /New project/i }).first().click()
      await page.waitForTimeout(600)
      // The client's half: at the cap the sheet draws the upgrade tile and the app's own sentence.
      const said = (await page.locator(sheetSel).innerText().catch(() => '')).replace(/\s+/g, ' ')
      const noForm = await page.locator(`${sheetSel} button[type="submit"]`).count()
      await page.keyboard.press('Escape')
      await page.waitForTimeout(300)
      // The SERVER's half: the create form as it was under the cap, posted again now.
      const postsBefore = posts.length
      const reposted = Boolean(createForm) && await page.evaluate((html) => {
        const holder = document.createElement('div')
        holder.style.display = 'none'
        holder.innerHTML = html
        document.body.appendChild(holder)
        holder.querySelector('form').requestSubmit()
        return true
      }, createForm)
      await page.waitForTimeout(4000)
      const rows = await projectsOf(USER_ID)
      step('cap', rows.length === 1 && said.includes(SAY.at_cap) && noForm === 0 && reposted
           && posts.length > postsBefore,
           `at the Free cap the sheet draws the upgrade tile and no create form (${noForm} submit ` +
           `button(s)) and says ${JSON.stringify(SAY.at_cap)} = ${said.includes(SAY.at_cap)}; and ` +
           `the create form AS IT WAS UNDER THE CAP, re-posted past that (reached the server: ` +
           `${JSON.stringify(posts.slice(postsBefore))}), left the account at ${rows.length} ` +
           `project row(s) — which is createProject's own atCap, the half the sheet hides`)
    }

    // ── cross-rename / cross-delete: a SECOND account's row, forged into this account's forms.
    const [stranger] = await sql`
      insert into public.projects (user_id, name, slug, style_pack)
      values (${OTHER_USER_ID}, 'Stranger', ${'stranger-' + Date.now()}, '{}'::jsonb)
      returning id, name, slug`
    const strangerBefore = JSON.stringify(await sql`select * from public.projects where id = ${stranger.id}`)
    for (const which of ['rename', 'delete']) {
      await page.goto(`${APP}/`, { waitUntil: 'load' })
      await page.locator('button[aria-label^="Options for "]').first().click()
      await page.waitForTimeout(300)
      await page.getByRole('button', { name: which === 'rename' ? /^Rename/i : /^Delete/i }).first().click()
      await page.waitForSelector('dialog[open]', { timeout: 10000 })
      const postsBefore = posts.length
      // The typed confirm is set RIGHT FOR THE STRANGER'S ROW, or a refusal would prove only that
      // the name did not match — which is `delete-typed`'s claim, not this one's.
      const forged = await postForm(page, 'dialog[open] form', {
        id: stranger.id,
        [which === 'delete' ? 'typed' : 'name']:
          which === 'delete' ? stranger.name : 'Renamed by a stranger',
      })
      await page.waitForTimeout(3000)
      const reached = posts.length > postsBefore
      const after = JSON.stringify(await sql`select * from public.projects where id = ${stranger.id}`)
      step(`cross-${which}`, forged && reached && after === strangerBefore,
           `a project id owned by a DIFFERENT account was forged into this account's ${which} form ` +
           `and submitted (forged = ${forged}, and it REACHED the server: ` +
           `${JSON.stringify(posts.slice(postsBefore))}); the stranger's row is byte-identical ` +
           `afterwards = ${after === strangerBefore}`)
      await page.keyboard.press('Escape')
    }
    await sql`delete from public.projects where id = ${stranger.id}`

    /* ── delete-typed AND delete-control COME LAST OF THE DASHBOARD STEPS, because the control
       really does delete the account's only project — and an account with nothing is sent to
       /start by First Run (Story 3.8), so every step above that needs a card would find none.
       Executed rather than reasoned: the first ordering put the cap proof after this and it waited
       thirty seconds for a "New project" button on the First Run screen. */
    // ── delete-typed: the WRONG name is refused and the row survives.
    const name = made[0].name
    /* THE CLONE'S POST IS A REAL NAVIGATION, so the dialog is gone afterwards and the second post
       needs the confirm opened again — the first writing of this step reused a form that no longer
       existed, and its control silently did nothing while the refusal above "passed" (found on the
       deployed site, 2026-09-11). */
    const openConfirm = async () => {
      await page.goto(`${APP}/`, { waitUntil: 'load' })
      await page.locator('button[aria-label^="Options for "]').first().click()
      await page.waitForTimeout(300)
      await page.getByRole('button', { name: /^Delete/i }).first().click()
      await page.waitForSelector('dialog[open]', { timeout: 10000 })
    }
    await openConfirm()
    const before = await rowsJson(USER_ID)
    const postsBeforeWrong = posts.length
    const postedWrong = await postForm(page, 'dialog[open] form', { typed: 'definitely not the name' })
    await page.waitForTimeout(3000)
    const wrongReached = posts.length > postsBeforeWrong
    const afterWrong = await rowsJson(USER_ID)
    step('delete-typed', postedWrong && wrongReached && afterWrong === before,
         `a delete POSTED with the wrong name typed — past the client's own greyed button, which is ` +
         `a courtesy and not the control — REACHED THE SERVER (${JSON.stringify(posts.slice(postsBeforeWrong))}) ` +
         `and left the account's rows byte-identical = ${afterWrong === before} ` +
         `(${(await projectsOf(USER_ID)).length} row(s))`)

    // …and the right name really does delete it, so the refusal above is a refusal and not a
    // delete that never ran (standing rule 2). Same form, same route, one value different.
    await openConfirm()
    const postedRight = await postForm(page, 'dialog[open] form', { typed: name })
    await page.waitForTimeout(4000)
    const afterRight = await projectsOf(USER_ID)
    step('delete-control', postedRight && afterRight.length === 0,
         `the same form with the exact name ${JSON.stringify(name)} deleted it: ` +
         `${afterRight.length} row(s) left`)

    // ── not-found: every unbuilt destination, and one nonsense URL, INSIDE the shell.
    const landings = []
    for (const path of [...UNBUILT, '/nothing-here-3-9']) {
      blocked.length = 0
      // ONE RETRY, and `domcontentloaded`: a cold serverless start on an unmatched url overran the
      // 30s default once on a run where every other landing was instant (executed, 2026-09-11).
      // The assertions below are about the DOCUMENT, so waiting for every subresource buys nothing.
      let r = await page.goto(`${APP}${path}`, { waitUntil: 'domcontentloaded', timeout: 60000 })
        .catch(() => null)
      if (!r) r = await page.goto(`${APP}${path}`, { waitUntil: 'domcontentloaded', timeout: 60000 })
      await page.waitForTimeout(1500)
      const seen = await page.evaluate((homeLabel) => {
        const main = document.querySelector('main')
        return {
          main: main ? main.innerText.replace(/\s+/g, ' ').trim().slice(0, 120) : null,
          sidebar: Boolean(document.querySelector('nav[aria-label="Sections"]')),
          // THE PAGE'S OWN BUTTON, INSIDE <main>, BY ITS OWN WORDS. Any `<a href="/">` on the page
          // is satisfied by the sidebar's Projects row, which every in-shell page carries — so the
          // first draft of this read stayed green with the button deleted (review, 2026-09-11).
          home: Boolean(main && [...main.querySelectorAll('a[href="/"]')]
            .some((a) => a.textContent.replace(/\s+/g, ' ').trim() === homeLabel)),
        }
      }, SAY.not_found_home)
      landings.push({ path, status: r ? r.status() : 0, ...seen, blocked: blocked.length })
    }
    const inShell = landings.filter((l) => l.main && l.main.includes(SAY.not_found_title) && l.sidebar && l.home)
    step('not-found', inShell.length === landings.length,
         `${inShell.length} of ${landings.length} unmatched destinations render Inflozo's own ` +
         `not-found INSIDE the shell — the sentence in <main>, the sidebar drawn and a way home: ` +
         JSON.stringify(landings.map((l) => `${l.path} ${l.status}`)))
    // ASSERTED, NOT RECORDED: every landing here is the catch-all's, and the catch-all has no
    // skeleton, so a 200 would mean a Suspense boundary came back above it — a re-added
    // group-level loading.tsx puts every notFound() back at 200 and nothing else goes red
    // (review, 2026-09-11). `/sites/brand`'s 200 is DW-67's remaining half and is not read here.
    step('not-found-status', landings.every((l) => l.status === 404),
      'DW-67: the catch-all carries no skeleton, so it answers a real 404 — ' +
      JSON.stringify(landings.map((l) => ({ path: l.path, status: l.status }))))
    const csp = landings.filter((l) => l.blocked === 0)
    step('not-found-csp', csp.length === landings.length,
         `DW-18's app half: ${csp.length} of ${landings.length} unmatched app URLs report ZERO ` +
         `blocked scripts (the root /_not-found is prerendered and reported ten); per page: ` +
         JSON.stringify(landings.map((l) => l.blocked)))

    // ── axe over the in-shell not-found, at the three widths.
    for (const width of [1440, 834, 390]) {
      await page.setViewportSize({ width, height: width === 390 ? 800 : 900 })
      await page.goto(`${APP}/nothing-here-3-9`, { waitUntil: 'domcontentloaded', timeout: 60000 })
      await page.waitForTimeout(1000)
      await axeOver(page, 'not-found', width)
    }
  } catch (error) {
    step('run', false, `threw: ${String(error).slice(0, 300)}`)
  } finally {
    await sql.end().catch(() => {})
    await browser.close().catch(() => {})
  }
  console.log('STEPS:' + JSON.stringify(steps))
})()
'''


def run_browser(cfg):
    pw = playwright_dir()
    if not pw:
        return [{'name': 'browser', 'ok': False, 'detail': 'playwright not resolvable; see memory '
                                                           '`headless-browser-tooling`'}]
    if not os.path.isdir(PG_DIR):
        return [{'name': 'browser', 'ok': False,
                 'detail': f'the postgres driver is not at {os.path.relpath(PG_DIR)}; run pnpm install'}]
    with tempfile.TemporaryDirectory() as work:
        script = os.path.join(work, 'dashboard.js')
        open(script, 'w').write(BROWSER_JS)
        # SECRETS GO IN THE ENVIRONMENT, never in argv: argv is world-readable in `ps`.
        child = dict(os.environ, PW_DIR=pw, PG_DIR=os.path.abspath(PG_DIR),
                     AXE_PATH=axe_path() or '', **cfg)
        try:
            proc = subprocess.run(['node', script], env=child, capture_output=True, text=True, timeout=900)
        except subprocess.TimeoutExpired as timed_out:
            # A hang is a FAIL with a name, not a traceback (review, 2026-09-11; the sibling
            # harness's pattern). What the child had already written is printed so the run says
            # how far it got.
            hung = timed_out.stdout.decode() if isinstance(timed_out.stdout, bytes) else (timed_out.stdout or '')
            for line in hung.splitlines():
                if line.lstrip().startswith('note:'):
                    print(f'  {line.strip()}')
            return [{'name': 'browser', 'ok': False, 'detail': 'node did not finish inside 900s'}]
        except FileNotFoundError:
            return [{'name': 'browser', 'ok': False, 'detail': 'node is not on PATH; Playwright is Node'}]
    for line in proc.stdout.splitlines():
        if line.startswith('STEPS:'):
            return json.loads(line[len('STEPS:'):])
    return [{'name': 'browser', 'ok': False,
             'detail': f'the browser half printed no steps (exit {proc.returncode}): '
                       + (proc.stderr.strip()[-400:] or proc.stdout.strip()[-400:])}]


def nav_hrefs():
    """Every in-app destination the shell DRAWS — the sidebar's `NAV` and the account menu's rows —
    READ OUT OF THOSE TWO FILES rather than listed here. Counts and membership are derived
    (standing rule 4): a destination added to either tomorrow is covered without anyone
    remembering, which is how the six unbuilt ones came to be six in the first place."""
    import re as _re
    hrefs = []

    shell = open(os.path.join(WEB, 'components', 'shell', 'shell.tsx'), encoding='utf8').read()
    block = _re.search(r'const NAV[^=]*=\s*\[(.*?)\n\]', shell, _re.S)
    if not block:
        sys.exit('  FAIL  the shell no longer declares a NAV array this can read — point it at the new one')
    hrefs += _re.findall(r"href:\s*'([^']+)'", block.group(1))

    # The other three live in the account menu, which is why "six destinations" was never one list.
    menu = open(os.path.join(WEB, 'components', 'shell', 'account-menu.tsx'), encoding='utf8').read()
    hrefs += _re.findall(r'href="(/[^"]*)"', menu)

    hrefs = sorted(set(hrefs))
    if not hrefs:
        sys.exit("  FAIL  neither the shell's NAV nor the account menu declares an href — this run "
                 'would assert nothing')
    return hrefs


def built_routes():
    """Which of those the app actually has a page for — again derived, by walking the route tree."""
    authed = os.path.join(WEB, 'app', '(app)', 'app', '(authed)')
    built = set()
    for root, _dirs, files in os.walk(authed):
        if 'page.tsx' not in files or '[' in root:
            continue
        rel = os.path.relpath(root, authed)
        segments = [s for s in rel.split(os.sep) if s != '.' and not (s.startswith('(') and s.endswith(')'))]
        built.add('/' + '/'.join(segments) if segments else '/')
    return built


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--check', action='store_true',
                    help='plumbing only: keys present, playwright and the postgres driver '
                         'resolvable, the app\'s sentences evaluate, and the admin API answers a '
                         'real create-read-delete. No browser and no UI.')
    ap.add_argument('--url', default=APP, help='the deployment to drive (default: production)')
    args = ap.parse_args()

    env = load_env()
    needed = ['SUPABASE_URL', 'SUPABASE_SECRET_KEY', 'SUPABASE_DB_POOLER_URL']
    missing = [k for k in needed if not env.get(k)]
    if missing:
        print(f'  FAIL  tools/probe/.env is missing: {", ".join(missing)}')
        return 1

    says = app_text()
    nav = nav_hrefs()
    built = built_routes()
    unbuilt = [h for h in nav if h not in built]
    print(f'  the shell draws {len(nav)} destination(s); {len(unbuilt)} have no page: {unbuilt}')
    if not unbuilt:
        print('  note: every drawn destination is now built, so only the nonsense URL exercises '
              'the catch-all. That is a good day, not a failure.')

    admin = Admin(env['SUPABASE_URL'], env['SUPABASE_SECRET_KEY'])
    swept = admin.sweep_stale_fixtures(rf'^{FIXTURE}-\d+(-other)?@inflozo\.com$')
    if swept:
        print(f'  swept {swept} stale {FIXTURE}-* user(s) an earlier run left behind')
    before = admin.user_count()
    print(f'  users before: {before}')
    if before is None:
        print('  FAIL  the Admin-API user count could not be read, so the cleanup has no control.')
        return 1

    stamp = int(time.time())
    made = []
    failed = False
    try:
        for suffix in ('', '-other'):
            status, created = admin.call('POST', '/admin/users',
                                         {'email': f'{FIXTURE}-{stamp}{suffix}@inflozo.com',
                                          'email_confirm': True})
            if status not in (200, 201) or not created.get('id'):
                print(f'  FAIL  could not create the fixture user{suffix}: HTTP {status}')
                return 1
            made.append(created['id'])
        print(f'  two fixture users created (Free, so the second project is the cap proof)')

        if args.check:
            pw, axe = playwright_dir(), axe_path()
            print(f'  playwright: {"resolved" if pw else "NOT FOUND"}')
            print(f'  axe-core:   {"resolved" if axe else "NOT FOUND"}')
            print(f'  postgres driver: {"resolved" if os.path.isdir(PG_DIR) else "NOT FOUND"}')
            print(f'  the app says at the cap: {json.dumps(says["at_cap"])}')
            print(f'  the not-found says:      {json.dumps(says["not_found_title"])}')
            print(f'  First Run\'s blank door:  {json.dumps(says["blank_door"])}')
            status, read = admin.call('GET', f'/admin/users/{made[0]}')
            ok = status == 200 and read.get('id') == made[0]
            print(f'  {"PASS" if ok else "FAIL"}  admin round trip: create, read back ({status})')
            failed = not ok or not pw or not axe or not os.path.isdir(PG_DIR)
        else:
            status, link = admin.call('POST', '/admin/generate_link',
                                      {'type': 'magiclink', 'email': f'{FIXTURE}-{stamp}@inflozo.com'})
            if status != 200 or not link.get('hashed_token'):
                print(f'  FAIL  generate_link (the fixture sign-in) answered HTTP {status}')
                return 1
            steps = run_browser({
                'APP_URL': args.url.rstrip('/'),
                'PG_URL': env['SUPABASE_DB_POOLER_URL'],
                'USER_ID': made[0],
                'OTHER_USER_ID': made[1],
                'CONFIRM_URL': f'{args.url.rstrip("/")}/auth/confirm?'
                               f'token_hash={link["hashed_token"]}&type=magiclink',
                'UNBUILT': json.dumps(unbuilt),
                'SENTENCES': json.dumps(says),
            })
            for s in steps:
                mark = 'RECORD' if s['ok'] is None else ('PASS' if s['ok'] else 'FAIL')
                print(f'  {mark:6} {s["name"]}: {s["detail"]}')
                if s['ok'] is False:
                    failed = True
    finally:
        for user_id in made:
            admin.call('DELETE', f'/admin/users/{user_id}', {})
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
