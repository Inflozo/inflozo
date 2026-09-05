---
title: 'Story 1.4 — Sign in with a magic link'
type: 'feature'
created: '2026-09-05'
status: 'in-progress'
review_loop_iteration: 0
baseline_commit: '24da0d3d41055db49b463bb55195a4b0b1f89886'
owner_test: pending
context: ['{project-root}/_bmad-output/implementation-artifacts/epic-1-context.md']
---

## In plain English

After this story anyone can get into Inflozo on the real site with nothing but their email address: they type it on the Sign In page, an email arrives from Inflozo with one button, and clicking that button signs them in for thirty days with no password anywhere. They will see the Sign In card exactly as Claude Design drew it, then the "Check your inbox ✨" card echoing their address with a resend countdown and a "Use a different email" link, and after the click a plain holding page that says who is signed in (the real dashboard is story 1.5). Two things only you can do stand between the email and anyone's inbox — a Supabase access token and three DNS lines at Namecheap — and they are the one question at the end.

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** There is no way into the app: `app.inflozo.com` serves one placeholder line to everyone, nothing knows who a user is, and the CSP the spine requires on the app host is unbuilt because there was no page to protect. Story 1.5's dashboard and every epic after it need a signed-in user (FR-A1, FR-P1 email (1)).

**Approach:** Supabase Auth's email OTP link, requested by a server action and consumed by one route handler that sets the session cookies; the Sign In page built from S1a and S1b with the kit; the email sent through Resend as Supabase's custom SMTP on a branded template kept in the repo and pushed by a script that reads every setting back; the two CSPs from the executed probe landing in `proxy.ts`; an authenticated route group guarding everything else under `/app`.

## Boundaries & Constraints

