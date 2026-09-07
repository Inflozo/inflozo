---
title: 'Story 1.6 — The new identity everywhere'
type: 'feature'
created: '2026-09-06'
status: 'in-review'
review_loop_iteration: 2
baseline_commit: '039fe1fe8631f2f10ac32b001247cd51df0c1993'
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
  (Owner, 2026-09-07, question 3: `app/icon.svg` is `favicon-16.svg` plus one `<style>` that swaps to the export's
  Dark-section colours under `prefers-color-scheme: dark`; geometry untouched, `identity.test.ts` holds it.)
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
| Magic-link email | a sign-in link sent by Supabase via Resend | The header row shows the mark (`<img>` 27×27 with an 8px gap — the README's ratio at 22px type; owner, 2026-09-07, question 2, superseding the 44×44 first written here — from `https://inflozo.com/brand/mark-light@2x.png`, `alt=""`) beside "Inflozo" in the template's existing system stack; `--check` reads both templates back byte-identical to the file | Gmail strips SVG, hence PNG; an image blocked by the client leaves the word, which is the whole name |
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
- `supabase/auth/magic-link.html:41` -- the header `div` "Inflozo" -- becomes a table row: `<img src="https://inflozo.com/brand/mark-light@2x.png" width="27" height="27" alt="" style="display:block">` (27 = 1.221 × 22, gap 8 = 0.28 × 27; owner's ruling on question 2) then the same word `div`; inline styles only. `tools/probe/configure-supabase-auth.py --apply` pushes it, `--check` proves it (spec 1.4's Verification is the pattern); `apps/web/app-routes.test.ts:62`'s `type=` scan is untouched by a header row
- `apps/web/components/kit/logo.tsx` (new, server-safe, no hooks) -- `Mark({ size, className })`: the `<svg viewBox="0 0 44 44">` and its three `<rect>`s copied verbatim from `assets/mark-light.svg`, `aria-hidden`, `<metadata>` dropped with the comment saying why. `Lockup({ size, href?, className? })`: `inline-flex items-center` with `gap: 0.28 × mark`, `Mark` at `1.221 × size`, the wordmark span `font-display font-extrabold tracking-[-0.035em] leading-none` at `size`, its *i* the export's span construction (`Inflozo Logo.html`, the horizontal lockups: `scaleY(0.809)`, `transform-origin:50% 82.86%`, tittle `0.16em` at `left:.12em; top:.13em`). The tittle is the identity's accent `#C2381F` — the mark's own core colour, not a chrome token, so it is written as the hex beside the mark's, the way `style-pack.ts` keeps pack colours out of the chrome tokens. With `href` it is a `next/link` wearing `ring` from `shell.tsx`; without, a `span`
- `apps/web/app/icon.svg` (new) -- `assets/favicon-16.svg` plus one `<style>` for dark tab strips (question 3); Next's file convention emits the `<link>`. `apps/web/app/apple-icon.png` (new) -- `app-icon.svg` rendered at 180×180
- `apps/web/public/brand/` (new) -- `mark-light.svg`, `mark-dark.svg`, `mark-mono.svg`, `app-icon.svg`, `favicon-16.svg` byte-identical, plus `mark-light@2x.png` (88×88) for the email
- `apps/web/proxy.ts:84` -- the matcher `'/((?!_next/|favicon.ico).*)'`: on `app.inflozo.com` every other path is rewritten to `/app/…` (`routing.ts:41`), which would send `/icon.svg`, `/apple-icon.png` and `/brand/…` to a 404. **Extend the exclusion** to `_next/|favicon.ico|icon.svg|apple-icon.png|brand/`; `routing.test.ts` covers `route()`, so the control is the deployed curl
- `apps/web/components/kit/banner.tsx:40-45` -- `Banner`: the icon wrapper `<span className="mt-px shrink-0">` becomes `flex shrink-0 items-center` with height `rowHeight ?? '1lh'` (the sentence's own line box, its type on the row since Change Log 4 — the frame's `margin-top:1px` was the same alignment by eye, `Editor Sidebar Kit.dc.html:238`); new optional prop `rowHeight?: number` (px), documented as the control-row exception the file's header already records
- `apps/web/app/(app)/app/(authed)/passkey-nudge.tsx:68-72` -- `<Banner kind="notice" rowHeight={32}>`, and the sentence span becomes `<span className="flex items-center" style={{ minHeight: ROW }}>` (`ROW = 32`, Change Log 5) so its line box is 32px whether or not the buttons wrap beside it; nothing else in the file moves
- `apps/web/app/layout.tsx` · `apps/web/app/(app)/app/layout.tsx` -- read-only: no `icons` metadata exists; the file convention supplies it. `apps/web/csp.ts:45` `img-src 'self' data: https:` already admits the PNG and the inline SVG
- `apps/web/app/(app)/app/(authed)/kit/page.tsx` -- **not touched** (ponytail: the gallery is for Kit controls; the lockup is seen on every page)
- `_bmad-output/planning-artifacts/design/claude-design-export/Logo/export/Inflozo Logo/` -- read-only: `README.txt` (the rules), `assets/` (the five SVGs), `Inflozo Logo.html` (the *i* construction and the three sizes the ratio was derived from)
- `_bmad-output/implementation-artifacts/deferred-work.md:706` -- DW-31, `status: open` → `done` with the story's Done commit, not before

## Tasks & Acceptance

**Execution:**
- [x] `apps/web/public/brand/` + `apps/web/app/icon.svg` + `apps/web/app/apple-icon.png` -- copy the five SVGs byte-for-byte (`cmp` each), render the two PNGs with the headless Chromium (command in Design Notes) -- the marks are the export's, never redrawn
- [x] `apps/web/proxy.ts` -- extend the matcher exclusion -- the app host must serve the icons and `/brand/` unrewritten
- [x] `apps/web/components/kit/logo.tsx` -- `Mark` and `Lockup` -- one component, the README's ratios expressed once
- [x] `apps/web/components/shell/shell.tsx` · `sign-in-form.tsx` · `error.tsx` · `(marketing)/page.tsx` -- substitute the lockup at the frame's type size, a one-line comment at each naming DW-31 as the departure -- every logo site from the grep
- [x] `supabase/auth/magic-link.html` + `tools/probe/configure-supabase-auth.py --apply` then `--check` -- the mark beside the word; pushed and read back -- FR-P1's email carries the identity
- [x] `apps/web/components/kit/banner.tsx` + `passkey-nudge.tsx` -- `rowHeight` and the 32px sentence box -- the icon level with its sentence
- [x] Verification -- the grep, the diff of the watermark, the measured banner, axe, the curls, on the deployed site -- R-82

**Acceptance Criteria:**
- Given `grep -rnE ">\s*Inflozo\s*<" apps/web --include='*.tsx'` after the change (the rule it enforces is the frozen constraint — *the only literal display-weight "Inflozo" left is the watermark*; `font-extrabold` alone also matches the Kit page's type specimen and `<h1>`, Spec Change Log 3), when it runs, then every hit is inside `components/kit/logo.tsx`, the watermark at `sign-in/page.tsx` is CSS `content` and not a text node, and `git diff` of that page's watermark line is empty; `identity.test.ts` runs the same scan on every `pnpm check`.
- Given `/`, `/sign-in`, `/account`, the ☰ drawer and the error page at 1440, 834 and 390, when they render, then each **matches its frame** (S3a/S3b, S1a, S3 · mobile, S3 · mobile — menu open, the S3 extrapolation) **with the lockup where the frame draws the wordmark** — mark 1.221× the type size, gap 0.28× the mark, 800 weight, −0.035em — and nothing else moved (R-74; the owner's DW-31 ruling recorded beside each substitution).
- Given the lockup's mark, when its markup is diffed against `assets/mark-light.svg`, then the three `<rect>`s and the `viewBox` are byte-identical and only `<metadata>` is absent.
- Given `curl -sI https://app.inflozo.com/icon.svg`, `…/apple-icon.png`, `…/brand/mark-light@2x.png` and the same three on `https://inflozo.com`, when they run, then each is `200` with the right `content-type`, and the served `icon.svg` bytes equal `favicon-16.svg`.
- Given a magic link sent to a fixture address from the deployed site, when the email arrives, then its header shows the mark beside "Inflozo", and `configure-supabase-auth.py --check` reports both templates byte-identical to the file.
- Given the dashboard with the nudge at 390 and 1440, when the icon's and the sentence's bounding boxes are measured in a real Chromium, then their vertical centres differ by ≤1px in both widths, including with the sentence wrapped under the buttons at 390; given a plain one-line `Banner`, the icon's centre equals the line's centre within 1px (the control: the pre-change nudge measures >5px apart).
- Given every touched page at 1440, 834 and 390, when axe-core runs at `wcag2a · wcag2aa · wcag21a · wcag21aa`, then zero violations; the lockup's accessible name is "Inflozo" and the mark is not announced.
- Given `pnpm check`, `pnpm build` and `node --test`, when they run, then green; given a push to `main`, then CI's `check` and `rls` are green and `deploy` publishes.

### Review Findings

Code review of 2026-09-06 — five layers (Blind Hunter, Edge Case Hunter, Verification Gap, Acceptance
Auditor, Real-infra verifier), the last against the live project; 16 findings dismissed as noise. Every
patch below is applied; the run that proves them is `## Verification` → *The review's run*.

- [x] [Review][Decision] The email draws the mark at 44px beside 22px type — twice the README's lockup ratio (≈27px) that the spec's "Always" binds every other surface to; the spec's own Code Map prescribed 44, so Dev followed it and the contradiction is inside the spec → **Ruled (owner, 2026-09-07): option 1, the ratio** — 27×27 with an 8px gap, pushed to both templates and read back [supabase/auth/magic-link.html:51]
- [x] [Review][Decision] The favicon is ink on transparent, so on a dark browser tab strip it all but vanishes; the export ships no dark favicon cut and the SVG cannot carry a media query without breaking its byte-identity → **Ruled (owner, 2026-09-07): use the export's own Dark section** — `icon.svg` keeps the export's geometry byte for byte and gains one `<style>` that swaps to the Dark section's ink and core under `prefers-color-scheme: dark`; measured in Chromium [apps/web/app/icon.svg]
- [x] [Review][Patch] The proxy matcher had no test — mistype `icon.svg` and every gate stays green while the app host 404s its favicon; `routing.test.ts` now reads the literal back and runs it, the excluded files derived from `app/` and `public/brand/` [apps/web/routing.test.ts · apps/web/proxy.ts:84]
- [x] [Review][Patch] Nothing tied the email's `https://inflozo.com/brand/mark-light@2x.png` to a file under `public/` (`alt=""` hides a missing one as a blank cell) [apps/web/app-routes.test.ts]
- [x] [Review][Patch] `tokens.test.ts` exempts the whole of `logo.tsx`, so the tittle's hex was pinned by nothing and the mark's `#1C1B1A` could drift from `--color-ink`; both are now read from the export's own rects [apps/web/identity.test.ts]
- [x] [Review][Patch] The mark check was value-by-value, so two rects swapping attributes or a fourth rect passed; it is rect-by-rect with a count, and asserts it compared something [apps/web/identity.test.ts]
- [x] [Review][Patch] The two rasters had no check at all; their IHDR sizes are asserted (88×88, 180×180) [apps/web/identity.test.ts]
- [x] [Review][Patch] `Banner` restated the sentence's type (`calc(12.5px * 1.5)`) beside `text-[12.5px] leading-[1.5]`; the type sits once on the row and the icon box is `1lh` — measured identical [apps/web/components/kit/banner.tsx:56]
- [x] [Review][Patch] The nudge wrote 32 four times (`rowHeight`, `min-h-8`, two buttons); one `ROW` constant [apps/web/app/(app)/app/(authed)/passkey-nudge.tsx:35]
- [x] [Review][Patch] `Mark` set `display:block; flex-shrink:0` inline beside a `className` in a file whose siblings use the utilities [apps/web/components/kit/logo.tsx:38]
- [x] [Review][Patch] The marketing page's comment called 35.7px "the export's STACKED lockup" while drawing the horizontal one — the stacked card is mark-above-word [apps/web/app/(marketing)/page.tsx:11]
- [x] [Review][Patch] AC 1's grep matched the Kit page's type specimen and `<h1>` (Change Log 3 said so but the AC was left reading as failing); Design Notes still prescribed the `hidden tablet:inline-flex` pattern Change Log 1 replaced; the Verification "owed" list was stale the moment CI deployed the Dev push [this spec]
- [x] [Review][Defer] The error page's lockup has never been rendered — verified by code and `pnpm build` only; the runner cannot test a `.tsx` boundary and a throwing route is a route change the story forbids [apps/web/app/(app)/app/error.tsx:54] — deferred, DW-34
- [x] [Review][Defer] Safari before 26 draws no SVG favicon at all (caniuse `link-icon-svg`: "3.1 – 18.7 not supported", support from 26.0); there is no PNG or `.ico` fallback [apps/web/app/icon.svg] — deferred, DW-35

## Spec Change Log

1. **The card's two sizes are two media-query variants, not one** (Dev, 2026-09-06). The Code Map
   prescribed `tablet:hidden` on the 20px lockup and `hidden tablet:inline-flex` on the 22px one.
   Measured at 390 in real Chromium, **both drew**: the bare `hidden` and the `inline-flex`
   `Lockup` sets on itself are the same unprefixed display utility, so the later one in the sheet
   wins. The 22px one now carries `max-tablet:hidden`, so each side is a media query and each beats
   the component's own display. Re-measured: exactly one lockup visible at 390, 834 and 1440.
2. **`tokens.test.ts`'s colour exemption is now two named files** (Dev, 2026-09-06). The test allows
   a colour literal in exactly one named file, and the identity's ink and accent core are the second
   such vocabulary — the Code Map said so ("the way `style-pack.ts` keeps pack colours out of the
   chrome tokens") but nothing had widened the guard. `components/kit/logo.tsx` is named beside
   `lib/style-pack.ts`, each still asserted to exist so an exemption cannot outlive its file.
3. **The acceptance grep is broader than the rule it enforces** (Dev, 2026-09-06). Run after the
   change, `grep -rnE "font-extrabold|>Inflozo<"` returns two hits the AC does not name:
   `kit/page.tsx:126` (the type specimen, the words "Bricolage Grotesque — display") and
   `kit/page.tsx:166` (the page's own `<h1>`, "Editor sidebar kit"). Neither is a wordmark, and the
   Code Map rules `/kit` untouched. The frozen constraint — *the only literal display-weight
   "Inflozo" left in `apps/web` is the Sign In watermark* — holds exactly, and is now a test
   (`identity.test.ts`) rather than a grep run once.
4. **The Banner's sentence type lives on the row** (Review, 2026-09-06). The Code Map put the default
   icon-box height as `calc(12.5px * 1.5)` beside a sentence span carrying `text-[12.5px] leading-[1.5]`
   — one fact in two places. The type is on the banner's row now and the box is `1lh`; measured in
   Chromium the box is the same 18.75px and the icon-to-line offset is unchanged (0.38px).
5. **The nudge's row height is one constant** (Review, 2026-09-06). `rowHeight`, the sentence's
   `min-h`, and both buttons read `ROW = 32` instead of restating it.
6. **The email mark follows the README's ratio** (owner, 2026-09-07, question 2). The frozen matrix's
   44×44 `<img>` was twice the ratio every other surface obeys; it is 27×27 (1.221 × 22px) with an
   8px gap (0.28 × 27). The 88px PNG still covers 2× at that size. Pushed with `--apply`, read back
   with `--check`: both templates 5542 chars, byte-identical to the file.
7. **The favicon carries the export's dark treatment** (owner, 2026-09-07, question 3). He pointed at
   the export's *Dark* section — the mark on a dark surface in the README's dark colours — rather than
   at either option offered. `app/icon.svg` is `favicon-16.svg` byte for byte plus one `<style>`:
   under `prefers-color-scheme: dark` the boundary's stroke becomes the Dark section's ink and the
   core its accent, both read from `mark-dark.svg` by the test, never typed. Colour is not geometry,
   so the README's dash rhythm is untouched; `public/brand/favicon-16.svg` stays the unmodified file.

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
`className`; the card renders the 20px lockup with `tablet:hidden` and the 22px one with `max-tablet:hidden` (both
media-query variants — Spec Change Log 1 records why a bare `hidden` lost to the component's own `inline-flex`)
— two elements, the frame's two sizes, no CSS arithmetic (ponytail: a `calc()`-driven lockup if a third size appears).

**The rasters, made once, recorded here.** With `PATH` holding Node 24 and the machine's Playwright
(`/home/ghost/Dev/BMAD/inflozo/node_modules/.pnpm/playwright@1.61.1/node_modules/playwright`), open `file://…/assets/
mark-light.svg` in Chromium at `viewport 44×44, deviceScaleFactor 2`, `page.screenshot({ omitBackground: true })` →
`public/brand/mark-light@2x.png`; `app-icon.svg` at `viewport 180×180, deviceScaleFactor 1` → `app/apple-icon.png`.
A browser rendering the export's SVG is not a redraw; the two PNGs are derived artifacts and the command is their
provenance.

**The Banner's alignment, root cause.** `Banner` pins its icon to the top (`mt-px`) — right for a sentence, wrong
under a 32px control row whose sentence `items-center` puts at 16px. `rowHeight` lets the one caller that carries
controls (the owner's exception, `banner.tsx:8-12`) say so; the sentence's own `minHeight: ROW` box makes the alignment
hold when the buttons wrap below it at 390. The default is `1lh` of the row's type — the sentence's line box, set once
(Change Log 4) — so a plain banner's icon is centred on its first line, which is what `mt-px` was approximating.

**The email's word stays in the system stack.** Bricolage cannot be relied on in an inbox, so the lockup rule
(800, −0.035em) is met only where the font is; the email keeps its `Trebuchet MS` word at 800/−0.02em beside the
PNG mark, and the owner judges it in his inbox (spec 1.4: a transactional email is not a drawn surface).

**The animation is not used.** The epic allows it at most once, only where the owner asks; he has not, so nothing
animates and the CSS from `Inflozo Logo.html` is not copied. Question 1 is where he says.

## Verification

**R-82 — the real services this story hit, by the variable name of the key used, never its value.**
Every browser measurement is real Chromium (`~/.cache/ms-playwright/chromium-1228`) driving a real
`next build` + `next start` production build served with `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`
and `SUPABASE_SECRET_KEY` in its environment — the real project, not a mock. The deployed-domain
curls and the email in the inbox are the Deploy phase's, and are listed as still owed at the end.

**Supabase — Management API** (`SUPABASE_ACCESS_TOKEN`), `PATCH`/`GET /v1/projects/{ref}/config/auth`:
- `configure-supabase-auth.py --check` **before** the push, as the control: **`FAIL` on exactly
  `mailer_templates_magic_link_content` and `mailer_templates_confirmation_content`**, every other
  field `PASS`. A control that reports the two things that changed and nothing else.
- `--apply`: `PATCH 402` on `sessions_inactivity_timeout` (not on this plan, stated not swallowed),
  retried without it → **`PATCH 200`, 22 fields written**, then **`GET 200` and every field `PASS`**,
  both templates **5284 chars, byte-identical to `supabase/auth/magic-link.html`**.
- Read back independently: both live templates carry
  `<img src="https://inflozo.com/brand/mark-light@2x.png" width="44" height="44" alt="">`.

**Supabase — GoTrue admin API** (`SUPABASE_SECRET_KEY`), for every signed-in measurement:
- `POST /auth/v1/admin/generate_link` → **HTTP 200**, `verification_type: signup`, redeemed at
  `/app/auth/confirm?token_hash=…&type=email` in the browser, landing signed in.
- **Every fixture user was deleted in a `finally`: `DELETE /auth/v1/admin/users/{id}` → HTTP 200**,
  on all four runs (two measurement passes, one control pass, one screenshot pass).

**The banner's alignment — the icon GLYPH, not its wrapper.** The first pass measured the wrapper
`<span>` and produced a convincing wrong answer: before the change that span is a flex child with no
height and no `align-self`, so it **stretches to the row** and its box centre reads *correct* while
the 14px icon inside sits flush against the top. Measuring the `<svg>` is the only honest reading,
and every number below is the `<svg>`.

| | icon vs sentence, 1440 | icon vs sentence, 390 | plain banner, first line |
|---|---|---|---|
| **before** (HEAD `039fe1fe`, rebuilt and re-served) | **8.00px** | 1.38px | 0.50px |
| **after** | **0.00px** | **0.00px** | 0.88px |

- The failing control is the owner's bug itself: **8.00px apart at 1440** before the change, which is
  the ">5px" the spec predicted. At 390 the buttons already wrapped, so the sentence sat on its own
  row and the gap was 1.38px — the defect is a 1440 symptom, and both widths are now 0.00px.
- The plain banner is **0.88px** after against `mt-px`'s 0.50px: both inside the ≤1px the AC asks,
  and the new default is one rule (`rowHeight ?? the sentence's line box`) where the old was a
  hand-set guess. Recorded because it is a 0.38px move, not an improvement.
- No horizontal scroll at 390, before or after.
- **The refusal row** (matrix row "Banner, nudge failed"), proved by fulfilling the dismissal's own
  POST with a 500 so the component takes its `setFailed` path: the caption appears on a second line,
  and the icon is **0.00px from the sentence's centre at both 1440 and 390** while sitting
  **12.25px (1440) and 40.50px (390) from the centre of the whole block** — on the first row, not on
  the block, which is what the row asks for.

**The lockup, measured where each frame draws it** — `mark ÷ font-size` against the README's 1.221,
`gap ÷ mark` against its 0.28:

| surface | font | mark | ratio | gap | ratio | weight | tracking |
|---|---|---|---|---|---|---|---|
| sidebar, 1440 | 20px | 24.41 | 1.2203 | 6.8376 | 0.2801 | 800 | −0.7px (= −0.035em) |
| top bar, 390 | 19px | 23.19 | 1.2205 | 6.4957 | 0.2801 | 800 | −0.665em-equivalent |
| ☰ drawer, 390 | 20px | 24.41 | 1.2203 | — | — | 800 | — |
| Sign In card, 390 | 20px | 24.41 | 1.2203 | 6.8376 | 0.2801 | 800 | −0.7px |
| Sign In card, 834 · 1440 | 22px | 26.86 | 1.2209 | 7.5214 | 0.2800 | 800 | −0.77px |
| marketing, 390 · 834 · 1440 | 35.7px | 43.58 | 1.2207 | 12.2051 | 0.2801 | 800 | −1.2495px |

- The face is `"Bricolage Grotesque"` at every one; the accessible name of the shell's lockup is
  **"Inflozo"** and the mark is `aria-hidden`, so it is not announced.
- **Exactly one lockup is visible at each width on the Sign In card** (390: the 20px, 22px
  `offsetParent === null`; 834 and 1440: the reverse). This is what Spec Change Log 1 fixed.
- The 1.221 itself was re-derived from the export before anything was written: the six horizontal
  lockups in `Inflozo Logo.html` give 101.6/83.2, 52.3/42.9, 43.6/35.7, 29.0/23.8, 75.5/61.9 and
  34.6/28.3 — **1.2185 to 1.2226**. Executed against the export, not asserted.

**The watermark is untouched.** `git diff -- "apps/web/app/(app)/app/sign-in/page.tsx"` is **empty**,
and measured in the browser it is still `content: "Inflozo"`, 130px at 390 / 380px at 834 and 1440,
tracking −6.5px / −19px, `rgb(239, 236, 231)`. The first tab stop on Sign In is the email `INPUT`,
not the card's lockup — it is a `span`, so the card gained no new focus stop.

**The marks are the export's bytes.** `cmp` silent for all five SVGs into `public/brand/` and for
`app/icon.svg` against `favicon-16.svg`. Served locally, `GET /icon.svg` is **200 `image/svg+xml`**
and its body `cmp`s silent against `assets/favicon-16.svg`; `/apple-icon.png` **200 `image/png`**;
`/brand/mark-light@2x.png` **200 `image/png`**. Next's file convention emits
`<link rel="icon" href="/icon.svg?…" sizes="any" type="image/svg+xml">` and
`<link rel="apple-touch-icon" href="/apple-icon.png?…" sizes="180x180" type="image/png">`.
The two rasters are 88×88 and 180×180, rendered from the export's own SVGs by the headless Chromium
in Design Notes and read back as images to confirm they draw the mark and the filled tile.

**axe-core 4.12.1, `wcag2a · wcag2aa · wcag21a · wcag21aa` — zero violations on all sixteen:**
the dashboard with the nudge shown, `/kit` and `/account` signed in, `/sign-in` signed out and the
marketing placeholder, each at **1440, 834 and 390**, plus the ☰ drawer open at 390.
(The first pass ran `/sign-in` inside the signed-in context, where it redirects — those three rows
measured the marketing page. Re-run in a context with no cookies at all; the table above is that run.)

**`identity.test.ts` — the acceptance grep made permanent, each guard proved by its own control:**
- every SVG the export ships is byte-identical in `public/brand/`, and `app/icon.svg` is
  `favicon-16.svg` — red only when a byte is appended to `public/brand/mark-mono.svg`;
- the inlined mark carries the export's `viewBox` and every attribute of every `<rect>` — red only
  when `rx="5.51"` becomes `rx="5.5"` (the README: a re-radius breaks the dash rhythm);
- no `.tsx` but the lockup draws the word — red only when a surface types `<span>Inflozo</span>`.
Each control turned exactly its own test red and the other two stayed green; all three green again
once restored.

**The gates:** `pnpm check` **exit 0** (lint, typecheck, and 104 tests across the four packages,
`fail 0`), `pnpm build` **exit 0** with `/icon.svg` and `/apple-icon.png` in the route table.

**Not executed in the Dev phase** (and what became of each at Review, below): the six deployed-domain
curls; the magic-link email seen in an inbox; **the error page, which was not rendered** — two attempts
to trip the boundary from outside failed (the client navigation's RSC fetch fulfilled with a `500`, and
with a `200` carrying a body that is not valid flight; Next recovered from both and stayed on `/app`), so
`error.tsx`'s lockup is verified by code — `<Lockup size={20} />`, the same node measured at 24.41px in
the sidebar — and by `pnpm build`, not by a rendered page.

### The review's run (2026-09-06, R-82)

The Real-infra verifier re-executed the claims above against the live project, by the key's variable
name, and the review's own patches were gated the same way:

- **Supabase Management API** (`SUPABASE_ACCESS_TOKEN`): `configure-supabase-auth.py --check` → `GET 200`,
  every field `PASS`, both templates 5284 chars; read back independently, both carry the `<img>` and are
  byte-identical to the file. **Negative control:** `--check --expect mailer_otp_exp=901` → `FAIL … (live:
  900)`, exit 1 — the checker can tell a miss from a pass.
- **The six deployed-domain curls already hold** — the Dev push deployed through CI (DW-7), so the story
  is live: `app.inflozo.com` and `inflozo.com` × `/icon.svg` (`image/svg+xml`), `/apple-icon.png`
  (`image/png`), `/brand/mark-light@2x.png` (`image/png`) all **200**, and each body `cmp`s silent
  against the file in the repo on both hosts. **Negative control for the matcher:** with no cookies,
  `app.inflozo.com/kit` and `/account` → `307 → /sign-in` (the proxy still guards app paths) while
  `/icon.svg` and `/brand/mark-light@2x.png` → 200 with no redirect (excluded). Both deployed pages carry
  Next's `<link rel="icon" … type="image/svg+xml">` and `<link rel="apple-touch-icon" … 180x180>`.
- **The email's prerequisite is met** — the PNG the template names now returns 200 with the right bytes —
  so the mark drawn in a real inbox is the owner's test step 3, as planned; no review can see his inbox.
- **The marks are the export's bytes** (`cmp` silent, five SVGs and `app/icon.svg`), the rasters are
  180×180 and 88×88 (`file`), `identity.test.ts` green on Node 24. Ghost T1/T3 untouched — the story has
  no Ghost surface. DNS healthy throughout (`dig @1.1.1.1`).
- **The review's four new guards, each proved by its own control** (mutate → exactly that test red →
  restore → green): `routing.test.ts` reads the proxy's matcher literal back and runs it — red when
  `icon.svg|` is dropped from the matcher; `app-routes.test.ts` ties every `inflozo.com` image in the
  template to a file under `public/` — red when the PNG is moved; `identity.test.ts` compares the mark
  rect by rect (not value by value) — red when two rects swap `rx`; and pins the tittle to the core's
  fill and `--color-ink` to the boundary's stroke — red when the tittle's hex is off by one; plus the two
  PNGs' IHDR sizes.
- **The Banner's one CSS change, measured in real Chromium** (`chromium-1228`): the icon box at `1lh` of
  the row's 12.5px × 1.5 computes to **18.75px**, and the icon-to-first-line offset is **0.38px both
  before (`calc(12.5px * 1.5)` on the box) and after** — the same number, so the Dev-phase measurements
  above stand unchanged. The nudge's `ROW` constant changes no value (32 everywhere it was 32).
- **The gates:** `pnpm check` exit 0 (typecheck, lint, 108 tests in `apps/web`, `fail 0`), `pnpm build`
  exit 0 with `/icon.svg` and `/apple-icon.png` in the route table.
- **The second loop (2026-09-07), after the owner's two rulings.** Supabase Management API
  (`SUPABASE_ACCESS_TOKEN`): `--apply` → `PATCH 200` (the plan's `sessions_inactivity_timeout` refusal
  stated, as before), `--check` → `GET 200`, every field `PASS`, both templates **5542 chars, byte-identical**
  to the resized file. The favicon rendered as an `<img>` in real Chromium — a separate SVG document,
  as a tab strip loads it — and sampled: **light** stroke `rgb(28,27,26)` = `#1C1B1A`, core
  `rgb(194,56,31)` = `#C2381F`; **dark** (`colorScheme: 'dark'`) stroke `rgb(247,245,242)` = `#F7F5F2`,
  core `rgb(255,89,65)` = `#FF5941` — the Dark section's colours, the export's geometry. Controls for
  the new guard: the dark core off by one hex → red; `rx="5.4"` → `"5.5"` → red; restored → green.
  That an SVG favicon honours `prefers-color-scheme` in the tab strip itself is the documented
  technique and is executed here only as an `<img>`; the owner's test step 1 is the tab.
- **Still without a rendered page: the error page.** The review could not add a `node --test` for a
  `.tsx` boundary (the runner strips types, not JSX), and adding a route that throws is a route change
  the story's Never forbids. Deferred as DW-34; the owner's test step 7 says the review checks it, and the
  honest reading is that it is checked by code and build only.

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

**2. How big should the mark be in the sign-in email?** Everywhere in the app the mark and the word follow the logo's
rule: the mark is about 1.2 times the word's letter size, with a small gap. Example: in the sidebar the word is 20px
tall and the mark is 24px. In the email the word is 22px, so the rule would give a 27px mark — but the email as built
draws it at 44px, nearly twice the word, with a 12px gap. The spec asked for 44 and the code did what it asked, so this
is a choice, not a bug. You can see the difference in your inbox at test step 3.

1. **Follow the logo's rule (RECOMMENDED).** The email mark becomes 27px with an 8px gap, the same proportion as every
   other place the logo appears. The image file already has enough pixels to look sharp at that size.
2. **Keep 44px.** The email keeps the bigger mark as a header icon above the word, like a small app icon. The spec is
   amended to say the email is the one deliberate exception to the rule.

Ruled: option 1 — follow the logo's rule (owner, 2026-09-07). The email mark is 27px with an 8px gap; live in both
templates.

**3. Should there be a dark version of the browser-tab icon?** The tab icon (favicon) is the mark drawn in near-black
ink on a transparent background. On a light tab bar it reads clearly; on a dark tab bar (dark mode in Chrome, Safari
or Firefox) the ink is nearly invisible and only the red core shows. Example: the export has a "dark" mark for dark
surfaces, but no dark cut of the *favicon*, and the favicon file must stay byte-identical to the export, so the fix
is a design-side one, not a code one.

1. **Leave it for now (RECOMMENDED).** Most browsers draw a light tile behind a favicon in dark mode anyway; if it
   looks poor on your own devices, say so in your test and it becomes a small design request to Claude Design for a
   dark favicon cut, added to the export the way the logo was.
2. **Ask Claude Design for a dark favicon now**, before this story closes; the review adds it as a second icon file
   with a dark-mode media query in the page head.

Ruled: neither as offered — the owner pointed at the export's own *Dark* section (after *Small sizes*, before
*Specification*), which draws the mark in the README's dark colours (owner, 2026-09-07). The tab icon now switches to
those colours in dark mode, geometry untouched (Change Log 7). Nothing was asked of Claude Design.

## Owner's manual test

Before you start, the Deploy run will have cleared your account's "not now" answer to the passkey line, so the
yellow line shows again for step 5.

1. **URL:** https://app.inflozo.com/sign-in · **Screen:** Sign In · **Do:** look at the card and the browser tab ·
   **See:** at the top of the card, the Nest mark — three nested rounded squares with a red centre — sits beside the
   word "Inflozo". The huge faded "Inflozo" behind the card is unchanged. The tab shows the small mark as its icon;
   switch your Mac to dark mode (System Settings → Appearance) and the tab icon turns light-on-dark, then switch back.
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
