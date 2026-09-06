import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

// Two contracts a fully green gate cannot see, in `tokens.test.ts`'s idiom: both are READ out of
// the files they govern, so neither can be restated wrongly here. Story 1.4's own history is the
// argument for both — `force-static` on /kit made a guarded page unreachable with no error, no
// warning and the route table unchanged (Spec Change Log 12), and narrowing the confirm route's
// accepted types is a one-token edit that reads like a tightening and ends sign-in for everyone.

const APP = 'app/(app)/app'
const ROUTE = join(APP, 'auth/confirm/route.ts')
const TEMPLATE = '../../supabase/auth/magic-link.html'

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

test("the email template's type= is one the confirm route accepts", () => {
  const declared = /const TYPES: readonly EmailOtpType\[\] = \[([^\]]*)\]/.exec(readFileSync(ROUTE, 'utf8'))
  assert.ok(declared, 'TYPES was not found in route.ts — this test reads the list rather than restating it')
  const accepted = [...declared[1].matchAll(/'([a-z_]+)'/g)].map((m) => m[1])

  // `&amp;type=email` in the href, and again in the pasteable URL under the button.
  const sent = [...readFileSync(TEMPLATE, 'utf8').matchAll(/[?&](?:amp;)?type=([a-z_]+)/g)].map((m) => m[1])
  assert.ok(sent.length > 0, 'the template carries no type= at all — every link would 303 to ?error=link')

  for (const type of new Set(sent)) {
    assert.ok(
      accepted.includes(type),
      `the template sends type=${type}, which the confirm route does not accept: every real sign-in link — and every first-ever sign-up — would 303 to /sign-in?error=link and nobody could get in.`,
    )
  }
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
