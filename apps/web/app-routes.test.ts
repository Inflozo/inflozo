import { test } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

// Two contracts a fully green gate cannot see, in `tokens.test.ts`'s idiom: both are READ out of
// the files they govern, so neither can be restated wrongly here. Story 1.4's own history is the
// argument for both — `force-static` on /kit made a guarded page unreachable with no error, no
// warning and the route table unchanged (Spec Change Log 12), and narrowing the confirm route's
// accepted types is a one-token edit that reads like a tightening and ends sign-in for everyone.

const APP = 'app/(app)/app'
const ROUTE = join(APP, 'auth/confirm/route.ts')
const TEMPLATE = '../../supabase/auth/magic-link.html'
const TEMPLATES = '../../supabase/auth'
/** Every email template the project pushes (`configure-supabase-auth.py` reads the same files). */
const templates = () => readdirSync(TEMPLATES).filter((f) => f.endsWith('.html')).map((f) => join(TEMPLATES, f))

/** Every `page.tsx` under `app/(app)/app`, relative to it. */
function pages(dir = ''): string[] {
  return readdirSync(join(APP, dir), { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory()
      ? pages(join(dir, entry.name))
      : entry.name === 'page.tsx'
        ? [join(dir, entry.name)]
        : [],
  )
}

// The routes that exist FOR someone who is not signed in yet. `auth/confirm` is a route handler,
// not a page, so it never appears here. Everything else under /app is behind the guard by where
// its file sits — the one thing nobody forgets to do — and this is what makes that true rather
// than merely customary.
const PUBLIC = [join('sign-in', 'page.tsx')]

// A SECOND LIST, AND IT IS NOT THE FIRST. `/restore` is for someone who IS signed in — FR-A5's
// deletion window — but it cannot live inside `(authed)`, because that layout is what redirects a
// pending account here and a layout cannot read its own path: inside the group the redirect would
// loop. So it sits outside and carries its own guard, and this list is the promise that it does.
// A page belongs here only when both are true, and the test below is what makes the second one
// checked rather than remembered.  [Story 2.5]
const SELF_GUARDED = [join('restore', 'page.tsx')]

// A THIRD LIST, AND IT IS NEITHER OF THE FIRST TWO. Story 5.9's keyboard harness (R-146) is not a
// page anyone reaches: it mounts the real `Editor` with fixture props so a browser in `pnpm check`
// can open the editor with no database, and it must therefore sit OUTSIDE `(authed)` — every page
// inside that group answers 500 with no Supabase environment, which is exactly what makes the run
// possible (executed 2026-09-19). It cannot call `signedIn()` either, for the same reason. Its
// guard is that it DOES NOT EXIST unless the gate turned it on: `notFound()` unless
// `INFLOZO_HARNESS=1`, which nothing in production sets. The test below is the promise that it
// does, and the deployed walk asserts the 404 on the real stack (`run-verify-editor.cjs`).
const HARNESS_ONLY = [join('harness', 'editor', 'page.tsx')]

test('every page under /app is inside the (authed) group, or named as public here', () => {
  const found = pages()
  assert.ok(found.length >= 3, `expected the app's pages to be found, got ${found.length}`)
  for (const page of found) {
    if (PUBLIC.includes(page) || SELF_GUARDED.includes(page) || HARNESS_ONLY.includes(page)) continue
    assert.ok(
      page.startsWith(`(authed)${'/'}`),
      `${page} sits under /app but not inside (authed) — it would ship with no sign-in guard at all. Move it, or add it to PUBLIC (or SELF_GUARDED) with its reason.`,
    )
  }
})

test('no page under /app re-declares force-static, which empties the cookie store', () => {
  for (const page of pages()) {
    assert.doesNotMatch(
      readFileSync(join(APP, page), 'utf8'),
      // anchored: /kit's own comment quotes the export it replaced, and prose is not a config
      /^export const dynamic\s*=\s*'force-static'/m,
      `${page}: a page-level segment config beats the layout's, and under force-static Next hands every server component an EMPTY cookie store — the guard then 307s a SIGNED-IN visitor back to /sign-in, with no error and the route table still reading the same (Spec Change Log 12).`,
    )
  }
})

/*
 * THE EXEMPTION ABOVE IS NOT A HOLE. A page skipped by the group test must guard itself, and
 * `await signedIn()` is the one guard the app has (`lib/supabase/server.ts`, DW-38) — it redirects
 * to /sign-in and narrows, so a page that has it cannot render for a stranger. Deleting that line
 * is green under eslint, `tsc`, `node --test` and `next build`, and `/restore` would then tell
 * anyone at all that an account is being deleted.  [Story 2.5]
 */
test('every page outside (authed) that is not public guards itself', () => {
  assert.ok(SELF_GUARDED.length > 0, 'SELF_GUARDED is empty — remove it rather than leaving an unused exemption')
  for (const page of SELF_GUARDED) {
    assert.ok(pages().includes(page), `${page} is named in SELF_GUARDED but no such page exists`)
    const source = readFileSync(join(APP, page), 'utf8').replace(/\/\/[^\n]*|\/\*[^]*?\*\//g, ' ')
    assert.match(
      source,
      /await signedIn\(/,
      `${page} sits outside (authed) and never calls await signedIn() — it would render for anyone.`,
    )
  }
})

test('every harness page does not exist unless the gate switched it on', () => {
  assert.ok(HARNESS_ONLY.length > 0, 'HARNESS_ONLY is empty — remove it rather than leaving an unused exemption')
  for (const page of HARNESS_ONLY) {
    assert.ok(pages().includes(page), `${page} is named in HARNESS_ONLY but no such page exists`)
    const source = readFileSync(join(APP, page), 'utf8').replace(/\/\/[^\n]*|\/\*[^]*?\*\//g, ' ')
    assert.match(
      source,
      /if \(!HARNESS\) notFound\(\)/,
      `${page} sits outside (authed) and does not refuse without INFLOZO_HARNESS=1 — it would ship a test mount to production.`,
    )
  }
  // the canvas ROUTE beside it is no page, so the walk above never meets it (review, 2026-09-19)
  const route = readFileSync(join(APP, 'harness', 'canvas', 'route.ts'), 'utf8').replace(/\/\/[^\n]*|\/\*[^]*?\*\//g, ' ')
  assert.match(route, /if \(!HARNESS\) return new NextResponse\('not found', \{ status: 404 \}\)/)
  // and the switch itself is read in ONE place, so the page and the canvas route cannot disagree
  assert.match(readFileSync('lib/harness.ts', 'utf8'), /process\.env\.INFLOZO_HARNESS === '1'/)
})

/** The `type=` values a template's links carry — in the href, and again in the pasteable URL. */
const typesSentBy = (template: string) =>
  new Set([...readFileSync(template, 'utf8').matchAll(/[?&](?:amp;)?type=([a-z_]+)/g)].map((m) => m[1]))

test("every email template's type= is one the confirm route accepts", () => {
  const declared = /const TYPES: readonly EmailOtpType\[\] = \[([^\]]*)\]/.exec(readFileSync(ROUTE, 'utf8'))
  assert.ok(declared, 'TYPES was not found in route.ts — this test reads the list rather than restating it')
  const accepted = [...declared[1].matchAll(/'([a-z_]+)'/g)].map((m) => m[1])

  const found = templates()
  assert.ok(found.length >= 2, `expected the sign-in and email-change templates under supabase/auth, got ${found}`)
  for (const template of found) {
    const sent = typesSentBy(template)
    assert.ok(sent.size > 0, `${template} carries no type= at all — every link it sends would 303 to ?error=link`)
    for (const type of sent) {
      assert.ok(
        accepted.includes(type),
        `${template} sends type=${type}, which the confirm route does not accept: every link it sends would 303 to /sign-in?error=link.`,
      )
    }
  }
})

/*
 * ACCEPTED IS NOT ENOUGH FOR THE EMAIL-CHANGE TEMPLATE. The confirm route lands `email_change` on
 * /account?email=changed and everything else on /; `type=email` — the sibling's value, the natural
 * copy — is in TYPES too, so the test above stays green while the real link lands on the
 * dashboard with no banner (Story 2.3 review, 2026-09-07). The route's own branch value is read
 * out of route.ts rather than restated here.
 */
test('the email-change template sends the one type the confirm route lands on /account', () => {
  const branch = /type === '([a-z_]+)' \? EMAIL_CHANGED_PATH/.exec(readFileSync(ROUTE, 'utf8'))
  assert.ok(branch, 'route.ts no longer branches its landing on a type — this test reads that literal')
  const sent = typesSentBy(join(TEMPLATES, 'email-change.html'))
  assert.deepEqual([...sent], [branch[1]], `email-change.html sends type=${[...sent]}; the route lands only type=${branch[1]} on /account?email=changed`)
})

/**
 * THE SHELL OWNS THE `<main>`, and nothing watched it. `/kit` was changed from `<main>` to `<div>`
 * for exactly this reason once `(authed)/layout.tsx` grew one — two nested `main` landmarks is
 * axe's `region`/`landmark-unique` rule — and the change was verified by a hand-run axe pass that
 * lives in no gate. The next page added under `(authed)` could wrap itself in one with lint,
 * `tsc`, `node --test` and `next build` all green (review, 2026-09-06). This is the same class of
 * invisible route-shape contract as the two tests above, so it lives in the same file.
 *
 * `sign-in/page.tsx` renders OUTSIDE the shell and therefore owns its own, which is why the rule
 * is scoped to `(authed)` rather than to every page. `error.tsx` is not a page and is not walked
 * here; it replaces the document and owns its own for the same reason.
 */
test('no page inside (authed) declares its own <main> — the shell is the only one', () => {
  for (const page of pages()) {
    if (!page.startsWith(`(authed)${'/'}`)) continue
    assert.doesNotMatch(
      readFileSync(join(APP, page), 'utf8'),
      // anchored, and for the reason the force-static test above is: /kit's own comment explains
      // why it is a `<div>` by quoting the `<main>` it gave up, and prose is not markup.
      /^\s*(return\s+)?<main[\s>]/m,
      `${page} declares a <main>, but the shell in (authed)/layout.tsx already does — two nested main landmarks. Use a <div>, as kit/page.tsx does.`,
    )
  }
})

/*
 * The template's mark is a PNG at an absolute inflozo.com URL (Story 1.6): Gmail strips SVG, so
 * it cannot be inlined, and `alt=""` means a missing file shows as a blank cell, not an error.
 * `identity.test.ts` proves the SVGs byte-identical but never looks at a PNG, and nothing else
 * ties the URL in the email to a file under `public/` (review, 2026-09-06).
 */
test('every inflozo.com image the email template names is a file under public/', () => {
  const srcs = [...readFileSync(TEMPLATE, 'utf8').matchAll(/src="https:\/\/inflozo\.com\/([^"]+)"/g)].map((m) => m[1])
  assert.ok(srcs.length > 0, 'the template names no image on inflozo.com — the mark is gone from the email')
  for (const path of srcs) {
    assert.ok(existsSync(join('public', path)), `the email points at /${path}, which is not under public/ — the mark would be a blank cell in every sign-in email`)
  }
})

/*
 * STORY 3.9 — the catch-all that puts the unbuilt destinations inside the shell (DW-17, DW-26).
 *
 * `(authed)/[...unbuilt]/page.tsx` matches every url under the group that no real route claimed,
 * and calls `notFound()`. The thing worth asserting is that it cannot claim a url a real route
 * wants: Next resolves a STATIC segment before a dynamic one and a dynamic one before a catch-all,
 * so the danger is not precedence but SHAPE — a second catch-all, or one nested deeper, and two
 * routes are competing for the same urls with only the framework's tie-break between them and
 * every screen in the app.
 *
 * This is the structural half. The executed half is the deployed-site read in the story's
 * `## Verification`: the six unbuilt destinations answer the app's own 404, and every built route
 * still answers its own page.
 */
test('exactly one catch-all under (authed), at the group root, and it only calls notFound()', () => {
  const catchAlls = pages().filter((p) => p.includes('[...'))
  assert.deepEqual(
    catchAlls,
    [join('(authed)', '[...unbuilt]', 'page.tsx')],
    'the catch-all must be the only one and must sit directly under (authed): nested deeper it stops ' +
      'covering its siblings, and a second one competes with it for every unmatched url.',
  )
  const source = readFileSync(join(APP, catchAlls[0]), 'utf8')
  assert.match(
    source,
    /notFound\(\)/,
    'the catch-all must call notFound() — it is the route that hands an unmatched url to (authed)/not-found.tsx.',
  )
  assert.ok(
    !existsSync(join(APP, '(authed)', '[...unbuilt]', 'loading.tsx')),
    'the catch-all must have NO loading.tsx: a skeleton is a Suspense boundary, and Next commits the ' +
      'status line before the page runs — notFound() would then land inside an already-successful 200 ' +
      '(R-98, DW-67). busy.test.ts records it in NO_SKELETON with the same reason.',
  )
})

/*
 * EVERY PAGE UNDER (authed) DECLARES A TITLE, and this is not tidiness — it is what stops the
 * not-found page from having none. `not-found.tsx` is a boundary and not a route segment, so no
 * `metadata` export of its own reaches the document: the title of a `notFound()` page is the
 * title of the SEGMENT that was being rendered. Measured rather than reasoned (Story 3.9, on the
 * deployed site): before the catch-all declared one, axe-core reported `document-title`, impact
 * serious, at all three widths, and the tab read the raw url.
 */
test('every page under (authed) declares a title — the not-found page inherits it', () => {
  const missing = pages()
    .filter((page) => page.startsWith(`(authed)${'/'}`))
    .filter((page) => !/export (const metadata|(async )?function generateMetadata)/
      .test(readFileSync(join(APP, page), 'utf8')))
  assert.deepEqual(
    missing,
    [],
    'these pages declare no metadata, so a notFound() raised inside one renders a document with no ' +
      '<title> — an axe `document-title` violation on a page nobody tests:\n  ' + missing.join('\n  '),
  )
})

/*
 * …and the page it hands them to. `not-found.tsx` must sit INSIDE `(authed)`, because that is what
 * makes the shell — sidebar, account menu, `<main>` — the frame around it rather than Next's own
 * unstyled page replacing the route. DW-74's arrival control depends on the sentence being inside
 * `<main>`, which is only true when the boundary is under the layout that draws one.
 */
test('(authed) has its own not-found, and it does not draw a second <main>', () => {
  const file = join(APP, '(authed)', 'not-found.tsx')
  assert.ok(existsSync(file), 'apps/web/app/(app)/app/(authed)/not-found.tsx is what renders a 404 inside the shell')
  assert.doesNotMatch(
    readFileSync(file, 'utf8'),
    /^\s*(return\s+)?<main[\s>]/m,
    'the not-found sits inside the shell, which already declares the one <main>.',
  )
})
