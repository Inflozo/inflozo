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

test('every page under /app is inside the (authed) group, or named as public here', () => {
  const found = pages()
  assert.ok(found.length >= 3, `expected the app's pages to be found, got ${found.length}`)
  for (const page of found) {
    if (PUBLIC.includes(page)) continue
    assert.ok(
      page.startsWith(`(authed)${'/'}`),
      `${page} sits under /app but not inside (authed) — it would ship with no sign-in guard at all. Move it, or add it to PUBLIC with its reason.`,
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
