---
title: 'Story 2.3 — Change my email address safely'
type: 'feature'
created: '2026-09-07'
status: 'ready-for-dev'
review_loop_iteration: 0
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
- **One email, to the new address, and no other** (FR-P1 is exactly six and this is (2)): the
  project's `mailer_secure_email_change_enabled` is **false** and
  `mailer_notifications_email_changed_enabled` is **false**, both written and read back by
  `configure-supabase-auth.py` — with secure change on, GoTrue mails BOTH addresses and the new
  address's link alone never lands the change (`verify.go:548-585`); with the notification on, the
  old address gets a seventh email (`verify.go:632-637`). Read in the source; executed by the
  harness.
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
  control on the Sign In page.
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
| Link opened, any device | `/auth/confirm?token_hash=…&type=email_change` | `verifyOtp` → session cookies for that browser → **303 `/account?email=changed`**; the card shows the new address with `Banner kind="success"`: "Your email is now **new@x**." (once — it is a URL hint, not state) | expired, used, forged → `/sign-in?error=link`, the existing sentence |
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
- `apps/web/app/(app)/app/auth/confirm/route.ts` -- `const landing = type === 'email_change' ? EMAIL_CHANGED_PATH : '/'` computed **after** `type` is parsed and **before** `home` is built, because `setAll` writes the session cookies onto THAT response object — a redirect built afterwards would carry no cookies and land a signed-out user on the sign-in page. `TYPES` already lists `email_change`; the comment says which template sends it
- `supabase/auth/email-change.html` (new) -- `magic-link.html`'s skeleton: preheader "Confirm your new Inflozo email address. The link is good for 15 minutes."; heading "Confirm your new email"; body "You asked to move your Inflozo account to **{{ .NewEmail }}**. Open the link below from any device to finish. It is good for 15 minutes. If you didn't ask for this, ignore this email — nothing changes until you do."; the button "Confirm new email" and the paste line, both to `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email_change`; the head comment records which GoTrue lines say this file is sent to the new address alone with the new address's token (`templatemailer.go:257-280`)
- `tools/probe/configure-supabase-auth.py` -- `settings()` takes both templates; adds `mailer_subjects_email_change: 'Confirm your new Inflozo email'`, `mailer_templates_email_change_content`, `mailer_secure_email_change_enabled: False`, `mailer_notifications_email_changed_enabled: False` (field names read from `api.supabase.com/api/v1-json` `UpdateAuthConfigBody`, 2026-09-07); the docstring's "both templates" becomes "the three"; its `doc-audit.py` row at `:248` gains the email-change template and "Stories 1.4, 2.1, 2.3"
- `tools/probe/run-verify-email-change.py` (new, tool → a `doc-audit.py` row at `:280`'s shape) -- Playwright against `app.inflozo.com`, importing `Admin`, `load_env`, `playwright_dir`, `axe_path`, `tokens_rgb` from `run-verify-passkeys.py` through `importlib.import_module('run-verify-passkeys')` rather than copying them; TWO fixtures `email-change-harness-<ts>-a@inflozo.com` and `-b@`, swept by that prefix, the user count read before and after; A signed in through `generate_link magiclink` redeemed at `/auth/confirm`; the steps in `## Verification`. `--check` is plumbing only. No key printed; keys reach the browser half through its environment
- `_bmad-output/implementation-artifacts/deferred-work.md` -- DW-22 gains one line: this story's harness proves the hand-off (`email_change_sent_at`), not delivery, for the same reason
- read-only: `apps/web/app/(app)/app/sign-in/email.ts` (the schema and `BAD_EMAIL`), `sign-in/resend-timer.ts` (`SEND_INTERVAL`, `sentStateFor`, `retryAfterFrom`), `kit/dialog.ts`, `kit/banner.tsx`, `lib/supabase/server.ts` (`supabaseAdmin`'s caller list is unchanged — `server-wiring.test.ts` stays green), `passkeys-card.tsx`
- `EXPERIENCE.md:131` · `epics.md:773-786` · PRD FR-A4 (`prd.md:183`), FR-P1 (`prd.md:465`) · GoTrue `internal/api/user.go:135-139,272`, `internal/api/mail.go:524-560`, `internal/api/verify.go:120-165,236-300,546-637`, `internal/mailer/templatemailer/templatemailer.go:257-320`, `internal/conf/configuration.go:545,662` (defaults: notification off, secure change ON) -- the rows that bind

## Tasks & Acceptance

**Execution:**
- [ ] `supabase/auth/email-change.html` -- the template, extrapolated from `magic-link.html` -- FR-P1 email (2), branded
- [ ] `tools/probe/configure-supabase-auth.py` + its catalogue row -- the four new fields, written and read back; `--apply` on the live project, then `--check`, then the control `--expect mailer_secure_email_change_enabled=true` must FAIL -- one email, to the new address
- [ ] `account/email-change-rule.ts` + `apps/web/email-change-rule.test.ts` -- the boundary, the pending rule, the URL contract, the derived lifetime -- under `node --test`
- [ ] `components/kit/input.tsx` -- `type` and `autoComplete` on `TextInput` -- an email field in the Kit's own control
- [ ] `account/actions.ts` -- `signedIn()`, `changeEmail`, the five codes and sentences -- FR-A4's verb
- [ ] `account/email-card.tsx` + `account/page.tsx` -- the card lifted, the button, the dialog, the two banners, `searchParams` -- S12a
- [ ] `app/auth/confirm/route.ts` -- the landing for `email_change`, decided before the cookie-carrying response exists -- the link's other end
- [ ] `tools/probe/run-verify-email-change.py` + its catalogue row -- the harness -- R-82's round trip, re-runnable
- [ ] `deferred-work.md` -- the DW-22 line -- propagate, never localise
- [ ] Run `## Verification` on the real infrastructure and record every command and result

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
- Given `pnpm check`, `pnpm build`, `node --test` and axe-core on `/account` with the dialog closed, open, and with the pending banner showing, then all green and zero violations at 1440 and 390

## Spec Change Log

## Design Notes

**Routine calls made here, not the owner's** (each one line, as CLAUDE.md asks). *One email, to the new
address:* the PRD's own words are "re-verification of the new address" and FR-P1 counts exactly six
emails; GoTrue's default secure change would mail both addresses and demand two clicks, and its
"changed" notice would be a seventh email, so both switches go off and the template names the new
address so a wrong-hands recipient can see what they are being asked to confirm. *No table of ours:*
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
- `cd apps/web && pnpm check && pnpm build && node --test` (Node 24 on PATH — memory `headless-browser-tooling`) -- expected: green; `email-change-rule.test.ts` and `server-wiring.test.ts` among the passes
- `python3 tools/probe/run-verify-email-change.py --check` -- expected: keys present, Playwright and axe resolved, the Admin API's create-read-delete round trip `PASS`
- `python3 tools/probe/run-verify-email-change.py` (after Deploy, against `app.inflozo.com`) -- each step `PASS` or `RECORD`, exit 0:
  - `frame` — the button's height, radius, border and hover fill read off the deployed DOM against the tokens
  - `dialog-focus` — focus on Cancel at open
  - `same` — the current address: no request, the field's sentence
  - `in-use` — B's address from A: `422` on the wire, the field's sentence, A's `email_change_sent_at` unchanged via the Admin API (**the control**)
  - `send` — a fresh address: dialog closes, the info banner names it, `new_email` and `email_change_sent_at` set, `email` unchanged
  - `too-soon` — the same again inside the interval: the Banner with GoTrue's seconds, `email_change_sent_at` unchanged
  - `confirm` — `generate_link email_change_new` for A → the link opened in a NEW context → lands on `/account?email=changed` signed in, the success banner, `email` = the new address, `new_email` absent
  - `magic-link-new` — a magic link minted for the new address redeems to A's user id
  - `axe-closed` · `axe-dialog` · `axe-pending` — axe-core WCAG 2.1 AA at 1440 and 390, zero violations
  - cleanup: A and B deleted, the user count back where it started, or the run FAILS

**Manual checks:**
- The owner's inbox receives FR-P1's email (2) from `Inflozo <hello@inflozo.com>` with the subject "Confirm your new Inflozo email" (his manual test, step 4) — the delivery half DW-22 says no key here can read.

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
7. **URL:** https://app.inflozo.com/sign-in · **Do:** avatar → Sign out; ask for a magic link to
   `you+inflozo@gmail.com` and open it · **See:** your own dashboard and projects. (Do not ask for a
   magic link to your **old** address unless you want a brand-new empty account: that address is
   free again, and signing in creates one — that is how sign-in has always worked.)
8. **URL:** https://app.inflozo.com/account · **Do:** change the email back to your original address
   the same way and open the link · **See:** the green message with your original address.
