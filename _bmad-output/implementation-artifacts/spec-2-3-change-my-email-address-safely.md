---
title: 'Story 2.3 — Change my email address safely'
type: 'feature'
created: '2026-09-07'
status: 'in-review'
baseline_commit: '4da178c8444aee8a942aeba007b830c567416316'
review_loop_iteration: 1
owner_test: pending
context: ['{project-root}/_bmad-output/implementation-artifacts/epic-2-context.md']
---

## In plain English

After this story you can move your Inflozo account to a new email address from the Account page,
and if that address already belongs to another Inflozo account you are told so at once — no email is
sent that could never work. You will see a **Change email** button at the end of the Email card; it
opens a small window with one field, and when you press **Send link** the window closes and a blue
note in the card says a link went to the new address. Nothing changes until you open that link: your
old address keeps working until then, and the moment you open it the Account page shows a green
"Your email is now …" message and magic links land at the new address.

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** FR-A4 asks for an email change with re-verification of the **new** address, and for an
address already registered to another account to be rejected upfront with "already in use" before
any verification email is sent. The Email card on `/account` has shown the address since 2.1 with the
frame's **Change email** button deliberately absent (UX-DR3); nobody can move their account today.

**Approach:** The frame's button, a one-field dialog extrapolated from the rename dialog, and one
server action that calls Supabase's own `auth.updateUser({ email })`. GoTrue refuses a duplicate
**before** it sends — `422 email_exists` at `internal/api/user.go:135-139`, read in its source
2026-09-07 — which is FR-A4's upfront rejection with no code of ours touching `auth.users`. The
verification mail is FR-P1's email (2): a new branded template pushed and read back by
`configure-supabase-auth.py`, sent to the new address only (`mailer_secure_email_change_enabled`
off), whose link lands on the existing confirm route and from there on `/account` with a green
banner. The change lands only when that link is opened (`verify.go:546-630`).

## Boundaries & Constraints

**Always:**
- The frame is `S12 Billing.dc.html` S12a's Email card (`:74-82`): the row as it is, plus the
  **Change email** button at `margin-left:auto` — 30px tall, `0 13px` padding, 12px/500, radius 10,
  surface fill, `line` border, `paper` on hover — read off the frame, never rounded, tokens only,
  drawn from the tokens as "Add a passkey" is (the Kit's three heights are 44/36/32; this is a size
  the Kit does not carry, not a second vocabulary).
- The dialog has no frame and is **extrapolated from the same place the rename dialog was** — S12c
  through `kit/dialog.ts`: the same `sheet`, the same `title`, one `TextInput`, Cancel + primary,
  opening with focus on Cancel. Title "Change email"; one sentence under it: "We'll send a link to
  the new address. Nothing changes until you open it."; the field "New email"; the primary
  **Send link**. The field's own refusals go in its helper-caption slot; a send that failed goes in
  a `Banner kind="error"` above the form (`passkeys-card.tsx`'s split).
- **Two emails: the link to the new address, and the notice to the old one.**
  `mailer_secure_email_change_enabled` is **false** — with secure change on, GoTrue mails BOTH
  addresses and the new address's link alone never lands the change (`verify.go:548-585`) — and
  `mailer_notifications_email_changed_enabled` is **true**, both written and read back by
  `configure-supabase-auth.py`. Read in the source; executed by the harness.
  **AMENDED BY THE OWNER, 2026-09-07, ruling R-95** (this story's review, question 2 — the human
  renegotiating what this block froze). It read *"One email, to the new address, and no other (FR-P1
  is exactly six and this is (2))"*, and the notice was off. He ruled it **on**: the address an
  account is moving away from is told, so a change made from a stolen 30-day session cannot happen
  in silence. **FR-P1 is now seven and the notice is its (7)**; it is GoTrue's own plain default
  template, sent to the old address alone after the change lands (`templatemailer.go:433-441`),
  non-fatally (`verify.go:633-639`), and **E12 brands it** (DW-39). Nothing in this story sends it
  and no template of ours is pushed for it.
- The template is `supabase/auth/email-change.html`, extrapolated from `magic-link.html` (a
  transactional email is not a drawn surface): the same header, the same ink button, the same
  fifteen minutes, the link
  `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email_change`, and `{{ .NewEmail }}`
  named in the body so the reader knows which address they are confirming.
- The action is `'use server'` in `account/actions.ts`, guarded by the **session only** — no feature
  flag exists for email change and `ready()`'s passkey switch must not gate it. Mutation shape:
  client → server action → the platform through the user's own cookie-backed client; one schema at
  the boundary — `sign-in/email.ts`'s `emailSchema`, reused, never a second one; error envelope
  `{ code, message }` as the file shapes it.
- The confirm route's landing for `type=email_change` is `/account?email=changed`, decided
  **before** the response object that receives the cookies is built. The value and its reader live
  in one plain module, `signed-out.ts`'s shape, under `node --test`.
