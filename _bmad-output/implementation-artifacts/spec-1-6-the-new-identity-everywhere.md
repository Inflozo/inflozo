---
title: 'Story 1.6 — The new identity everywhere'
type: 'feature'
created: '2026-09-06'
status: 'ready-for-dev'
review_loop_iteration: 0
owner_test: pending
context: ['{project-root}/_bmad-output/implementation-artifacts/epic-1-context.md']
---

## In plain English

Today every place Inflozo writes its own name — the sidebar, the phone's top bar and menu, the sign-in card, the
error page, the sign-in email, the browser tab — shows the word alone, in the display font. After this story each
of them shows the real logo: the "Nest" mark (three nested rounded squares with a red core) beside the word, and
the tab and your phone's home screen get the icon. The huge faded "Inflozo" behind the sign-in card stays exactly
as it is, and the yellow "add a passkey" line on the dashboard gets its warning icon sitting level with its sentence
instead of a little above it.

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The owner's identity landed in the export on 2026-09-06 (DW-31) and nothing in the product draws it:
seven surfaces still draw the wordmark alone, the app has no favicon or app icon at all, and the email carries a
system-font word. Separately, the dashboard's passkey nudge draws its triangle icon a few pixels above its sentence
because the sentence sits centred in a 32px row of buttons while the Kit's Banner pins its icon to the top.

**Approach:** One `Mark` (the export's SVG, inlined verbatim) and one `Lockup` (mark + wordmark under the README's
ratios) in the kit, substituted at every logo site the grep finds; the export's SVGs served as the favicon and app
icon; the email gets the mark as a rasterised PNG beside its word. The Banner learns to centre its icon on a row of
the caller's height, and the nudge declares that height.

## Boundaries & Constraints

**Always:**
- The marks are the export's own SVGs: `Logo/export/Inflozo Logo/assets/*.svg`, inlined or copied byte-for-byte
  into `public/`. The only thing dropped when inlining is the `<metadata>` C2PA manifest (provenance bytes, not
  drawing), and the comment beside the component says so. Nothing is redrawn, re-radiused or rescaled by hand.
- The lockup obeys the README: mark height 1.85× the wordmark's cap height — **1.221× the font-size**, derived from
  the export's own lockups (43.6px mark at 35.7px type, 52.3 at 42.9, 101.6 at 83.2, every one 1.221) — gap and clear
  space 0.28× the mark's height, Bricolage Grotesque 800, tracking −0.035em, never below 600, never positive tracking.
  The wordmark's lowercase *i* is the export's own construction (capital I scaled 0.809, tittle 0.16em), copied from
  `Inflozo Logo.html`, not typed as `i`.
- Light mark on light surfaces, dark mark on dark. Every surface this story touches is light (the app has no dark
  chrome yet), so `mark-light.svg` is the one drawn; `mark-dark.svg` ships in `public/brand/` unused, for the day a
  dark surface exists.
- Every logo site is found by grep, never listed by hand (AC below carries the command); the inventory in the Code
  Map is what the grep returned on 2026-09-06 and is re-derived at Dev and Review.