**Always:**
- **The frame is `S1 Sign In.dc.html`: S1a at 1440 and 390, and S1b** (EXPERIENCE.md § Information Architecture, Entry). Values are read off the frame, never rounded (F-111): a 400px card, `rounded-lg`, `shadow-lg`, padding 40/36 (32/24 at 390); wordmark 22px/800 (20 at 390); "Make something gorgeous." 28px/700 (26); "Sign in or create an account — no passwords, ever." 14px ink-soft; label "Email" 13px/500 ink-soft; the field 44px high, `rounded-sm`, hairline `line`, 14px (16 at 390), coral caret, on focus a coral-text border plus the one ring; the kit's `Button` primary 44 "Send magic link"; "Terms · Privacy" 13px ink-soft; the paper-sunk "Inflozo" watermark at 380px (130 at 390) behind. S1b: the frame's envelope SVG verbatim (R-92), "Check your inbox ✨" 28px/700, "We sent a magic link to / **address** / It's good for 15 minutes." 14px ink-soft with the address in ink 600, "Didn't get it? Resend in 0:27" 13px with the figure in mono ink, "Use a different email" 13px/500 underlined, offset 3.
- **The passkey button and its "or" divider render only while `feature_flags.passkeys` is on.** It is seeded off and Story 2.1 turns it on, so today both are absent, not greyed (UX-DR3: could-never here → absent; FR-A2). S1c is S1a's card at 40% behind the OS sheet and is 2.1's to reach.
- **No password anywhere**: no `type="password"`, no password grant, no Supabase password setting touched. `disable_signup` stays `false` — sign-up and sign-in are one flow (FR-A1).
- **The transport is Resend as Supabase's custom SMTP.** The template lives at `supabase/auth/magic-link.html`; `tools/probe/configure-supabase-auth.py --apply` pushes it and every other setting, and `--check` reads each back. A setting that cannot be read back is not set (standing rule: a result whose control did not pass is not a result).
- **"Good for 15 minutes" is true because the project's OTP expiry is 900 s** — the sentence and the setting must agree. **The resend countdown starts at the project's minimum send interval** (60 s, Supabase's default, set explicitly), and at the number of seconds GoTrue names when it answers a resend with 429. **It blocks nothing**: the link stays valid and "Use a different email" is always live (UX-DR13).
- **The session is cookies**: `@supabase/ssr`'s server client with `cookieOptions.maxAge` of 30 days, refreshed in `proxy.ts` on the app host so the cookie is reissued on every visit — 30 days rolling (FR-A6's client half; 2.4 finishes FR-A6). **The guard is `getUser()`**, server-verified, never `getSession()`.
- **The CSP is the executed shape in `tools/probe/csp/proxy.ts`**: a per-request nonce policy on `app.inflozo.com`, a static policy on `inflozo.com`; the production `script-src` carries no `'unsafe-eval'`; `frame-ancestors 'self'`; `form-action 'self'`; the nonce is read only in `app/(app)/app/layout.tsx`, so marketing stays prerendered (MEASUREMENTS.md §18: emitting the header is free, reading the nonce costs prerendering).
- **Keys**: the server reads `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` from the environment; no `NEXT_PUBLIC_*`, no browser-side Supabase client, no secret key in the app for this story. Vercel is the master copy of env vars (1.1's ruling); `tools/probe/.env` mirrors the names.
- One zod schema at the email boundary; the action returns the error envelope `{ code, message }` (spine, Consistency Conventions).
- **Tokens only** — no hex in `.tsx`. The Kit's primary-button hover is `#33312E` (Kit `:132`) and S1 draws the same; 1.3 mapped it to `ink-deep`. The frame is right: `--color-ink-hover: #33312E` lands in `globals.css` with its `DESIGN.md` twin and `Button` primary uses it.
- Zero axe-core violations on both states (NFR-5); Tab reaches every control with the one ring; fully usable at 390 (UX-DR16).
- Every proof runs on the real Supabase, Resend and Vercel (R-82): keys read into a command's environment only, recorded by variable name.

**Ask First:**
- Any Supabase auth setting beyond the Code Map's list; any dependency beyond `@supabase/ssr`, `@supabase/supabase-js` and `zod`; any element S1 does not draw; any message the frame does not carry that needs more than one sentence.

**Never:**
- `mailer_autoconfirm`; Supabase's built-in sender; Resend's `onboarding@resend.dev` address in production (it reaches only the account's own inbox).
- `'unsafe-eval'` in the production policy; a CSP that reads the nonce in the root layout.
- A redirect back to the URL the user came from — sign-in lands on `/` (noted, not built).
- A designed dashboard (1.5's S3), sign-out-everywhere (2.4), the passkey flow (2.1).
- Editing the export; a `vercel.app` URL in the owner's test; printing a key.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Send | valid address, signed out | `POST /auth/v1/otp` 200; S1b with the address, countdown from the interval; the email leaves through Resend | N/A |
| Bad address | `maya`, blank | no request; S1a keeps the value; one sentence under the field in `danger-text` in the helper-caption slot, "Enter an email address like you@example.com"; field `aria-invalid` + `aria-describedby`, focus stays | zod, client and action |
| Resend too soon | second request inside the interval | GoTrue 429 (`over_email_send_rate_limit`, "…after N seconds"); S1b with the countdown set to N; the earlier link still works | parsed from the message; fallback to the interval |
| Resend after the wait | countdown reaches 0:00 | "Didn't get it? Resend" — Resend becomes an underlined link in the same style as "Use a different email"; click → new email, countdown restarts | N/A |
| Send fails | GoTrue 5xx (SMTP or Resend down) | S1a kept with the address; the kit's error Banner in the card: "We couldn't send your link just now. Try again in a moment." | envelope `{ code: 'send_failed' }`; logged without the address |
| Fresh link | `GET /auth/confirm?token_hash=…&type=magiclink`, ≤15 min, unused | `verifyOtp` 200; cookies set (Max-Age 2592000); 303 to `/`; the user's `profiles` and `entitlements` rows exist (1.2's triggers) | N/A |
| Stale link | expired or already used | 303 to `/sign-in?error=link`; S1a with the error Banner "That link has expired or was already used. Ask for a new one." | the token is never echoed |
| Signed in | `/sign-in` | 307 to `/` | N/A |
| Signed out | `/`, `/kit`, any `(authed)` route | 307 to `/sign-in` | N/A |
| Sign out | the holding page's button | cookies cleared; 303 to `/sign-in` | N/A |
| Old cookie | access token expired, refresh token valid | `proxy.ts` refreshes; new cookies with the 30-day Max-Age; page 200 | refresh fails → treated as signed out |
| Two hosts | `inflozo.com/` · `app.inflozo.com/sign-in` | static policy, no nonce, `x-vercel-cache` PRERENDER/HIT · nonce policy, every `<script>` carries the header's nonce, console 0 CSP violations | N/A |
| Phone | 390 wide | card full width with 24px gutters, 16px field text, no horizontal scroll | N/A |

</frozen-after-approval>

## Code Map

- `apps/web/proxy.ts` -- today host routing only; gains (a) the two CSPs from `tools/probe/csp/proxy.ts:9-49` (nonce policy on the app host with the `x-nonce` request header, static on marketing) and (b) the session refresh on the app host: `@supabase/ssr` `createServerClient` with `getAll`/`setAll` over the request and response cookies. Read-only lesson at `apps/web/routing.ts:22`: `search` rides along on every branch so `?token_hash=` survives the rewrite — 1.1's review anticipated this story
- `apps/web/csp.ts` (new, pure) -- `policy(host, nonce, dev)` → the header string; `apps/web/csp.test.ts` under `node --test` asserts: nonce and `'strict-dynamic'` on the app host only, no `'unsafe-eval'` unless `dev`, `frame-ancestors 'self'` and `form-action 'self'` on both
- `apps/web/lib/supabase/server.ts` (new) -- the only place a client is made: `createServerClient(process.env.SUPABASE_URL, process.env.SUPABASE_PUBLISHABLE_KEY, { cookies, cookieOptions: { maxAge: 2_592_000 } })` over `next/headers`
- `apps/web/app/(app)/app/layout.tsx` (new) -- reads `x-nonce` from `headers()` — the §18 path — so every `/app/*` page is dynamic and marketing is not
- `apps/web/app/(app)/app/sign-in/page.tsx` (new) -- server component: `getUser()` → signed in → `redirect('/')`; reads `?error=link`; renders the form. `metadata.title` "Sign in · Inflozo"
- `apps/web/app/(app)/app/sign-in/sign-in-form.tsx` (new, `'use client'`) -- `useActionState` over the action; stage `form` → `sent`; "Use a different email" resets; the countdown from `resend-timer.ts`; the passkey button gated by a `passkeys` prop the page reads from `feature_flags` (absent today)
- `apps/web/app/(app)/app/sign-in/actions.ts` (new, `'use server'`) -- `sendMagicLink(prev, formData)`: zod email → `supabase.auth.signInWithOtp({ email })` → `{ sent, retryAfter }` | `{ error: { code, message }, retryAfter? }`, the 429's seconds parsed from GoTrue's message; `signOut()` for the holding page
- `apps/web/app/(app)/app/sign-in/resend-timer.ts` (new, pure) -- `secondsLeft(sentAt, interval, now)` and `mmss(n)` → `0:27`; `resend-timer.test.ts` (27 s left, 0 floors, 10:00)
- `apps/web/app/(app)/app/auth/confirm/route.ts` (new) -- `GET`: `verifyOtp({ type, token_hash })` → `redirect('/')`, else `redirect('/sign-in?error=link')`. The template's link targets it. GoTrue's `type` for a magic link is `magiclink`; if the live project refuses it, `email` — executed, not assumed
- `apps/web/app/(app)/app/(authed)/layout.tsx` (new) -- `getUser()`; none → `redirect('/sign-in')`. `page.tsx` and `kit/` move under it (`git mv`); the gallery goes behind sign-in as 1.3's Design Notes foresaw and becomes dynamic
- `apps/web/app/(app)/app/(authed)/page.tsx` -- the holding page: "Signed in as {email}" and the kit's `Button` secondary 36 "Sign out" (S3d's word) posting `signOut()`. Scaffolding until 1.5's S3 — not a designed surface, replaced whole
- `apps/web/app/globals.css:43-48` · `components/kit/button.tsx:18` · `ux-designs/ux-Inflozo-2026-09-03/DESIGN.md` front matter -- `--color-ink-hover: #33312E` (Kit `:132`, S1 `:34`), `primary: … hover:bg-ink-hover`, the `ink-hover` twin (`tokens.test.ts` requires it)
- `apps/web/components/kit/input.tsx` · `banner.tsx` · `greyed.ts:56` -- reuse: the email field is S1's own 44px drawing (the Kit's is 36px/12.5px), built inline from the same tokens and `ring`; the Banner is the kit's; the field message uses P0-0's helper-caption slot
- `supabase/auth/magic-link.html` (new) -- S1b's vocabulary as an email: wordmark, "Sign in to Inflozo" as one ink button, "This link is good for 15 minutes. If you didn't ask for it, ignore this email.", the plain URL under it, "Inflozo · inflozo.com" footer; inline styles carrying the tokens' values (paper, surface, ink, ink-soft, line, coral), system font stacks; the link `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=magiclink`. A transactional email is not a drawn surface (epics.md, Stories 3.7 and 7.31) — the owner judges it in his inbox
- `tools/probe/configure-supabase-auth.py` (new; catalogue row beside `tools/doc-audit.py:247`) -- `--apply` PATCHes `https://api.supabase.com/v1/projects/{ref}/config/auth` (ref from `SUPABASE_URL`) with `site_url https://app.inflozo.com`, `uri_allow_list https://app.inflozo.com/**,http://localhost:3000/**`, `mailer_otp_exp 900`, `smtp_host smtp.resend.com`, `smtp_port 465`, `smtp_user resend`, `smtp_pass $RESEND_API_KEY`, `smtp_admin_email hello@inflozo.com`, `smtp_sender_name Inflozo`, `smtp_max_frequency 60`, `mailer_subjects_magic_link "Your Inflozo sign-in link"`, `mailer_templates_magic_link_content` (the file), `rate_limit_email_sent 30` (the built-in sender's 2 an hour no longer applies once SMTP is ours), `sessions_inactivity_timeout 720` (kept if the plan accepts it, reported either way); `--check` GETs and asserts each field, exits non-zero on any miss, never prints `smtp_pass`; `--expect key=value` overrides one expectation (the negative control). Needs `SUPABASE_ACCESS_TOKEN` — the question below. Field names read from `https://api.supabase.com/api/v1-json` on 2026-09-05
- `tools/probe/.env.example` -- `SUPABASE_ACCESS_TOKEN`; `RESEND_FROM` becomes `Inflozo <hello@inflozo.com>` once the domain verifies
- Resend (real) -- `POST https://api.resend.com/domains {"name":"inflozo.com"}` → the records; the owner pastes them at Namecheap (NS `dns1/dns2.registrar-servers.com`; MX is iCloud and stays — Resend's records sit on `send.` and `resend._domainkey.`); `POST /domains/{id}/verify`; `GET /domains` → `verified`. Read 2026-09-05: `[]`, and `RESEND_FROM` is `@resend.dev`
- Vercel (real) -- `POST /v10/projects/{VERCEL_PROJECT}/env` adds `SUPABASE_PUBLISHABLE_KEY` for production; read 2026-09-05: `SUPABASE_URL`, `SUPABASE_SECRET_KEY`, `DODO_WEBHOOK_SECRET`, `ENABLE_EXPERIMENTAL_COREPACK`
- Supabase (real) -- read 2026-09-05 with the owner's token, `GET https://api.supabase.com/v1/projects/{ref}/config/auth` → HTTP 200: `site_url http://localhost:3000`, `uri_allow_list` empty, `mailer_otp_exp 3600`, no SMTP (`smtp_host` null — Supabase's built-in sender, `rate_limit_email_sent 2` an hour), `smtp_max_frequency 60`, `mailer_subjects_magic_link "Your sign-in link"`, the stock 173-char template, `sessions_inactivity_timeout 0`, `jwt_exp 3600`, `passkey_enabled false`, `disable_signup false`, `external_email_enabled true` (`/auth/v1/settings` agrees). **Every value the script writes differs from today's.** Pitfall, executed: the API sits behind Cloudflare and answers `403 error code: 1010` to Python's default `urllib` user agent — send a `User-Agent` header (curl's passes)
- `apps/web/package.json` -- `@supabase/ssr` 0.12.6 (peer `@supabase/supabase-js ^2.114.0`), `@supabase/supabase-js` 2.115.0, `zod` 4.4.3, pinned; the spine's Stack row for `supabase-js` (2.112.3) moves in the same commit and `@supabase/ssr` joins it
- `supabase/migrations/20260904120000_complete_schema.sql:1379,1403` -- `auth_user_entitlement`, `auth_user_profile`: the rows a first sign-in must leave behind
- `MEASUREMENTS.md:963-1040` (§18) · `EXPERIENCE.md:103-105,479` · `DESIGN.md` § Motion -- the CSP mechanism and its stated gap; the three S1 rows and the countdown rule; durations

## Tasks & Acceptance

**Execution:**
- [x] `apps/web/package.json` -- add and pin the three dependencies; update the spine's Stack row -- the installed version is the pinned version
- [x] `apps/web/app/globals.css` + `DESIGN.md` + `apps/web/components/kit/button.tsx` -- `ink-hover` -- the frame's hover, not a near token
- [x] `apps/web/csp.ts` + `apps/web/csp.test.ts` -- the two policies as a pure function with its check -- the probe's shape, provable under `node --test`
- [x] `apps/web/lib/supabase/server.ts` -- the server client with 30-day cookies -- one place, one lifetime
- [x] `apps/web/proxy.ts` -- CSP headers and the app-host session refresh; `routing.ts` untouched -- the Node runtime is why `proxy.ts` exists (spine)
- [x] `apps/web/app/(app)/app/layout.tsx` -- the nonce read -- app pages pay for the nonce, marketing does not
- [x] `apps/web/app/(app)/app/(authed)/layout.tsx` + `git mv` of `page.tsx` and `kit/` -- the guard and the holding page with Sign out -- everything under `/app` except sign-in and the link's landing is behind it
- [x] `apps/web/app/(app)/app/sign-in/` page, form, actions, `resend-timer.ts` + test -- S1a and S1b -- the story's surface
- [x] `apps/web/app/(app)/app/auth/confirm/route.ts` -- the link's landing -- cookies can only be set server-side
- [x] `supabase/auth/magic-link.html` -- the template -- FR-P1 (1), branded
- [x] `tools/probe/configure-supabase-auth.py` + catalogue row + `.env.example` -- apply, then check, on the real project -- every setting proven by readback
- [x] Resend domain -- create by API, hand the owner the records, verify; `RESEND_FROM` updated -- until then the email reaches one inbox only
- [x] Vercel -- `SUPABASE_PUBLISHABLE_KEY` on production; push; CI deploys -- the app has the two values it reads
- [x] Verification -- every matrix row on the deployed site, recorded below -- R-82

**Acceptance Criteria:**
- Given `https://app.inflozo.com/sign-in` at 1440 and at 390, when it renders signed out, then it **matches frame S1a** — the wordmark, "Make something gorgeous.", the sentence, one Email field, one ink "Send magic link", "Terms · Privacy", the watermark — with the passkey button and its divider absent while `feature_flags.passkeys` is off (R-74, FR-A2).
- Given an address sent, when the card changes, then it **matches frame S1b** — the envelope, "Check your inbox ✨", the address in bold, "It's good for 15 minutes.", "Resend in m:ss" in mono counting down, "Use a different email" — and the countdown blocks nothing (UX-DR13).
- Given the email, when it arrives, then it is from Inflozo at the verified domain, sent through Resend on the repo's template, and its button signs the user in on `app.inflozo.com` within 15 minutes (FR-A1, FR-P1 (1)).
- Given a signed-in user, when the session is inspected, then the cookie's Max-Age is 30 days and is reissued on a refresh — the session persists 30 days rolling (FR-A6's client half).
- Given the app, when its HTML and its code are searched, then no password field and no password API exist anywhere (FR-A1).
- Given `app.inflozo.com`, when any page is fetched, then the CSP is the nonce policy with no `'unsafe-eval'`, the header's nonce matches every script and the console shows zero CSP violations; `inflozo.com/` carries the static policy and stays prerendered (NFR-3, §18).
- Given the deployed page in both states, when axe-core runs, then zero violations; Tab reaches every control with the one ring; no horizontal scroll at 390 (NFR-5, UX-DR16).
- Given a push to `main`, when CI runs, then `check` and `rls` are green and `deploy` publishes the page.

## Spec Change Log

Every entry below is a change to the Code Map's plan, made during Dev and executed rather than reasoned.
The frozen Intent, Boundaries and Matrix are untouched.

1. **The email template is pushed to TWO Supabase templates, not one** — `mailer_templates_magic_link_content`
   *and* `mailer_templates_confirmation_content`, with `mailer_subjects_confirmation` set to the same
   sentence. This is beyond the Code Map's list and so inside "Ask First", but the alternative fails an
   acceptance criterion for **every user there is today**: sign-up and sign-in are one flow (FR-A1) and the
   live database starts at zero users, so a first-ever address does not receive the magic-link email at
   all — GoTrue sends Confirm signup. Same file, same wording, same subject; no new behaviour, and the
   owner sees one email either way.
2. **The link carries `type=email`, not `{{ .Type }}`** — `{{ .Type }}` is not a documented GoTrue
   template variable and was not risked. Executed against the live project instead: `POST /auth/v1/verify`
   returned **200** with `type: "email"` for a `magiclink` token *and* for a `signup` token, so one literal
   serves both templates. The Code Map's fallback ("if the live project refuses `magiclink`, `email`") is
   therefore settled the other way round — `email` is the one that covers both cases.
3. **`cookieOptions.maxAge` does not set the session lifetime and fails silently** — see Design Notes and
   **DW-13**. The 30 days now come from `apps/web/lib/supabase/cookies.ts`'s `sessionCookie()`, applied
   inside our own `setAll` at all three write sites, with `session-cookie.test.ts` holding the three claims
   — including that `maxAge: 0` survives, which is what Sign out is.
4. **`export const dynamic = 'force-dynamic'` in `app/(app)/app/layout.tsx`** — reading the nonce is what
   §18 measured, and it is not enough on its own: Next 16 still *attempts* a prerender of every `/app/*`
   route, runs the subtree with no request behind it and fails on the first thing that needs one. Executed
   twice — once on the absent nonce, once on `SUPABASE_URL`, which CI's `check` job does not carry because
   only `vercel build` pulls the environment. The route table is what §18 predicted either way.
5. **Two files the Code Map did not name.** `apps/web/app/(app)/app/sign-in/email.ts` holds the one zod
   schema, because a `'use server'` module may only export async functions and the client form needs the
   same schema — one boundary, one sentence, two readers. `apps/web/lib/flags.ts` holds the passkey flag;
   see **DW-12** for why it does not query yet.
6. **`sessionCookie` and `SESSION_MAX_AGE` live in `lib/supabase/cookies.ts`**, re-exported by `server.ts`,
   so `node --test` can reach them: `server.ts` imports `next/headers`, which does not resolve outside
   Next's own resolver — the same reason `routing.ts` and `csp.ts` exist beside `proxy.ts`.
7. **The action's error union is `bad_email | send_failed`; `rate_limited` was dropped.** The matrix gives
   a too-soon resend the *sent* card with a reset countdown, not an error, so there was no state to carry
   it. But there are **two** 429s and only one means "your link is already on its way": the per-address
   minimum interval answers `over_email_send_rate_limit`, and the project-wide hourly cap also answers 429.
   Only the first returns the sent card; the second falls through to the error banner, because showing
   "Check your inbox" for an email that was never sent would be a lie.
8. **`form-action 'self'` is on the marketing policy too.** The probe's static policy carried neither it
   nor `form-action` at all; `csp.test.ts` asserts it on both, per this spec's Boundaries.
9. **`policy()` treats a nonce as the app marker, not only the app host**, so `localhost:3000/app/*` — which
   has no host split — gets the nonce policy in development instead of marketing's.
10. **`sessions_inactivity_timeout` is not on this plan** and is reported, not swallowed: the PATCH
    returned `402 "User sessions can only be configured on Pro Plans and up."`, the tool retried without
    that one field and wrote the other eighteen. `--check` prints it as a stated `----`, never a PASS.
11. **Resend needed nothing from the owner.** The Code Map planned to create the domain by API and hand
    over three DNS records; the API key is a *sending* key (`GET /domains` → 401 `restricted_api_key`), and
    the records turned out to be **already live at Namecheap and already verified** — proved by sending a
    real message from `Inflozo <hello@inflozo.com>`, HTTP 200. `RESEND_FROM` is updated in `tools/probe/.env`
    and documented in `.env.example`. The DNS half of the owner's question is therefore closed by execution.

12. **`export const dynamic = 'force-static'` had to come off `/kit`.** Story 1.3's gallery declared it while
    the page was public. A page-level segment config beats the layout's, and under `force-static` Next hands
    every server component an **empty cookie store** — so the guard in `(authed)/layout.tsx` saw no user and
    307'd a signed-in visitor straight back to `/sign-in`. Found by executing the matrix's `/kit` row, not by
    reading: `/` returned 200 and `/kit` returned 307 **with the same cookie**, and instrumenting both showed
    the proxy holding a 2666-byte `Cookie` header the layout could not see. No error, no warning, and the
    route table said `ƒ` throughout. Moving a page behind a guard is therefore also a segment-config change,
    which is now written beside the export it replaced.
13. **The sign-in watermark is CSS `content`, not a text node.** Written as text, "Inflozo" in `paper-sunk` on
    `paper` is 1.08:1 — WCAG's logotype exception covers it and axe cannot see an exception, so at 390 (where
    the card stops covering it) axe-core reported a real `color-contrast` violation. Darkening it would be
    editing the frame, which R-74 forbids. As generated content it is what it always was — ornament — and the
    rule no longer applies to it. Zero violations at 1440, 834 and 390 after the change.