- "Pending" is read from Supabase's own `new_email` and `email_change_sent_at` on the user
  `getUser()` already returns — nothing of ours stores a pending address — and it is shown only
  while the link is still good (the project's `mailer_otp_exp`).
- `revalidatePath('/app/account')` after a send — the internal path; nothing on the client edits
  the card optimistically.
- Every claim below about GoTrue is a hypothesis until the harness executes it against the live
  project (standing rule 1); `## Verification` says which.

**Ask First:**
- Any column, table or metadata key of ours that stores an email address or a pending one.
- Any second reader of `SUPABASE_SECRET_KEY` (an admin lookup of `auth.users` is the fallback if
  GoTrue does not answer `email_exists` before sending — stop and ask before building it).
- A second email in this flow (to the old address, or a "changed" notice), a route change, or any
  control on the Sign In page. **ASKED AND RULED, 2026-09-07:** the "changed" notice to the old
  address is **on** (R-95, above); the confirm route's failure path gained one branch for a dead
  email-change link (R-94, the matrix row below). The Sign In page is untouched either way.
- Turning `mailer_secure_email_change_enabled` back on.

**Never:**
- Sign-out-everywhere (2.4), the Danger zone (2.5), the plan column (E12), a display name.
- A browser Supabase client; the one-call helpers; a `disabled` attribute; a tooltip; a "Resend"
  control in the card (pressing **Change email** again is the resend, and GoTrue's own interval
  answers it).
- A cancel for a pending change: GoTrue has no such call, the link expires on its own, and the old
  address is live throughout.
- Logging an address, a token or a link.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Send | **Change email** → "New email" `new@x` → **Send link** | `PUT /user {email}`; dialog closes; the card gains `Banner kind="info"`: "We sent a link to **new@x**. Open it to finish — this address stays until you do." | — |
| Not an address | `maya` · `""` · `maya@` | nothing sent | field slot: "Enter an email address like you@example.com" (`BAD_EMAIL`, the sign-in sentence) |
| Same address | the current address, any case or spacing | nothing sent; GoTrue would no-op (`user.go:135`) | field slot: "That's already your address." |
| Already in use | an address on another account | `PUT /user` → `422 email_exists`; **no email sent** (`email_change_sent_at` stays as it was) | field slot: "That email is already in use on another account." |
| Too soon | a second send inside `smtp_max_frequency` | `429 over_email_send_rate_limit`; nothing sent | Banner: "We sent a link a moment ago. Try again in N seconds." — N from GoTrue's message (`retryAfterFrom`) |
| Send fails | any other error, a throw, or the session ended | dialog stays open / redirect to sign-in | Banner: "We couldn't send that link just now. Try again in a moment." |
| Link opened, any device | `/auth/confirm?token_hash=…&type=email_change` | `verifyOtp` → session cookies for that browser → **303 `/account?email=changed`**; the card shows the new address with `Banner kind="success"`: "Your email is now **new@x**." (once — it is a URL hint, not state); GoTrue then mails the OLD address its "your email address was changed" notice (R-95) | see the next row |
| Link dead, browser SIGNED IN | expired, already used, or forged, with a live session | **303 `/account?email=stale`**; the card shows `Banner kind="error"`: "That link has expired or was already used. Press Change email to get a new one." (once — a URL hint on the same key) | — (R-94: `/sign-in` would send this browser to the dashboard before it said a word) |
| Link dead, browser SIGNED OUT | the same, with no session | **303 `/sign-in?error=link`**, the existing sentence — unchanged | — |
| Link expired, unopened | 15 minutes pass | the info banner leaves the card on the next render; the old address is untouched; **Change email** works as before | — |
| Change email again while pending, after the interval | a different `other@x` | GoTrue replaces the pending address; the earlier link is dead; the banner names `other@x` | — |
| Magic link after the change | sign in with `new@x` | lands in the same account | a magic link to the **old** address now creates a fresh account (FR-A1: sign-up is sign-in) — by design, said in the owner's test |
| Double submit | Enter held, or two clicks | one request (`once`) | — |
| Cancel / Escape / backdrop | the dialog | closes; the field resets (`form.reset()`) | — |

</frozen-after-approval>

## Code Map

- `apps/web/app/(app)/app/(authed)/account/email-change-rule.ts` (new, plain) -- the boundary and the URL contract in one module, because a `'use server'` file may export only async functions (`passkey-name-rule.ts`'s precedent): `newEmailFor(current, raw)` → `{ email }` or `{ code: 'bad_email' | 'same_email' }` (trims, lowercases for the comparison, `parseEmail` from `../../sign-in/email.ts` does the rest); `SAME_EMAIL`, `IN_USE`, `SEND_FAILED` sentences; `LINK_LIFETIME_S = 900` with a comment naming `configure-supabase-auth.py`'s `mailer_otp_exp` as its source; `pendingChange({ new_email, email_change_sent_at }, now)` → `{ email }` while `sent_at + LINK_LIFETIME_S` is ahead of `now`, else `null`; `EMAIL_CHANGED = 'email'`, `EMAIL_CHANGED_VALUE = 'changed'`, `EMAIL_CHANGED_PATH = '/account?email=changed'` (a BROWSER path, `/` not `/app` — `signed-out.ts`'s note), `isEmailChanged(value)`
- `apps/web/email-change-rule.test.ts` (new) -- `node --test`: bad / empty / same-in-another-case / trimmed-ok; pending inside and past the lifetime, and with no `new_email`; the value-and-reader round trip; and `LINK_LIFETIME_S` read AGAINST `tools/probe/configure-supabase-auth.py`'s `'mailer_otp_exp': (\d+)` with `fs` — derived, never restated (standing rule 4)
- `apps/web/app/(app)/app/(authed)/account/actions.ts` -- ADD `changeEmail(prev, formData)` in `useActionState`'s `(previous, FormData)` shape; a `signedIn()` (the three lines `projects/actions.ts:63-67` has — not exported from there, because an exported async function in a `'use server'` file is an action) that `ready()` now calls for its second half; `newEmailFor(user.email, formData.get('email'))` first; then `supabase.auth.updateUser({ email })` wrapped in try (`auth-js` throws on a non-`AuthError`): `error.code === 'email_exists'` → `in_use`; `sentStateFor(error, SEND_INTERVAL)` from `../../sign-in/resend-timer.ts` → `too_soon` with the seconds in the sentence; else `send_failed` logged by status and code only; success → `revalidatePath('/app/account')` → `{ ok: true }`. `Code` widens by `'bad_email' | 'same_email' | 'in_use' | 'too_soon' | 'send_failed'`; `MESSAGES` gains them (`bad_email` is `BAD_EMAIL`, `too_soon` is composed). Note `updateUser` with PKCE (`@supabase/ssr` sets `flowType: "pkce"`, `createServerClient.js:37`; `GoTrueClient.js:2859` adds the challenge) is the same `pkce_`-prefixed `token_hash` the magic link already redeems through the same route on production
- `apps/web/app/(app)/app/(authed)/account/email-card.tsx` (new, client) -- the Email card LIFTED from `page.tsx` verbatim (the row, the `Mail` glyph, "Magic links land here") plus: the frame's button at `:80` drawn from tokens (`h-[30px] px-[13px] rounded-thumb text-control-label font-medium border border-line bg-surface hover:bg-paper` + `ring`); `justChanged` → the success Banner above the row; `pending` → the info Banner under it; ONE `<dialog>` from `kit/dialog.ts` (`sheet`, `title`, `openOnCancel`, `closeOnBackdrop`), `aria-labelledby`, `onClose` → `form.reset()` and mark the result seen; `useActionState(changeEmail, null)`; the `once` guard and the "seen" pattern copied from `passkeys-card.tsx:96-131` (per component by construction — the ref closes over this card's `pending`); a client `guard()` that runs `newEmailFor` at submit so bad/same never round-trip and `in_use` always does; the split: `bad_email | same_email | in_use` → the field's `error`, `too_soon | send_failed` → the Banner
- `apps/web/app/(app)/app/(authed)/account/page.tsx` -- takes `searchParams: Promise<{ [EMAIL_CHANGED]?: string | string[] }>` (`(authed)/page.tsx:37-47`'s shape); renders `<EmailCard email={user.email} pending={pendingChange(user, Date.now())} justChanged={isEmailChanged(...)} />`; the header comment's "So is Change email (2.3)" becomes what is true
- `apps/web/components/kit/input.tsx` -- `TextInput` gains `type?: 'text' | 'email'` (default `'text'`) and `autoComplete?: string`, passed through; nothing else moves
- `apps/web/app/(app)/app/auth/confirm/route.ts` -- ALSO the dead link's landing (R-94): on the failure path, `type === 'email_change'` asks `getUser()` and a browser with a live session gets a FRESH `303` to `EMAIL_STALE_PATH` rather than `stale` — `/sign-in` renders its sentence only for a browser with no session (`sign-in/page.tsx:41`), and a new response object because `home` may carry sign-out cookies `verifyOtp` wrote on its way to failing. And `const landing = type === 'email_change' ? EMAIL_CHANGED_PATH : '/'` computed **after** `type` is parsed and **before** `home` is built, because `setAll` writes the session cookies onto THAT response object — a redirect built afterwards would carry no cookies and land a signed-out user on the sign-in page. `TYPES` already lists `email_change`; the comment says which template sends it
- `supabase/auth/email-change.html` (new) -- `magic-link.html`'s skeleton: preheader "Confirm your new Inflozo email address. The link is good for 15 minutes."; heading "Confirm your new email"; body "You asked to move your Inflozo account to **{{ .NewEmail }}**. Open the link below from any device to finish. It is good for 15 minutes. If you didn't ask for this, ignore this email — nothing changes until you do."; the button "Confirm new email" and the paste line, both to `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email_change`; the head comment records which GoTrue lines say this file is sent to the new address alone with the new address's token (`templatemailer.go:257-280`)
- `tools/probe/configure-supabase-auth.py` -- `settings()` takes both templates; adds `mailer_subjects_email_change: 'Confirm your new Inflozo email'`, `mailer_templates_email_change_content`, `mailer_secure_email_change_enabled: False`, `mailer_notifications_email_changed_enabled: False` (field names read from `api.supabase.com/api/v1-json` `UpdateAuthConfigBody`, 2026-09-07); the docstring's "both templates" becomes "the three"; its `doc-audit.py` row at `:248` gains the email-change template and "Stories 1.4, 2.1, 2.3"
- `tools/probe/run-verify-email-change.py` (new, tool → a `doc-audit.py` row at `:280`'s shape) -- Playwright against `app.inflozo.com`, importing `Admin`, `load_env`, `playwright_dir`, `axe_path`, `tokens_rgb` from `run-verify-passkeys.py` through `importlib.import_module('run-verify-passkeys')` rather than copying them; TWO fixtures `email-change-harness-<ts>-a@inflozo.com` and `-b@`, swept by that prefix, the user count read before and after; A signed in through `generate_link magiclink` redeemed at `/auth/confirm`; the steps in `## Verification`. `--check` is plumbing only. No key printed; keys reach the browser half through its environment
- `_bmad-output/implementation-artifacts/deferred-work.md` -- DW-22 gains one line: this story's harness proves the hand-off (`email_change_sent_at`), not delivery, for the same reason
- read-only: `apps/web/app/(app)/app/sign-in/email.ts` (the schema and `BAD_EMAIL`), `sign-in/resend-timer.ts` (`SEND_INTERVAL`, `sentStateFor`, `retryAfterFrom`), `kit/dialog.ts`, `kit/banner.tsx`, `lib/supabase/server.ts` (`supabaseAdmin`'s caller list is unchanged — `server-wiring.test.ts` stays green), `passkeys-card.tsx`
- `EXPERIENCE.md:131` · `epics.md:773-786` · PRD FR-A4 (`prd.md:183`), FR-P1 (`prd.md:465`) · GoTrue `internal/api/user.go:135-139,272`, `internal/api/mail.go:524-560`, `internal/api/verify.go:120-165,236-300,546-637`, `internal/mailer/templatemailer/templatemailer.go:257-320`, `internal/conf/configuration.go:545,662` (defaults: notification off, secure change ON) -- the rows that bind

## Tasks & Acceptance

**Execution:**
- [x] `supabase/auth/email-change.html` -- the template, extrapolated from `magic-link.html` -- FR-P1 email (2), branded
- [x] `tools/probe/configure-supabase-auth.py` + its catalogue row -- the four new fields, written and read back; `--apply` on the live project, then `--check`, then the control `--expect mailer_secure_email_change_enabled=true` must FAIL -- one email, to the new address
- [x] `account/email-change-rule.ts` + `apps/web/email-change-rule.test.ts` -- the boundary, the pending rule, the URL contract, the derived lifetime -- under `node --test`
- [x] `components/kit/input.tsx` -- `type` and `autoComplete` on `TextInput` -- an email field in the Kit's own control
- [x] `account/actions.ts` -- `signedIn()`, `changeEmail`, the five codes and sentences -- FR-A4's verb
- [x] `account/email-card.tsx` + `account/page.tsx` -- the card lifted, the button, the dialog, the two banners, `searchParams` -- S12a
- [x] `app/auth/confirm/route.ts` -- the landing for `email_change`, decided before the cookie-carrying response exists -- the link's other end
- [x] `tools/probe/run-verify-email-change.py` + its catalogue row -- the harness -- R-82's round trip, re-runnable
- [x] `deferred-work.md` -- the DW-22 line -- propagate, never localise
- [x] Run `## Verification` on the real infrastructure and record every command and result
- [x] **R-94** (owner, at the review) -- `STALE_LINK` · `EMAIL_STALE_VALUE`/`_PATH`/`isEmailStale` · the route's failure branch · the card's third banner · the round-trip and branch tests · the harness's two `stale-*` steps -- a dead link says so where the button that fixes it is
- [x] **R-95** (owner, at the review) -- `mailer_notifications_email_changed_enabled: True` with its own `--expect …=false` control · PRD FR-P1 six → seven with a new **(7)** · the ruling record `A19` · DW-39 rewritten as E12's branding job -- the old address is told

**Acceptance Criteria:**
- Given a signed-in user on `/account` at 1440 and at 390, when the page renders, then the Email card **matches the frame** (`S12 Billing.dc.html` S12a `:74-82`: the row unchanged, **Change email** at the row's end at 30px / radius 10 / 12px 500 / surface with the `line` border and `paper` on hover), the Passkeys card exactly as 2.2 left it, the plan column and the Danger zone still absent
- Given **Change email** pressed, when the dialog opens, then focus is on Cancel, the title is "Change email", the one sentence and the "New email" field are there, and the card behind is untouched
- Given a valid new address sent, when GoTrue answers 200, then the dialog closes, the Admin API shows `new_email` = that address and a fresh `email_change_sent_at`, and the card shows the info banner naming it; the `email` on the user is still the old one
- Given an address on another account, when it is sent, then GoTrue answers `422 email_exists`, the field says "That email is already in use on another account.", and `email_change_sent_at` did not move — **the control for "before any verification email is sent"**
- Given the current address or a non-address, when **Send link** is pressed, then no request leaves the browser and the field says its sentence
- Given a second send inside the interval, when GoTrue answers 429 `over_email_send_rate_limit`, then the Banner says "a moment ago" with GoTrue's own seconds, nothing was sent, and the dialog stays open
- Given the new address's link opened in a browser with no session, when the confirm route redeems it, then that browser is signed in, lands on `/account?email=changed`, sees the green banner with the new address, and the Admin API shows `email` = the new address and no `new_email`
- Given a magic link minted for the new address after the change, when it is redeemed, then it signs in to the same user id
- Given the live project's Auth config, when `configure-supabase-auth.py --check` runs, then every field passes including the four new ones, and `--expect mailer_secure_email_change_enabled=true` fails
- Given an email-change link that is expired or already used, when it is opened on a browser **with** a live session, then it lands on `/account?email=stale` and the Email card shows the red "That link has expired or was already used. Press Change email to get a new one."; when it is opened on a browser **without** one, then it lands on `/sign-in?error=link` with the sign-in page's own sentence, exactly as before (R-94)
- Given a confirmed email change, when GoTrue has landed it, then the **previous** address is sent the "your email address was changed" notice, and the live project's `mailer_notifications_email_changed_enabled` reads back `true` with `--expect mailer_notifications_email_changed_enabled=false` failing (R-95)
- Given `pnpm check`, `pnpm build`, `node --test` and axe-core on `/account` with the dialog closed, open, and with the pending banner showing, then all green and zero violations at 1440 and 390

### Review Findings

Code review 2026-09-07, five layers (Blind Hunter, Edge Case Hunter, Verification Gap, Acceptance Auditor,
Real-infra verifier). The verifier ran the whole harness against the deployed Dev commit: 15 of 16 steps
passed and `bad-email` failed on a real defect. Two decisions for the owner, under `## Questions for the
owner`; every patch applied in the review; one item deferred.

- [x] [Review][Decision] A stale or already-used email-change link opened on a browser that is signed in lands on the dashboard with nothing said — the sign-in page bounces signed-in visitors before its sentence renders — Question 1, **ruled option 1 (R-94)**: it lands on the Account page with the red note, built and executed in this review
- [x] [Review][Decision] The old address is never told when the email changes, so a stolen 30-day session can move the account silently; FR-P1's six-email count is why — Question 2, **ruled option 2 (R-95)**: the notice is on, unbranded, FR-P1 is seven, and DW-39 is now E12's branding job
- [x] [Review][Patch] The dialog's form had no `noValidate` beside a `type="email"` field, so for `maya` the browser's own bubble ran and `guard()` never did — no field sentence, a tooltip P0-0 forbids [apps/web/app/(app)/app/(authed)/account/email-card.tsx] — executed on the deployed site (`bad-email`: 0 POSTs, the field said `null`) and reproduced in Chromium (no `novalidate` → the submit event never fires); one attribute, `sign-in-form.tsx`'s own
- [x] [Review][Patch] GoTrue's own refusal of an address (`email_address_invalid`) said "try again in a moment" in the Banner for an address that will never be accepted [apps/web/app/(app)/app/(authed)/account/actions.ts] — the field's sentence
- [x] [Review][Patch] The two field refusals were restated in the card as `REFUSALS` beside the action's `MESSAGES` [apps/web/app/(app)/app/(authed)/account/email-change-rule.ts] — one `FIELD_REFUSALS` map in the plain module, spread by both
- [x] [Review][Patch] The harness's `confirm` redeemed an admin-minted `generate_link` token — an implicit-flow token the app never mints — so the product's own PKCE token, the one in the real email, was executed by nobody but the owner [tools/probe/run-verify-email-change.py] — the stored `email_change_token_new` is read out of `auth.one_time_tokens` through the Management API (`SUPABASE_ACCESS_TOKEN`, its first use in a harness) and rendered into the template's own href; executed at Review, see Verification
- [x] [Review][Patch] `magic-link-new` never compared a user id, and the `finally` swept `-new@` strays BEFORE comparing the count — a fresh sign-up wearing the new address would pass and be tidied away [tools/probe/run-verify-email-change.py] — `generate_link`'s answer names the user it minted for and it must be A; the count is compared first and a non-empty sweep FAILS the run
- [x] [Review][Patch] `in_use_wire` and the browser's `wire()` compared two empty bodies as "unmoved" when an admin read had failed, passing the control without observing anything [tools/probe/run-verify-email-change.py] — both reads must answer 200
- [x] [Review][Patch] The confirm route's `/` landing for every ordinary link was unpinned: inverting its new branch sent every sign-in to `/account` under a green banner with both harnesses green [tools/probe/run-verify-email-change.py] — `magic-link-home` records the sign-in link's chain and asserts `/` with no `email=changed`
- [x] [Review][Patch] A reload after the confirm, and a reopen after Cancel, were exercised by nothing — the one-shot strip and the `onClose` reset could both go with every step green [tools/probe/run-verify-email-change.py] — `confirm-once` and `dialog-reset`
- [x] [Review][Patch] `--to` with an address that already has an account proved the refusal instead of the send, and a run killed after `confirm` left A wearing the owner's address where no regex sweeps it [tools/probe/run-verify-email-change.py] — refused up front with the fix spelled out
- [x] [Review][Patch] `frame_tokens()` and `sweep()` copied the sibling's `tokens_rgb()` and `sweep_stale_fixtures()` bodies with different names, against the Code Map's "rather than copying them" [tools/probe/run-verify-passkeys.py] — both take a parameter now and are imported; a token missing from `globals.css` is a named failure, not a traceback
- [x] [Review][Patch] The template's `type=email_change` reached no check: `app-routes.test.ts` read only `magic-link.html`, and `type=email` — the natural copy — is accepted by the route and lands on `/` with no banner [apps/web/app-routes.test.ts] — every template under `supabase/auth/` is walked, and the email-change template's type must be the one the route's branch reads
- [x] [Review][Patch] Nothing pinned that `changeEmail` guards on the session alone: the sibling actions' first line would put FR-A4 behind the passkey kill switch with every check green [apps/web/email-change-rule.test.ts] — the action's source is read and its guard asserted
- [x] [Review][Patch] "15 minutes" is written by hand in both templates while only `LINK_LIFETIME_S` was tied to `mailer_otp_exp` [apps/web/email-change-rule.test.ts] — every template's minutes are read and compared
- [x] [Review][Patch] Three new files cited "standing rule N" by number; CLAUDE.md says cite the words [account/email-change-rule.ts · email-change-rule.test.ts · tools/probe/run-verify-email-change.py]
- [x] [Review][Patch] `## Verification` named `cd apps/web && pnpm check`, which does not exist (`check` is a root script), and restated "eleven UI steps" for a list of twelve [this spec]
- [x] [Review][Defer] `signedIn()` is now copied into a second `'use server'` file; a plain-module export beside `currentUser()` would delete both copies [apps/web/app/(app)/app/(authed)/account/actions.ts · projects/actions.ts] — deferred, DW-38; the change touches `projects/actions.ts`, outside this story

## Spec Change Log

1. **The harness's `email_change_new` token is the one in `action_link`, not `hashed_token`** (Dev,
   2026-09-07). Design Notes listed "`generate_link` with `type: 'email_change_new'` and `new_email`
   mints a redeemable token" as a hypothesis. It does — but `hashed_token` in that response is NOT
   it: `POST /verify {type:'email_change', token_hash:<hashed_token>}` answered `403 otp_expired` on
   a token minted seconds earlier, four times, while the `token` query param out of the same
   response's `action_link` answered **200** with a session and landed the change. GoTrue looks the
   hash up in `one_time_tokens` over EmailChangeTokenCurrent and EmailChangeTokenNew
   (`verify.go:644-668`), and with `mailer_secure_email_change_enabled` false only the NEW one is
   ever stored. **Nothing in the product changes** — the email carries `{{ .TokenHash }}`, which
   GoTrue renders per message, and the confirm route's call shape is proved correct by the 200 —
   but the harness would have reported a broken confirm route, so `run-verify-email-change.py`
   reads `action_link` and records why beside the line.
2. **The owner's two rulings at the review changed the story's shape** (Review, 2026-09-07). **R-94**
   added a landing this story did not have: a dead email-change link on a signed-in browser lands on
   `/account?email=stale` with a red note, because `/sign-in` renders its sentence only for a browser
   with no session. **R-95** amended the frozen Boundaries and the PRD: the notice to the old address is
   ON, unbranded, and FR-P1 is seven rather than six. Both are recorded in
   `reconcile-designs-decisions.md` §A19 with their target lists, and both are executed below.
3. **`sessions_inactivity_timeout` is still the plan's, not the story's** — the `--apply` run
   answered `402` for it, retried without it and wrote the other 26 fields. Unchanged from 1.4.

## Design Notes

**Routine calls made here, not the owner's** (each one line, as CLAUDE.md asks). *The link to the new
address:* the PRD's own words are "re-verification of the new address"; GoTrue's default secure change
would mail both addresses and demand two clicks, so that switch goes off and the template names the new
address so a wrong-hands recipient can see what they are being asked to confirm. *The notice to the old
address is NOT a routine call and was not made here* — it was the owner's, at the review (R-95), and it
is FR-P1's seventh email. *No table of ours:*
`new_email` and `email_change_sent_at` are the platform's own record of a pending change and arrive
inside `getUser()` for free; a column would be a migration that can disagree with it. *The landing is
`/account` and the banner is a URL hint:* `signed-out.ts` already proved the shape, and a hint that is
not state cannot go stale. *A dialog, not inline editing:* the frame draws a button, and the product
owns one dialog vocabulary. *No Resend control and no cancel:* see Never — each would be a second
copy of something GoTrue already does. *The harness's fresh address is a real send* to an
`@inflozo.com` address the owner's domain receives (`--to` overrides it); DW-22 says nothing here
can read whether it arrived, so the hand-off is what is asserted and delivery is the owner's test.

**What is a hypothesis until the harness runs.** That the hosted GoTrue is the `master` read above:
`422 email_exists` before any send; a `pkce_` token hash for an email change redeemed by `POST
/verify` as the magic link's is; that `generate_link` with `type: 'email_change_new'` and `new_email`
mints a redeemable token; that `verifyOtp` for `email_change` issues a session to a cookie-less
browser; that the message on the 429 names a number `retryAfterFrom` can read. Each is executed, not
reasoned, and the result lands under `## Verification` and, where it changes a sentence, in the
matrix through the change log.

**Why the landing is decided first in the confirm route.** `createServerClient`'s `setAll` writes the
cookies onto the `home` response captured in its closure. Deciding the redirect after `verifyOtp`
would mean building a new response, which carries none of them — the user would arrive at
`/account` signed out and be bounced to sign-in with nothing said. One `const` above the client, and
the trap cannot be walked into.

`// ponytail: the pending banner is time-boxed by a constant that mirrors mailer_otp_exp; a settings read the day the app has one` ·
`// ponytail: "Change email" again is the resend; a Resend line with a countdown the day the owner asks for one`

## Verification

**Commands** (R-82 — the real project, the real domains; every key by its variable name, never printed):
- `python3 tools/probe/configure-supabase-auth.py --apply` (it reads `tools/probe/.env` itself — an `env $(…)` prefix cannot carry `RESEND_FROM`'s space, its docstring says) -- expected: `PATCH 200`, then every field `PASS`, the four new ones among them
- `python3 tools/probe/configure-supabase-auth.py --check --expect mailer_secure_email_change_enabled=true` -- expected: exactly one `FAIL`, that field — the control
- `python3 tools/probe/configure-supabase-auth.py --check --expect mailer_notifications_email_changed_enabled=false` -- expected: exactly one `FAIL`, that field — **R-95's own control**, because a switch written `true` needs a control of its own; the other one proves nothing about it
- `pnpm check` from the repository root (it is a root script — lint, typecheck, `node --test` across the workspace; Node 24 on PATH — memory `headless-browser-tooling`) and `cd apps/web && pnpm build` -- expected: green; `email-change-rule.test.ts`, `app-routes.test.ts` and `server-wiring.test.ts` among the passes
- `python3 tools/probe/run-verify-email-change.py --check` -- expected: keys present, Playwright and axe resolved, the Admin API's create-read-delete round trip `PASS`
- `python3 tools/probe/run-verify-email-change.py` (after Deploy, against `app.inflozo.com`) -- each step `PASS` or `RECORD`, exit 0:
  - `frame` — the button's height, radius, border and hover fill read off the deployed DOM against the tokens
  - `dialog-focus` — focus on Cancel at open
  - `same` — the current address: no request, the field's sentence
  - `in-use` — B's address from A: `422` on the wire, the field's sentence, A's `email_change_sent_at` unchanged via the Admin API (**the control**)
  - `send` — a fresh address: dialog closes, the info banner names it, `new_email` and `email_change_sent_at` set, `email` unchanged
  - `too-soon` — the same again inside the interval: the Banner with GoTrue's seconds, `email_change_sent_at` unchanged
  - `dialog-reset` — Cancel after the refused send, reopen: an empty field and no sentence left
  - `confirm` — **the product's own token**: the `email_change_token_new` GoTrue stored for the `send` step, read out of `auth.one_time_tokens` through the Management API and rendered into the template's own href → opened in a NEW context → lands on `/account?email=changed` signed in, the success banner, `email` = the new address, `new_email` absent
  - `confirm-once` — reload: the green banner is gone and `email=changed` is off the URL
  - `stale-signed-in` — the link the `confirm` step just spent, opened again on A's signed-in browser: `/account?email=stale` and the red note (**R-94**)
  - `stale-signed-out` — the same spent link on a browser with no cookies: still `/sign-in?error=link` and the sign-in page's own sentence
  - `magic-link-new` — a magic link minted for the new address is minted for A's user id and signs in to A
  - `magic-link-home` — the ordinary magic link that signs A in lands on `/`, never on `/account?email=changed`
  - `axe-closed` · `axe-dialog` · `axe-pending` — axe-core WCAG 2.1 AA at 1440 and 390, zero violations
  - cleanup: A and B deleted, the user count back where it started, or the run FAILS

**Manual checks:**
- The owner's inbox receives FR-P1's email (2) from `Inflozo <hello@inflozo.com>` with the subject "Confirm your new Inflozo email" (his manual test, step 4) — the delivery half DW-22 says no key here can read.

### Ran at Dev, 2026-09-07 — the real services, by variable name, never by value

**Supabase** (project `adasbmxypwvnxznzzxwp`, from `SUPABASE_URL`; `SUPABASE_ACCESS_TOKEN`,
`SUPABASE_SECRET_KEY`, `SUPABASE_PUBLISHABLE_KEY`, `RESEND_API_KEY`, `RESEND_FROM` in
`tools/probe/.env`):

- `curl https://api.supabase.com/api/v1-json` -> **all four field names PRESENT** in
  `UpdateAuthConfigBody`: `mailer_subjects_email_change` (string),
  `mailer_templates_email_change_content` (string), `mailer_secure_email_change_enabled` (boolean),
  `mailer_notifications_email_changed_enabled` (boolean). Read in the source, not assumed.
- `python3 tools/probe/configure-supabase-auth.py --apply` -> `PATCH 402` for
  `sessions_inactivity_timeout` (a Pro-plan field, stated not swallowed), retried -> **`PATCH 200`,
  26 fields written**, then `GET 200` and **every field PASS**, the four new ones among them:
  `mailer_subjects_email_change = 'Confirm your new Inflozo email'`,
  `mailer_templates_email_change_content = 5373 chars`,
  `mailer_secure_email_change_enabled = False`, `mailer_notifications_email_changed_enabled = False`.
  `smtp_pass` written by name only. Exit 0.
- `python3 tools/probe/configure-supabase-auth.py --check --expect mailer_secure_email_change_enabled=true`
  -> **exactly one `FAIL`**, `mailer_secure_email_change_enabled = True (live: False)`, exit **1**.
  **THE CONTROL PASSED** — the read-back can fail, so the green run above is a result.
- `python3 tools/probe/configure-supabase-auth.py --check` -> `OK`, exit 0, after every edit.

**GoTrue, executed against the live project on two throwaway fixture users** (standing rule 1 — each
of these was a hypothesis in Design Notes and is now a fact):

- **`422 email_exists` BEFORE anything is sent.** A's own access token (a magic link redeemed
  through `POST /verify`), then `PUT /auth/v1/user {email: B}` -> **HTTP 422, `error_code:
  'email_exists'`**, and A's `email_change_sent_at` **did not move** and `new_email` stayed `''`.
  This is FR-A4's "rejected upfront before any verification email is sent", read off the wire; it is
  `run-verify-email-change.py`'s `in-use-wire` step and it printed `PASS`.
- **`generate_link` with `type: 'email_change_new'` and `new_email` -> 200**, `verification_type:
  'email_change_new'`, and the change recorded as `new_email` on the user.
- **The confirm route's call shape redeems it**: `POST /verify {type:'email_change', token_hash}`
  with the `action_link` token -> **200 with an `access_token`**, and the wire then showed
  `email` = the new address with `new_email` cleared. With `hashed_token` from the same response it
  answered `403 otp_expired` — see Spec Change Log 1; the finding is the harness's, not the app's.
- **GoTrue's own `GET /verify?token=…&type=email_change` -> 303** with a session in the fragment and
  the change landed, which is why the product uses its own route instead: no server can read a
  fragment.
- `python3 tools/probe/run-verify-email-change.py --check` -> playwright resolved, axe-core
  resolved, `PASS admin round trip: create, read back (200)`, users before 4 / after 4, exit 0.
  Every fixture user created in the runs above was deleted and the count returned to 4 each time.

**The repository's own gates:**

- `pnpm check` (Node 24.18.1 — memory `headless-browser-tooling`) -> lint, typecheck and
  `node --test` all green: **127 tests pass, 0 fail** in `apps/web`, `email-change-rule.test.ts`
  (9 tests) and `server-wiring.test.ts` among them.
- `pnpm build` -> compiled, TypeScript green, `/app/account` and `/app/auth/confirm` both routed.
- `python3 tools/doc-audit.py --check` -> `documentation gate: PASS (0 warning(s))`.

**Resend** — not called at Dev: the one real send of this story happens inside the Deploy run of
`run-verify-email-change.py`, and DW-22 means even then only the hand-off is readable here.
**Vercel** — not called at Dev; the deployment is CI's, on the push (DW-7). **Dodo** and the Ghost
test servers **T1/T3** — untouched by this story, and named here only to say so.

### Ran at Review, 2026-09-07 — the deployed Dev commit, then the patched harness

The Dev push had already been published by CI (run `34088348480` green; Vercel's newest production
deployment carried `478b6ef7` and both aliases pointed at it), so the review ran the whole harness
against `app.inflozo.com` rather than `--check` alone. Every key by its variable name, never printed.

- `python3 tools/probe/configure-supabase-auth.py --check` -> `OK`, exit 0, the four new fields among
  the passes. **The control** `--check --expect mailer_secure_email_change_enabled=true` -> exactly one
  `FAIL`, exit 1. Both re-executed by the Real-infra verifier.
- `python3 tools/probe/run-verify-email-change.py` **as the Dev commit left it**, against the deployed
  site -> `in-use-wire` **PASS** (`422 email_exists`, `email_change_sent_at` unmoved), then 14 UI steps
  PASS and **`bad-email` FAIL: "0 POST(s); the field said null"** — the form had no `noValidate` beside
  its `type="email"` field, so Chromium's own bubble stopped the submit before `guard()` ran. The
  mechanism was reproduced in Chromium on a bare page: without `novalidate` the submit event never
  fires, with it it does. Fixture users deleted, users before 4 / after 4. Exit 1.
- `python3 tools/probe/run-verify-email-change.py` **after the review's harness patches**, against the
  same deployment (the app fix is not deployed yet, so `bad-email` is expected to fail and did):
  `in-use-wire` PASS; `magic-link-home` PASS (the ordinary sign-in link's chain ends on `/`, no
  `email=changed`); `signed-in`, `frame`, `axe-closed`, `dialog-focus`, `axe-dialog` PASS;
  **`bad-email` FAIL** (the known defect); `same`, `in-use-ui` (1 POST, sent_at `"" -> ""`), `send`
  (`new_email` set, sent_at moved, `email` unchanged), `axe-pending`, `too-soon` ("Try again in 57
  seconds", sent_at unmoved) PASS; `dialog-reset` PASS (field `""`, no alert left); **`confirm` PASS
  with the product's own token: the stored `email_change_token_new` read out of `auth.one_time_tokens`
  through the Management API carried the `pkce_` prefix, the template's own href rendered with it landed
  on `/account?email=changed` signed in, the green banner named the new address, and the wire showed
  `email` = the new address with `new_email` cleared** — the PKCE path the Code Map reasoned about,
  executed; `confirm-once` PASS (after reload: no banner, URL clean); `magic-link-new` PASS (minted for
  user A, landed on `/account` with the new address). Fixture users deleted, users before 4 / after 4,
  no strays. Exit 1, from `bad-email` alone.
- `pnpm check` (root, Node 24.18.1) -> lint, typecheck and `node --test` green: **130 tests pass, 0
  fail** in `apps/web` (the three added by the review among them), the three packages 1 each.

- **After the review commit `def46235` was published by CI** (run green at 11:46, `app.inflozo.com`
  serving it): `python3 tools/probe/run-verify-email-change.py` -> **every step PASS, exit 0** —
  `bad-email` now "0 POST(s); the field said \"Enter an email address like you@example.com\"", the
  `confirm` step again on the product's own `pkce_` token, `too-soon` naming 56 seconds, users before
  4 / after 4. The Deploy run has, in effect, already happened once; Deploy re-runs it for the record.

**Dodo**, **T1/T3** — untouched, as at Dev. **Resend** — the three `send` steps above each handed one real
email to GoTrue for a `-new@inflozo.com` fixture address; delivery stays the owner's step 4 (DW-22).

### Ran at Review, 2026-09-07 — the owner's two rulings, executed against the live project and site

- `python3 tools/probe/configure-supabase-auth.py --apply` -> `PATCH 200`, then **every field PASS**
  including **`mailer_notifications_email_changed_enabled = True`** (R-95) and
  `mailer_secure_email_change_enabled = False`; `sessions_inactivity_timeout` reported apart as ever.
- **Two controls, each failing exactly its own field**, which is what makes the green run above a
  result: `--check --expect mailer_secure_email_change_enabled=true` -> `1 FAILED`, exit 1; `--check
  --expect mailer_notifications_email_changed_enabled=false` -> `1 FAILED`, exit 1. Plain `--check`
  -> `OK`, exit 0.
- **GoTrue's own source, read rather than assumed** (`master`, fetched 2026-09-07): the notice is sent
  to the OLD address alone — `templatemailer.go:433-441`, whose recipient argument is `oldEmail` — only
  after `ConfirmEmailChange` succeeds and only when the address really differs, and a failed send is
  logged rather than failing the request (`verify.go:633-639`). Its default subject and body are
  `templatemailer.go:137` and `:73-77`, which is the unbranded copy DW-39 now owns.
- `pnpm check` (root, Node 24.18.1) -> **133 tests pass, 0 fail** — the three R-94 tests among them,
  including the one that reads the confirm route's own dead-link branch out of its source. `pnpm build`
  -> compiled, `/app/account` and `/app/auth/confirm` both routed.
- `python3 tools/probe/run-verify-email-change.py` against the deployed review commit -> **every step
  PASS, exit 0**, the two new ones among them: **`stale-signed-in`** — the link the `confirm` step had
  just spent, opened again on the signed-in browser, landed on `/account?email=stale` and the card said
  *"That link has expired or was already used. Press Change email to get a new one."* — and
  **`stale-signed-out`** — the same spent link with no cookies still landed on `/sign-in?error=link`
  with the sign-in page's own sentence. Users before 4 / after 4, no strays.
- **One harness defect found by executing it and fixed** (not a product fault): the first run against
  the brand-new deployment died at `page.goto('/account')` — Playwright's 30s default with
  `waitUntil: 'networkidle'` against a cold authed render — leaving every later step unrun. Every
  navigation now waits for `load` with a 60s ceiling, which still waits for the stylesheets the
  `frame` step measures. Re-run twice after the change: all steps PASS both times.

### Still to run, at Deploy, against `app.inflozo.com`

`python3 tools/probe/run-verify-email-change.py` — the UI steps above, `frame` through
`axe-pending`. They need the deployed site by construction: this
story's whole surface is a signed-in page on `app.inflozo.com`, and the frame step reads computed
styles off the deployed DOM. The wire control they depend on has already passed, above.

## Owner's manual test

On the live site, after the Deploy run. You need a second address you can read — a Gmail alias works:
if your inbox is `you@gmail.com`, then `you+inflozo@gmail.com` arrives in the same inbox.

1. **URL:** https://app.inflozo.com/account · **Screen:** Account & Billing · **Do:** look at the
   Email card · **See:** your address with "Magic links land here" under it and, at the right end of
   the row, a small white **Change email** button. Hover it: the background goes light grey.
2. **URL:** the same · **Do:** press **Change email** · **See:** a window titled "Change email" with
   one sentence — "We'll send a link to the new address. Nothing changes until you open it." — a
   "New email" field, **Cancel** and **Send link**. Type `maya` and press **Send link** · **See:** the
   window stays open and under the field: "Enter an email address like you@example.com".
3. **URL:** the same · **Do:** type your **current** address and press **Send link** · **See:** "That's
   already your address." under the field. Now type an address that already has an Inflozo account —
   the address of any other account you have signed in with; if you have none, first sign in once
   from a private window with a spare address to create one — and press **Send link** · **See:**
   "That email is already in use on another account." No email arrives at that address.
4. **URL:** the same · **Do:** type your alias, e.g. `you+inflozo@gmail.com`, and press **Send link** ·
   **See:** the window closes and a blue note appears in the Email card: "We sent a link to
   you+inflozo@gmail.com. Open it to finish — this address stays until you do." Your old address is
   still the one shown. Within a minute an email from **Inflozo** arrives with the subject "Confirm
   your new Inflozo email", naming the new address, with a dark **Confirm new email** button.
5. **URL:** the same · **Do:** before a minute has passed, press **Change email** again, type the same
   alias, **Send link** · **See:** a red message above the field: "We sent a link a moment ago. Try
   again in N seconds." Press **Cancel**.
6. **URL:** the link in the email — open it on your **phone** if you can · **See:** the Account page,
   signed in, with a green message "Your email is now you+inflozo@gmail.com." and the Email card
   showing the new address; the blue note is gone. Reload: the green message is gone, the address
   stays.
7. **Check your OLD inbox** (your original address) · **See:** a second email, subject "Your email
   address was changed", saying the account moved from your old address to the new one and to contact
   support if it was not you. **This one is plain and unbranded on purpose** — it is Supabase's own
   default, it is the seventh email the product sends, and Epic 12 brands it with the rest. It is your
   ruling from this review (R-95), and it exists so that nobody can move your account in silence.
8. **URL:** the same link from step 6, opened a second time · **See:** the Account page with a red
   message: "That link has expired or was already used. Press Change email to get a new one." — the
   link works once, and this is your other ruling from this review (R-94). Try it on your phone too,
   where you are signed in.
9. **URL:** https://app.inflozo.com/sign-in · **Do:** avatar → Sign out; ask for a magic link to
   `you+inflozo@gmail.com` and open it · **See:** your own dashboard and projects. (Do not ask for a
   magic link to your **old** address unless you want a brand-new empty account: that address is
   free again, and signing in creates one — that is how sign-in has always worked.)
10. **URL:** https://app.inflozo.com/account · **Do:** change the email back to your original address
    the same way and open the link · **See:** the green message with your original address, and the
    "Your email address was changed" note now arriving at `you+inflozo@gmail.com`, the address you are
    leaving this time.

## Questions for the owner

Two decisions from the review. Neither blocks the Deploy run; both are yours.

### Question 1 — A stale link, opened where you are already signed in, says nothing

**In plain English:** the link in the "Confirm your new email" mail is good for 15 minutes and works
once. If you open it too late, or a second time, on a browser where you are **signed out**, you land on
the sign-in page and it says "That link has expired…" — the sentence sign-in already has. But you will
usually open it on the phone or laptop where you are **already signed in**, and there the sign-in page
sends signed-in visitors straight to the dashboard before it can say anything. **Example:** you ask for
the change at 9:00 and open the email at 9:20 on the laptop where Inflozo is open. You see your
dashboard. Nothing tells you the link was too old or that you should press **Change email** again.

1. **(RECOMMENDED)** A stale email-change link lands on the **Account page** with a red note: "That link
   has expired or was already used. Press Change email to get a new one." — one sentence, next to the
   button that fixes it. A signed-out browser still gets the sign-in page's sentence as today.
2. Leave it as it is: a signed-out browser gets the sign-in sentence; a signed-in browser lands on the
   dashboard with nothing said.
3. Like 1, but the red note is on the dashboard rather than the Account page.

**Ruled:** option 1 (owner, 2026-09-07) — recorded as **R-94** in `reconcile-designs-decisions.md` §A19
and built in this review. The confirm route asks `getUser()` on the failure path; a signed-in browser
lands on `/account?email=stale` with the red note, a signed-out one still gets the sign-in sentence. Two
harness steps prove both halves against the deployed site.

### Question 2 — Your old address is never told when your email changes

**In plain English:** this story sends exactly one email, to the **new** address, because the product
promises only six emails ever (FR-P1) and the PRD asks to "re-verify the new address". Most services
also send a short "your email was changed" note to the **old** address, so that if someone else got hold
of your signed-in session — a stolen laptop, a shared computer left signed in; a session lasts 30 days
— and moved the account to their own address, you would at least find out. Without it, the first sign
would be that a magic link to your old address opens a brand-new, empty account. Supabase has a switch
for this notice (`mailer_notifications_email_changed_enabled`), turned off by this story; turning it on
is a seventh email, and it would need its own branded template. **Example:** your laptop is stolen on
Monday while signed in; the thief changes the account's email on Tuesday; today you hear nothing.

1. **(RECOMMENDED)** Keep one email for now and record the risk as deferred work (**DW-39**), to be
   decided with **Epic 12**, where every other transactional email is built and branded — a seventh
   email, its template and the change to FR-P1's count belong there, if you want them.
2. Turn the notice on now: the old address gets Supabase's plain, unbranded "your email has been
   changed" email until Epic 12 brands it. Seven emails, and FR-P1's count changes today.
3. Turn it on now **and** add a story to this epic to brand it before 2.3 is done.

**Ruled:** option 2 (owner, 2026-09-07) — recorded as **R-95** in `reconcile-designs-decisions.md` §A19.
The switch is on in the live project and read back; **FR-P1 now says seven** and the notice is its (7);
the frozen Boundaries above carry the amendment; **DW-39 is no longer a question** but the branding job
E12 inherits. Read in GoTrue's source, not assumed: the notice goes to the old address alone, only after
the change lands, and a failure to send it is logged rather than losing the change.