- The surfaces keep their frames (`S1`, `S3`, the error page's S3 extrapolation, `Editor Sidebar Kit`) and this story
  departs from each in one thing only, the logo, on the owner's ruling of 2026-09-06 (DW-31 → Story 1.6) — recorded
  in the comment beside each substitution. The export is never edited (R-74).
- `prefers-reduced-motion` stays honoured by `globals.css`'s global rule; nothing new animates.
- Zero axe-core violations at WCAG 2.1 AA on every touched page at 1440, 834 and 390 (NFR-5); the mark is
  decorative beside the word (`aria-hidden`), the word is the accessible name.
- After the change the only literal display-weight "Inflozo" left in `apps/web` is the Sign In watermark's
  `before:content-['Inflozo']`.

**Ask First:**
- Using the launch animation anywhere — the epic says at most once and only where the owner asks; he has not asked
  (see Questions for the owner). Dev proceeds on option 1 until he rules otherwise.
- Any surface where the horizontal lockup does not fit at the frame's type size and a stacked lockup or the mark
  alone seems needed. None was found at 390 or 1440 in planning.

**Never:**
- Touch the Sign In watermark or add a mark to it (owner, 2026-09-06).
- Edit anything under `design/claude-design-export/` (R-74).
- Change what any surface does — this story is drawing only; no copy, route, action or schema changes.
- Add a dependency for rasterising: the email PNG is a headless-Chromium screenshot of the export's SVG, made once,
  committed, its command recorded in Design Notes.
- Let the Banner centre its icon on a multi-line sentence: the default stays first-line alignment; only a caller
  that carries a control row declares its height.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Sidebar, 1440 | `/` signed in | S3's header slot draws `Lockup` at 20px: 24px mark, 7px gap, the word; linked to `/` with the one focus ring, as `Wordmark` was | — |
| Top bar and ☰ drawer, 390 | `/` signed in, phone | Top bar `Lockup` at 19px (23px mark), drawer header at 20px; nothing scrolls sideways | — |
| Sign In card | `/sign-in` | The card's 20/22px wordmark becomes the lockup at the same type size; the 130/380px watermark behind is byte-identical to today | — |
| Error page | a thrown render under `/app` | `error.tsx`'s 20px wordmark becomes the lockup, centred as before | — |
| Marketing placeholder | `inflozo.com/` | The lockup at 35.7px (the export's "stacked" size) centred on paper, replacing `<p>Inflozo</p>` | — |
| Favicon | any page, both hosts | `<link rel="icon" href="/icon.svg">` emitted by Next's file convention; `GET /icon.svg` on `app.inflozo.com` and `inflozo.com` is 200 `image/svg+xml`, the bytes of `favicon-16.svg` | the proxy matcher excludes it, or the app host rewrites it to `/app/icon.svg` and 404s — the curl in Verification is the control |
| App icon | "Add to Home Screen" on iOS / Android | `/apple-icon.png`, 180×180, the filled tile rendered from `app-icon.svg` | same exclusion, same curl |
| Magic-link email | a sign-in link sent by Supabase via Resend | The header row shows the mark (`<img>` 44×44 from `https://inflozo.com/brand/mark-light@2x.png`, `alt=""`) beside "Inflozo" in the template's existing system stack; `--check` reads both templates back byte-identical to the file | Gmail strips SVG, hence PNG; an image blocked by the client leaves the word, which is the whole name |
| Banner, plain sentence | `<Banner kind="info">One sentence</Banner>` | Icon centred on the first line (a 14px icon in an 18.75px line box: 2.4px above and below — today's `mt-px` was the hand-set guess for the same thing) | — |
| Banner, control row | the nudge: sentence + two 32px buttons | The nudge passes `rowHeight={32}` and wraps its sentence in a 32px-tall box; the icon's vertical centre and the sentence's are equal within 1px at 390 and 1440, wrapped or not | — |
| Banner, nudge failed | "Not now" refused | The caption appears on a second line; the icon stays on the first row's centre, not the block's | — |

</frozen-after-approval>

## Code Map

**The inventory — `grep -rnE "font-extrabold|>Inflozo<|'Inflozo'" apps/web --include='*.tsx'` and `grep -n Inflozo
supabase/auth/magic-link.html`, 2026-09-06.** Seven draws plus the watermark:

- `apps/web/components/shell/shell.tsx:135` -- `Wordmark({ size: 19 | 20 })`, a `next/link` to `/` with `ring`; used at :289 (sidebar header), :308 (390 top bar, size 19), :357 (drawer header). **Replace its body with `<Lockup size={size} href="/">`** and keep the name, the sizes and the ring — three call sites change nothing
- `apps/web/app/(app)/app/sign-in/sign-in-form.tsx:238` -- the card's wordmark `div`, 20px / `tablet:` 22px, `font-extrabold tracking-[-0.02em]` -- becomes `<Lockup size={20} className="tablet:…" />` (see Design Notes for the two-size pattern); S1a's type sizes are kept
- `apps/web/app/(app)/app/sign-in/page.tsx:58-61` -- **read-only**: the watermark. Stays byte-identical; the AC diffs it
- `apps/web/app/(app)/app/error.tsx:53` -- the 20px wordmark `span` -- becomes `<Lockup size={20} />` (no link: the page's own button is the way out)
- `apps/web/app/(marketing)/page.tsx` -- `<p>Inflozo</p>`, Story 1.1's placeholder until Epic 11 -- becomes a centred `<Lockup size={35.7} />` on paper; `metadata.title` "Inflozo"
- `supabase/auth/magic-link.html:41` -- the header `div` "Inflozo" -- becomes a table row: `<img src="https://inflozo.com/brand/mark-light@2x.png" width="44" height="44" alt="" style="display:block">` then the same word `div`; inline styles only. `tools/probe/configure-supabase-auth.py --apply` pushes it, `--check` proves it (spec 1.4's Verification is the pattern); `apps/web/app-routes.test.ts:62`'s `type=` scan is untouched by a header row
- `apps/web/components/kit/logo.tsx` (new, server-safe, no hooks) -- `Mark({ size, className })`: the `<svg viewBox="0 0 44 44">` and its three `<rect>`s copied verbatim from `assets/mark-light.svg`, `aria-hidden`, `<metadata>` dropped with the comment saying why. `Lockup({ size, href?, className? })`: `inline-flex items-center` with `gap: 0.28 × mark`, `Mark` at `1.221 × size`, the wordmark span `font-display font-extrabold tracking-[-0.035em] leading-none` at `size`, its *i* the export's span construction (`Inflozo Logo.html`, the horizontal lockups: `scaleY(0.809)`, `transform-origin:50% 82.86%`, tittle `0.16em` at `left:.12em; top:.13em`). The tittle is the identity's accent `#C2381F` — the mark's own core colour, not a chrome token, so it is written as the hex beside the mark's, the way `style-pack.ts` keeps pack colours out of the chrome tokens. With `href` it is a `next/link` wearing `ring` from `shell.tsx`; without, a `span`
- `apps/web/app/icon.svg` (new) -- `assets/favicon-16.svg`, byte-identical; Next's file convention emits the `<link>`. `apps/web/app/apple-icon.png` (new) -- `app-icon.svg` rendered at 180×180
- `apps/web/public/brand/` (new) -- `mark-light.svg`, `mark-dark.svg`, `mark-mono.svg`, `app-icon.svg`, `favicon-16.svg` byte-identical, plus `mark-light@2x.png` (88×88) for the email
- `apps/web/proxy.ts:84` -- the matcher `'/((?!_next/|favicon.ico).*)'`: on `app.inflozo.com` every other path is rewritten to `/app/…` (`routing.ts:41`), which would send `/icon.svg`, `/apple-icon.png` and `/brand/…` to a 404. **Extend the exclusion** to `_next/|favicon.ico|icon.svg|apple-icon.png|brand/`; `routing.test.ts` covers `route()`, so the control is the deployed curl
- `apps/web/components/kit/banner.tsx:40-45` -- `Banner`: the icon wrapper `<span className="mt-px shrink-0">` becomes `flex shrink-0 items-center` with height `rowHeight ?? 'calc(12.5px * 1.5)'` (the sentence's own line box — the frame's `margin-top:1px` was the same alignment by eye, `Editor Sidebar Kit.dc.html:238`); new optional prop `rowHeight?: number` (px), documented as the control-row exception the file's header already records
- `apps/web/app/(app)/app/(authed)/passkey-nudge.tsx:68-72` -- `<Banner kind="notice" rowHeight={32}>`, and the sentence span becomes `<span className="flex min-h-8 items-center">` so its line box is 32px whether or not the buttons wrap beside it; nothing else in the file moves
- `apps/web/app/layout.tsx` · `apps/web/app/(app)/app/layout.tsx` -- read-only: no `icons` metadata exists; the file convention supplies it. `apps/web/csp.ts:45` `img-src 'self' data: https:` already admits the PNG and the inline SVG
- `apps/web/app/(app)/app/(authed)/kit/page.tsx` -- **not touched** (ponytail: the gallery is for Kit controls; the lockup is seen on every page)
- `_bmad-output/planning-artifacts/design/claude-design-export/Logo/export/Inflozo Logo/` -- read-only: `README.txt` (the rules), `assets/` (the five SVGs), `Inflozo Logo.html` (the *i* construction and the three sizes the ratio was derived from)
- `_bmad-output/implementation-artifacts/deferred-work.md:706` -- DW-31, `status: open` → `done` with the story's Done commit, not before

## Tasks & Acceptance

**Execution:**
- [ ] `apps/web/public/brand/` + `apps/web/app/icon.svg` + `apps/web/app/apple-icon.png` -- copy the five SVGs byte-for-byte (`cmp` each), render the two PNGs with the headless Chromium (command in Design Notes) -- the marks are the export's, never redrawn
- [ ] `apps/web/proxy.ts` -- extend the matcher exclusion -- the app host must serve the icons and `/brand/` unrewritten
- [ ] `apps/web/components/kit/logo.tsx` -- `Mark` and `Lockup` -- one component, the README's ratios expressed once
- [ ] `apps/web/components/shell/shell.tsx` · `sign-in-form.tsx` · `error.tsx` · `(marketing)/page.tsx` -- substitute the lockup at the frame's type size, a one-line comment at each naming DW-31 as the departure -- every logo site from the grep
- [ ] `supabase/auth/magic-link.html` + `tools/probe/configure-supabase-auth.py --apply` then `--check` -- the mark beside the word; pushed and read back -- FR-P1's email carries the identity
- [ ] `apps/web/components/kit/banner.tsx` + `passkey-nudge.tsx` -- `rowHeight` and the 32px sentence box -- the icon level with its sentence
- [ ] Verification -- the grep, the diff of the watermark, the measured banner, axe, the curls, on the deployed site -- R-82

**Acceptance Criteria:**
- Given `grep -rnE "font-extrabold|>Inflozo<" apps/web --include='*.tsx'` after the change, when it runs, then every hit is either inside `components/kit/logo.tsx` or the watermark at `sign-in/page.tsx`, and `git diff` of that page's watermark line is empty.
- Given `/`, `/sign-in`, `/account`, the ☰ drawer and the error page at 1440, 834 and 390, when they render, then each **matches its frame** (S3a/S3b, S1a, S3 · mobile, S3 · mobile — menu open, the S3 extrapolation) **with the lockup where the frame draws the wordmark** — mark 1.221× the type size, gap 0.28× the mark, 800 weight, −0.035em — and nothing else moved (R-74; the owner's DW-31 ruling recorded beside each substitution).
- Given the lockup's mark, when its markup is diffed against `assets/mark-light.svg`, then the three `<rect>`s and the `viewBox` are byte-identical and only `<metadata>` is absent.
- Given `curl -sI https://app.inflozo.com/icon.svg`, `…/apple-icon.png`, `…/brand/mark-light@2x.png` and the same three on `https://inflozo.com`, when they run, then each is `200` with the right `content-type`, and the served `icon.svg` bytes equal `favicon-16.svg`.
- Given a magic link sent to a fixture address from the deployed site, when the email arrives, then its header shows the mark beside "Inflozo", and `configure-supabase-auth.py --check` reports both templates byte-identical to the file.
- Given the dashboard with the nudge at 390 and 1440, when the icon's and the sentence's bounding boxes are measured in a real Chromium, then their vertical centres differ by ≤1px in both widths, including with the sentence wrapped under the buttons at 390; given a plain one-line `Banner`, the icon's centre equals the line's centre within 1px (the control: the pre-change nudge measures >5px apart).
- Given every touched page at 1440, 834 and 390, when axe-core runs at `wcag2a · wcag2aa · wcag21a · wcag21aa`, then zero violations; the lockup's accessible name is "Inflozo" and the mark is not announced.
- Given `pnpm check`, `pnpm build` and `node --test`, when they run, then green; given a push to `main`, then CI's `check` and `rls` are green and `deploy` publishes.

## Spec Change Log

## Design Notes

**Why 1.221.** The README gives the mark as 1.85× the wordmark's *cap height* but never states Bricolage Grotesque
800's cap height. The export's own three horizontal lockups do: 43.6/35.7, 52.3/42.9 and 101.6/83.2 all give
1.221, so cap height is 0.66em and the mark is `1.221 × font-size`. Executed against the export, not asserted.

**The lockup, at 20px (the shell), as a golden example:**

```tsx
<Link href="/" className={`inline-flex items-center ${ring}`} style={{ gap: 24.4 * 0.28 }}>
  <Mark size={24.4} />           {/* 20 × 1.221 */}
  <span className="font-display font-extrabold leading-none tracking-[-0.035em] text-ink" style={{ fontSize: 20 }}>
    <span className="relative inline-block">
      <span className="inline-block origin-[50%_82.86%] scale-y-[0.809]">I</span>
      <span aria-hidden className="absolute left-[.12em] top-[.13em] size-[.16em] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#C2381F]" />
    </span>nflozo
  </span>
</Link>
```

The card's two sizes (20 → 22 at `tablet:`) cannot be one `style`, so `Lockup` takes `size` and an optional
`className`; the card renders the 20px lockup with `tablet:hidden` and the 22px one with `hidden tablet:inline-flex`
— two elements, the frame's two sizes, no CSS arithmetic (ponytail: a `calc()`-driven lockup if a third size appears).

**The rasters, made once, recorded here.** With `PATH` holding Node 24 and the machine's Playwright
(`/home/ghost/Dev/BMAD/inflozo/node_modules/.pnpm/playwright@1.61.1/node_modules/playwright`), open `file://…/assets/
mark-light.svg` in Chromium at `viewport 44×44, deviceScaleFactor 2`, `page.screenshot({ omitBackground: true })` →
`public/brand/mark-light@2x.png`; `app-icon.svg` at `viewport 180×180, deviceScaleFactor 1` → `app/apple-icon.png`.
A browser rendering the export's SVG is not a redraw; the two PNGs are derived artifacts and the command is their
provenance.

**The Banner's alignment, root cause.** `Banner` pins its icon to the top (`mt-px`) — right for a sentence, wrong
under a 32px control row whose sentence `items-center` puts at 16px. `rowHeight` lets the one caller that carries
controls (the owner's exception, `banner.tsx:8-12`) say so; the sentence's own `min-h-8` box makes the alignment
hold when the buttons wrap below it at 390. The default `calc(12.5px * 1.5)` is the sentence's line box, so a plain
banner's icon is centred on its first line — which is what `mt-px` was approximating.

**The email's word stays in the system stack.** Bricolage cannot be relied on in an inbox, so the lockup rule
(800, −0.035em) is met only where the font is; the email keeps its `Trebuchet MS` word at 800/−0.02em beside the
PNG mark, and the owner judges it in his inbox (spec 1.4: a transactional email is not a drawn surface).

**The animation is not used.** The epic allows it at most once, only where the owner asks; he has not, so nothing
animates and the CSS from `Inflozo Logo.html` is not copied. Question 1 is where he says.

## Verification

**Commands** (R-82 — the deployed site, both domains):
- `grep -rnE "font-extrabold|>Inflozo<" apps/web --include='*.tsx'` -- expected: hits only in `components/kit/logo.tsx` and `sign-in/page.tsx:60`
- `git diff HEAD~N -- "apps/web/app/(app)/app/sign-in/page.tsx" | grep content:` -- expected: empty (the watermark line unchanged)
- `for f in mark-light mark-dark mark-mono app-icon favicon-16; do cmp "…/assets/$f.svg" apps/web/public/brand/$f.svg; done; cmp "…/assets/favicon-16.svg" apps/web/app/icon.svg` -- expected: silent
- `pnpm check && pnpm build && (cd apps/web && node --test '*.test.ts')` -- expected: green
- `for u in app.inflozo.com inflozo.com; do for p in icon.svg apple-icon.png brand/mark-light@2x.png; do curl -sI https://$u/$p | head -1; done; done` -- expected: six `200`s; `curl -s https://app.inflozo.com/icon.svg | cmp - "…/assets/favicon-16.svg"` silent
- `env $(grep '^SUPABASE_' tools/probe/.env | xargs) python3 tools/probe/configure-supabase-auth.py --apply && … --check` -- expected: PASS, both templates byte-identical to `supabase/auth/magic-link.html`
- A Playwright script (the 2.1 review's pattern: real Chromium, the fixture user signed in, `passkey_nudge_done_at` cleared by the admin API first) measuring `getBoundingClientRect()` of the banner's icon `span` and the sentence `span` at 390 and 1440 -- expected: `|iconCenterY − textCenterY| ≤ 1` at both; the pre-change build measured first as the failing control
- axe-core 4.12.1 on `/sign-in`, `/`, `/account`, `/` with the drawer open, the error page (throw from a test render), `inflozo.com/`, at 1440, 834 and 390 -- expected: zero violations at `wcag2a · wcag2aa · wcag21a · wcag21aa`
- A magic link sent to the fixture address from `https://app.inflozo.com/sign-in` -- expected: the email in the fixture inbox shows the mark beside "Inflozo"; note the Resend message id

**Manual checks:**
- The owner's test below, on both his Mac and his phone.

## Questions for the owner

**1. Where, if anywhere, should the launch animation play?** The logo export includes a 2.9-second animation (the
mark lands and springs back, the red core releases a dot that flies across and knocks the capital I down to a
lowercase i). Your epic says it may play at most once in the whole product, and only where you ask. Example: on
the marketing home page, the logo at the top plays it once when the page loads, then sits still; everywhere else
the logo is simply drawn.

1. **Nowhere for now (RECOMMENDED).** Every logo is drawn still. The animation is kept for the marketing site
   (Epic 11), where a first impression is the point, and that story asks you again. Nothing else in the app
   animates because of this story.
2. **On the Sign In page**, once, when the page loads. Every visitor sees it every time they sign in.
3. **On the marketing home page now**, in the placeholder that stands there until Epic 11 builds the real one.

Ruled: option 1 — nowhere for now (owner, 2026-09-06). Nothing animates in this story; the animation waits for Epic 11.

## Owner's manual test

Before you start, the Deploy run will have cleared your account's "not now" answer to the passkey line, so the
yellow line shows again for step 5.

1. **URL:** https://app.inflozo.com/sign-in · **Screen:** Sign In · **Do:** look at the card and the browser tab ·
   **See:** at the top of the card, the Nest mark — three nested rounded squares with a red centre — sits beside the
   word "Inflozo". The huge faded "Inflozo" behind the card is unchanged. The tab shows the small mark as its icon.
2. **URL:** https://app.inflozo.com/ · **Screen:** Dashboard (Mac) · **Do:** sign in with a magic link · **See:**
   the same mark-and-word at the top of the left sidebar. Click it: it takes you to the dashboard.
3. **Your inbox** · **Screen:** the "Your Inflozo sign-in link" email from step 2 · **Do:** open it · **See:** the
   mark beside "Inflozo" at the top of the email, above "Sign in to Inflozo".
4. **URL:** https://app.inflozo.com/ on your phone · **Screen:** Dashboard (phone) · **Do:** look at the top bar,
   then tap ☰ · **See:** the mark-and-word in the top bar and again at the top of the menu; nothing is cut off and
   the page does not scroll sideways.
5. **URL:** https://app.inflozo.com/ · **Screen:** Dashboard · **Do:** look at the yellow line "Sign in faster next
   time — add a passkey." · **See:** the small triangle icon sits level with that sentence, centred on it, not above
   it. Press **Not now** so the line goes away again.
6. **Your phone** · **Do:** in Safari (iPhone) share → "Add to Home Screen", or in Chrome (Android) ⋮ → "Add to Home
   screen", for https://app.inflozo.com/ · **See:** the home-screen tile is the filled Nest icon, not a letter or a
   blank square. You can delete the tile afterwards.
7. **URL:** https://inflozo.com/ · **Screen:** the marketing placeholder · **Do:** open it · **See:** the mark and
   the word, centred on the page, and the same tab icon. The error page with the new logo only shows when something
   breaks, so the review checks it, not you.