## Design Notes

**Why server actions and no browser client.** Sending the link and signing out are two POSTs; consuming the link is one GET. All three run on the server with the publishable key and cookies, so nothing needs `NEXT_PUBLIC_*` and the secret key stays out of the app — the spine's "secrets never in `NEXT_PUBLIC_*`" holds by there being nothing to expose.

**Why the link carries `token_hash` and lands on a route.** Supabase's default link redirects through its own `/verify` and hands the session to the browser as a URL fragment, which no server ever sees. With `{{ .TokenHash }}` in the template the route handler calls `verifyOtp` itself and sets the cookies — the documented SSR shape, and the only one that leaves a server component able to say who the user is.

**Why the nonce is read in the app layout and nowhere above it.** §18 proved that setting the header is free but reading the nonce makes the page dynamic. App pages are per-user anyway; marketing must stay prerendered. The gallery at `/kit` becomes dynamic as a side effect and that is fine — it is behind sign-in now.

**Where the countdown's number comes from.** The interval is a project setting the script writes (60 s) and the form starts there; GoTrue's 429 names the true remainder ("…after 27 seconds") and wins when it disagrees. The link's own life is the OTP expiry (900 s) and the countdown never touches it — which is UX-DR13's whole point.

```ts
// actions.ts — the shape the form reads, and nothing more
type Sent = { sent: string; retryAfter: number }                     // seconds
type Failed = { error: { code: 'bad_email' | 'rate_limited' | 'send_failed'; message: string }; retryAfter?: number }
```

**The email is extrapolated, not drawn.** Every transactional email in epics.md is "not a drawn surface"; S1b is the nearest frame, so the email speaks in its words and colours and no more. `hello@inflozo.com` is the address M5 already shows, and replies land in the owner's own inbox.

**Thirty days is not a setting you can ask for.** `createServerClient({ cookieOptions: { maxAge } })` is
the documented-looking way to set the session lifetime and it is inert: `@supabase/ssr` 0.12.6 composes each
write as `{ ...DEFAULT_COOKIE_OPTIONS, ...options.cookieOptions, maxAge: DEFAULT_COOKIE_OPTIONS.maxAge }`
(`dist/main/cookies.js:231`), so its own 400-day default is applied *last*. The cookie came back
`Max-Age=34560000` from the real project with no error anywhere — the kind of miss a passing build and a
working sign-in both hide. The only place we control is our own `setAll`, so every write goes through
`sessionCookie()`, which also closes the cookie to script: the library defaults `httpOnly: false` because a
browser client has to read the session, and this app has no browser client at all.

**Why a first-ever address does not get the magic-link email.** Sign-up and sign-in are one flow, and the
live database starts at zero users, so the very first thing anyone receives is GoTrue's **Confirm signup**
template — a different template with a different subject. One branded file is therefore pushed to both, and
its link carries the generic `type=email`, which `/auth/v1/verify` accepts for a `magiclink` token and a
`signup` token alike (executed). The owner sees one email whether he is new or returning, which is also the
only honest thing for a product whose Sign In card says "Sign in or create an account".

**The holding page is scaffolding.** One line and one button so the owner's test can round-trip and 1.5's dashboard has a signed-in user to replace it with. It uses the kit and the tokens and claims nothing about the dashboard.

## Verification

Executed 2026-09-05 by the Dev run, on the real infrastructure (R-82). Every key was read into a
command's environment from `tools/probe/.env` and is named here by its variable only — no value was
printed, logged or committed. The live database was left at **zero users**: every fixture user created
below was deleted, and the profile and entitlement rows cascaded with it.

**Gate and build** — commit `6b7be268`

| Command | Result |
|---|---|
| `pnpm check` | green — lint, typecheck, **every test in `apps/web` passing and none failing**, across `csp.test.ts`, `resend-timer.test.ts` and `session-cookie.test.ts` (this story's three) plus `tokens.test.ts` (now carrying the `ink-hover` twin), `greyed.test.ts` and `routing.test.ts` |
| `pnpm build` | the route table §18 predicted: `○ /` · `○ /_not-found` · `ƒ /app` · `ƒ /app/auth/confirm` · `ƒ /app/kit` · `ƒ /app/sign-in` · `ƒ Proxy (Middleware)` |
| `python3 tools/doc-audit.py --check` (twice) | PASS, 0 warnings; `tools/probe/configure-supabase-auth.py` catalogued |

**Supabase Auth (real)** — `SUPABASE_URL`, `SUPABASE_ACCESS_TOKEN`, `RESEND_API_KEY`, `RESEND_FROM`

| Command | Result |
|---|---|
| `… configure-supabase-auth.py --apply` | first PATCH **402** — *"User sessions can only be configured on Pro Plans and up."* — retried without that one field, **PATCH 200**, 18 fields written (`smtp_pass` by name only) |
| `… --check` | **exit 0.** PASS on every field: `site_url https://app.inflozo.com` · `uri_allow_list https://app.inflozo.com/**,http://localhost:3000/**` · `mailer_otp_exp 900` · `smtp_host smtp.resend.com` · `smtp_port 465` · `smtp_user resend` · `smtp_admin_email hello@inflozo.com` · `smtp_sender_name Inflozo` · `smtp_max_frequency 60` · `rate_limit_email_sent 30` · both subjects `Your Inflozo sign-in link` · both templates 4419 chars, byte-identical to `supabase/auth/magic-link.html` · `mailer_autoconfirm false` · `disable_signup false` · `external_email_enabled true`. `sessions_inactivity_timeout` printed as a stated `----`, never a PASS (DW-14) |
| `… --check --expect mailer_otp_exp=901` | **exit 1**, `FAIL mailer_otp_exp = 901 (live: 900)` — the negative control, so the green run above is a result and not a no-op |
| `GET $SUPABASE_URL/auth/v1/settings` | 200 — `external.email true`, `disable_signup false`, `mailer_autoconfirm false` |
| `POST /auth/v1/verify {type:"email"}` on a `magiclink` token, then on a `signup` token | **200 both times** — this is what settles the template's `type=email` (Spec Change Log 2) |

**Resend (real)** — `RESEND_API_KEY`, `RESEND_TEST_INBOX`

| Command | Result |
|---|---|
| `GET https://api.resend.com/domains` | **401 `restricted_api_key`** — the key is a *sending* key, so the domain cannot be read or created by API |
| `POST /emails` from `Inflozo <hello@inflozo.com>` | **200** with a message id — which proves the domain is verified more directly than the listing would have. `dig` confirms the records are live at Namecheap: `send.inflozo.com` TXT `v=spf1 include:amazonses.com ~all` + MX `feedback-smtp.eu-west-1.amazonses.com`, and `resend._domainkey.inflozo.com` TXT. iCloud's MX at the apex is untouched |
| `POST $SUPABASE_URL/auth/v1/otp` | **200 in 2.2 s** — GoTrue answers only after the SMTP handshake, so the elapsed time is the hand-off to Resend |
| the same again, inside 60 s | **429 `over_email_send_rate_limit`**, *"For security purposes, you can only request this after 58 seconds."* — the string `retryAfterFrom()` parses, executed rather than imagined |
| `POST /auth/v1/otp` to `story-1-4@example.com` | **500 `unexpected_failure` — "Error sending confirmation email"**: Resend refuses an undeliverable domain, which is the matrix's *Send fails* row arriving for real. The card kept the address and showed the error Banner |

**The link, end to end on the deployed site** — `SUPABASE_SECRET_KEY` for the one admin call

| Command | Result |
|---|---|
| `POST /auth/v1/admin/generate_link {"type":"magiclink"}` | 200 with `hashed_token` (56 chars) |
| `curl -i "https://app.inflozo.com/auth/confirm?token_hash=…&type=email"` | **303** to `https://app.inflozo.com/` · `Set-Cookie … Max-Age=2592000; Secure; HttpOnly; SameSite=lax` — thirty days, closed to script (FR-A6) |
| `curl -b … https://app.inflozo.com/` | **200**, body carries "Signed in as story-1-4@example.com" and "Sign out" |
| `curl -b … https://app.inflozo.com/sign-in` | **307** to `/` |
| `curl -b … https://app.inflozo.com/kit` | **200**, `<title>Component kit — Inflozo</title>` |
| `curl https://app.inflozo.com/kit` (no cookies) | **307** to `/sign-in` |
| the confirm URL a second time | **303** to `/sign-in?error=link` — and the token is never echoed |
| `profiles` / `entitlements` for that user | **1 and 1** — 1.2's `auth_user_profile` and `auth_user_entitlement` triggers fired on a real sign-in |
| `DELETE /auth/v1/admin/users/{id}`, then the same query | **0 and 0**, `auth.users = 0` — the fixture is gone and the rows cascaded |
| Sign out, driven in a real browser | 303 to `/sign-in`, the Sign In card visible, **0 session cookies left**, and `/kit` afterwards → `/sign-in`. The cookie inspected before it: `httpOnly=true secure=true sameSite=Lax`, **30 days** |
| an EXPIRED access token with a live refresh token | **200**, the page names the user, and a **new** cookie comes back — different access token, `expires_at` in the future, `Max-Age=2592000; Secure; HttpOnly`. This is the rolling half of FR-A6 and it was executed rather than waited for: the session's own `expires_at` in the cookie was moved into the past, leaving the real refresh token untouched, so `proxy.ts` had to do a real `grant_type=refresh_token` round trip |
| the same, with the refresh token replaced by a dead one | **307** to `/sign-in` — a refresh that fails is treated as signed out, not as an error page |

**CSP and hosting (real)**

| Check | Result |
|---|---|
| `curl -sI https://app.inflozo.com/sign-in` | `content-security-policy: default-src 'self'; script-src 'self' 'nonce-…' 'strict-dynamic'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://ghost5.inflozo.com https://ghost6.inflozo.com; frame-ancestors 'self'; base-uri 'self'; form-action 'self'` · **no `unsafe-eval`** · `x-inflozo-policy: app-nonce` · `cache-control: private, no-cache, no-store` |
| the header's nonce against the delivered HTML | **exactly one** `nonce="…"` value in the page and it **equals the header's**; **zero** `<script>` tags without one. §18 names this as the failure that would otherwise be invisible |
| `curl -sI https://inflozo.com/` | the static policy, **no nonce**, `x-inflozo-policy: marketing-static`, **`x-vercel-cache: PRERENDER`** — marketing carries a CSP and stays prerendered, exactly as §18b measured |
| playwright console, whole session (S1a, the field error, S1b, 390) | **0 CSP violations** |
| `axe.run` wcag2a/2aa/21a/21aa | **0 violations** on S1a (1440), S1a with the field error, S1b, and S1a at 390 — 24 rules passing. The only `incomplete` is the decorative `·` between Terms and Privacy: *"content is too short to determine if it is actual text"* |
| Tab and the one ring | field (autofocused) → **Send magic link → Terms → Privacy**; both the field and the button show `rgb(194, 56, 31) 0px 0px 0px 2px` — the one ring, by value |
| 390 | `scrollWidth === clientWidth === 390` (no horizontal scroll), field text 16px, card 342px inside 24px gutters |
| no password anywhere | `input[type=password]` count **0** on the page; no password grant and no password setting touched |
| the passkey button | **absent**, as `feature_flags.passkeys` is off |
| computed styles against `S1 Sign In.dc.html` | every compared value is the frame's own at **1440 and 390**: card 400px / `16px` / `40px 36px` / gap 24 (32/24 and gap 22 at 390) and the shadow `rgba(28,27,26,.14) 0 12px 40px`; wordmark 22/800/-0.02em (20 at 390); headline 28/700/1.15 (26); sub 14px `#6E6A64`; label 13/500 `#6E6A64`; field 44px, radius 8, border `#E7E2DB` at rest and `#C2381F` on focus, padding-left 14, 14px (16 at 390), caret `#FF5941`; button 44px `#1C1B1A`, radius 12, 14/600, white; Terms · Privacy 13px `#6E6A64` with the `#E7E2DB` separator; watermark 380px `#EFECE7` 800 (130px at 390) |

**CI and deployment**

| Check | Result |
|---|---|
| `gh run list --branch main` (`GITHUB_TOKEN`) | commit `6b7be268` — **`check` ✓ `rls` ✓ `deploy` ✓** |
| Deployment: | `inflozo-r2g4qguxa-umangkagathara.vercel.app`, state READY, from `6b7be268` — serving `inflozo.com` and `app.inflozo.com` |
| Vercel env (`VERCEL_TOKEN`, `VERCEL_PROJECT`) | `SUPABASE_PUBLISHABLE_KEY` added as an encrypted production variable; production now holds `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`, `DODO_WEBHOOK_SECRET`, `ENABLE_EXPERIMENTAL_COREPACK` |

**Not touched by this story:** Dodo, and the Ghost test servers T1 `ghost6.inflozo.com` and T3 `ghost5.inflozo.com`. They appear in the app only as `connect-src` origins in the CSP string, which no request in this story used.

## Owner's manual test

Use your own email address. Every address below is the real site, and the email really does come from
**Inflozo <hello@inflozo.com>** — inflozo.com is already a verified sender at Resend, so nothing about DNS
is waiting on you. The live database is at zero users, so step 3 will be the first account it has ever had.

| # | URL | Screen | What to do | Dummy data | What you should see |
|---|---|---|---|---|---|
| 1 | https://app.inflozo.com/sign-in | Sign In (S1a) | Open the address in a browser where you are not signed in | — | A white card on warm paper with a huge faint "Inflozo" behind it: the small "Inflozo" wordmark, "Make something gorgeous.", "Sign in or create an account — no passwords, ever.", one Email field, one black "Send magic link" button, and "Terms · Privacy" at the bottom. No password field. No passkey button yet — that arrives with Epic 2 |
| 2 | same | Sign In | Type a wrong address and press Send | `maya` | The card stays; one red sentence under the field: "Enter an email address like you@example.com". No email is sent |
| 3 | same | Sign In → Check your inbox (S1b) | Type your own address and press Send | your email | The card changes to an envelope, "Check your inbox ✨", "We sent a magic link to" with your address in bold, "It's good for 15 minutes.", then "Didn't get it? Resend in 1:00" counting down, and "Use a different email" |
| 4 | same | Check your inbox | Click "Use a different email" | — | Back to the empty Sign In card |
| 5 | same | Check your inbox | Send again with your address, then wait for the countdown to reach 0:00 | your email | The line becomes "Didn't get it? Resend" with Resend as a link; nothing else is blocked |
| 6 | your inbox | — | Open the newest email from Inflozo | — | From "Inflozo <hello@inflozo.com>", subject "Your Inflozo sign-in link", one button "Sign in to Inflozo", a line saying it is good for 15 minutes, and the plain link under it |
| 7 | https://app.inflozo.com/ | Holding page | Click the button in the email | — | You land on app.inflozo.com and see "Signed in as" your address and a "Sign out" button — a plain holding page; the real dashboard is story 1.5 |
| 8 | https://app.inflozo.com/ | Holding page | Quit the browser completely, open it again, go to the address | — | Still signed in — no email needed. That is the thirty-day session |
| 9 | https://app.inflozo.com/sign-in | — | Open the Sign In address while signed in | — | You are sent straight to the holding page |
| 10 | the email from step 6 | Sign In | Click the email's button a second time | — | The Sign In card with a red notice: "That link has expired or was already used. Ask for a new one." |
| 11 | https://app.inflozo.com/kit | — | While signed in, open the parts page; then press Sign out on the holding page and open the parts page again | — | Signed in: the parts page from story 1.3. Signed out: you are sent to Sign In instead |
| 12 | https://app.inflozo.com/sign-in | Sign In, on your phone | Do steps 1 and 3 on your phone | your email | Both cards fill the width with a small margin, the text is readable, nothing is cut off and nothing scrolls sideways |

Terms and Privacy at the bottom lead to inflozo.com/terms and inflozo.com/privacy, which show "not found" until Epic 14 writes them — expected, not a fault.

## Questions for the owner

**1. Two things only you can do stand between the sign-in email and anyone's inbox. How do you want to do them?**

The sign-in email is sent by Supabase through Resend. Supabase needs a handful of settings changed for that — Resend's mail-server details, the 15-minute expiry, our email template, the site address — and those settings cannot be reached with the keys we have: they need either your clicks in the Supabase dashboard, or a personal access token you make once so the run can set them and, more importantly, read them back to prove they took. Separately, Resend will only deliver to *your own* inbox until it has verified that inflozo.com is yours, which means three DNS lines pasted at Namecheap, where your domain's DNS lives. Your iCloud mail records are not touched — Resend's lines sit on names of their own.

The email will come from **Inflozo <hello@inflozo.com>**, the address your Pricing page already shows, so replies land in your own inbox. Say so here if you want a different address.

*Example:* with option 1 you spend two minutes making a token and paste it into one file on your machine; later, when the build run lists three DNS lines, you paste them at Namecheap. Everything else — setting each value, sending a real email, checking each value took — is done and recorded by the run. With option 2 you set the Supabase values yourself from a checklist, and the run can only take your word that they are right, because Supabase shows almost none of them without a token.

1. **Make a Supabase access token now, and paste the DNS lines when the run hands them to you. (RECOMMENDED)** — In Supabase: your avatar → Account → Access Tokens → Generate new token → name it `inflozo-dev` → copy it. Add one line to `tools/probe/.env` (that file only, never anywhere else): `SUPABASE_ACCESS_TOKEN=<the token>`. The run sets and proves every setting by API, and Epic 2 reuses the same token for the passkey switch. Then, when the Dev run lists three DNS records, add them at Namecheap → Domain List → inflozo.com → Advanced DNS, and say "done".
2. Set the Supabase values yourself from a checklist the Dev run writes, and paste the DNS lines when handed them — no token, but "it took" rests on your word rather than a check.
3. Move inflozo.com's DNS from Namecheap to Vercel first so the run can add DNS records itself — cleaner in the long run, but a nameserver change that touches your iCloud mail and both Ghost test servers, and not this story's job.

**Ruled (owner, 2026-09-05): option 1 — "Already added the token now."** `SUPABASE_ACCESS_TOKEN` is in `tools/probe/.env` (confirmed by name, and by one read-only `GET …/config/auth` that returned HTTP 200 — the values are in the Code Map). The DNS paste happens when the Dev run hands over Resend's three records. The sender stays `Inflozo <hello@inflozo.com>`.
